import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, MessageCircle, Send, Clock, Sparkles, Bookmark } from "lucide-react";
import { readLeads, type StoredLead } from "@/lib/leads-store";

export const Route = createFileRoute("/_authenticated/outreach")({
  head: () => ({ meta: [{ title: "Outreach — Scoutly" }, { name: "robots", content: "noindex" }] }),
  component: OutreachPage,
});

const TABS = [
  { key: "ready", label: "Ready to contact" },
  { key: "drafts", label: "Drafts" },
  { key: "sent", label: "Sent" },
  { key: "followups", label: "Follow-ups" },
] as const;

function OutreachPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("ready");
  const [leads, setLeads] = useState<StoredLead[]>([]);

  useEffect(() => {
    const load = () => setLeads(readLeads());
    load();
    window.addEventListener("scoutly:leads-changed", load);
    return () => window.removeEventListener("scoutly:leads-changed", load);
  }, []);

  const ready = leads.filter((l) => (l.status ?? "new") === "new");

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-soft-blue">Outreach</p>
        <h1 className="text-display mt-3 text-4xl">Turn opportunities into clients.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Draft, send, and follow up. Email, Gmail, and LinkedIn integrations coming soon.
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-full border border-hairline bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`h-9 rounded-full px-4 text-xs font-medium transition ${
              tab === t.key ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ready" && (
        ready.length === 0 ? (
          <Empty
            icon={Bookmark}
            title="Nothing ready to contact"
            body="Save leads from Find, then come back here to send outreach."
            cta={<Link to="/find" className="inline-flex h-10 items-center rounded-full bg-navy px-5 text-sm font-medium text-navy-foreground">Find businesses</Link>}
          />
        ) : (
          <div className="grid gap-3">
            {ready.map((l) => (
              <div key={l.placeId} className="flex items-center gap-4 rounded-2xl border border-hairline bg-card p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface">
                  {l.heroPhoto ? <img src={l.heroPhoto} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{l.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground truncate">
                    {l.primaryCategory} · {l.websiteStatus ?? "—"} website · {l.address}
                  </div>
                </div>
                {typeof l.opportunityScore === "number" && (
                  <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">
                    {l.opportunityScore}
                  </span>
                )}
                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-semibold text-navy-foreground hover:opacity-90">
                  <Sparkles className="h-3.5 w-3.5" /> Draft with AI
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "drafts" && (
        <Empty icon={Mail} title="No drafts yet" body="AI-generated first-touch drafts appear here once you save leads." />
      )}
      {tab === "sent" && (
        <Empty icon={Send} title="Sent history is coming" body="Connect Gmail, Outlook, or LinkedIn to log outreach automatically." integrations />
      )}
      {tab === "followups" && (
        <Empty icon={Clock} title="No follow-ups scheduled" body="Set reminders on any outreach thread to follow up at the right moment." />
      )}
    </div>
  );
}

function Empty({ icon: Icon, title, body, cta, integrations }: { icon: any; title: string; body: string; cta?: React.ReactNode; integrations?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-hairline bg-surface/50 p-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-background text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-display mt-6 text-2xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-6">{cta}</div>}
      {integrations && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {["Gmail", "Outlook", "LinkedIn", "WhatsApp"].map((i) => (
            <span key={i} className="rounded-full border border-hairline bg-background px-3 py-1 text-xs text-muted-foreground">
              {i} · coming soon
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
