"use client";

import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BallotMeasure, CalculateImpactResponse } from "@/types";

const ACCENT_COLORS: Record<
	CalculateImpactResponse["direction"],
	{ bar: string; text: string; bg: string }
> = {
	positive: {
		bar: "bg-emerald-500",
		text: "text-emerald-400",
		bg: "bg-emerald-500/10",
	},
	negative: {
		bar: "bg-red-500",
		text: "text-red-400",
		bg: "bg-red-500/10",
	},
	neutral: {
		bar: "bg-white/20",
		text: "text-white/50",
		bg: "bg-white/[0.04]",
	},
};

const DIRECTION_ICON = {
	positive: TrendingUp,
	negative: TrendingDown,
	neutral: Minus,
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

export function ImpactCard({
	measure,
	impact,
	onClick,
}: {
	measure: BallotMeasure;
	impact: CalculateImpactResponse;
	onClick: () => void;
}) {
	const colors = ACCENT_COLORS[impact.direction];
	const Icon = DIRECTION_ICON[impact.direction];

	return (
		<button
			type="button"
			onClick={onClick}
			className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] text-left transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.04]"
		>
			{/* Accent bar */}
			<div className={`h-[3px] w-full ${colors.bar}`} />

			<div className="flex flex-1 flex-col gap-3 p-5">
				{/* Header: code + category */}
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className="border-white/[0.1] bg-white/[0.04] font-mono text-[11px] text-white/60"
					>
						{measure.code}
					</Badge>
					<span className="text-[11px] text-white/30">
						{CATEGORY_LABELS[measure.category] ?? measure.category}
					</span>
				</div>

				{/* Title */}
				<h3 className="text-sm font-semibold leading-snug text-foreground">
					{measure.title}
				</h3>

				{/* Impact amount */}
				<div className="flex items-center gap-2">
					<div
						className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${colors.bg}`}
					>
						<Icon className={`size-3.5 ${colors.text}`} />
						<span className={`text-sm font-bold ${colors.text}`}>
							{impact.impact}
						</span>
					</div>
				</div>

				{/* Explanation */}
				<p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
					{impact.explanation}
				</p>
			</div>

			{/* Hover arrow */}
			<div className="absolute right-3 top-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
				<ArrowRight className="size-4 text-white/30" />
			</div>
		</button>
	);
}
