import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateText, streamText } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import * as hyperspell from "@/lib/hyperspell";

const MEASURES_CONTEXT = `
Ballot Measures on this ballot (CA, Los Angeles, 2026):

1. Prop 33 — Rent Control Expansion (Housing)
   Allows cities/counties to establish rent control on any type of housing.

2. Prop 5 — Lower Property Tax Threshold (Tax)
   Lowers voter approval threshold for local bonds for affordable housing/infrastructure from 66.7% to 55%.

3. Prop 2 — School Facilities Bond (Education)
   $10B bond for K-12 and community college facilities — repairs, upgrades, new construction.

4. Prop 4 — Climate Bond (Environment)
   $10B bond for safe drinking water, wildfire prevention, climate risk protection.

5. Measure J — Public Transit Expansion (Transportation)
   Half-cent sales tax to fund bus/rail transit expansion, bike lanes, road repairs.

6. Prop 36 — Criminal Sentencing Reform (Justice)
   Increases penalties for certain drug and theft crimes, reversing some Prop 47 provisions.

7. Measure A — Minimum Wage Increase (Labor)
   Raises local minimum wage to $20/hour for all employers, with annual inflation adjustments.

8. Prop 35 — Medi-Cal Funding (Healthcare)
   Makes permanent the existing tax on managed healthcare insurance plans to fund Medi-Cal services.
`.trim();

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const userId = session.user.id;
	const body = await request.json();
	const { messages, profile, measureId } = body;

	// Get the last user message for RAG query (v6 UIMessage uses parts, not content)
	const lastUserMsg = [...messages]
		.reverse()
		.find((m: { role: string }) => m.role === "user");
	const lastUserMessage =
		lastUserMsg?.parts
			?.filter((p: { type: string }) => p.type === "text")
			.map((p: { text: string }) => p.text)
			.join("") ?? "";

	// Fetch user's consolidated memory
	let currentMemory = "";
	try {
		const mem = await hyperspell.getMemory(userId);
		if (mem?.text) {
			currentMemory = mem.text;
		}
	} catch {
		// Hyperspell unavailable — continue without memory
	}

	// Build profile context
	let profileContext = "";
	if (profile) {
		const housing =
			profile.housingStatus === "renter"
				? `Renter paying $${profile.monthlyRent}/month`
				: `Homeowner with property valued at $${profile.homeValue}`;
		profileContext = [
			`User Profile:`,
			`- Location: ZIP ${profile.zipCode}`,
			`- Housing: ${housing}`,
			`- Income: ${profile.incomeRange}`,
			`- Job sector: ${profile.jobSector}`,
			`- Household size: ${profile.householdSize}`,
		].join("\n");
	}

	const focusMeasure = measureId
		? `\nThe user is specifically asking about measure ID "${measureId}". Focus your answer on this measure.`
		: "";

	const systemPrompt = `You are a helpful civic advisor for "How Does This Affect Me?" — an app that helps voters understand how ballot measures impact them personally.

${profileContext}

${MEASURES_CONTEXT}
${focusMeasure}
${currentMemory ? `\nUser memory (accumulated context from past interactions):\n${currentMemory}` : ""}

Guidelines:
- Be concise and direct — 2-4 sentences for simple questions, more for complex ones
- Always reference specific dollar amounts when possible (e.g. "$1,200/year")
- Cite measure codes (e.g. "Prop 33") when discussing specific measures
- Personalize answers based on the user's profile (housing status, income, household size)
- If asked about something outside the ballot, politely redirect to ballot-related topics
- Use plain language — avoid jargon`;

	const modelMessages = await convertToModelMessages(messages);

	const result = streamText({
		model: openai("gpt-4o-mini"),
		system: systemPrompt,
		messages: modelMessages,
		onFinish: async ({ text }) => {
			// AI agent decides whether to update the user's memory
			try {
				const { text: decision } = await generateText({
					model: openai("gpt-4o-mini"),
					system: `You manage a user's memory for a ballot impact app. You receive the current memory and a new Q&A exchange. Decide if the memory should be updated with new info (preferences, concerns, clarifications, inferred facts about the user). If yes, output the full updated memory. If no new info worth saving, output exactly "NO_UPDATE". Keep the memory concise — bullet points, max 15 lines. Never remove existing useful info, only add or refine.`,
					prompt: `CURRENT MEMORY:\n${currentMemory || "(empty)"}\n\nNEW Q&A:\nQ: ${lastUserMessage}\nA: ${text}`,
				});

				if (decision.trim() !== "NO_UPDATE") {
					await hyperspell.updateMemory(userId, decision.trim(), {
						lastUpdated: new Date().toISOString(),
					});
				}
			} catch {
				// Memory update failed silently
			}
		},
	});

	return result.toUIMessageStreamResponse();
}
