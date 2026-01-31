// ── Hyperspell Memory Layer ──────────────────────────────────
// Types for Hyperspell SDK interactions.

export interface HyperspellStoreParams {
	userId: string;
	text: string;
	collection: string;
	title?: string;
	metadata?: Record<string, string | number | boolean>;
}

export interface HyperspellQueryParams {
	userId: string;
	query: string;
	sources: string[];
	maxResults?: number;
	answer?: boolean;
	answerModel?: HyperspellModel;
}

export type HyperspellModel =
	| "llama-3.1"
	| "gemma2"
	| "deepseek-r1"
	| "qwen-qwq"
	| "mistral-saba"
	| "llama-4-scout";

export interface HyperspellQueryResult {
	documents: HyperspellDocument[];
	answer: string | null;
	errors: string[];
}

export interface HyperspellDocument {
	id: string;
	text: string;
	title: string | null;
	score: number;
	metadata: Record<string, unknown>;
}
