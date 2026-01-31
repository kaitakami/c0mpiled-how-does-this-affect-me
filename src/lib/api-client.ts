import type {
	Ballot,
	BallotMeasure,
	BallotMeasureDetail,
	BallotWithMeasures,
	CalculateImpactRequest,
	CalculateImpactResponse,
	MeasureWithImpact,
	UserProfile,
	UserProfileInput,
} from "@/types";

// ── Helpers ──────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_PROFILE = false; // false → real Hyperspell memory
const MOCK_BALLOTS = true; // flip to false when Ashley's ballot DB is ready

async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, init);
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body?.error?.message ?? `Request failed: ${res.status}`);
	}
	return res.json() as Promise<T>;
}

// ── API Client ───────────────────────────────────────────────

export const api = {
	// ── User Profile ─────────────────────────────────────────

	async getUserProfile(userId: string): Promise<UserProfile | null> {
		if (MOCK_PROFILE) return mock.getUserProfile(userId);
		const res = await fetch("/api/memory/profile");
		if (res.status === 404) return null;
		if (!res.ok) throw new Error(`Failed to get profile: ${res.status}`);
		return res.json() as Promise<UserProfile>;
	},

	async createUserProfile(input: UserProfileInput): Promise<UserProfile> {
		if (MOCK_PROFILE) return mock.createUserProfile(input);
		return fetcher<UserProfile>("/api/memory/profile", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		});
	},

	// ── Ballots ──────────────────────────────────────────────

	async getBallot(state: string, county: string): Promise<Ballot> {
		if (MOCK_BALLOTS) return mock.getBallot(state, county);
		return fetcher<Ballot>(
			`/api/ballots?state=${encodeURIComponent(state)}&county=${encodeURIComponent(county)}`,
		);
	},

	async getBallotMeasures(ballotId: string): Promise<BallotWithMeasures> {
		if (MOCK_BALLOTS) return mock.getBallotMeasures(ballotId);
		return fetcher<BallotWithMeasures>(`/api/ballots/${ballotId}/measures`);
	},

	// ── Measures ─────────────────────────────────────────────

	async getMeasure(measureId: string): Promise<BallotMeasureDetail> {
		if (MOCK_BALLOTS) return mock.getMeasure(measureId);
		return fetcher<BallotMeasureDetail>(`/api/measures/${measureId}`);
	},

	// ── Impact ───────────────────────────────────────────────

	async calculateImpact(
		req: CalculateImpactRequest,
	): Promise<CalculateImpactResponse> {
		if (MOCK_BALLOTS) return mock.calculateImpact(req);
		return fetcher<CalculateImpactResponse>("/api/calculate-impact", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(req),
		});
	},

	// ── Aggregate ────────────────────────────────────────────

	async getAllImpacts(profile: {
		housingStatus: UserProfile["housingStatus"];
		homeValue: number | null;
		monthlyRent: number | null;
		incomeRange: UserProfile["incomeRange"];
		householdSize: number;
	}): Promise<MeasureWithImpact[]> {
		// Get ballot for the user's area (mock: CA / Los Angeles)
		const ballot = await this.getBallot("CA", "Los Angeles");
		const { measures } = await this.getBallotMeasures(ballot.id);

		const impacts = await Promise.all(
			measures.map(async (measure) => {
				const impact = await this.calculateImpact({
					measureId: measure.id,
					profile,
				});
				return { measure, impact } as MeasureWithImpact;
			}),
		);

		return impacts;
	},
};

// ── Mock Data ────────────────────────────────────────────────

