"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ImpactCardSkeleton() {
	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
			{/* Accent bar */}
			<div className="h-[3px] w-full bg-white/[0.06]" />

			<div className="flex flex-col gap-3 p-5">
				{/* Code + category */}
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="h-3 w-12" />
				</div>

				{/* Title */}
				<Skeleton className="h-4 w-3/4" />

				{/* Impact */}
				<Skeleton className="h-7 w-24 rounded-md" />

				{/* Explanation */}
				<div className="space-y-1.5">
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-2/3" />
				</div>
			</div>
		</div>
	);
}
