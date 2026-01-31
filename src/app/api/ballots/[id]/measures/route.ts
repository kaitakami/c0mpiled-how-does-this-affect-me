import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { measure } from "@/db/schema";
import type {
	BallotMeasure,
	GetBallotMeasuresResponse,
	MeasureCategory,
} from "@/types";

// GET /api/ballots/:id/measures
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	const results = await db.query.measure.findMany({
		where: eq(measure.ballotId, id),
	});

	const measures: BallotMeasure[] = results.map((m) => ({
		id: m.id,
		code: m.code,
		title: m.title,
		summary: m.summary,
		category: m.category as MeasureCategory,
	}));

	const response: GetBallotMeasuresResponse = {
		ballotId: id,
		measures,
	};

	return NextResponse.json(response);
}
