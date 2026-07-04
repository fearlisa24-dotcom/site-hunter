import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark, Search, MapPin, Star, Trash2, ExternalLink, MessageCircle, Globe,
} from "lucide-react";
import { readLeads, removeLead, type StoredLead } from "@/lib/leads-store";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [{ title: "Saved leads — Scoutly" }, { name: "robots", content: "noindex" }],
  }),
  component: SavedLeadsPage,
});

type SortKey = "score" | "recent" | "name";

function SavedLeadsPage() {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("score");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = () => setLeads(readLeads());
    load();
    window.addEventListener("scoutly:leads-changed", load);
    return () => window.removeEventListener("scoutly:leads-changed", load);
  }, []);

  const filtered = useMemo(() => {
    let list = leads.filter((l) =>
      q ? (l.name + " " + (l.address ?? "") + " " + (l.primaryCategory ?? "")).toLowerCase().includes(q.toLowerCase()) : true,
    );
    if (statusFilter !== "all") list = list.filter((l) => (l.websiteStatus ?? "None") === statusFilter);
    if (sort === "score") list = [...list].sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0));
    if (sort === "recent") list = [...list].sort((a, b) => (b.savedAt.localeCompare(a.savedAt)));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [leads, q, sort, statusFilter]);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-soft-blue">Pipeline</p>
          <h1 className="text-display mt-3 text-4xl">Saved leads</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {leads.length} businesses on your shortlist.
          </p>
        </div>
        <Link to="/find" className="inline-flex h-10 items-center gap-2 rounded-full bg-navy px-5 text-sm font-medium text-navy-foreground">
          <Search className="h-4 w-4" /> Find more
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-hairline bg-surface px-3 min-w-[220px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search saved leads…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <Select value={statusFilter} onChange={setStatusFilter} options={[
          { v: "all", l: "All statuses" },
          { v: "None", l: "No website" },
          { v: "Outdated", l: "Outdated" },
          { v: "Template", l: "Template" },
          { v: "Modern", l: "Modern" },
        ]} />
        <Select value={sort} onChange={(v) => setSort(v as SortKey)} options={[
          { v: "score", l: "Opportunity score" },
          { v: "recent", l: "Recently saved" },
          { v: "name", l: "Name (A–Z)" },
        ]} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-hairline bg-surface/50 p-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-background text-muted-foreground">
            <Bookmark className="h-6 w-6" />
          </span>
          <h3 className="text-display mt-6 text-2xl">No saved leads {q ? "match" : "yet"}</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {q ? "Try a different search." : "Bookmark businesses from the Find page to build your outreach pipeline."}
          </p>
          <Link to="/find" className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-navy px-5 text-sm font-medium text-navy-foreground">
            <Search className="h-4 w-4" /> Find businesses
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((l) => (
            <div key={l.placeId} className="group overflow-hidden rounded-2xl border border-hairline bg-card">
              <div className="relative aspect-[16/9] bg-surface">
                {l.heroPhoto ? (
                  <img src={l.heroPhoto} alt={l.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground/60">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
                {typeof l.opportunityScore === "number" && (
                  <span className="absolute right-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">
                    {l.opportunityScore}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="truncate text-sm font-semibold">{l.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  {typeof l.rating === "number" && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {l.rating.toFixed(1)}
                    </span>
                  )}
                  {l.primaryCategory && <span className="truncate">· {l.primaryCategory}</span>}
                </div>
                <div className="mt-2 line-clamp-1 text-xs text-muted-foreground">{l.address}</div>

                <div className="mt-3 flex gap-1.5">
                  {l.websiteStatus && (
                    <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium">
                      {l.websiteStatus === "None" ? "No website" : l.websiteStatus}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    to="/outreach"
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy text-xs font-semibold text-navy-foreground hover:opacity-90"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Draft outreach
                  </Link>
                  {l.website && (
                    <a
                      href={l.website}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-lg border border-hairline text-muted-foreground hover:bg-accent"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => removeLead(l.placeId)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-hairline text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-hairline bg-surface px-3 text-sm outline-none"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}
