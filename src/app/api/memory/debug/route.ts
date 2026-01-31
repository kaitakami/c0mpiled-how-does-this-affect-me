import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as hyperspell from "@/lib/hyperspell";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const memory = await hyperspell.getMemory(session.user.id);
		return NextResponse.json({ memory });
	} catch {
		return NextResponse.json({ memory: null });
	}
}
