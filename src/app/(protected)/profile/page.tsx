import { ArrowLeft, Vote } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { ProfileGuard } from "../dashboard/profile-guard";
import { SignOutButton } from "../dashboard/sign-out-button";
import { ProfileContent } from "./profile-content";

export default async function ProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	const initials = session.user.name
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<ProfileGuard>
			<div className="relative min-h-screen bg-background">
				<div className="pointer-events-none fixed inset-0 bg-dot-pattern opacity-20" />

				{/* Header */}
				<header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
					<div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
						<Link href="/" className="flex items-center gap-2.5">
							<div className="flex size-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/10">
								<Vote className="size-4 text-white" />
							</div>
							<span className="text-sm font-semibold tracking-tight text-foreground">
								How Does This Affect Me?
							</span>
						</Link>

						<div className="flex items-center gap-4">
							<div className="flex items-center gap-3">
								<Avatar className="size-8 border border-white/[0.08]">
									<AvatarFallback className="bg-white/10 text-xs text-foreground">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div className="hidden sm:block">
									<p className="text-sm font-medium text-foreground">
										{session.user.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{session.user.email}
									</p>
								</div>
							</div>
							<SignOutButton />
						</div>
					</div>
				</header>

				{/* Content */}
				<main className="mx-auto max-w-4xl px-6 py-12">
					<div className="mb-2">
						<Link
							href="/dashboard"
							className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							<ArrowLeft className="size-3.5" />
							Back to Dashboard
						</Link>
					</div>

					<div className="mb-8">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Profile
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Your account, civic profile, and memory debug info.
						</p>
					</div>

					<Separator className="mb-8 opacity-50" />

					<ProfileContent />
				</main>
			</div>
		</ProfileGuard>
	);
}
