// ── User Profile ──────────────────────────────────────────────

export type HousingStatus = "renter" | "owner";

export type IncomeRange =
	| "under-25k"
	| "25k-50k"
	| "50k-75k"
	| "75k-100k"
	| "100k-150k"
	| "150k-200k"
	| "over-200k";

export type JobSector =
	| "tech"
	| "healthcare"
	| "education"
	| "retail"
	| "hospitality"
	| "manufacturing"
	| "finance"
	| "government"
	| "construction"
	| "other";

export interface UserProfile {
	id: string;
	userId: string;
	zipCode: string;
	housingStatus: HousingStatus;
	homeValue: number | null;
	monthlyRent: number | null;
	incomeRange: IncomeRange;
	jobSector: JobSector;
	householdSize: number;
}

export interface UserProfileInput {
	userId: string;
	zipCode: string;
	housingStatus: HousingStatus;
	homeValue: number | null;
	monthlyRent: number | null;
	incomeRange: IncomeRange;
	jobSector: JobSector;
	householdSize: number;
}
