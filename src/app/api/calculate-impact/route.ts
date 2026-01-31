import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { measure } from "@/db/schema";
import type {
	CalculateImpactRequest,
	CalculateImpactResponse,
	ImpactDirection,
	ImpactFormula,
} from "@/types";

function evaluateFormula(
	formula: string,
	context: Record<string, number | null>,
): number | null {
	// Replace variable names with values
	let expression = formula;
	for (const [key, value] of Object.entries(context)) {
		if (value === null) {
			// If a required variable is null, we can't evaluate
			if (expression.includes(key)) {
				return null;
			}
		} else {
			expression = expression.replace(
				new RegExp(`\\b${key}\\b`, "g"),
				String(value),
			);
		}
	}

	// Only allow numbers, operators, parentheses, and whitespace
	if (!/^[\d\s+\-*/().]+$/.test(expression)) {
		return null;
	}

	try {
		// Using Function constructor for safe evaluation of arithmetic expressions
		const result = new Function(`return (${expression})`)();
		return typeof result === "number" && !Number.isNaN(result) ? result : null;
	} catch {
		return null;
	}
}

function formatCurrency(amount: number): string {
	const absAmount = Math.abs(amount);
	if (absAmount >= 1000) {
		return `$${absAmount.toLocaleString()}/year`;
	}
	return `$${absAmount}/year`;
}

// POST /api/calculate-impact
export async function POST(request: NextRequest) {
	const body: CalculateImpactRequest = await request.json();
	const { measureId, profile } = body;

	const results = await db
		.select()
		.from(measure)
		.where(eq(measure.id, measureId))
		.limit(1);
	const result = results[0];

	if (!result) {
		return NextResponse.json({ error: "Measure not found" }, { status: 404 });
	}

	// Parse the impact formula
	const impactFormulas: Record<string, ImpactFormula> = result.impactFormula
		? JSON.parse(result.impactFormula)
		: {};

	// Build context from profile
	const context: Record<string, number | null> = {
		homeValue: profile.homeValue,
		monthlyRent: profile.monthlyRent,
		householdSize: profile.householdSize,
	};

	// Find the first applicable formula based on profile
	let totalAmount = 0;
	let explanation = "No direct financial impact calculated";
	let applicableFormula: ImpactFormula | null = null;

	for (const [_key, formula] of Object.entries(impactFormulas)) {
		// Check if profile has required fields
		const hasRequired = formula.requires.every((field) => {
			const value = context[field];
			return value !== null && value !== undefined;
		});

		if (hasRequired) {
			const amount = evaluateFormula(formula.formula, context);
			if (amount !== null) {
				totalAmount += amount;
				applicableFormula = formula;
			}
		}
	}

	if (applicableFormula) {
		explanation = applicableFormula.description;
	}

	// Determine direction
	let direction: ImpactDirection = "neutral";
	if (totalAmount > 0) {
		direction = "positive";
	} else if (totalAmount < 0) {
		direction = "negative";
	}

	const response: CalculateImpactResponse = {
		measureId,
		impact: formatCurrency(totalAmount),
		amount: Math.round(totalAmount),
		direction,
		explanation,
	};

	return NextResponse.json(response);
}
