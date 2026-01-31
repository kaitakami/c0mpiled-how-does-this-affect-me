import Link from "next/link";
import {
  ArrowRight,
  Vote,
  BarChart3,
  Shield,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: BarChart3,
    title: "Personal Impact Score",
    description:
      "See exactly how each measure affects your taxes, housing, commute, and daily life with clear dollar amounts.",
  },
  {
    icon: Shield,
    title: "Plain Language Summaries",
    description:
      "No more legal jargon. Every measure explained in language anyone can understand, with honest pros and cons.",
  },
  {
    icon: Zap,
    title: "Tailored to Your Life",
    description:
      "Renter or owner, income range, neighborhood — your report is built around your actual situation.",
  },
];

const steps = [
  {
    step: "01",
    title: "Enter your location",
    description:
      "Share your address or zip code and we pull your exact ballot with every measure you can vote on.",
  },
  {
    step: "02",
    title: "Answer a few questions",
    description:
      "Quick profile — housing, income range, commute, what matters to you. Takes under 2 minutes.",
  },
  {
    step: "03",
    title: "Get your report",
    description:
      "Personalized impact breakdown for every measure. Real numbers, plain English, zero spin.",
  },
];

const previewMeasures = [
  {
    prop: "Prop A",
    title: "Affordable Housing Bond",
    impact: "Your rent could decrease ~$200/mo",
    tag: "Positive" as const,
  },
  {
    prop: "Prop K",
    title: "Sales Tax Increase",
    impact: "You'd pay ~$45 more per month",
    tag: "Negative" as const,
  },
  {
    prop: "Measure J",
    title: "Public Transit Expansion",
    impact: "Your commute improves by ~15 min",
    tag: "Positive" as const,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern mask-radial-faded" />
      <div className="pointer-events-none fixed inset-0 bg-glow-primary" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 border border-white/[0.06]">
              <Vote className="size-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              How Does This Affect Me?
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="gap-1.5">
                Get Started
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-36 md:pb-32">
        <div
          className="flex flex-col items-center text-center"
          style={{ animation: "fade-up 0.8s ease-out" }}
        >
          <Badge
            variant="outline"
            className="mb-6 gap-1.5 border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="size-3" />
            Powered by AI
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gradient sm:text-5xl md:text-6xl lg:text-7xl">
            Know exactly how your ballot affects you
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Stop guessing. Get personalized, plain-language breakdowns of every
            proposition, bond, and measure on your ballot — tailored to your
            life, your neighborhood, your wallet.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 px-8 text-base">
                Get Your Personalized Report
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-white/10 px-8 text-base"
              >
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Mock ballot preview */}
        <div
          className="mx-auto mt-20 max-w-2xl"
          style={{ animation: "fade-up 1s ease-out 0.3s both" }}
        >
          <div className="glass rounded-2xl p-1">
            <div className="rounded-xl bg-card/80 p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Your Ballot Impact Report
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    San Francisco, CA — November 2026
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  12 Measures
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {previewMeasures.map((item) => (
                  <div
                    key={item.prop}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-white/10 px-2 py-1 font-mono text-xs text-muted-foreground">
                        {item.prop}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.impact}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.tag === "Positive"
                          ? "border-emerald-500/30 text-emerald-400"
                          : "border-red-500/30 text-red-400"
                      }`}
                    >
                      {item.tag}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
            Built for informed voters
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            We translate dense ballot language into clear, personal impact
            statements you can actually understand.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-white/[0.06]">
                <feature.icon className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-6 py-24"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
            Three steps to clarity
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Get your personalized ballot breakdown in under 2 minutes.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="relative flex flex-col">
              <span className="font-mono text-5xl font-bold text-white/[0.06]">
                {item.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center md:p-20">
          <div className="pointer-events-none absolute inset-0 bg-glow-secondary" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
              Your ballot. Your impact. Your choice.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join voters who make more informed decisions with personalized
              ballot insights.
            </p>
            <Link href="/sign-up" className="mt-8 inline-block">
              <Button size="lg" className="gap-2 px-8 text-base">
                Get Started — It&apos;s Free
                <ChevronRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-white/10">
              <Vote className="size-3 text-white" />
            </div>
            <span className="text-sm text-muted-foreground">
              How Does This Affect Me?
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with care for informed democracy.
          </p>
        </div>
      </footer>
    </div>
  );
}
