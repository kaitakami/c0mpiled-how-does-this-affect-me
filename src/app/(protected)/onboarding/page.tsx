"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
	Vote,
	MapPin,
	Home,
	Building2,
	DollarSign,
	Users,
	ArrowRight,
	ArrowLeft,
	Loader2,
	Check,
	Briefcase,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, MapTileLayer, MapCircle } from "@/components/ui/map";
import { api } from "@/lib/api-client";
import type { HousingStatus, IncomeRange, JobSector } from "@/types";
import type { LatLngExpression } from "leaflet";

const TOTAL_STEPS = 4;

const INCOME_OPTIONS: { value: IncomeRange; label: string; short: string }[] = [
	{ value: "under-25k", label: "Under $25k", short: "<$25k" },
	{ value: "25k-50k", label: "$25k – $50k", short: "$25–50k" },
	{ value: "50k-75k", label: "$50k – $75k", short: "$50–75k" },
	{ value: "75k-100k", label: "$75k – $100k", short: "$75–100k" },
	{ value: "100k-150k", label: "$100k – $150k", short: "$100–150k" },
	{ value: "150k-200k", label: "$150k – $200k", short: "$150–200k" },
	{ value: "over-200k", label: "Over $200k", short: "$200k+" },
];

const JOB_SECTORS: { value: JobSector; label: string; icon: typeof Briefcase }[] = [
	{ value: "tech", label: "Technology", icon: Briefcase },
	{ value: "healthcare", label: "Healthcare", icon: Briefcase },
	{ value: "education", label: "Education", icon: Briefcase },
	{ value: "finance", label: "Finance", icon: Briefcase },
	{ value: "government", label: "Government", icon: Briefcase },
	{ value: "retail", label: "Retail", icon: Briefcase },
	{ value: "hospitality", label: "Hospitality", icon: Briefcase },
	{ value: "manufacturing", label: "Manufacturing", icon: Briefcase },
	{ value: "construction", label: "Construction", icon: Briefcase },
	{ value: "other", label: "Other", icon: Briefcase },
];

