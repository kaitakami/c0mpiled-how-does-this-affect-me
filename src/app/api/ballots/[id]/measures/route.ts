import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { measure } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { GetBallotMeasuresResponse, BallotMeasure, MeasureCategory } from "@/types";

// GET /api/ballots/:id/measures
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
