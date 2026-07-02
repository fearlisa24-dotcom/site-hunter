import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Bell, Compass, LayoutDashboard, Bookmark, Settings, MapPin, Building2,
  Star, Phone, Mail, Instagram, Facebook, Globe, Sparkles, X, ArrowUpRight, Copy,
  CheckCircle2, ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Scoutly" },
      { name: "description", content: "Discover businesses that need websites." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type Business = {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviews: number;
  score: number;
  status: "No website" | "Outdated" | "Template";
  socials: Array<"instagram" | "facebook" | "web">;
  summary: string;
};

const businesses: Business[] = [
  { id: "1", name: "Loro Asian Smokehouse", category: "Restaurant", city: "South Lamar", address: "2115 S Lamar Blvd", phone: "(512) 916-4858", email: "hello@loro.com", rating: 4.6, reviews: 1240, score: 92, status: "No website", socials: ["instagram", "facebook"], summary: "Popular smokehouse with strong foot traffic but no dedicated website. Menu is only on third-party apps." },
  { id: "2", name: "East Side Pies", category: "Pizzeria", city: "Rosewood", address: "1401 Rosewood Ave", phone: "(512) 524-0933", email: "orders@eastsidepies.com", rating: 4.5, reviews: 890, score: 87, status: "Outdated", socials: ["instagram", "web"], summary: "Beloved local pizzeria with a website last updated in 2018. No online ordering." },
  { id: "3", name: "Franklin BBQ Co.", category: "BBQ", city: "Downtown", address: "900 E 11th St", phone: "(512) 653-1187", email: "info@franklinbbq.com", rating: 4.8, reviews: 2380, score: 78, status: "Template", socials: ["instagram", "facebook", "web"], summary: "Legendary BBQ using a generic Squarespace template. No brand story or merch shop." },
  { id: "4", name: "Mueller Coffee House", category: "Café", city: "Mueller", address: "1901 Aldrich St", phone: "(512) 953-3392", email: "hi@muellercoffee.com", rating: 4.4, reviews: 412, score: 74, status: "No website", socials: ["instagram"], summary: "Neighborhood café with a loyal following on Instagram. No web presence for hours, menu, or events." },
  { id: "5", name: "Barton Springs Nursery", category: "Garden", city: "Zilker", address: "3601 Bee Cave Rd", phone: "(512) 328-6655", email: "team@bartonspringsnursery.com", rating: 4.7, reviews: 620, score: 69, status: "Outdated", socials: ["facebook", "web"], summary: "Popular nursery with outdated site — no plant catalog or e-commerce." },
];

function DashboardPage() {
  const [selected, setSelected] = useState<Business | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSaved((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <TopBar />
        <main className="flex-1 overflow-x-hidden px-8 py-8">
          <div className="mx-auto max-w-6xl">
            <PageHeader />
            <SearchPanel />
            <ResultsHeader count={businesses.length} />
            <div className="mt-4 space-y-2">
              {businesses.map((b) => (
                <BusinessCard
                  key={b.id}
                  b={b}
                  saved={saved.has(b.id)}
                  onSave={() => toggleSave(b.id)}
                  onResearch={() => setSelected(b)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
      <ResearchDrawer business={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Search, label: "Find Businesses", active: true },
    { icon: Bookmark, label: "Saved Leads" },
    { icon: Settings, label: "Settings" },
  ];
  return (
    <aside className="flex flex-col border-r border-hairline bg-sidebar px-4 py-5">
      <div className="flex items-center gap-2 px-2 pb-8">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy text-navy-foreground">
          <Compass className="h-4 w-4" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Scoutly</span>
      </div>
      <nav className="space-y-0.5">
        {items.map((i) => (
          <a
            key={i.label}
            href="#"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              i.active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            <i.icon className="h-4 w-4" />
            {i.label}
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-hairline bg-card p-4">
        <div className="text-xs font-medium">Free plan</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
          <div className="h-full w-2/3 rounded-full bg-navy" />
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">32 / 50 lookups used</div>
        <button className="mt-4 inline-flex h-8 w-full items-center justify-center rounded-lg bg-navy text-xs font-medium text-navy-foreground">
          Upgrade to Pro
        </button>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-hairline bg-background px-8">
      <div className="flex h-9 w-96 max-w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span className="text-xs">Search leads, notes, cities…</span>
        <span className="ml-auto rounded border border-hairline bg-background px-1.5 py-0.5 text-[10px]">⌘K</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-hairline py-1 pl-1 pr-2.5">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-soft-blue to-subtle-purple" />
          <span className="text-xs font-medium">Maya R.</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}

function PageHeader() {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-soft-blue">Find businesses</p>
      <h1 className="text-display mt-2 text-4xl">Discover your next client.</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Search a location and industry. We'll surface businesses that need a new website first.
      </p>
    </div>
  );
}

function SearchPanel() {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-4 shadow-soft">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.2fr_1fr_0.7fr_auto]">
        <SearchField icon={MapPin} label="Location" value="Austin, TX" />
        <SearchField icon={Building2} label="Industry" value="Restaurants" />
        <SearchField label="Radius" value="10 mi" />
        <button className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-navy px-6 text-sm font-medium text-navy-foreground transition hover:opacity-90">
          <Sparkles className="h-4 w-4" />
          Find opportunities
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-hairline pt-3">
        {["No website", "Outdated", "Template", "Rating > 4", "50+ reviews"].map((f, i) => (
          <button
            key={f}
            className={`inline-flex h-7 items-center rounded-full border px-3 text-xs transition ${
              i === 0 ? "border-navy bg-navy text-navy-foreground" : "border-hairline text-muted-foreground hover:bg-accent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchField({ icon: Icon, label, value }: { icon?: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3">
      {Icon && (
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-background text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function ResultsHeader({ count }: { count: number }) {
  return (
    <div className="mt-10 flex items-center justify-between">
      <h2 className="text-sm font-medium">
        <span className="text-foreground">{count} opportunities</span>{" "}
        <span className="text-muted-foreground">in Austin, TX</span>
      </h2>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        Sort by
        <button className="inline-flex h-8 items-center gap-1 rounded-lg border border-hairline bg-surface px-3 text-foreground">
          Opportunity score
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function BusinessCard({ b, saved, onSave, onResearch }: { b: Business; saved: boolean; onSave: () => void; onResearch: () => void }) {
  const socialIcon = { instagram: Instagram, facebook: Facebook, web: Globe };
  const statusColor = {
    "No website": "bg-soft-blue/15 text-navy",
    Outdated: "bg-warning/15 text-warning",
    Template: "bg-subtle-purple/15 text-subtle-purple",
  }[b.status];

  return (
    <div className="group rounded-2xl border border-hairline bg-card p-5 transition hover:border-foreground/20 hover:shadow-card">
      <div className="grid grid-cols-[1fr_auto] gap-4 sm:grid-cols-[1.6fr_0.7fr_1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">{b.name}</h3>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor}`}>
              <Sparkles className="h-2.5 w-2.5" /> {b.status}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {b.category} · {b.city} · {b.address}
          </div>
          <p className="mt-3 line-clamp-1 max-w-xl text-xs text-muted-foreground">{b.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" /> {b.phone}</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> {b.email}</span>
            <span className="inline-flex items-center gap-1.5">
              {b.socials.map((s) => {
                const Icon = socialIcon[s];
                return <Icon key={s} className="h-3 w-3" />;
              })}
            </span>
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-navy">{b.score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <div className="mt-2 h-1 w-20 overflow-hidden rounded-full bg-hairline">
            <div className="h-full rounded-full bg-gradient-to-r from-soft-blue to-subtle-purple" style={{ width: `${b.score}%` }} />
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</div>
          <div className="mt-1 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-sm font-medium">{b.rating}</span>
            <span className="text-xs text-muted-foreground">({b.reviews})</span>
          </div>
        </div>

        <div className="col-span-2 flex justify-end gap-2 sm:col-span-1">
          <button
            onClick={onSave}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
              saved ? "border-navy bg-navy text-navy-foreground" : "border-hairline text-muted-foreground hover:bg-accent"
            }`}
            aria-label="Save"
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={onResearch}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-4 text-xs font-medium text-background transition hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" /> Research
          </button>
        </div>
      </div>
    </div>
  );
}

function ResearchDrawer({ business, onClose }: { business: Business | null; onClose: () => void }) {
  if (!business) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-background shadow-elevated animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-soft-blue" />
            AI Research Report
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-soft-blue to-subtle-purple" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{business.name}</h2>
              <div className="text-xs text-muted-foreground">{business.category} · {business.city}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
              <div className="text-2xl font-semibold text-navy">{business.score}</div>
            </div>
          </div>

          <Section title="Business summary">
            <p className="text-sm leading-relaxed text-muted-foreground">{business.summary}</p>
          </Section>

          <Section title="Online presence">
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Website", v: business.status, ok: false },
                { l: "Google reviews", v: `${business.rating} · ${business.reviews}`, ok: true },
                { l: "Instagram", v: business.socials.includes("instagram") ? "Active" : "None", ok: business.socials.includes("instagram") },
                { l: "Facebook", v: business.socials.includes("facebook") ? "Active" : "None", ok: business.socials.includes("facebook") },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-hairline p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                    {s.ok && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Why it's a good lead">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Strong local demand — 1000+ Google reviews with a 4.6 rating.",
                "No dedicated website means every visit is a missed conversion.",
                "Active social presence signals openness to digital investment.",
                "Category (restaurants) has high average website lifetime value.",
              ].map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-soft-blue" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Recommended website">
            <div className="rounded-2xl border border-hairline bg-surface p-4">
              <div className="text-sm font-medium">One-page Framer site with online menu</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Menu, hours, reservations link, gallery, and Instagram feed. Estimated 2–3 day build.
              </p>
              <div className="mt-3 flex gap-2 text-[10px]">
                {["Framer", "Menu integration", "Reservations", "Analytics"].map((t) => (
                  <span key={t} className="rounded-full bg-background px-2 py-0.5 text-muted-foreground">{t}</span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Suggested price</div>
                <div className="text-lg font-semibold">$1,800 – $2,400</div>
              </div>
            </div>
          </Section>

          <Section title="Suggested outreach message">
            <div className="rounded-2xl border border-hairline bg-card p-4">
              <p className="text-sm leading-relaxed">
                Hi {business.name.split(" ")[0]} team — I stopped by last week and loved the atmosphere.
                I noticed you don't have a dedicated site yet and thought a lightweight one-pager with your
                menu and reservations could help capture the search traffic you're already getting.
                Happy to send over a quick mockup — no pressure.
                <br />— Maya
              </p>
              <div className="mt-3 flex gap-2">
                <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline px-3 text-xs">
                  <Copy className="h-3 w-3" /> Copy
                </button>
                <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-medium text-navy-foreground">
                  <Mail className="h-3 w-3" /> Open in email
                </button>
              </div>
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-hairline px-6 py-4">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline px-4 text-sm">
            <Bookmark className="h-4 w-4" /> Save lead
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-4 text-sm font-medium text-navy-foreground">
            Add to pipeline <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
