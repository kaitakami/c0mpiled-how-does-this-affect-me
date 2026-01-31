import type { UserProfile } from "./user";

// ── Impact Calculations ──────────────────────────────────────

export type ImpactDirection = "positive" | "negative" | "neutral";

export interface CalculateImpactRequest {
	measureId: string;
	profile: {
		housingStatus: UserProfile["housingStatus"];
		homeValue: number | null;
		monthlyRent: number | null;
		incomeRange: UserProfile["incomeRange"];
		householdSize: number;
	};
}

export interface CalculateImpactResponse {
	measureId: string;
	impact: string; // formatted, e.g. "$1,500/year"
	amount: number; // raw number, e.g. 1500
	direction: ImpactDirection;
	explanation: string; // e.g. "Caps your annual rent increase at 5%, saving you ~$1,500/year"
}
