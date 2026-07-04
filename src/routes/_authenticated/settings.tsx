import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  User as UserIcon, Bell, Palette, ShieldCheck, CreditCard, Plug, LogOut, Trash2, Loader2, Check,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Scoutly" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

const SECTIONS = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "subscription", label: "Subscription", icon: CreditCard },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "integrations", label: "Connected accounts", icon: Plug },
  { key: "security", label: "Security", icon: ShieldCheck },
] as const;

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<(typeof SECTIONS)[number]["key"]>("profile");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.user_metadata?.full_name ?? "");
  }, [user]);

  const saveProfile = async () => {
    setSaving(true); setSaved(false);
    await supabase.auth.updateUser({ data: { full_name: fullName } });
    await supabase.from("profiles").upsert({ id: user!.id, full_name: fullName, email: user!.email });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-soft-blue">Settings</p>
        <h1 className="text-display mt-3 text-4xl">Preferences & account</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                section === s.key ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {section === "profile" && (
            <Card title="Profile" body="How you appear inside Scoutly.">
              <div className="space-y-4">
                <Field label="Full name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-hairline bg-surface px-3 text-sm outline-none focus:border-navy/40"
                  />
                </Field>
                <Field label="Email">
                  <input disabled value={user?.email ?? ""} className="h-10 w-full rounded-lg border border-hairline bg-muted px-3 text-sm text-muted-foreground" />
                </Field>
                <div>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-5 text-sm font-medium text-navy-foreground disabled:opacity-60"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saved && <Check className="h-4 w-4" />}
                    Save changes
                  </button>
                </div>
              </div>
            </Card>
          )}
          {section === "subscription" && (
            <Card title="Subscription" body="You're on the Free plan.">
              <div className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="text-sm font-semibold">Free plan</div>
                <div className="mt-1 text-xs text-muted-foreground">50 lookups / month · basic scoring · 20 saved leads</div>
                <button className="mt-4 inline-flex h-9 items-center rounded-full bg-navy px-4 text-xs font-medium text-navy-foreground">Upgrade to Pro — $23/mo</button>
              </div>
            </Card>
          )}
          {section === "notifications" && (
            <Card title="Notifications" body="Choose what Scoutly emails you about.">
              <ToggleRow label="Weekly opportunity digest" />
              <ToggleRow label="New high-score lead alerts" defaultOn />
              <ToggleRow label="Product updates" />
            </Card>
          )}
          {section === "appearance" && (
            <Card title="Appearance" body="Interface preferences.">
              <ToggleRow label="Dark mode (coming soon)" disabled />
            </Card>
          )}
          {section === "integrations" && (
            <Card title="Connected accounts" body="Bring Scoutly into your existing workflow.">
              <div className="grid gap-3">
                {["Gmail", "Outlook", "LinkedIn", "WhatsApp", "Slack", "Notion"].map((s) => (
                  <div key={s} className="flex items-center justify-between rounded-xl border border-hairline p-4">
                    <div>
                      <div className="text-sm font-medium">{s}</div>
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    </div>
                    <button disabled className="h-9 rounded-lg border border-hairline px-4 text-xs text-muted-foreground opacity-60">Connect</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {section === "security" && (
            <>
              <Card title="Security" body="Manage your account access.">
                <button
                  onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline px-4 text-sm hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </Card>
              <Card title="Danger zone" body="Permanent actions cannot be undone.">
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-destructive/40 px-4 text-sm text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" /> Delete account
                </button>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, body, children }: { title: string; body?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-hairline bg-card p-6">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {body && <p className="mt-1 text-xs text-muted-foreground">{body}</p>}
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function ToggleRow({ label, defaultOn, disabled }: { label: string; defaultOn?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl border border-hairline p-4">
      <span className={`text-sm ${disabled ? "text-muted-foreground" : ""}`}>{label}</span>
      <button
        disabled={disabled}
        onClick={() => setOn((v) => !v)}
        className={`relative h-5 w-9 rounded-full transition ${on ? "bg-navy" : "bg-hairline"} ${disabled ? "opacity-40" : ""}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${on ? "left-4" : "left-0.5"}`} />
      </button>
    </div>
  );
}
