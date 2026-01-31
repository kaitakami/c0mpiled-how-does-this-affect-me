import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { auth } from "@/lib/auth";
import * as hyperspell from "@/lib/hyperspell";
import type { UserProfile, UserProfileInput } from "@/types";

// ── Helpers ──────────────────────────────────────────────────

function profileToText(p: UserProfileInput): string {
	const housing =
		p.housingStatus === "renter"
			? `Renter paying $${p.monthlyRent}/month`
			: `Homeowner with property valued at $${p.homeValue}`;
	return [
		`Location: ZIP ${p.zipCode}`,
		`Housing: ${housing}`,
		`Income: ${p.incomeRange}`,
		`Job sector: ${p.jobSector}`,
		`Household size: ${p.householdSize}`,
	].join(". ");
}

function profileToMetadata(
	p: UserProfileInput,
): Record<string, string | number | boolean> {
	return {
		zipCode: p.zipCode,
		housingStatus: p.housingStatus,
		homeValue: p.homeValue ?? 0,
		monthlyRent: p.monthlyRent ?? 0,
		incomeRange: p.incomeRange,
		jobSector: p.jobSector,
		householdSize: p.householdSize,
	};
}

function metadataToProfile(
	id: string,
	userId: string,
	meta: Record<string, unknown>,
): UserProfile {
	return {
		id,
		userId,
		zipCode: String(meta.zipCode ?? ""),
		housingStatus:
			(meta.housingStatus as UserProfile["housingStatus"]) ?? "renter",
		homeValue: meta.homeValue ? Number(meta.homeValue) : null,
		monthlyRent: meta.monthlyRent ? Number(meta.monthlyRent) : null,
		incomeRange: (meta.incomeRange as UserProfile["incomeRange"]) ?? "50k-75k",
		jobSector: (meta.jobSector as UserProfile["jobSector"]) ?? "other",
		householdSize: Number(meta.householdSize ?? 1),
	};
}

// ── POST — Store civic profile ──────────────────────────────

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await request.json()) as UserProfileInput;
	const userId = session.user.id;
	const profileId = `profile-${userId}`;

	// Dual write: Hyperspell + DB
	const [hsResult] = await Promise.allSettled([
		hyperspell.addMemory(userId, profileToText(body), profileToMetadata(body)),
		db
			.insert(userProfile)
			.values({
				id: profileId,
				userId,
				zipCode: body.zipCode,
				housingStatus: body.housingStatus,
				homeValue: body.homeValue,
				monthlyRent: body.monthlyRent,
				incomeRange: body.incomeRange,
				jobSector: body.jobSector,
				householdSize: body.householdSize,
			})
			.onConflictDoUpdate({
				target: userProfile.id,
				set: {
					zipCode: body.zipCode,
					housingStatus: body.housingStatus,
					homeValue: body.homeValue,
					monthlyRent: body.monthlyRent,
					incomeRange: body.incomeRange,
					jobSector: body.jobSector,
					householdSize: body.householdSize,
				},
			}),
	]);

	if (hsResult.status === "rejected") {
		console.warn(
			"Hyperspell write failed, DB write used as fallback:",
			hsResult.reason,
		);
	}

	const profile: UserProfile = {
		...body,
		id: profileId,
		userId,
	};

	return NextResponse.json(profile);
}

// ── GET — Retrieve civic profile ────────────────────────────

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;

	// Try Hyperspell first
	try {
		const memory = await hyperspell.getMemory(userId);
		if (memory?.metadata) {
			const profile = metadataToProfile(
				memory.id ?? `profile-${userId}`,
				userId,
				memory.metadata,
			);
			return NextResponse.json(profile);
		}
	} catch {
		// Hyperspell unavailable, fall through to DB
	}

	// Fallback to DB
	const rows = await db
		.select()
		.from(userProfile)
		.where(eq(userProfile.userId, userId))
		.limit(1);

	if (rows.length === 0) {
		return NextResponse.json(null, { status: 404 });
	}

	const row = rows[0];
	const profile: UserProfile = {
		id: row.id,
		userId: row.userId ?? userId,
		zipCode: row.zipCode,
		housingStatus:
			(row.housingStatus as UserProfile["housingStatus"]) ?? "renter",
		homeValue: row.homeValue,
		monthlyRent: row.monthlyRent,
		incomeRange: (row.incomeRange as UserProfile["incomeRange"]) ?? "50k-75k",
		jobSector: (row.jobSector as UserProfile["jobSector"]) ?? "other",
		householdSize: row.householdSize ?? 1,
	};

	return NextResponse.json(profile);
}
