import type { Ballot, BallotMeasureDetail, BallotWithMeasures } from "./ballot";
import type { CalculateImpactRequest, CalculateImpactResponse } from "./impact";
import type { UserProfile, UserProfileInput } from "./user";

// ── API Contracts ────────────────────────────────────────────

// ── GET /api/ballots?state=XX&county=YY ──────────────────────

export interface GetBallotParams {
	state: string;
	county: string;
}

export type GetBallotResponse = Ballot;

// ── GET /api/ballots/:id/measures ────────────────────────────

export type GetBallotMeasuresResponse = BallotWithMeasures;

// ── GET /api/measures/:id ────────────────────────────────────

export type GetMeasureResponse = BallotMeasureDetail;

// ── POST /api/calculate-impact ───────────────────────────────

export type { CalculateImpactRequest, CalculateImpactResponse };

// ── POST /api/user-profile ───────────────────────────────────

export type CreateUserProfileRequest = UserProfileInput;
export type CreateUserProfileResponse = UserProfile;

// ── GET /api/user-profile?userId=XXX ─────────────────────────

export interface GetUserProfileParams {
	userId: string;
}

export type GetUserProfileResponse = UserProfile;
