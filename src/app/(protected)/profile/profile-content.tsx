"use client";

import {
	Briefcase,
	Building2,
	Database,
	DollarSign,
	Home,
	MapPin,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useProfile } from "@/lib/profile-context";

const INCOME_LABELS: Record<string, string> = {
	"under-25k": "Under $25k",
	"25k-50k": "$25k – $50k",
	"50k-75k": "$50k – $75k",
	"75k-100k": "$75k – $100k",
	"100k-150k": "$100k – $150k",
	"150k-200k": "$150k – $200k",
	"over-200k": "Over $200k",
};

const SECTOR_LABELS: Record<string, string> = {
	tech: "Technology",
	healthcare: "Healthcare",
	education: "Education",
	finance: "Finance",
	government: "Government",
	retail: "Retail",
	hospitality: "Hospitality",
	manufacturing: "Manufacturing",
	construction: "Construction",
	other: "Other",
};

interface SessionUser {
	id: string;
	name: string;
	email: string;
	createdAt?: Date;
}

export function ProfileContent() {
	const profile = useProfile();
	const [user, setUser] = useState<SessionUser | null>(null);
	// biome-ignore lint/suspicious/noExplicitAny: raw debug data from Hyperspell
	const [memory, setMemory] = useState<Record<string, any> | null>(null);
	const [memoryLoading, setMemoryLoading] = useState(true);
	const [sessionLoading, setSessionLoading] = useState(true);

	useEffect(() => {
		authClient.getSession().then((s) => {
			if (s.data?.user) {
				setUser(s.data.user as SessionUser);
			}
			setSessionLoading(false);
		});

		fetch("/api/memory/debug")
			.then((r) => r.json())
			.then((data) => setMemory(data.memory))
			.finally(() => setMemoryLoading(false));
	}, []);

	return (
		<div className="space-y-6">
			{/* Account Info */}
			<Card className="border-white/[0.08] bg-white/[0.02]">
				<CardHeader>
					<CardTitle className="text-base">Account</CardTitle>
					<CardDescription>Your authentication details</CardDescription>
				</CardHeader>
				<CardContent>
					{sessionLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-4 w-64" />
							<Skeleton className="h-4 w-56" />
						</div>
					) : user ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InfoRow label="Name" value={user.name} />
							<InfoRow label="Email" value={user.email} />
							<InfoRow label="User ID" value={user.id} mono />
							{user.createdAt && (
								<InfoRow
									label="Created"
									value={new Date(user.createdAt).toLocaleDateString()}
								/>
							)}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							Unable to load session
						</p>
					)}
				</CardContent>
			</Card>

			{/* Civic Profile */}
			<Card className="border-white/[0.08] bg-white/[0.02]">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-base">Civic Profile</CardTitle>
							<CardDescription>
								Your personalization data used for impact calculations
							</CardDescription>
						</div>
						<Button variant="outline" size="sm" asChild>
							<Link href="/onboarding">Edit Profile</Link>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<ProfileField
							icon={MapPin}
							label="ZIP Code"
							value={profile.zipCode}
						/>
						<ProfileField
							icon={profile.housingStatus === "renter" ? Building2 : Home}
							label="Housing"
							value={
								profile.housingStatus === "renter"
									? `Renter — $${(profile.monthlyRent ?? 0).toLocaleString()}/mo`
									: `Homeowner — $${(profile.homeValue ?? 0).toLocaleString()}`
							}
						/>
						<ProfileField
							icon={DollarSign}
							label="Income Range"
							value={INCOME_LABELS[profile.incomeRange] ?? profile.incomeRange}
						/>
						<ProfileField
							icon={Briefcase}
							label="Job Sector"
							value={SECTOR_LABELS[profile.jobSector] ?? profile.jobSector}
						/>
						<ProfileField
							icon={Users}
							label="Household Size"
							value={`${profile.householdSize} ${profile.householdSize === 1 ? "person" : "people"}`}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Hyperspell Memory (Debug) */}
			<Card className="border-white/[0.08] bg-white/[0.02]">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Database className="size-4 text-muted-foreground" />
						<div>
							<CardTitle className="text-base">Hyperspell Memory</CardTitle>
							<CardDescription>
								Raw memory object stored in Hyperspell
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{memoryLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-32 w-full rounded-lg" />
						</div>
					) : memory ? (
						<div className="space-y-4">
							{memory.id && (
								<InfoRow label="Memory ID" value={String(memory.id)} mono />
							)}
							{memory.resource_id && (
								<InfoRow
									label="Resource ID"
									value={String(memory.resource_id)}
									mono
								/>
							)}
							{memory.collection && (
								<InfoRow label="Collection" value={String(memory.collection)} />
							)}
							{memory.text && (
								<>
									<Separator className="opacity-30" />
									<div>
										<p className="mb-2 text-xs font-medium text-muted-foreground">
											Stored Text
										</p>
										<p className="text-sm leading-relaxed text-foreground/80">
											{String(memory.text)}
										</p>
									</div>
								</>
							)}
							<Separator className="opacity-30" />
							<div>
								<p className="mb-2 text-xs font-medium text-muted-foreground">
									Raw JSON
								</p>
								<pre className="overflow-x-auto rounded-lg border border-white/[0.06] bg-black/30 p-4 font-mono text-xs leading-relaxed text-emerald-400/80">
									{JSON.stringify(memory, null, 2)}
								</pre>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center py-8 text-center">
							<Database className="mb-3 size-8 text-white/10" />
							<p className="text-sm text-muted-foreground">
								No Hyperspell memory found for this user
							</p>
							<p className="mt-1 text-xs text-muted-foreground/60">
								Complete onboarding to create a memory
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// ── Helpers ──────────────────────────────────────────────────

function InfoRow({
	label,
	value,
	mono,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div>
			<p className="text-xs text-muted-foreground">{label}</p>
			<p
				className={`mt-0.5 text-sm text-foreground ${mono ? "font-mono text-xs break-all" : ""}`}
			>
				{value}
			</p>
		</div>
	);
}

function ProfileField({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof MapPin;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
				<Icon className="size-4 text-white/40" />
			</div>
			<div>
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
			</div>
		</div>
	);
}
