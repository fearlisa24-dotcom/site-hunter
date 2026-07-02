import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Compass,
  Search,
  Sparkles,
  Target,
  Zap,
  MessageSquare,
  Globe,
  ShieldCheck,
  Plus,
  Minus,
} from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DashboardPreview } from "@/components/dashboard-preview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scoutly — Find your next website client before anyone else" },
      {
        name: "description",
        content:
          "Scoutly helps freelancers discover businesses without websites, research them with AI, and turn opportunities into paying clients.",
      },
      { property: "og:title", content: "Scoutly — Find your next website client" },
      {
        property: "og:description",
        content: "Discover businesses that need websites. Research them with AI. Win more clients.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustBar />
      <DashboardShowcase />
      <Features />
      <SocialProof />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 soft-grid-bg" />
      <div className="container-scoutly pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            New · AI research reports in one click
          </div>
          <h1 className="text-display text-5xl text-foreground md:text-7xl">
            Find your next website client{" "}
            <span className="italic text-soft-blue">before anyone else.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Scoutly helps freelancers discover businesses without websites, research them using AI,
            and turn opportunities into paying clients.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-6 text-sm font-medium text-navy-foreground shadow-soft transition hover:opacity-90"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-hairline bg-surface-elevated px-6 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free forever plan · No credit card required
          </p>
        </div>

        <div className="mt-20">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const logos = ["Northwind", "Acme Studio", "Kinfolk", "Lumen", "Foundry", "Halcyon"];
  return (
    <section className="border-y border-hairline bg-surface">
      <div className="container-scoutly py-10">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by 3,200+ independent freelancers and studios
        </p>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 md:grid-cols-6">
          {logos.map((l) => (
            <div key={l} className="text-center text-lg font-semibold tracking-tight text-muted-foreground/60">
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardShowcase() {
  return (
    <section id="how" className="container-scoutly py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-soft-blue">How it works</p>
        <h2 className="text-display mt-4 text-4xl md:text-5xl">Discovery, on autopilot.</h2>
        <p className="mt-4 text-muted-foreground">
          Three steps from empty pipeline to a shortlist of qualified opportunities.
        </p>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          {
            n: "01",
            icon: Search,
            title: "Search a market",
            body: "Pick a city, industry, and radius. Scoutly scans thousands of local businesses.",
          },
          {
            n: "02",
            icon: Target,
            title: "Spot the gaps",
            body: "We surface businesses with no website, weak presence, or outdated pages first.",
          },
          {
            n: "03",
            icon: Sparkles,
            title: "Research with AI",
            body: "Generate a full brief and outreach message tailored to each opportunity.",
          },
        ].map((s) => (
          <div key={s.n} className="group rounded-3xl border border-hairline bg-card p-8 transition hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-navy-foreground">
                <s.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">{s.n}</span>
            </div>
            <h3 className="mt-8 text-lg font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-t border-hairline bg-surface py-24 md:py-32">
      <div className="container-scoutly">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-soft-blue">Features</p>
          <h2 className="text-display mt-4 text-4xl md:text-5xl">Everything you need to close.</h2>
          <p className="mt-4 text-muted-foreground">
            Built for freelancers who prefer building sites over cold prospecting.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-6 md:grid-rows-2">
          <FeatureCard
            className="md:col-span-4 md:row-span-1"
            icon={Compass}
            title="Opportunity scoring"
            body="Every business is scored 0–100 based on website status, reviews, presence, and industry signals. Focus on the highest-leverage leads first."
            visual={<ScoreVisual />}
          />
          <FeatureCard
            className="md:col-span-2"
            icon={Zap}
            title="Instant enrichment"
            body="Phone, email, address, socials, and hours — auto-filled."
          />
          <FeatureCard
            className="md:col-span-2"
            icon={MessageSquare}
            title="AI outreach"
            body="Personalised first-touch messages, ready to send."
          />
          <FeatureCard
            className="md:col-span-4"
            icon={Globe}
            title="Website intelligence"
            body="See who has no site, an outdated site, or a template. Detect Wix, Squarespace, WordPress, and more with confidence scores."
            visual={<SiteVisual />}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  className = "",
  visual,
}: {
  icon: any;
  title: string;
  body: string;
  className?: string;
  visual?: React.ReactNode;
}) {
  return (
    <div className={`group flex flex-col overflow-hidden rounded-3xl border border-hairline bg-card p-8 transition hover:shadow-card ${className}`}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      {visual && <div className="mt-6 flex-1">{visual}</div>}
    </div>
  );
}

function ScoreVisual() {
  return (
    <div className="rounded-2xl border border-hairline bg-background p-4">
      <div className="space-y-2.5">
        {[
          { n: "Loro Asian Smokehouse", s: 92, t: "No website" },
          { n: "East Side Pies", s: 87, t: "Outdated" },
          { n: "Franklin BBQ Co.", s: 78, t: "Template" },
          { n: "Mueller Coffee", s: 64, t: "Weak SEO" },
        ].map((r) => (
          <div key={r.n} className="flex items-center gap-3 text-sm">
            <div className="w-40 truncate text-foreground">{r.n}</div>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
              <div className="h-full rounded-full bg-gradient-to-r from-soft-blue to-subtle-purple" style={{ width: `${r.s}%` }} />
            </div>
            <div className="w-8 text-right text-xs font-semibold text-navy">{r.s}</div>
            <div className="w-20 text-right text-[10px] text-muted-foreground">{r.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteVisual() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { l: "No website", c: "bg-soft-blue/15 text-navy", n: 148 },
        { l: "Outdated", c: "bg-warning/15 text-warning", n: 72 },
        { l: "Template", c: "bg-subtle-purple/15 text-subtle-purple", n: 34 },
      ].map((x) => (
        <div key={x.l} className="rounded-xl border border-hairline bg-background p-4">
          <div className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${x.c}`}>{x.l}</div>
          <div className="text-display mt-3 text-3xl">{x.n}</div>
        </div>
      ))}
    </div>
  );
}

function SocialProof() {
  return (
    <section className="container-scoutly py-24 md:py-32">
      <div className="grid gap-16 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-soft-blue">Loved by freelancers</p>
          <h2 className="text-display mt-4 text-4xl md:text-5xl">
            The pipeline you always meant to build.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Freelancers use Scoutly to replace hours of manual prospecting with a repeatable, calm discovery ritual.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            {[
              { k: "3.2k", l: "Freelancers" },
              { k: "180k", l: "Leads scored" },
              { k: "4.9", l: "Avg rating" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-display text-3xl">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              q: "I booked two new websites in my first week. Scoutly turned prospecting from dread into a 10-minute morning routine.",
              n: "Maya R.",
              r: "Web designer, Austin",
            },
            {
              q: "The AI briefs are absurdly good. I walk into calls already knowing the business better than they do.",
              n: "Jordan T.",
              r: "Studio owner, Toronto",
            },
            {
              q: "The scoring is what makes it work. I only reach out to leads that make sense.",
              n: "Priya S.",
              r: "Freelancer, London",
            },
            {
              q: "It feels like a tool built by someone who actually freelances.",
              n: "Ben K.",
              r: "Developer, Berlin",
            },
          ].map((t) => (
            <figure key={t.n} className="rounded-2xl border border-hairline bg-card p-6">
              <blockquote className="text-sm leading-relaxed text-foreground">"{t.q}"</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-soft-blue to-subtle-purple" />
                <div className="text-xs">
                  <div className="font-medium">{t.n}</div>
                  <div className="text-muted-foreground">{t.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const plans = [
    {
      name: "Starter",
      priceM: 0,
      priceA: 0,
      tagline: "Explore your local market.",
      features: ["50 lookups / month", "Basic opportunity score", "Save up to 20 leads", "Email support"],
      cta: "Start free",
      featured: false,
    },
    {
      name: "Pro",
      priceM: 29,
      priceA: 23,
      tagline: "For freelancers with a real pipeline.",
      features: [
        "Unlimited lookups",
        "AI research reports",
        "AI outreach messages",
        "Unlimited saved leads",
        "CSV export",
        "Priority support",
      ],
      cta: "Start 14-day trial",
      featured: true,
    },
    {
      name: "Studio",
      priceM: 79,
      priceA: 63,
      tagline: "For teams and small agencies.",
      features: ["Everything in Pro", "3 team seats", "Shared lead board", "Custom scoring", "Dedicated onboarding"],
      cta: "Contact sales",
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="border-t border-hairline bg-surface py-24 md:py-32">
      <div className="container-scoutly">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-soft-blue">Pricing</p>
          <h2 className="text-display mt-4 text-4xl md:text-5xl">Simple pricing. Serious ROI.</h2>
          <p className="mt-4 text-muted-foreground">One paid client covers a full year.</p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-hairline bg-background p-1 text-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`h-8 rounded-full px-4 transition ${!annual ? "bg-navy text-navy-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`h-8 rounded-full px-4 transition ${annual ? "bg-navy text-navy-foreground" : "text-muted-foreground"}`}
            >
              Annual <span className="ml-1 text-[10px] opacity-80">−20%</span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                p.featured
                  ? "border-navy bg-navy text-navy-foreground shadow-elevated"
                  : "border-hairline bg-card"
              }`}
            >
              {p.featured && (
                <span className="absolute right-6 top-6 rounded-full bg-soft-blue/20 px-2.5 py-0.5 text-[10px] font-medium text-navy-foreground">
                  Most popular
                </span>
              )}
              <div className="text-sm font-medium">{p.name}</div>
              <div className="mt-2 text-xs opacity-70">{p.tagline}</div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-display text-5xl">${annual ? p.priceA : p.priceM}</span>
                <span className="text-sm opacity-70">/mo</span>
              </div>
              <Link
                to="/dashboard"
                className={`mt-6 inline-flex h-11 items-center justify-center rounded-full text-sm font-medium transition ${
                  p.featured
                    ? "bg-navy-foreground text-navy hover:opacity-90"
                    : "bg-navy text-navy-foreground hover:opacity-90"
                }`}
              >
                {p.cta}
              </Link>
              <ul className="mt-8 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.featured ? "text-soft-blue" : "text-navy"}`} />
                    <span className={p.featured ? "opacity-90" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          14-day money-back guarantee. Cancel any time.
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Where does Scoutly get its business data?",
      a: "We aggregate from public sources (Google Business, Yelp, OpenStreetMap, WHOIS) and enrich in real time so the results are always fresh.",
    },
    {
      q: "How is the opportunity score calculated?",
      a: "A weighted model combining website status, tech stack quality, review count and rating, category, and market density. Pro users can customise the weights.",
    },
    {
      q: "Can I export leads?",
      a: "Yes — Pro and Studio plans export to CSV, and Studio includes a webhook to push leads into your CRM.",
    },
    {
      q: "Is there a free plan?",
      a: "Yes. Starter is free forever with 50 lookups per month and the core discovery tools.",
    },
    {
      q: "Does Scoutly send outreach for me?",
      a: "No — we generate the message; you own the send. This keeps your deliverability and voice intact.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="container-scoutly py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-soft-blue">FAQ</p>
          <h2 className="text-display mt-4 text-4xl">Answers,{" "}<span className="italic">first.</span></h2>
          <p className="mt-4 max-w-sm text-muted-foreground">
            Something we didn't cover? <a href="#" className="text-foreground underline underline-offset-4">Talk to us.</a>
          </p>
        </div>
        <div className="divide-y divide-hairline border-y border-hairline">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <button
                key={it.q}
                onClick={() => setOpen(isOpen ? null : i)}
                className="grid w-full grid-cols-[1fr_auto] items-start gap-4 py-5 text-left"
              >
                <div>
                  <div className="text-base font-medium">{it.q}</div>
                  {isOpen && <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{it.a}</p>}
                </div>
                <span className="mt-1 grid h-7 w-7 place-items-center rounded-full border border-hairline text-muted-foreground">
                  {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="container-scoutly pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-navy p-12 text-navy-foreground md:p-20">
        <div className="absolute inset-0 -z-0 opacity-30 [background-image:radial-gradient(circle_at_20%_10%,oklch(0.72_0.11_250/0.5),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.68_0.12_290/0.4),transparent_50%)]" />
        <div className="relative max-w-2xl">
          <h2 className="text-display text-4xl md:text-6xl">
            Start finding your next client{" "}
            <span className="italic text-soft-blue">today.</span>
          </h2>
          <p className="mt-4 max-w-lg text-navy-foreground/70">
            Free forever plan. No credit card. Set up in 60 seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-navy-foreground px-6 text-sm font-medium text-navy transition hover:opacity-90"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-medium text-navy-foreground transition hover:bg-white/5"
            >
              View pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
