import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ballot } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { GetBallotResponse } from "@/types";

// GET /api/ballots?state=CA&county=Alameda
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");
  const county = searchParams.get("county");

  if (!state || !county) {
    return NextResponse.json(
      { error: "Missing required params: state and county" },
      { status: 400 }
    );
  }

  const result = await db.query.ballot.findFirst({
    where: and(eq(ballot.state, state), eq(ballot.county, county)),
  });

  if (!result) {
    return NextResponse.json(
      { error: "Ballot not found" },
      { status: 404 }
    );
  }

  const response: GetBallotResponse = {
    id: result.id,
    state: result.state,
    county: result.county,
    electionDate: result.electionDate.toISOString().split("T")[0],
  };

  return NextResponse.json(response);
}
