"use client";

import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useProfile } from "@/lib/profile-context";
import type { MeasureWithImpact } from "@/types";
import { AskBox } from "./ask-box";
import { ImpactCard } from "./impact-card";
import { ImpactCardSkeleton } from "./impact-card-skeleton";
import { MeasureDetailSheet } from "./measure-detail-sheet";

export function BallotDashboard() {
	const profile = useProfile();
	const [items, setItems] = useState<MeasureWithImpact[]>([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState<MeasureWithImpact | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	useEffect(() => {
		api
			.getAllImpacts({
				housingStatus: profile.housingStatus,
				homeValue: profile.homeValue,
				monthlyRent: profile.monthlyRent,
				incomeRange: profile.incomeRange,
				householdSize: profile.householdSize,
			})
			.then(setItems)
			.finally(() => setLoading(false));
	}, [profile]);

	const openDetail = useCallback((item: MeasureWithImpact) => {
		setSelected(item);
		setSheetOpen(true);
	}, []);

	// Calculate summary
	const totalSavings = items.reduce(
		(acc, i) => acc + (i.impact.direction === "positive" ? i.impact.amount : 0),
		0,
	);
	const totalCosts = items.reduce(
		(acc, i) => acc + (i.impact.direction === "negative" ? i.impact.amount : 0),
		0,
	);
	const netImpact = totalSavings - totalCosts;

	return (
		<>
			{/* AI Ask Box */}
			<AskBox />

			{/* Summary row */}
			{!loading && items.length > 0 && (
				<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<SummaryCard
						label="Total Savings"
						value={`$${totalSavings.toLocaleString()}/yr`}
						icon={TrendingUp}
						color="text-emerald-400"
						bg="bg-emerald-500/10"
					/>
					<SummaryCard
						label="Total Costs"
						value={`$${totalCosts.toLocaleString()}/yr`}
						icon={TrendingDown}
						color="text-red-400"
						bg="bg-red-500/10"
					/>
					<SummaryCard
						label="Net Impact"
						value={`${netImpact >= 0 ? "+" : "-"}$${Math.abs(netImpact).toLocaleString()}/yr`}
						icon={DollarSign}
						color={netImpact >= 0 ? "text-emerald-400" : "text-red-400"}
						bg={netImpact >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
					/>
				</div>
			)}

			{/* Impact cards grid */}
			{loading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((id) => (
						<ImpactCardSkeleton key={id} />
					))}
				</div>
			) : items.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-20 text-center">
					<p className="text-sm text-muted-foreground">
						No ballot measures found for your area.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => (
						<ImpactCard
							key={item.measure.id}
							measure={item.measure}
							impact={item.impact}
							onClick={() => openDetail(item)}
						/>
					))}
				</div>
			)}

			{/* Detail sheet */}
			<MeasureDetailSheet
				data={selected}
				open={sheetOpen}
				onOpenChange={setSheetOpen}
			/>
		</>
	);
}

// ── Summary Card ─────────────────────────────────────────────

function SummaryCard({
	label,
	value,
	icon: Icon,
	color,
	bg,
}: {
	label: string;
	value: string;
	icon: typeof DollarSign;
	color: string;
	bg: string;
}) {
	return (
		<div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
			<div
				className={`flex size-10 items-center justify-center rounded-lg ${bg}`}
			>
				<Icon className={`size-5 ${color}`} />
			</div>
			<div>
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className={`text-lg font-bold ${color}`}>{value}</p>
			</div>
		</div>
	);
}
