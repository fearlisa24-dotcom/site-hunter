import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Bell, Compass, LayoutDashboard, Bookmark, Settings, MapPin, Building2,
  Star, Phone, Mail, Instagram, Facebook, Globe, Sparkles, X, ChevronDown, ChevronLeft, ChevronRight,
  Linkedin, Youtube, Twitter, MessageCircle, Loader2, ExternalLink, ImageIcon, Music2,
  Copy, Check, Navigation, TrendingUp, DollarSign, Target, Zap, Award, AlertTriangle, PhoneCall,
  Clock, Flame, Wand2, Send, ArrowUpRight,
} from "lucide-react";
import { AIAssistant } from "@/components/ai-assistant";
import { OnboardingModal } from "@/components/onboarding-modal";
import { readLeads, upsertLead, removeLead, type StoredLead } from "@/lib/leads-store";
import { recordSearch } from "@/lib/searches-store";

export const Route = createFileRoute("/_authenticated/find")({
  head: () => ({
    meta: [
      { title: "Dashboard — Scoutly" },
      { name: "description", content: "Discover businesses that need websites." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

// ---------- Types ----------
type Place = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  categories: string[];
  primaryCategory?: string;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  openingHours?: string[];
  photos: string[];
  heroPhoto: string | null;
  iconUri?: string;
};

type Research = {
  opportunityScore: number;
  websiteStatus: "None" | "Outdated" | "Template" | "Modern";
  onlinePresenceStrength: "Weak" | "Moderate" | "Strong";
  summary: string;
  whyGoodOpportunity: string[];
  onlinePresenceAnalysis: string;
  websiteAnalysis?: string;
  websiteQualityScore?: number;
  websiteIssues?: string[];
  websiteRecommendation: { type: string; rationale: string; features: string[] };
  seoOpportunities?: string[];
  marketingOpportunities?: string[];
  competitiveAdvantages?: string[];
  potentialMonthlyLeads?: string;
  estimatedWebsiteValue?: string;
  priceRange?: { min: number; max: number; currency: string };
  outreachStrategy: string;
  outreachMessage?: string;
  outreachEmail?: { subject: string; body: string };
  instagramDm?: string;
  facebookMessage?: string;
  coldCallScript?: string;
  quickBadges?: string[];
  socials: Partial<Record<"website" | "facebook" | "instagram" | "linkedin" | "tiktok" | "x" | "youtube" | "whatsapp" | "pinterest", string>>;
  email?: string;
};

type EnrichedPlace = Place & { research?: Research; researching?: boolean };

const INDUSTRIES = [
  "Restaurants", "Cafés", "Bars", "Bakeries", "Salons & Barbers", "Spas", "Gyms & Fitness",
  "Auto Repair", "Dentists", "Contractors", "Landscapers", "Real Estate", "Boutiques", "Photographers",
];

// ---------- Page ----------
function DashboardPage() {
  const [location, setLocation] = useState("Austin, TX");
  const [industry, setIndustry] = useState("Restaurants");
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EnrichedPlace[]>([]);
  const [meta, setMeta] = useState<{ formatted: string } | null>(null);
  const [selected, setSelected] = useState<EnrichedPlace | null>(null);
  const [gallery, setGallery] = useState<{ photos: string[]; index: number; name: string } | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSaved(new Set(readLeads().map((l) => l.placeId)));
    const h = () => setSaved(new Set(readLeads().map((l) => l.placeId)));
    window.addEventListener("scoutly:leads-changed", h);
    return () => window.removeEventListener("scoutly:leads-changed", h);
  }, []);

  const toggleSave = (p: EnrichedPlace) => {
    if (saved.has(p.placeId)) {
      removeLead(p.placeId);
    } else {
      const lead: StoredLead = {
        placeId: p.placeId,
        name: p.name,
        address: p.address,
        primaryCategory: p.primaryCategory,
        rating: p.rating,
        reviewCount: p.reviewCount,
        website: p.website,
        phone: p.phone,
        heroPhoto: p.heroPhoto,
        opportunityScore: p.research?.opportunityScore,
        websiteStatus: p.research?.websiteStatus,
        savedAt: new Date().toISOString(),
        status: "new",
      };
      upsertLead(lead);
    }
  };

  const runSearch = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, industry, radiusMiles: radius }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setMeta({ formatted: data.location?.formatted ?? location });
      const initial: EnrichedPlace[] = (data.results ?? []).map((p: Place) => ({ ...p, researching: true }));
      setResults(initial);
      // Kick off AI research in parallel (throttled to 4 at a time).
      runResearchQueue(initial);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const runResearchQueue = async (places: EnrichedPlace[]) => {
    const CONCURRENCY = 4;
    let cursor = 0;
    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < places.length) {
        const i = cursor++;
        const p = places[i];
        try {
          const res = await fetch("/api/research", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: p.name,
              address: p.address,
              website: p.website,
              phone: p.phone,
              category: p.primaryCategory,
              rating: p.rating,
              reviewCount: p.reviewCount,
              categories: p.categories,
            }),
          });
          const data = (await res.json()) as Research;
          setResults((prev) =>
            prev.map((x) => (x.placeId === p.placeId ? { ...x, research: data, researching: false } : x)),
          );
        } catch {
          setResults((prev) =>
            prev.map((x) => (x.placeId === p.placeId ? { ...x, researching: false } : x)),
          );
        }
      }
    });
    await Promise.all(workers);
  };

  // Auto-run first search on mount so the app doesn't feel empty.
  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedResults = useMemo(
    () =>
      [...results].sort((a, b) => (b.research?.opportunityScore ?? 0) - (a.research?.opportunityScore ?? 0)),
    [results],
  );

  const assistantContext = useMemo(() => {
    if (!selected) return `User is browsing ${industry} in ${location}. ${results.length} results.`;
    const r = selected.research;
    return `User is viewing "${selected.name}" (${selected.primaryCategory ?? ""}) in ${selected.address}. Google rating ${selected.rating ?? "n/a"} (${selected.reviewCount ?? 0} reviews). Website: ${selected.website ?? "none"}. Opportunity score: ${r?.opportunityScore ?? "pending"}. Website status: ${r?.websiteStatus ?? "unknown"}.`;
  }, [selected, industry, location, results.length]);

  return (
    <>
      <OnboardingModal />
      <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        <PageHeader />
        <SearchPanel
          location={location}
          setLocation={setLocation}
          industry={industry}
          setIndustry={setIndustry}
          radius={radius}
          setRadius={setRadius}
          onSearch={runSearch}
          loading={loading}
        />

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <ResultsHeader
          count={sortedResults.length}
          loading={loading}
          location={meta?.formatted ?? location}
          industry={industry}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {loading && sortedResults.length === 0 && Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
          {sortedResults.map((p) => (
            <BusinessCard
              key={p.placeId}
              p={p}
              saved={saved.has(p.placeId)}
              onSave={() => toggleSave(p)}
              onResearch={() => setSelected(p)}
              onImage={() => p.photos.length > 0 && setGallery({ photos: p.photos, index: 0, name: p.name })}
            />
          ))}
        </div>
      </div>

      {selected && (
        <BusinessProfile
          p={selected}
          saved={saved.has(selected.placeId)}
          onSave={() => toggleSave(selected)}
          onClose={() => setSelected(null)}
          onOpenGallery={(index) => setGallery({ photos: selected.photos, index, name: selected.name })}
        />
      )}
      {gallery && (
        <ImageGallery
          photos={gallery.photos}
          index={gallery.index}
          name={gallery.name}
          onClose={() => setGallery(null)}
          onIndex={(i) => setGallery((g) => (g ? { ...g, index: i } : g))}
        />
      )}
      <AIAssistant context={assistantContext} />
    </>
  );
}