const MOCK_MEASURES: BallotMeasure[] = [
	{
		id: "measure-1",
		code: "Prop 33",
		title: "Rent Control Expansion",
		summary:
			"Allows cities and counties to establish rent control on any type of housing",
		category: "housing",
	},
	{
		id: "measure-2",
		code: "Prop 5",
		title: "Lower Property Tax Threshold",
		summary:
			"Lowers the voter approval threshold for local bonds for affordable housing and public infrastructure from 66.7% to 55%",
		category: "tax",
	},
	{
		id: "measure-3",
		code: "Prop 2",
		title: "School Facilities Bond",
		summary:
			"$10 billion bond for K-12 and community college facilities, including repairs, upgrades, and new construction",
		category: "education",
	},
	{
		id: "measure-4",
		code: "Prop 4",
		title: "Climate Bond",
		summary:
			"$10 billion bond for safe drinking water, wildfire prevention, and protection of communities and natural lands from climate risks",
		category: "environment",
	},
	{
		id: "measure-5",
		code: "Measure J",
		title: "Public Transit Expansion",
		summary:
			"Half-cent sales tax to fund expansion of bus and rail transit, bike lanes, and road repairs",
		category: "transportation",
	},
	{
		id: "measure-6",
		code: "Prop 36",
		title: "Criminal Sentencing Reform",
		summary:
			"Increases penalties for certain drug and theft crimes, reversing some Proposition 47 provisions",
		category: "criminal_justice",
	},
	{
		id: "measure-7",
		code: "Measure A",
		title: "Minimum Wage Increase",
		summary:
			"Raises the local minimum wage to $20/hour for all employers, with annual adjustments for inflation",
		category: "labor",
	},
	{
		id: "measure-8",
		code: "Prop 35",
		title: "Medi-Cal Funding",
		summary:
			"Makes permanent the existing tax on managed healthcare insurance plans to fund Medi-Cal health services",
		category: "healthcare",
	},
];

const MOCK_MEASURE_DETAILS: Record<string, BallotMeasureDetail> = {
	"measure-1": {
		...MOCK_MEASURES[0],
		impactFormula: {
			rent: {
				formula: "monthlyRent * 0.05 * 12",
				requires: ["monthlyRent"],
				description: "Annual savings from 5% rent cap",
			},
		},
	},
	"measure-2": {
		...MOCK_MEASURES[1],
		impactFormula: {
			propertyTax: {
				formula: "homeValue * 0.0012",
				requires: ["homeValue"],
				description: "Estimated annual property tax increase from new bonds",
			},
		},
	},
	"measure-3": {
		...MOCK_MEASURES[2],
		impactFormula: {
			propertyTax: {
				formula: "homeValue * 0.0005",
				requires: ["homeValue"],
				description: "Annual property tax increase for school bond repayment",
			},
		},
	},
	"measure-4": {
		...MOCK_MEASURES[3],
		impactFormula: {
			stateTax: {
				formula: "householdSize * 25",
				requires: ["householdSize"],
				description: "Estimated annual state cost per household member",
			},
		},
	},
	"measure-5": {
		...MOCK_MEASURES[4],
		impactFormula: {
			salesTax: {
				formula: "householdSize * 180",
				requires: ["householdSize"],
				description:
					"Estimated annual sales tax cost based on average spending",
			},
		},
	},
	"measure-6": {
		...MOCK_MEASURES[5],
		impactFormula: {},
	},
	"measure-7": {
		...MOCK_MEASURES[6],
		impactFormula: {
			costOfLiving: {
				formula: "householdSize * 120",
				requires: ["householdSize"],
				description:
					"Estimated annual cost-of-living increase from price adjustments",
			},
		},
	},
	"measure-8": {
		...MOCK_MEASURES[7],
		impactFormula: {},
	},
};

const PROFILE_STORAGE_KEY = "hdtam-user-profile";

