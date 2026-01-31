// ── Hyperspell Memory Client (server-only) ──────────────────
// Thin wrapper around the Hyperspell REST API.
// NEVER import this from client components.

const HYPERSPELL_API_KEY = process.env.HYPERSPELL_API_KEY ?? "";
const BASE_URL = "https://api.hyperspell.com";

export const CIVIC_PROFILE_COLLECTION = "civic-profiles";
export const BALLOT_QA_COLLECTION = "ballot-qa";
const MEMORY_SOURCE = "vault"; // Hyperspell storage source for get/update paths

function resourceId(userId: string) {
	return `civic-profile-${userId}`;
}

async function hs(path: string, opts: RequestInit & { userId?: string } = {}) {
	const { userId, ...init } = opts;
	const headers: Record<string, string> = {
		Authorization: `Bearer ${HYPERSPELL_API_KEY}`,
		"Content-Type": "application/json",
		...(userId ? { "X-As-User": userId } : {}),
	};

	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers: { ...headers, ...(init.headers as Record<string, string>) },
	});

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Hyperspell ${res.status}: ${body}`);
	}

	const text = await res.text();
	return text ? JSON.parse(text) : null;
}

// ── Public API ───────────────────────────────────────────────

export async function addMemory(
	userId: string,
	text: string,
	metadata: Record<string, string | number | boolean>,
) {
	return hs("/memories/add", {
		method: "POST",
		userId,
		body: JSON.stringify({
			text,
			resource_id: resourceId(userId),
			collection: CIVIC_PROFILE_COLLECTION,
			title: "Civic Profile",
			metadata,
		}),
	});
}

export async function getMemory(userId: string) {
	return hs(`/memories/get/${MEMORY_SOURCE}/${resourceId(userId)}`, {
		userId,
	});
}

export async function updateMemory(
	userId: string,
	text: string,
	metadata: Record<string, string | number | boolean>,
) {
	return hs(`/memories/update/${MEMORY_SOURCE}/${resourceId(userId)}`, {
		method: "POST",
		userId,
		body: JSON.stringify({ text, metadata }),
	});
}

export async function listMemories(userId: string) {
	return hs(`/memories/list?collection=${CIVIC_PROFILE_COLLECTION}`, {
		userId,
	});
}

export async function queryMemories(
	userId: string,
	query: string,
	options?: { maxResults?: number; answer?: boolean },
) {
	return hs("/memories/query", {
		method: "POST",
		userId,
		body: JSON.stringify({
			query,
			sources: [CIVIC_PROFILE_COLLECTION, BALLOT_QA_COLLECTION],
			max_results: options?.maxResults ?? 5,
			answer: options?.answer ?? false,
		}),
	});
}

export async function addQAMemory(
	userId: string,
	question: string,
	answer: string,
	measureId?: string,
) {
	const resourceSuffix = `qa-${Date.now()}`;
	return hs("/memories/add", {
		method: "POST",
		userId,
		body: JSON.stringify({
			text: `Q: ${question}\nA: ${answer}`,
			resource_id: `${resourceSuffix}`,
			collection: BALLOT_QA_COLLECTION,
			title: measureId ? `Q&A about ${measureId}` : "Ballot Q&A",
			metadata: {
				type: "qa",
				...(measureId ? { measureId } : {}),
				timestamp: new Date().toISOString(),
			},
		}),
	});
}
