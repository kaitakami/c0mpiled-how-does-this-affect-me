"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
	Info,
	Loader,
	Minus,
	Sparkles,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useProfile } from "@/lib/profile-context";
import type { MeasureWithImpact } from "@/types";

const DIRECTION_ICON = {
	positive: TrendingUp,
	negative: TrendingDown,
	neutral: Minus,
};

const DIRECTION_COLORS = {
	positive: {
		text: "text-emerald-400",
		bg: "bg-emerald-500/10",
		border: "border-emerald-500/20",
	},
	negative: {
		text: "text-red-400",
		bg: "bg-red-500/10",
		border: "border-red-500/20",
	},
	neutral: {
		text: "text-white/50",
		bg: "bg-white/[0.04]",
		border: "border-white/[0.08]",
	},
};

const CATEGORY_LABELS: Record<string, string> = {
	housing: "Housing",
	tax: "Tax",
	education: "Education",
	transportation: "Transit",
	healthcare: "Healthcare",
	environment: "Environment",
	criminal_justice: "Justice",
	labor: "Labor",
	other: "Other",
};

export function MeasureDetailSheet({
	data,
	open,
	onOpenChange,
}: {
	data: MeasureWithImpact | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	if (!data) return null;

	return (
		<MeasureDetailSheetInner
			data={data}
			open={open}
			onOpenChange={onOpenChange}
		/>
	);
}

function MeasureDetailSheetInner({
	data,
	open,
	onOpenChange,
}: {
	data: MeasureWithImpact;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const profile = useProfile();
	const { measure, impact } = data;
	const colors = DIRECTION_COLORS[impact.direction];
	const Icon = DIRECTION_ICON[impact.direction];

	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
				body: {
					measureId: measure.id,
					profile: {
						zipCode: profile.zipCode,
						housingStatus: profile.housingStatus,
						homeValue: profile.homeValue,
						monthlyRent: profile.monthlyRent,
						incomeRange: profile.incomeRange,
						jobSector: profile.jobSector,
						householdSize: profile.householdSize,
					},
				},
			}),
		[
			measure.id,
			profile.zipCode,
			profile.housingStatus,
			profile.homeValue,
			profile.monthlyRent,
			profile.incomeRange,
			profile.jobSector,
			profile.householdSize,
		],
	);

	const { messages, sendMessage, status } = useChat({
		id: `explain-${measure.id}`,
		transport,
	});

	const isStreaming = status === "streaming" || status === "submitted";
	const aiResponse = messages.find((m) => m.role === "assistant");
	const hasAsked = messages.some((m) => m.role === "user");

	const getMessageText = (m: (typeof messages)[0]) => {
		return m.parts
			.filter((p) => p.type === "text")
			.map((p) => p.text)
			.join("");
	};

	const handleExplain = () => {
		if (hasAsked || isStreaming) return;
		sendMessage({
			text: `Explain ${measure.code} (${measure.title}) to me in simple terms. How does it affect me personally based on my profile?`,
		});
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="overflow-y-auto border-white/[0.08] bg-background px-6 pb-8 sm:max-w-lg">
				<SheetHeader className="gap-4 px-0 pb-0">
					{/* Code + category */}
					<div className="flex items-center gap-2">
						<Badge
							variant="outline"
							className="border-white/[0.1] bg-white/[0.04] font-mono text-xs text-white/60"
						>
							{measure.code}
						</Badge>
						<span className="text-xs text-white/30">
							{CATEGORY_LABELS[measure.category] ?? measure.category}
						</span>
					</div>

					<SheetTitle className="text-xl font-bold leading-tight text-foreground">
						{measure.title}
					</SheetTitle>

					<p className="text-sm leading-relaxed text-muted-foreground">
						{measure.summary}
					</p>
				</SheetHeader>

				<Separator className="my-6 opacity-30" />

				{/* Impact section */}
				<div className="space-y-4">
					<h4 className="text-xs font-semibold uppercase tracking-widest text-white/40">
						Your Impact
					</h4>

					<div
						className={`flex items-center gap-4 rounded-xl border p-5 ${colors.bg} ${colors.border}`}
					>
						<div
							className={`flex size-12 items-center justify-center rounded-xl ${colors.bg}`}
						>
							<Icon className={`size-6 ${colors.text}`} />
						</div>
						<div>
							<p className={`text-2xl font-bold ${colors.text}`}>
								{impact.impact}
							</p>
							<p className="text-xs text-muted-foreground">
								{impact.direction === "positive"
									? "Estimated savings"
									: impact.direction === "negative"
										? "Estimated cost"
										: "No direct financial impact"}
							</p>
						</div>
					</div>

					<p className="text-sm leading-relaxed text-muted-foreground">
						{impact.explanation}
					</p>
				</div>

				<Separator className="my-6 opacity-30" />

				{/* Methodology */}
				<div className="space-y-3">
					<h4 className="text-xs font-semibold uppercase tracking-widest text-white/40">
						How we calculated this
					</h4>
					<div className="flex gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
						<Info className="mt-0.5 size-4 shrink-0 text-white/30" />
						<p className="text-xs leading-relaxed text-muted-foreground">
							This estimate is based on your civic profile — housing status,
							income range, household size, and location. Actual impacts may
							vary depending on implementation details and your specific
							circumstances.
						</p>
					</div>
				</div>

				<Separator className="my-6 opacity-30" />

				{/* AI Explain */}
				<div className="space-y-3">
					{!hasAsked ? (
						<Button
							variant="outline"
							onClick={handleExplain}
							className="w-full gap-2 border-violet-500/20 bg-violet-500/5 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
						>
							<Sparkles className="size-4" />
							Explain This to Me
						</Button>
					) : (
						<div className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-4">
							<div className="mb-2 flex items-center gap-2">
								<Sparkles className="size-3.5 text-violet-400" />
								<span className="text-xs font-medium text-violet-300">
									AI Explanation
								</span>
							</div>
							{isStreaming && !aiResponse ? (
								<div className="flex items-center gap-2 py-2">
									<Loader className="size-3.5 animate-spin text-violet-400/50" />
									<span className="text-xs text-white/30">
										Generating explanation...
									</span>
								</div>
							) : (
								<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
									{aiResponse ? getMessageText(aiResponse) : ""}
								</p>
							)}
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
