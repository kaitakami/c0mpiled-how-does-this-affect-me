"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Vote, ArrowLeft, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/onboarding",
    });

    if (error) {
      setError(error.message ?? "Failed to create account");
      setLoading(false);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 bg-dot-pattern opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-glow-primary opacity-50" />

      {/* Back to home */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-10 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      {/* Auth card */}
      <div
        className="relative w-full max-w-sm"
        style={{ animation: "fade-up 0.6s ease-out" }}
      >
        {/* Logo + heading */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white/10 border border-white/[0.08]">
            <Vote className="size-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started with personalized ballot insights
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
            <div className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm text-muted-foreground"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 border-white/[0.08] bg-white/[0.04] placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm text-muted-foreground"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 border-white/[0.08] bg-white/[0.04] placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm text-muted-foreground"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-10 border-white/[0.08] bg-white/[0.04] placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-white/10"
                />
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
