import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark, Sparkles, Search, TrendingUp, Users, MessageCircle,
  ArrowUpRight, MapPin, Clock,
} from "lucide-react";
import { readLeads, type StoredLead } from "@/lib/leads-store";
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

const RECENT_KEY = "scoutly.recentSearches.v1";
type RecentSearch = { location: string; industry: string; radius: number; when: string; count: number };
function readRecent(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

function DashboardOverview() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const load = () => {
      setLeads(readLeads());
      setRecent(readRecent());
    };
    load();
    window.addEventListener("scoutly:leads-changed", load);
    return () => window.removeEventListener("scoutly:leads-changed", load);
  }, []);

  const stats = useMemo(() => {
    const scored = leads.filter((l) => typeof l.opportunityScore === "number");
    const avg = scored.length
      ? Math.round(scored.reduce((a, l) => a + (l.opportunityScore ?? 0), 0) / scored.length)
      : 0;
    const contacted = leads.filter((l) => l.status === "contacted" || l.status === "responded").length;
    return { saved: leads.length, researched: scored.length, contacted, avg };
  }, [leads]);

  const firstName = (user?.user_metadata?.full_name ?? user?.email ?? "there").split(" ")[0];

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-soft-blue">Dashboard</p>
          <h1 className="text-display mt-3 text-4xl lg:text-5xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Here's your pipeline. Let's find your next website client.
          </p>
        </div>
        <Link
          to="/find"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-navy-foreground hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Find opportunities
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Bookmark} label="Saved leads" value={stats.saved} tone="navy" />
        <StatCard icon={TrendingUp} label="Researched" value={stats.researched} tone="blue" />
        <StatCard icon={MessageCircle} label="Contacted" value={stats.contacted} tone="purple" />
        <StatCard icon={Users} label="Avg. opportunity" value={stats.avg || "—"} tone="green" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Recent searches" action={<Link to="/find" className="text-xs text-muted-foreground hover:text-foreground">New search →</Link>}>
          {recent.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No searches yet"
              body="Try 'Restaurants in Austin, TX' to see how Scoutly ranks opportunities."
              cta={<Link to="/find" className="inline-flex h-9 items-center rounded-full bg-navy px-4 text-xs font-medium text-navy-foreground">Start searching</Link>}
            />
          ) : (
            <ul className="divide-y divide-hairline">
              {recent.slice(0, 6).map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.industry} · {r.location}</div>
                    <div className="text-xs text-muted-foreground">{r.count} results · {r.radius} mi · {timeAgo(r.when)}</div>
                  </div>
                  <Link
                    to="/find"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Re-run →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top opportunities" action={<Link to="/saved" className="text-xs text-muted-foreground hover:text-foreground">All saved →</Link>}>
          {leads.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Nothing saved yet"
              body="Save businesses from Find to build your shortlist."
              cta={<Link to="/find" className="inline-flex h-9 items-center rounded-full border border-hairline px-4 text-xs font-medium hover:bg-accent">Find businesses</Link>}
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
      to={to}
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
