import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { measure } from "@/db/schema";
import type {
	GetMeasureResponse,
	ImpactFormula,
	MeasureCategory,
} from "@/types";

// GET /api/measures/:id
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	const result = await db.query.measure.findFirst({
		where: eq(measure.id, id),
	});

	if (!result) {
		return NextResponse.json({ error: "Measure not found" }, { status: 404 });
	}

	const impactFormula: Record<string, ImpactFormula> = result.impactFormula
		? JSON.parse(result.impactFormula)
		: {};

	const response: GetMeasureResponse = {
		id: result.id,
		code: result.code,
		title: result.title,
		summary: result.summary,
		category: result.category as MeasureCategory,
		impactFormula,
	};

	return NextResponse.json(response);
}