// ---------- Chrome ----------
function Sidebar({ savedCount }: { savedCount: number }) {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Search, label: "Find Businesses", active: true },
    { icon: Bookmark, label: "Saved Leads", badge: savedCount || undefined },
    { icon: MessageCircle, label: "Outreach" },
    { icon: Settings, label: "Settings" },
  ];
  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-hairline bg-sidebar px-4 py-5">
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
              i.active
                ? "bg-accent font-medium text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            <i.icon className="h-4 w-4" />
            <span className="flex-1">{i.label}</span>
            {i.badge !== undefined && (
              <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-semibold text-navy-foreground">
                {i.badge}
              </span>
            )}
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
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-hairline bg-background/80 px-6 backdrop-blur lg:px-10">
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-soft-blue">Discovery</p>
      <h1 className="text-display mt-3 text-4xl lg:text-5xl">Find your next website client.</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        Search any city and industry. Scoutly pulls real businesses from Google Maps, then our AI ranks them by how much they'd benefit from a new website.
      </p>
    </div>
  );
}

// ---------- Search ----------
function SearchPanel(props: {
  location: string; setLocation: (v: string) => void;
  industry: string; setIndustry: (v: string) => void;
  radius: number; setRadius: (v: number) => void;
  onSearch: () => void; loading: boolean;
}) {
  return (
    <div className="rounded-3xl border border-hairline bg-card p-3 shadow-soft">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.3fr_1.1fr_0.8fr_auto]">
        <Field icon={MapPin} label="Location">
          <input
            value={props.location}
            onChange={(e) => props.setLocation(e.target.value)}
            placeholder="City, neighborhood, or address"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
          />
        </Field>
        <Field icon={Building2} label="Industry">
          <input
            list="industries"
            value={props.industry}
            onChange={(e) => props.setIndustry(e.target.value)}
            placeholder="Restaurants, salons, gyms…"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
          />
          <datalist id="industries">
            {INDUSTRIES.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
        </Field>
        <Field label="Radius">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={30}
              value={props.radius}
              onChange={(e) => props.setRadius(Number(e.target.value))}
              className="w-full accent-[color:var(--navy)]"
            />
            <span className="w-14 shrink-0 text-right text-sm font-medium tabular-nums">{props.radius} mi</span>
          </div>
        </Field>
        <button
          onClick={props.onSearch}
          disabled={props.loading}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-navy px-6 text-sm font-semibold text-navy-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {props.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Find opportunities
        </button>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3 transition focus-within:border-navy/40 focus-within:bg-background">
      {Icon && (
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-background text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5">{children}</div>
      </div>
    </label>
  );
}

function ResultsHeader({
  count, loading, location, industry,
}: { count: number; loading: boolean; location: string; industry: string }) {
  return (
    <div className="mt-10 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-display text-2xl">
          {loading ? "Scouting…" : `${count} opportunities`}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {industry} · {location}
        </p>
      </div>
    </div>
  );
}

// ---------- Cards ----------
function BusinessCard({
  p, saved, onSave, onResearch, onImage,
}: {
  p: EnrichedPlace; saved: boolean; onSave: () => void; onResearch: () => void; onImage: () => void;
}) {
  const status = p.research?.websiteStatus;
  const score = p.research?.opportunityScore;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-card">
      <button
        onClick={onImage}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-soft-blue/15 to-subtle-purple/15"
      >
        {p.heroPhoto ? (
          <img
            src={p.heroPhoto}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground/60">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        {/* top-left status */}
        {status && (
          <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusPillClass(status)}`}>
            {status === "None" ? "No website" : status}
          </span>
        )}
        {/* bottom score */}
        {typeof score === "number" && (
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-navy shadow-soft">
            <Sparkles className="h-3 w-3 text-soft-blue" />
            {score}
          </div>
        )}
        {p.researching && (
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-soft">
            <Loader2 className="h-3 w-3 animate-spin" /> Scoring…
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-hairline bg-background">
            {p.iconUri ? (
              <img src={p.iconUri} alt="" className="h-4 w-4 opacity-70" />
            ) : (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold tracking-tight">{p.name}</h3>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              {typeof p.rating === "number" && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="font-medium text-foreground">{p.rating.toFixed(1)}</span>
                  <span>({p.reviewCount ?? 0})</span>
                </span>
              )}
              {p.primaryCategory && <span className="truncate">· {p.primaryCategory}</span>}
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground">
          {p.research?.summary ?? (p.researching ? "Analyzing online presence…" : "Awaiting analysis")}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onResearch}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy text-xs font-semibold text-navy-foreground transition hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" /> Research
          </button>
          <button
            onClick={onSave}
            aria-label="Save"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition ${
              saved ? "border-navy bg-navy text-navy-foreground" : "border-hairline text-muted-foreground hover:bg-accent"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-card">
      <div className="aspect-[4/5] w-full animate-pulse bg-surface" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
        <div className="h-9 w-full animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}

function statusPillClass(status: Research["websiteStatus"]) {
  switch (status) {
    case "None": return "bg-navy text-navy-foreground";
    case "Outdated": return "bg-warning/20 text-[color:var(--warning)]";
    case "Template": return "bg-subtle-purple/25 text-[color:var(--subtle-purple)]";
    case "Modern": return "bg-success/20 text-[color:var(--success)]";
  }
}

// ---------- Business Profile (fullscreen modal) ----------
function BusinessProfile({
  p, saved, onSave, onClose, onOpenGallery,
}: {
  p: EnrichedPlace; saved: boolean; onSave: () => void; onClose: () => void; onOpenGallery: (i: number) => void;
}) {
  const r = p.research;
  const [contactOpen, setContactOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (p.photos.length > 1) {
        if (e.key === "ArrowLeft") setHeroIndex((i) => (i - 1 + p.photos.length) % p.photos.length);
        if (e.key === "ArrowRight") setHeroIndex((i) => (i + 1) % p.photos.length);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, p.photos.length]);

  const mapSrc = `https://www.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
  const mapsUrl = p.googleMapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;

  const badges = deriveBadges(p, r);
  const businessContext = buildContext(p, r);

  const askScout = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("scoutly:ask", { detail: { prompt, context: businessContext } }));
  };

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchStart.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStart.current == null || p.photos.length < 2) return;
      const dx = e.changedTouches[0].clientX - touchStart.current;
      if (dx > 50) setHeroIndex((i) => (i - 1 + p.photos.length) % p.photos.length);
      if (dx < -50) setHeroIndex((i) => (i + 1) % p.photos.length);
      touchStart.current = null;
    },
  };

  const industry = p.primaryCategory ?? p.categories?.[0] ?? "Local business";

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-xl"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Fullscreen sheet */}
      <div className="absolute inset-0 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="relative m-0 flex h-full flex-col overflow-hidden bg-background sm:m-3 sm:rounded-3xl sm:border sm:border-hairline sm:shadow-elevated md:m-6">
          {/* Sticky top bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-hairline bg-background/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-hairline bg-surface">
                {p.iconUri ? (
                  <img src={p.iconUri} alt="" className="h-4 w-4 opacity-80" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-tight">{p.name}</div>
                <div className="truncate text-[11px] text-muted-foreground">{industry} · {p.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSave}
                className={`hidden h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition sm:inline-flex ${
                  saved ? "border-navy bg-navy text-navy-foreground" : "border-hairline text-foreground hover:bg-accent"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved" : "Save lead"}
              </button>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scroll body */}
          <div className="flex-1 overflow-y-auto">
            {/* Hero + gallery */}
            <div className="relative bg-gradient-to-br from-soft-blue/10 to-subtle-purple/10">
              <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                  <button
                    onClick={() => p.photos[heroIndex] && onOpenGallery(heroIndex)}
                    className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-hairline bg-surface md:aspect-[16/11]"
                    {...swipe}
                  >
                    {p.photos[heroIndex] ? (
                      <img src={p.photos[heroIndex]} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-muted-foreground/50">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                    {p.photos.length > 1 && (
                      <>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); setHeroIndex((i) => (i - 1 + p.photos.length) % p.photos.length); }}
                          className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-soft backdrop-blur hover:bg-background"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); setHeroIndex((i) => (i + 1) % p.photos.length); }}
                          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-soft backdrop-blur hover:bg-background"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </span>
                        <span className="absolute bottom-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium shadow-soft">
                          {heroIndex + 1} / {p.photos.length}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Thumb strip */}
                  <div className="grid grid-cols-4 gap-2 md:grid-cols-2">
                    {p.photos.slice(0, 4).map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                          heroIndex === i ? "border-navy" : "border-hairline hover:border-foreground/30"
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                    {p.photos.length > 4 && (
                      <button
                        onClick={() => onOpenGallery(4)}
                        className="relative col-span-4 hidden aspect-[16/6] items-center justify-center overflow-hidden rounded-xl border border-hairline bg-surface text-xs font-medium text-muted-foreground hover:bg-accent md:col-span-2 md:flex"
                      >
                        +{p.photos.length - 4} more photos
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Header block */}
              <div className="mx-auto mt-6 max-w-6xl px-4 pb-8 md:px-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft-blue">{industry}</p>
                    <h2 className="text-display mt-2 text-3xl md:text-4xl">{p.name}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      {typeof p.rating === "number" && (
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium text-foreground">{p.rating.toFixed(1)}</span>
                          <span>({p.reviewCount ?? 0} reviews)</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        {r?.websiteStatus ? (r.websiteStatus === "None" ? "No website" : `${r.websiteStatus} website`) : "Checking website…"}
                      </span>
                      {p.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-4 w-4" /> {p.phone}
                        </span>
                      )}
                    </div>
                    {badges.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {badges.map((b) => (
                          <span key={b.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${b.className}`}>
                            <b.Icon className="h-3 w-3" /> {b.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {typeof r?.opportunityScore === "number" && (
                    <div className="rounded-2xl border border-hairline bg-card px-5 py-4 text-center shadow-soft">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Opportunity</div>
                      <div className="mt-1 text-4xl font-bold text-navy tabular-nums">{r.opportunityScore}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">out of 100</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:px-8 md:py-10">
              {/* Left column */}
              <div className="min-w-0 space-y-6">
                {!r ? (
                  <ResearchLoading />
                ) : (
                  <>
                    <Card icon={Sparkles} label="Business Summary">
                      <p className="text-[15px] leading-relaxed text-foreground/90">{r.summary}</p>
                    </Card>

                    <Card icon={Zap} label="Why this is a good lead">
                      <ul className="space-y-2.5">
                        {r.whyGoodOpportunity.map((item) => (
                          <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--success)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card icon={Globe} label="Online Presence Analysis">
                      <p className="text-sm leading-relaxed text-muted-foreground">{r.onlinePresenceAnalysis}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {socialLinks(r.socials).length === 0 ? (
                          <span className="text-xs text-muted-foreground">No public social profiles detected.</span>
                        ) : (
                          socialLinks(r.socials).map((s) => (
                            <a
                              key={s.key}
                              href={s.href}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={s.key}
                              title={s.key}
                              className="grid h-10 w-10 place-items-center rounded-xl border border-hairline bg-surface text-foreground transition hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-accent hover:shadow-soft"
                            >
                              <s.Icon className="h-4 w-4" />
                            </a>
                          ))
                        )}
                      </div>
                    </Card>

                    <WebsitePreviewCard website={p.website ?? r.socials?.website} score={r.websiteQualityScore} issues={r.websiteIssues} analysis={r.websiteAnalysis} />

                    <Card icon={Wand2} label="Recommended Website">
                      <div className="text-sm font-semibold">{r.websiteRecommendation.type}</div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.websiteRecommendation.rationale}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.websiteRecommendation.features.map((f) => (
                          <span key={f} className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] text-foreground/80">
                            {f}
                          </span>
                        ))}
                      </div>
                    </Card>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {(r.seoOpportunities?.length ?? 0) > 0 && (
                        <Card icon={Target} label="SEO Opportunities">
                          <BulletList items={r.seoOpportunities!} />
                        </Card>
                      )}
                      {(r.marketingOpportunities?.length ?? 0) > 0 && (
                        <Card icon={TrendingUp} label="Marketing Opportunities">
                          <BulletList items={r.marketingOpportunities!} />
                        </Card>
                      )}
                      {(r.competitiveAdvantages?.length ?? 0) > 0 && (
                        <Card icon={Award} label="Competitive Advantages">
                          <BulletList items={r.competitiveAdvantages!} />
                        </Card>
                      )}
                      <Card icon={DollarSign} label="Estimated Value">
                        {r.potentialMonthlyLeads && (
                          <div className="text-sm"><span className="text-muted-foreground">Potential leads:</span> <span className="font-medium">{r.potentialMonthlyLeads}</span></div>
                        )}
                        {r.estimatedWebsiteValue && (
                          <div className="mt-1.5 text-sm"><span className="text-muted-foreground">Estimated value:</span> <span className="font-medium">{r.estimatedWebsiteValue}</span></div>
                        )}
                        {r.priceRange && (
                          <div className="mt-3 rounded-xl border border-hairline bg-surface px-3 py-2 text-sm">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Suggested project fee</div>
                            <div className="mt-0.5 text-lg font-semibold text-navy tabular-nums">
                              ${r.priceRange.min.toLocaleString()} – ${r.priceRange.max.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>

                    <Card icon={Send} label="Outreach Strategy">
                      <p className="text-sm leading-relaxed text-muted-foreground">{r.outreachStrategy}</p>
                    </Card>

                    {(r.outreachEmail || r.outreachMessage) && (
                      <MessageCard
                        icon={Mail}
                        label="Personalized Email"
                        subject={r.outreachEmail?.subject}
                        body={r.outreachEmail?.body ?? r.outreachMessage ?? ""}
                      />
                    )}
                    {r.instagramDm && (
                      <MessageCard icon={Instagram} label="Instagram DM" body={r.instagramDm} />
                    )}
                    {r.facebookMessage && (
                      <MessageCard icon={Facebook} label="Facebook Message" body={r.facebookMessage} />
                    )}
                    {r.coldCallScript && (
                      <MessageCard icon={PhoneCall} label="Cold Call Script" body={r.coldCallScript} />
                    )}
                  </>
                )}

                {/* AI quick actions */}
                <div className="rounded-2xl border border-hairline bg-gradient-to-br from-soft-blue/10 to-subtle-purple/10 p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
                    <Sparkles className="h-3.5 w-3.5" /> AI Research
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">Ask Scout about {p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">One click — Scout already knows this business.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => askScout(q.prompt)}
                        className="inline-flex items-center gap-2 rounded-full border border-hairline bg-background px-3.5 py-2 text-[13px] font-medium text-foreground transition hover:-translate-y-0.5 hover:border-navy/40 hover:bg-surface hover:shadow-soft"
                      >
                        <span>{q.emoji}</span>
                        <span>{q.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Map */}
                <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-soft">
                  <iframe title="map" src={mapSrc} className="h-56 w-full border-0" loading="lazy" />
                  <div className="border-t border-hairline bg-background p-3">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{p.address}</div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-hairline text-xs font-medium hover:bg-accent"
                      >
                        <MapPin className="h-3.5 w-3.5" /> Open in Maps
                      </a>
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-navy text-xs font-medium text-navy-foreground hover:opacity-90"
                      >
                        <Navigation className="h-3.5 w-3.5" /> Directions
                      </a>
                    </div>
                  </div>
                </div>

                {/* Business details */}
                <div className="rounded-2xl border border-hairline bg-card p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Business details</div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <DetailRow icon={Building2} label="Category" value={industry} />
                    <DetailRow icon={MapPin} label="Address" value={p.address} />
                    {p.phone && <DetailRow icon={Phone} label="Phone" value={p.phone} />}
                    {r?.email && <DetailRow icon={Mail} label="Email" value={r.email} />}
                    {p.website && (
                      <DetailRow icon={Globe} label="Website" value={
                        <a href={p.website} target="_blank" rel="noreferrer" className="text-navy underline-offset-2 hover:underline">
                          {safeHost(p.website)}
                        </a>
                      } />
                    )}
                    {typeof p.rating === "number" && (
                      <DetailRow icon={Star} label="Google rating" value={`${p.rating.toFixed(1)} · ${p.reviewCount ?? 0} reviews`} />
                    )}
                    <DetailRow icon={MapPin} label="Coordinates" value={`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`} />
                    {r?.websiteStatus && (
                      <DetailRow icon={Info} label="Website status" value={r.websiteStatus === "None" ? "No website found" : `${r.websiteStatus} site`} />
                    )}
                  </dl>

                  {p.openingHours && p.openingHours.length > 0 && (
                    <>
                      <div className="mt-5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Clock className="h-3 w-3" /> Hours
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {p.openingHours.map((h) => (<li key={h}>{h}</li>))}
                      </ul>
                    </>
                  )}
                </div>

                {/* CTAs */}
                <div className="sticky bottom-4 space-y-2">
                  <button
                    onClick={() => setContactOpen(true)}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-navy text-sm font-semibold text-navy-foreground shadow-elevated transition hover:opacity-90"
                  >
                    <MessageCircle className="h-4 w-4" /> Contact Business
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onSave}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition ${
                        saved ? "border-navy bg-navy text-navy-foreground" : "border-hairline text-foreground hover:bg-accent"
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
                    </button>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-hairline text-sm font-medium hover:bg-accent"
                    >
                      <ArrowUpRight className="h-4 w-4" /> Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {contactOpen && (
        <ContactModal business={p} research={r} onClose={() => setContactOpen(false)} />
      )}
    </div>
  );
}

// ---------- Profile helpers ----------
const QUICK_ACTIONS: { emoji: string; label: string; prompt: string }[] = [
  { emoji: "💰", label: "How much should I charge?", prompt: "How much should I charge this business for a new website? Give me a realistic price range with reasoning and a suggested payment structure." },
  { emoji: "🎨", label: "What website should I build?", prompt: "What kind of website should I build for this business? Recommend the type, key pages/features, and the tech stack I should propose." },
  { emoji: "📈", label: "How can this business grow?", prompt: "What are the top 5 concrete ways this business could grow online in the next 6 months? Focus on things a new website can enable." },
  { emoji: "📧", label: "Improve the outreach email", prompt: "Rewrite the outreach email so it feels more personal and less templated. Keep it under 130 words and end with a soft CTA." },
  { emoji: "💬", label: "Write an Instagram DM", prompt: "Write a short, casual Instagram DM to this business that references what makes them stand out. Under 60 words." },
  { emoji: "📱", label: "Write a Facebook message", prompt: "Write a friendly Facebook message to this business's page. Personable, not salesy. Under 70 words." },
  { emoji: "📞", label: "Cold call script", prompt: "Write a 60–90 second cold call script for this business. Include the opener, the hook, the value pitch, and a natural close." },
  { emoji: "🚀", label: "How likely to become a client?", prompt: "How likely is this business to become a paying client? Give me a % likelihood with 3 reasons for and 3 reasons against." },
  { emoji: "💡", label: "What services should I offer?", prompt: "What web design and follow-on services should I offer this business? List them in order of what they most need." },
];

function deriveBadges(p: EnrichedPlace, r?: Research) {
  const out: { label: string; Icon: React.ComponentType<{ className?: string }>; className: string }[] = [];
  const add = (label: string, Icon: React.ComponentType<{ className?: string }>, className: string) => out.push({ label, Icon, className });
  const score = r?.opportunityScore ?? 0;
  const custom = new Set(r?.quickBadges ?? []);
  if (custom.has("High Opportunity") || score >= 80) add("High Opportunity", Flame, "bg-[color:var(--warning)]/15 text-[color:var(--warning)]");
  if (custom.has("Popular") || (p.reviewCount ?? 0) > 300) add("Popular", Star, "bg-soft-blue/15 text-soft-blue");
  if (custom.has("Great Reviews") || (p.rating ?? 0) >= 4.6) add("Great Reviews", Award, "bg-[color:var(--success)]/15 text-[color:var(--success)]");
  if (r?.websiteStatus === "None") add("No Website", Globe, "bg-navy text-navy-foreground");
  if (custom.has("Social Only") && r?.websiteStatus !== "None") add("Social Only", Instagram, "bg-subtle-purple/25 text-[color:var(--subtle-purple)]");
  if (custom.has("Outdated Site") || r?.websiteStatus === "Outdated") add("Outdated Site", AlertTriangle, "bg-[color:var(--warning)]/15 text-[color:var(--warning)]");
  return out.slice(0, 4);
}

function buildContext(p: EnrichedPlace, r?: Research): string {
  const parts = [
    `You are advising a freelance web designer about a specific business.`,
    `Business: ${p.name}`,
    `Category: ${p.primaryCategory ?? p.categories?.[0] ?? "unknown"}`,
    `Address: ${p.address}`,
    p.phone ? `Phone: ${p.phone}` : null,
    p.website ? `Website: ${p.website}` : `Website: NONE LISTED`,
    typeof p.rating === "number" ? `Google rating: ${p.rating.toFixed(1)} (${p.reviewCount ?? 0} reviews)` : null,
    r ? `Opportunity score: ${r.opportunityScore}/100. Website status: ${r.websiteStatus}. Online presence: ${r.onlinePresenceStrength}.` : null,
    r?.summary ? `Prior summary: ${r.summary}` : null,
    r?.priceRange ? `Suggested price range: $${r.priceRange.min}-$${r.priceRange.max}.` : null,
  ].filter(Boolean);
  return parts.join("\n");
}

function safeHost(url: string) {
  try { return new URL(url).host; } catch { return url; }
}

function Card({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-hairline bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/85">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" /> <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

function MessageCard({ icon: Icon, label, subject, body }: { icon: React.ComponentType<{ className?: string }>; label: string; subject?: string; body: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = subject ? `Subject: ${subject}\n\n${body}` : body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };
  return (
    <section className="rounded-2xl border border-hairline bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <button
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline px-2.5 text-[11px] font-medium text-foreground hover:bg-accent"
        >
          {copied ? <><Check className="h-3 w-3 text-[color:var(--success)]" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
        </button>
      </div>
      {subject && (
        <div className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs">
          <span className="text-muted-foreground">Subject: </span>
          <span className="font-medium text-foreground">{subject}</span>
        </div>
      )}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{body}</p>
    </section>
  );
}

function WebsitePreviewCard({ website, score, issues, analysis }: { website?: string; score?: number; issues?: string[]; analysis?: string }) {
  if (!website) {
    return (
      <Card icon={Globe} label="Website Preview">
        <div className="grid place-items-center rounded-2xl border border-dashed border-hairline bg-surface px-6 py-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-navy/10 text-navy">
            <Globe className="h-6 w-6" />
          </div>
          <div className="mt-3 text-sm font-semibold">No website found</div>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            This business has no active website. That's a signal — they're a strong candidate for a first professional presence.
          </p>
        </div>
      </Card>
    );
  }
  const shot = (w: number) => `https://s.wordpress.com/mshots/v1/${encodeURIComponent(website)}?w=${w}`;
  return (
    <Card icon={Globe} label="Website Preview">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="flex items-center gap-1.5 border-b border-hairline bg-background px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-hairline" />
            <span className="h-2 w-2 rounded-full bg-hairline" />
            <span className="h-2 w-2 rounded-full bg-hairline" />
            <span className="ml-2 truncate text-[10px] text-muted-foreground">{safeHost(website)}</span>
          </div>
          <img src={shot(1024)} alt="Desktop preview" className="aspect-[16/10] w-full object-cover object-top" loading="lazy" />
        </div>
        <div className="mx-auto w-full max-w-[180px] overflow-hidden rounded-2xl border-2 border-foreground/10 bg-surface shadow-soft">
          <div className="border-b border-hairline bg-background px-3 py-1.5 text-center text-[9px] text-muted-foreground">Mobile</div>
          <img src={shot(360)} alt="Mobile preview" className="aspect-[9/16] w-full object-cover object-top" loading="lazy" />
        </div>
      </div>
      {(typeof score === "number" || (issues && issues.length > 0)) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {typeof score === "number" && (
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Quality</span>
              <span className={`font-semibold tabular-nums ${score >= 70 ? "text-[color:var(--success)]" : score >= 40 ? "text-[color:var(--warning)]" : "text-destructive"}`}>{score}/100</span>
            </div>
          )}
          {issues?.map((iss) => (
            <span key={iss} className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--warning)]/15 px-2.5 py-1 text-[11px] font-medium text-[color:var(--warning)]">
              <AlertTriangle className="h-3 w-3" /> {iss}
            </span>
          ))}
        </div>
      )}
      {analysis && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{analysis}</p>}
      <a href={website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-navy hover:underline">
        Visit site <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  );
}

function ResearchLoading() {
  const steps = [
    "🌐 Checking website…",
    "🗺️ Analyzing Google Maps…",
    "📱 Finding social profiles…",
    "🎯 Calculating opportunity score…",
    "✍️ Generating outreach…",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % steps.length), 1400);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-navy-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold">🤖 Scout AI is researching…</div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> {steps[i]}
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-11/12 animate-pulse rounded bg-surface" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-surface" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}

function Info(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1 text-[11px] font-medium text-foreground/80">
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-hairline pt-6">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

// ---------- Contact Modal ----------
function ContactModal({
  business, research, onClose,
}: { business: EnrichedPlace; research?: Research; onClose: () => void }) {
  const methods: { key: string; label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] = [];
  if (research?.email) methods.push({ key: "email", label: research.email, href: `mailto:${research.email}`, Icon: Mail });
  if (business.phone) methods.push({ key: "phone", label: business.phone, href: `tel:${business.phone.replace(/\s/g, "")}`, Icon: Phone });
  const s = research?.socials ?? {};
  if (s.instagram) methods.push({ key: "instagram", label: "Instagram", href: s.instagram, Icon: Instagram });
  if (s.facebook) methods.push({ key: "facebook", label: "Facebook", href: s.facebook, Icon: Facebook });
  if (s.whatsapp) methods.push({ key: "whatsapp", label: "WhatsApp", href: s.whatsapp, Icon: MessageCircle });
  if (s.linkedin) methods.push({ key: "linkedin", label: "LinkedIn", href: s.linkedin, Icon: Linkedin });
  if (s.x) methods.push({ key: "x", label: "X", href: s.x, Icon: Twitter });
  if (s.tiktok) methods.push({ key: "tiktok", label: "TikTok", href: s.tiktok, Icon: Music2 });
  if (s.youtube) methods.push({ key: "youtube", label: "YouTube", href: s.youtube, Icon: Youtube });
  if (business.website) methods.push({ key: "website", label: "Website", href: business.website, Icon: Globe });

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center px-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-hairline bg-background p-6 shadow-elevated animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">{business.name}</h3>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {methods.length === 0 && (
            <p className="text-sm text-muted-foreground">No public contact methods detected yet.</p>
          )}
          {methods.map((m) => (
            <a
              key={m.key}
              href={m.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 text-sm font-medium transition hover:border-foreground/20 hover:bg-accent"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-background text-foreground">
                <m.Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate">{m.label}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Image Gallery ----------
function ImageGallery({
  photos, index, name, onClose, onIndex,
}: {
  photos: string[]; index: number; name: string; onClose: () => void; onIndex: (i: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") onIndex((index + 1) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, photos.length, onClose, onIndex]);

  // Basic swipe
  const [startX, setStartX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setStartX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 50) onIndex((index - 1 + photos.length) % photos.length);
    if (dx < -50) onIndex((index + 1) % photos.length);
    setStartX(null);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" onClick={onClose} />
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      {photos.length > 1 && (
        <>
          <button
            onClick={() => onIndex((index - 1 + photos.length) % photos.length)}
            className="absolute left-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => onIndex((index + 1) % photos.length)}
            className="absolute right-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      <div
        className="relative mx-4 max-h-[85vh] max-w-6xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={photos[index]}
          alt={name}
          className="max-h-[85vh] w-auto rounded-xl object-contain shadow-elevated"
        />
        <div className="mt-3 text-center text-xs text-white/70">
          {name} · {index + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}

// ---------- Helpers ----------
function socialLinks(s: Research["socials"]) {
  const list: { key: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] = [];
  if (s.website) list.push({ key: "website", href: s.website, Icon: Globe });
  if (s.instagram) list.push({ key: "instagram", href: s.instagram, Icon: Instagram });
  if (s.facebook) list.push({ key: "facebook", href: s.facebook, Icon: Facebook });
  if (s.linkedin) list.push({ key: "linkedin", href: s.linkedin, Icon: Linkedin });
  if (s.tiktok) list.push({ key: "tiktok", href: s.tiktok, Icon: Music2 });
  if (s.x) list.push({ key: "x", href: s.x, Icon: Twitter });
  if (s.youtube) list.push({ key: "youtube", href: s.youtube, Icon: Youtube });
  if (s.whatsapp) list.push({ key: "whatsapp", href: s.whatsapp, Icon: MessageCircle });
  return list;
}
