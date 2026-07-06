import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark, Sparkles, Search, TrendingUp, Users, MessageCircle,
  ArrowUpRight, MapPin, Star, Globe, Zap,
} from "lucide-react";
import { readLeads, type StoredLead } from "@/lib/leads-store";
import { readRecentSearches, type RecentSearch } from "@/lib/searches-store";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Scoutly" },
      { name: "description", content: "Your pipeline at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardOverview,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardOverview() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const load = () => {
      setLeads(readLeads());
      setRecent(readRecentSearches());
    };
    load();
    window.addEventListener("scoutly:leads-changed", load);
    window.addEventListener("scoutly:searches-changed", load);
    return () => {
      window.removeEventListener("scoutly:leads-changed", load);
      window.removeEventListener("scoutly:searches-changed", load);
    };
  }, []);

  const stats = useMemo(() => {
    const scored = leads.filter((l) => typeof l.opportunityScore === "number");
    const avg = scored.length
      ? Math.round(scored.reduce((a, l) => a + (l.opportunityScore ?? 0), 0) / scored.length)
      : 0;
    const contacted = leads.filter((l) => l.status === "contacted" || l.status === "responded").length;
    return { saved: leads.length, researched: scored.length, contacted, avg };
  }, [leads]);

  const opportunities = useMemo(() => {
    return [...leads]
      .filter((l) => typeof l.opportunityScore === "number" && (l.opportunityScore ?? 0) >= 60)
      .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
      .slice(0, 5);
  }, [leads]);

  const firstName = (user?.user_metadata?.full_name ?? user?.email ?? "there").split(/[ @]/)[0];

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
      {/* Daily opportunity widget */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-navy to-navy/90 text-navy-foreground">
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1.3fr_1fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-navy-foreground/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Zap className="h-3 w-3" /> Today's opportunities
            </div>
            <h2 className="text-display mt-4 text-3xl leading-tight lg:text-4xl">
              {greeting()}, {firstName} 👋
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-foreground/70">
              {opportunities.length > 0
                ? `We've highlighted ${opportunities.length} ${opportunities.length === 1 ? "business" : "businesses"} in your saved list that look like strong website opportunities.`
                : "Once you save and research businesses, your best-fit opportunities will appear here every day."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to={"/find" as any}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-navy-foreground px-5 text-xs font-semibold text-navy hover:opacity-90"
              >
                <Search className="h-3.5 w-3.5" /> Find new businesses
              </Link>
              <Link
                to={"/saved" as any}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-navy-foreground/20 px-5 text-xs font-medium text-navy-foreground/90 hover:bg-navy-foreground/10"
              >
                Review pipeline <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            {opportunities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy-foreground/20 bg-navy-foreground/5 p-5 text-xs text-navy-foreground/70">
                Save businesses from Find, then research them to unlock daily opportunity recommendations.
              </div>
            ) : (
              opportunities.map((l) => (
                <Link
                  key={l.placeId}
                  to={"/saved" as any}
                  className="flex items-center gap-3 rounded-xl border border-navy-foreground/10 bg-navy-foreground/5 p-3 transition hover:bg-navy-foreground/10"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-navy-foreground/10">
                    {l.heroPhoto ? (
                      <img src={l.heroPhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <MapPin className="h-4 w-4 text-navy-foreground/60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">{l.name}</div>
                    <div className="truncate text-[10px] text-navy-foreground/60">
                      {l.primaryCategory ?? "Business"} · {opportunityReason(l)}
                    </div>
                  </div>
                  <span className="rounded-full bg-navy-foreground px-2 py-0.5 text-[10px] font-bold text-navy">
                    {l.opportunityScore}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Bookmark} label="Saved leads" value={stats.saved} tone="navy" />
        <StatCard icon={TrendingUp} label="Researched" value={stats.researched} tone="blue" />
        <StatCard icon={MessageCircle} label="Contacted" value={stats.contacted} tone="purple" />
        <StatCard icon={Users} label="Avg. opportunity" value={stats.avg || "—"} tone="green" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Recent searches" action={<Link to={"/find" as any} className="text-xs text-muted-foreground hover:text-foreground">New search →</Link>}>
          {recent.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No searches yet"
              body="Try 'Restaurants in Austin, TX' to see how Scoutly ranks opportunities."
              cta={<Link to={"/find" as any} className="inline-flex h-9 items-center rounded-full bg-navy px-4 text-xs font-medium text-navy-foreground">Start searching</Link>}
            />
          ) : (
            <ul className="divide-y divide-hairline">
              {recent.slice(0, 6).map((r, i) => (
                <li key={r.id ?? i} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.industry} · {r.location}</div>
                    <div className="text-xs text-muted-foreground">{r.count} results · {r.radius} mi · {timeAgo(r.when)}</div>
                  </div>
                  <Link
                    to={"/find" as any}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Re-run →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top opportunities" action={<Link to={"/saved" as any} className="text-xs text-muted-foreground hover:text-foreground">All saved →</Link>}>
          {leads.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Nothing saved yet"
              body="Save businesses from Find to build your shortlist."
              cta={<Link to={"/find" as any} className="inline-flex h-9 items-center rounded-full border border-hairline px-4 text-xs font-medium hover:bg-accent">Find businesses</Link>}
            />
          ) : (
            <ul className="space-y-2">
              {[...leads]
                .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
                .slice(0, 5)
                .map((l) => (
                  <li key={l.placeId} className="flex items-center gap-3 rounded-xl border border-hairline p-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface">
                      {l.heroPhoto ? <img src={l.heroPhoto} alt="" className="h-full w-full object-cover" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.primaryCategory} · {l.websiteStatus ?? "—"}</div>
                    </div>
                    {typeof l.opportunityScore === "number" && (
                      <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">
                        {l.opportunityScore}
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <QuickAction to="/find" icon={Search} title="Find businesses" body="Search a new city or industry." />
        <QuickAction to="/saved" icon={Bookmark} title="Review saved" body="Sort and filter your shortlist." />
        <QuickAction to="/outreach" icon={MessageCircle} title="Send outreach" body="Personalize and send AI drafts." />
      </div>
    </div>
  );
}

function opportunityReason(l: StoredLead) {
  if (l.websiteStatus === "None") return "No website found";
  if (l.websiteStatus === "Outdated") return "Outdated website";
  if (l.websiteStatus === "Template") return "Generic template site";
  if ((l.reviewCount ?? 0) > 100) return "High review count";
  return "Strong opportunity";
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string | number; tone: string }) {
  const tones: Record<string, string> = {
    navy: "bg-navy text-navy-foreground",
    blue: "bg-soft-blue/20 text-navy",
    purple: "bg-subtle-purple/20 text-navy",
    green: "bg-success/20 text-[color:var(--success)]",
  };
  return (
    <div className="rounded-2xl border border-hairline bg-card p-5">
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
      </div>
      <div className="text-display mt-4 text-3xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-hairline bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, cta }: { icon: any; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-surface/50 px-4 py-10 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-background text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-sm font-medium">{title}</div>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, body }: { to: string; icon: any; title: string; body: string }) {
  return (
    <Link
      to={to as any}
      className="group flex items-start gap-3 rounded-2xl border border-hairline bg-card p-5 transition hover:border-foreground/20 hover:shadow-card"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{body}</div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
