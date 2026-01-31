import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import type {
  CreateUserProfileRequest,
  CreateUserProfileResponse,
  GetUserProfileResponse,
  HousingStatus,
  IncomeRange,
  JobSector,
} from "@/types";

// POST /api/user-profile
export async function POST(request: NextRequest) {
  const body: CreateUserProfileRequest = await request.json();

  // Check if profile already exists for this user
  const existing = body.userId
    ? await db.query.userProfile.findFirst({
        where: eq(userProfile.userId, body.userId),
      })
    : null;

  let result;

  if (existing) {
    // Update existing profile
    const updated = await db
      .update(userProfile)
      .set({
        zipCode: body.zipCode,
        housingStatus: body.housingStatus,
        homeValue: body.homeValue,
        monthlyRent: body.monthlyRent,
        incomeRange: body.incomeRange,
        jobSector: body.jobSector,
        householdSize: body.householdSize,
        updatedAt: new Date(),
      })
      .where(eq(userProfile.id, existing.id))
      .returning();
    result = updated[0];
  } else {
    // Insert new profile
    const inserted = await db
      .insert(userProfile)
      .values({
        id: crypto.randomUUID(),
        userId: body.userId,
        zipCode: body.zipCode,
        housingStatus: body.housingStatus,
        homeValue: body.homeValue,
        monthlyRent: body.monthlyRent,
        incomeRange: body.incomeRange,
        jobSector: body.jobSector,
        householdSize: body.householdSize,
      })
      .returning();
    result = inserted[0];
  }

  const response: CreateUserProfileResponse = {
    id: result.id,
    userId: result.userId ?? "",
    zipCode: result.zipCode,
    housingStatus: result.housingStatus as HousingStatus,
    homeValue: result.homeValue,
    monthlyRent: result.monthlyRent,
    incomeRange: result.incomeRange as IncomeRange,
    jobSector: result.jobSector as JobSector,
    householdSize: result.householdSize ?? 1,
  };

  return NextResponse.json(response);
}

// GET /api/user-profile?userId=xxx
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing required param: userId" },
      { status: 400 }
    );
  }

  const result = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });

  if (!result) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  }

  const response: GetUserProfileResponse = {
    id: result.id,
    userId: result.userId ?? "",
    zipCode: result.zipCode,
    housingStatus: result.housingStatus as HousingStatus,
    homeValue: result.homeValue,
    monthlyRent: result.monthlyRent,
    incomeRange: result.incomeRange as IncomeRange,
    jobSector: result.jobSector as JobSector,
    householdSize: result.householdSize ?? 1,
  };

  return NextResponse.json(response);
}