const mock = {
	async getUserProfile(_userId: string): Promise<UserProfile | null> {
		await delay(200);
		if (typeof window === "undefined") return null;
		const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
		if (!stored) return null;
		return JSON.parse(stored) as UserProfile;
	},

	async createUserProfile(input: UserProfileInput): Promise<UserProfile> {
		await delay(400);
		const profile: UserProfile = {
			id: `profile-${Date.now()}`,
			...input,
		};
		if (typeof window !== "undefined") {
			localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
		}
		return profile;
	},

	async getBallot(state: string, county: string): Promise<Ballot> {
		await delay(400);
		return {
			id: "ballot-2026-general",
			state,
			county,
			electionDate: "2026-11-03",
		};
	},

	async getBallotMeasures(ballotId: string): Promise<BallotWithMeasures> {
		await delay(400);
		return {
			ballotId,
			measures: MOCK_MEASURES,
		};
	},

	async getMeasure(measureId: string): Promise<BallotMeasureDetail> {
		await delay(300);
		const detail = MOCK_MEASURE_DETAILS[measureId];
		if (!detail) throw new Error(`Measure ${measureId} not found`);
		return detail;
	},

	async calculateImpact(
		req: CalculateImpactRequest,
	): Promise<CalculateImpactResponse> {
		await delay(600);

		const { measureId, profile } = req;

		// Simple mock calculations based on measure
		const calculations: Record<
			string,
			() => {
				impact: string;
				amount: number;
				direction: CalculateImpactResponse["direction"];
				explanation: string;
			}
		> = {
			"measure-1": () => {
				const savings = (profile.monthlyRent ?? 2000) * 0.05 * 12;
				return {
					impact: `$${savings.toLocaleString()}/year`,
					amount: savings,
					direction: "positive",
					explanation: `Caps your annual rent increase at 5%, saving you ~$${savings.toLocaleString()}/year based on your $${(profile.monthlyRent ?? 2000).toLocaleString()}/mo rent`,
				};
			},
			"measure-2": () => {
				const cost = (profile.homeValue ?? 0) * 0.0012;
				if (profile.housingStatus === "renter") {
					return {
						impact: "Minimal direct impact",
						amount: 0,
						direction: "neutral",
						explanation:
							"As a renter, this property tax change doesn't directly affect you, though it may fund affordable housing projects nearby",
					};
				}
				return {
					impact: `$${Math.round(cost).toLocaleString()}/year`,
					amount: Math.round(cost),
					direction: "negative",
					explanation: `Your property tax could increase by ~$${Math.round(cost).toLocaleString()}/year to fund affordable housing bonds`,
				};
			},
			"measure-3": () => {
				if (profile.housingStatus === "renter") {
					return {
						impact: "No direct cost",
						amount: 0,
						direction: "positive",
						explanation:
							"As a renter, you won't pay directly, but local schools get $10B in facility upgrades",
					};
				}
				const cost = (profile.homeValue ?? 0) * 0.0005;
				return {
					impact: `$${Math.round(cost).toLocaleString()}/year`,
					amount: Math.round(cost),
					direction: "negative",
					explanation: `Your property tax increases ~$${Math.round(cost).toLocaleString()}/year for school bond repayment`,
				};
			},
			"measure-4": () => {
				const cost = profile.householdSize * 25;
				return {
					impact: `$${cost}/year`,
					amount: cost,
					direction: "negative",
					explanation: `Costs your household ~$${cost}/year through state taxes, funding wildfire prevention and climate programs`,
				};
			},
			"measure-5": () => {
				const cost = profile.householdSize * 180;
				return {
					impact: `$${cost}/year`,
					amount: cost,
					direction: "negative",
					explanation: `Half-cent sales tax costs your household ~$${cost}/year, funding expanded transit and road repairs`,
				};
			},
			"measure-6": () => ({
				impact: "No direct financial impact",
				amount: 0,
				direction: "neutral",
				explanation:
					"This measure changes criminal sentencing — no direct cost to your household but may affect public safety and incarceration spending",
			}),
			"measure-7": () => {
				const cost = profile.householdSize * 120;
				return {
					impact: `$${cost}/year`,
					amount: cost,
					direction: "negative",
					explanation: `Estimated $${cost}/year increase in cost of living from higher prices at local businesses`,
				};
			},
			"measure-8": () => ({
				impact: "No new cost",
				amount: 0,
				direction: "positive",
				explanation:
					"Makes existing Medi-Cal funding permanent — no new taxes, but preserves healthcare access for low-income residents",
			}),
		};

		const calc = calculations[measureId];
		if (calc) {
			const result = calc();
			return { measureId, ...result };
		}

		return {
			measureId,
			impact: "Unable to calculate",
			amount: 0,
			direction: "neutral",
			explanation: "Insufficient data to calculate personal impact",
		};
	},
};
