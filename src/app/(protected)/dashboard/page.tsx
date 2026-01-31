import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Vote } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
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
    <div className="relative min-h-screen bg-background">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 bg-dot-pattern opacity-20" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 border border-white/[0.06]">
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
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {session.user.name.split(" ")[0]}. Your personalized
            ballot insights will appear here.
          </p>
        </div>

        <Separator className="mb-8 opacity-50" />

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Vote className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No ballot data yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Enter your location and a few details to get your personalized
            ballot impact report.
          </p>
          <Button className="mt-6 gap-2">Get Your Report</Button>
        </div>
      </main>
    </div>
  );
}