export default function OnboardingPage() {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const [direction, setDirection] = useState<"forward" | "back">("forward");
	const [submitting, setSubmitting] = useState(false);

	// Map state
	const DEFAULT_CENTER: LatLngExpression = [34.8833, 134.3667]; // Kamigori, Japan
	const [mapCenter, setMapCenter] = useState<LatLngExpression>(DEFAULT_CENTER);
	const [locationName, setLocationName] = useState("");
	const [geocoding, setGeocoding] = useState(false);
	const [hasGeocodedResult, setHasGeocodedResult] = useState(false);
	const geocodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Form state
	const [zipCode, setZipCode] = useState("");
	const [housingStatus, setHousingStatus] = useState<HousingStatus | null>(null);
	const [homeValue, setHomeValue] = useState("");
	const [monthlyRent, setMonthlyRent] = useState("");
	const [incomeRange, setIncomeRange] = useState<IncomeRange | null>(null);
	const [jobSector, setJobSector] = useState<JobSector | null>(null);
	const [householdSize, setHouseholdSize] = useState("1");

	// Geocode ZIP code via Nominatim (free, no API key)
	useEffect(() => {
		if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);

		if (zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
			if (hasGeocodedResult) {
				setMapCenter(DEFAULT_CENTER);
				setLocationName("");
				setHasGeocodedResult(false);
			}
			setGeocoding(false);
			return;
		}

		setGeocoding(true);

		geocodeTimeout.current = setTimeout(async () => {
			try {
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=US&format=json&limit=1`,
					{ headers: { "User-Agent": "HowDoesThisAffectMe/1.0" } },
				);
				const data = await res.json();
				if (data.length > 0) {
					setMapCenter([Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)]);
					setLocationName(data[0].display_name?.split(",").slice(0, 2).join(",") ?? "");
					setHasGeocodedResult(true);
				}
			} catch {
				// Geocoding failed silently
			} finally {
				setGeocoding(false);
			}
		}, 400);

		return () => {
			if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
		};
	}, [zipCode]);

	const canProceed = useCallback(() => {
		switch (step) {
			case 0:
				return zipCode.length === 5 && /^\d{5}$/.test(zipCode);
			case 1:
				if (!housingStatus) return false;
				if (housingStatus === "owner" && !homeValue) return false;
				if (housingStatus === "renter" && !monthlyRent) return false;
				return true;
			case 2:
				return incomeRange !== null && jobSector !== null;
			case 3:
				return Number.parseInt(householdSize) >= 1;
			default:
				return false;
		}
	}, [step, zipCode, housingStatus, homeValue, monthlyRent, incomeRange, jobSector, householdSize]);

	const goNext = () => {
		if (step < TOTAL_STEPS - 1) {
			setDirection("forward");
			setStep((s) => s + 1);
		}
	};

	const goBack = () => {
		if (step > 0) {
			setDirection("back");
			setStep((s) => s - 1);
		}
	};

	const handleSubmit = async () => {
		if (!housingStatus || !incomeRange || !jobSector) return;

		setSubmitting(true);
		try {
			await api.createUserProfile({
				userId: `user-${Date.now()}`,
				zipCode,
				housingStatus,
				homeValue: housingStatus === "owner" ? Number.parseInt(homeValue) : null,
				monthlyRent: housingStatus === "renter" ? Number.parseInt(monthlyRent) : null,
				incomeRange,
				jobSector,
				householdSize: Number.parseInt(householdSize),
			});
			router.push("/dashboard");
		} catch {
			setSubmitting(false);
		}
	};

	const inputClasses =
		"h-12 rounded-lg border-white/[0.08] bg-white/[0.03] placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 text-base";

	const animationStyle = {
		animation: `${direction === "forward" ? "slide-in-right" : "slide-in-left"} 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
	};

	return (
		<div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
			{/* Background effects */}
			<div className="pointer-events-none fixed inset-0 bg-dot-pattern opacity-15" />
			<div className="pointer-events-none fixed inset-0">
				<div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_oklch(0.55_0.15_260_/_12%)_0%,_transparent_70%)]" />
			</div>

			{/* Top bar */}
			<div
				className="flex items-center justify-between px-6 py-5"
				style={{ animation: "fade-in 0.4s ease-out" }}
			>
				<div className="flex items-center gap-2.5">
					<div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.06]">
						<Vote className="size-4 text-white/80" />
					</div>
					<span className="text-sm font-medium text-white/60">
						How Does This Affect Me?
					</span>
				</div>
				<span className="text-xs font-medium tabular-nums text-white/30">
					{step + 1} / {TOTAL_STEPS}
				</span>
			</div>

			{/* Progress bar — thin line across the top */}
			<div className="relative h-px w-full bg-white/[0.06]">
				<div
					className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/40 to-white/20 transition-all duration-500 ease-out"
					style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
				/>
			</div>

			{/* Main content — centered */}
			<div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
				<div className="w-full max-w-lg">
					<div key={step} style={animationStyle}>
						{/* ─── Step 0: Location ─── */}
						{step === 0 && (
							<div className="flex flex-col items-center">
								{/* Step icon */}
								<div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
									<MapPin className="size-6 text-white/70" />
								</div>

								<h1 className="text-center text-3xl font-bold tracking-tight text-foreground">
									Where do you vote?
								</h1>
								<p className="mt-3 text-center text-base text-muted-foreground">
									Your ZIP code determines which ballot measures affect you.
								</p>

								<div className="mt-8 w-full space-y-4">
									<div className="w-full">
										<Label htmlFor="zip" className="sr-only">
											ZIP Code
										</Label>
										<Input
											id="zip"
											type="text"
											inputMode="numeric"
											maxLength={5}
											placeholder="Enter your ZIP code"
											value={zipCode}
											onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
											className={`${inputClasses} text-center text-lg tracking-widest`}
											autoFocus
										/>
									</div>

									{/* Map */}
									<div className="relative overflow-hidden rounded-xl border border-white/[0.08]">
										<Map
											key={`${(mapCenter as number[])[0]}-${(mapCenter as number[])[1]}`}
											center={mapCenter}
											zoom={hasGeocodedResult ? 12 : 6}
											className="h-56 w-full !min-h-0 !rounded-xl"
											scrollWheelZoom={false}
											dragging={false}
											doubleClickZoom={false}
											touchZoom={false}
										>
											<MapTileLayer />
											{hasGeocodedResult && (
												<MapCircle
													center={mapCenter}
													radius={3000}
													className="!fill-white/10 !stroke-white/30 !stroke-1"
												/>
											)}
										</Map>

										{/* Geocoding loader overlay */}
										{geocoding && (
											<div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
												<div className="flex flex-col items-center gap-3">
													<div className="relative size-8">
														<div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-white/70" style={{ animationDuration: "0.8s" }} />
													</div>
													<span className="text-xs font-medium text-white/60">Finding your area...</span>
												</div>
											</div>
										)}

										{locationName && !geocoding && (
											<div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
												<p className="flex items-center gap-2 text-sm text-muted-foreground">
													<MapPin className="size-3.5 shrink-0 text-white/40" />
													{locationName}
												</p>
											</div>
										)}
									</div>

									<Button
										onClick={goNext}
										disabled={!canProceed()}
										size="lg"
										className="h-12 w-full gap-2 rounded-xl text-base"
									>
										Continue
										<ArrowRight className="size-4" />
									</Button>
								</div>
							</div>
						)}

						{/* ─── Step 1: Housing ─── */}
						{step === 1 && (
							<div className="flex flex-col items-center">
								<div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
									<Home className="size-6 text-white/70" />
								</div>

								<h1 className="text-center text-3xl font-bold tracking-tight text-foreground">
									Your housing situation
								</h1>
								<p className="mt-3 text-center text-base text-muted-foreground">
									This helps calculate property tax and rent-related impacts.
								</p>

								<div className="mt-10 w-full space-y-6">
									{/* Housing type cards */}
									<div className="grid grid-cols-2 gap-4">
										<button
											type="button"
											onClick={() => setHousingStatus("renter")}
											className={`group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border p-6 transition-all duration-300 ${
												housingStatus === "renter"
													? "border-white/20 bg-white/[0.06]"
													: "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
											}`}
										>
											{housingStatus === "renter" && (
												<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.6_0.15_260_/_6%)_0%,_transparent_70%)]" />
											)}
											<div
												className={`relative flex size-12 items-center justify-center rounded-xl border transition-all duration-300 ${
													housingStatus === "renter"
														? "border-white/15 bg-white/[0.08]"
														: "border-white/[0.06] bg-white/[0.03]"
												}`}
											>
												<Building2
													className={`size-5 transition-colors duration-300 ${
														housingStatus === "renter" ? "text-white" : "text-white/30"
													}`}
												/>
											</div>
											<div className="relative text-center">
												<span
													className={`text-sm font-semibold transition-colors duration-300 ${
														housingStatus === "renter" ? "text-foreground" : "text-muted-foreground"
													}`}
												>
													Renter
												</span>
												<p className="mt-0.5 text-xs text-muted-foreground/60">
													I pay monthly rent
												</p>
											</div>
											{housingStatus === "renter" && (
												<div className="absolute right-3 top-3">
													<div className="flex size-5 items-center justify-center rounded-full bg-white/15">
														<Check className="size-3 text-white" />
													</div>
												</div>
											)}
										</button>

										<button
											type="button"
											onClick={() => setHousingStatus("owner")}
											className={`group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border p-6 transition-all duration-300 ${
												housingStatus === "owner"
													? "border-white/20 bg-white/[0.06]"
													: "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
											}`}
										>
											{housingStatus === "owner" && (
												<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.6_0.15_260_/_6%)_0%,_transparent_70%)]" />
											)}
											<div
												className={`relative flex size-12 items-center justify-center rounded-xl border transition-all duration-300 ${
													housingStatus === "owner"
														? "border-white/15 bg-white/[0.08]"
														: "border-white/[0.06] bg-white/[0.03]"
												}`}
											>
												<Home
													className={`size-5 transition-colors duration-300 ${
														housingStatus === "owner" ? "text-white" : "text-white/30"
													}`}
												/>
											</div>
											<div className="relative text-center">
												<span
													className={`text-sm font-semibold transition-colors duration-300 ${
														housingStatus === "owner" ? "text-foreground" : "text-muted-foreground"
													}`}
												>
													Homeowner
												</span>
												<p className="mt-0.5 text-xs text-muted-foreground/60">
													I own my home
												</p>
											</div>
											{housingStatus === "owner" && (
												<div className="absolute right-3 top-3">
													<div className="flex size-5 items-center justify-center rounded-full bg-white/15">
														<Check className="size-3 text-white" />
													</div>
												</div>
											)}
										</button>
									</div>

									{/* Conditional fields */}
									{housingStatus === "renter" && (
										<div
											className="space-y-2"
											style={{ animation: "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
										>
											<Label htmlFor="rent" className="text-sm text-muted-foreground">
												Monthly rent
											</Label>
											<div className="relative">
												<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
													$
												</span>
												<Input
													id="rent"
													type="text"
													inputMode="numeric"
													placeholder="2,000"
													value={monthlyRent}
													onChange={(e) =>
														setMonthlyRent(e.target.value.replace(/\D/g, ""))
													}
													className={`${inputClasses} pl-8`}
													autoFocus
												/>
											</div>
										</div>
									)}

									{housingStatus === "owner" && (
										<div
											className="space-y-2"
											style={{ animation: "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
										>
											<Label htmlFor="homeValue" className="text-sm text-muted-foreground">
												Estimated home value
											</Label>
											<div className="relative">
												<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
													$
												</span>
												<Input
													id="homeValue"
													type="text"
													inputMode="numeric"
													placeholder="500,000"
													value={homeValue}
													onChange={(e) =>
														setHomeValue(e.target.value.replace(/\D/g, ""))
													}
													className={`${inputClasses} pl-8`}
													autoFocus
												/>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* ─── Step 2: Income & Job ─── */}
						{step === 2 && (
							<div className="flex flex-col items-center">
								<div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
									<DollarSign className="size-6 text-white/70" />
								</div>

								<h1 className="text-center text-3xl font-bold tracking-tight text-foreground">
									Income & employment
								</h1>
								<p className="mt-3 text-center text-base text-muted-foreground">
									Used to estimate tax impacts and sector-specific effects.
								</p>

								<div className="mt-10 w-full space-y-8">
									{/* Income range */}
									<div className="space-y-3">
										<Label className="text-sm font-medium text-muted-foreground">
											Household income
										</Label>
										<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
											{INCOME_OPTIONS.map((opt) => (
												<button
													key={opt.value}
													type="button"
													onClick={() => setIncomeRange(opt.value)}
													className={`relative rounded-lg border px-3 py-2.5 text-center text-sm transition-all duration-200 ${
														incomeRange === opt.value
															? "border-white/20 bg-white/[0.08] text-foreground font-medium"
															: "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:border-white/[0.12] hover:bg-white/[0.04]"
													}`}
												>
													{opt.short}
													{incomeRange === opt.value && (
														<div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-white/20">
															<Check className="size-2.5 text-white" />
														</div>
													)}
												</button>
											))}
										</div>
									</div>

									{/* Job sector */}
									<div className="space-y-3">
										<Label className="text-sm font-medium text-muted-foreground">
											Job sector
										</Label>
										<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
											{JOB_SECTORS.map((opt) => (
												<button
													key={opt.value}
													type="button"
													onClick={() => setJobSector(opt.value)}
													className={`relative rounded-lg border px-3 py-2.5 text-center text-sm transition-all duration-200 ${
														jobSector === opt.value
															? "border-white/20 bg-white/[0.08] text-foreground font-medium"
															: "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:border-white/[0.12] hover:bg-white/[0.04]"
													}`}
												>
													{opt.label}
													{jobSector === opt.value && (
														<div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-white/20">
															<Check className="size-2.5 text-white" />
														</div>
													)}
												</button>
											))}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* ─── Step 3: Household ─── */}
						{step === 3 && (
							<div className="flex flex-col items-center">
								<div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
									<Users className="size-6 text-white/70" />
								</div>

								<h1 className="text-center text-3xl font-bold tracking-tight text-foreground">
									How many people live with you?
								</h1>
								<p className="mt-3 text-center text-base text-muted-foreground">
									Per-household costs from sales taxes, bonds, and services.
								</p>

								{/* Counter */}
								<div className="mt-12 flex items-center gap-8">
									<button
										type="button"
										onClick={() =>
											setHouseholdSize((s) =>
												String(Math.max(1, Number.parseInt(s) - 1)),
											)
										}
										disabled={householdSize === "1"}
										className="flex size-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xl font-light text-foreground transition-all hover:border-white/[0.16] hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
									>
										-
									</button>
									<div className="flex flex-col items-center">
										<span className="text-6xl font-bold tabular-nums tracking-tight text-foreground">
											{householdSize}
										</span>
										<span className="mt-1 text-sm text-muted-foreground">
											{Number.parseInt(householdSize) === 1
												? "Just you"
												: `${householdSize} people`}
										</span>
									</div>
									<button
										type="button"
										onClick={() =>
											setHouseholdSize((s) =>
												String(Math.min(12, Number.parseInt(s) + 1)),
											)
										}
										disabled={householdSize === "12"}
										className="flex size-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xl font-light text-foreground transition-all hover:border-white/[0.16] hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
									>
										+
									</button>
								</div>

								{/* Summary */}
								<div
									className="mt-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
									style={{ animation: "fade-in 0.5s ease-out 0.15s both" }}
								>
									<div className="mb-4 flex items-center gap-2">
										<Sparkles className="size-3.5 text-white/40" />
										<span className="text-xs font-medium uppercase tracking-widest text-white/40">
											Profile summary
										</span>
									</div>
									<div className="grid grid-cols-2 gap-x-6 gap-y-3">
										<div>
											<p className="text-xs text-muted-foreground">Location</p>
											<p className="mt-0.5 text-sm font-medium text-foreground">{zipCode}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Housing</p>
											<p className="mt-0.5 text-sm font-medium text-foreground">
												{housingStatus === "renter"
													? `Renter, $${Number(monthlyRent).toLocaleString()}/mo`
													: `Owner, $${Number(homeValue).toLocaleString()}`}
											</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Income</p>
											<p className="mt-0.5 text-sm font-medium text-foreground">
												{INCOME_OPTIONS.find((o) => o.value === incomeRange)?.label}
											</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Sector</p>
											<p className="mt-0.5 text-sm font-medium text-foreground">
												{JOB_SECTORS.find((o) => o.value === jobSector)?.label}
											</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Navigation */}
					<div className="mt-10 flex flex-col gap-4">
						{step > 0 && step < TOTAL_STEPS - 1 ? (
							<Button
								onClick={goNext}
								disabled={!canProceed()}
								size="lg"
								className="h-12 w-full gap-2 rounded-xl text-base"
							>
								Continue
								<ArrowRight className="size-4" />
							</Button>
						) : step === TOTAL_STEPS - 1 ? (
							<Button
								onClick={handleSubmit}
								disabled={!canProceed() || submitting}
								size="lg"
								className="h-12 w-full gap-2 rounded-xl text-base"
							>
								{submitting ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Setting up...
									</>
								) : (
									<>
										<Sparkles className="size-4" />
										Get My Ballot Report
									</>
								)}
							</Button>
						) : null}
						{step > 0 && (
							<button
								type="button"
								onClick={goBack}
								className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								<ArrowLeft className="size-3.5" />
								Back
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
