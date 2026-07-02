import { Search, Bell, MapPin, Building2, Compass, Star, Phone, Mail, Globe, Instagram, Facebook, Sparkles, Bookmark } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="absolute -inset-x-8 -top-8 bottom-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-soft-blue/10 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-hairline bg-surface-elevated shadow-elevated">
        {/* window chrome */}
        <div className="flex h-9 items-center gap-1.5 border-b border-hairline bg-surface px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
          <div className="mx-auto flex h-5 items-center gap-1.5 rounded-md bg-background px-3 text-[11px] text-muted-foreground">
            <Globe className="h-3 w-3" /> app.scoutly.io/dashboard
          </div>
        </div>

        <div className="grid grid-cols-[220px_1fr]">
          {/* sidebar */}
          <aside className="border-r border-hairline bg-sidebar p-4">
            <div className="flex items-center gap-2 px-2 pb-6">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-navy text-navy-foreground">
                <Compass className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold">Scoutly</span>
            </div>
            <nav className="space-y-1 text-sm">
              {[
                { l: "Dashboard", active: false },
                { l: "Find Businesses", active: true },
                { l: "Saved Leads", active: false },
                { l: "Settings", active: false },
              ].map((i) => (
                <div
                  key={i.l}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    i.active ? "bg-accent font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${i.active ? "bg-soft-blue" : "bg-hairline"}`} />
                  {i.l}
                </div>
              ))}
            </nav>
            <div className="mt-8 rounded-xl border border-hairline p-3">
              <div className="text-[11px] font-medium">Free plan</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-hairline">
                <div className="h-full w-2/3 rounded-full bg-navy" />
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">32 / 50 lookups</div>
            </div>
          </aside>

          {/* main */}
          <div className="min-w-0">
            <div className="flex h-12 items-center justify-between border-b border-hairline px-5">
              <div className="flex h-8 w-64 items-center gap-2 rounded-lg border border-hairline bg-background px-3 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5" /> Search leads, notes…
              </div>
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-soft-blue to-subtle-purple" />
              </div>
            </div>

            <div className="p-5">
              {/* search panel */}
              <div className="rounded-2xl border border-hairline bg-surface p-4">
                <div className="grid grid-cols-[1.2fr_1fr_0.8fr_auto] gap-2">
                  <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value="Austin, TX" />
                  <Field icon={<Building2 className="h-3.5 w-3.5" />} label="Industry" value="Restaurants" />
                  <Field label="Radius" value="10 mi" />
                  <button className="rounded-lg bg-navy px-4 text-xs font-medium text-navy-foreground">
                    Find opportunities
                  </button>
                </div>
              </div>

              {/* results */}
              <div className="mt-4 space-y-2">
                {[
                  { name: "Loro Asian Smokehouse", score: 92, rating: 4.6, city: "S. Lamar" },
                  { name: "East Side Pies", score: 87, rating: 4.5, city: "Rosewood" },
                  { name: "Franklin BBQ Co.", score: 78, rating: 4.8, city: "Downtown" },
                ].map((b, i) => (
                  <div key={b.name} className="grid grid-cols-[1.5fr_0.7fr_0.7fr_1fr_auto] items-center gap-4 rounded-xl border border-hairline bg-card px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {b.name}
                        {i === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-soft-blue/15 px-2 py-0.5 text-[10px] font-medium text-navy">
                            <Sparkles className="h-2.5 w-2.5" /> No website
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{b.city} · Restaurant</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
                      <div className="text-sm font-semibold text-navy">{b.score}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-warning text-warning" /> {b.rating}
                    </div>
                    <div className="flex gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <Mail className="h-3.5 w-3.5" />
                      <Instagram className="h-3.5 w-3.5" />
                      <Facebook className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex gap-1.5">
                      <button className="rounded-md border border-hairline px-2.5 py-1.5 text-[11px]">
                        <Bookmark className="h-3 w-3" />
                      </button>
                      <button className="rounded-md bg-foreground px-3 py-1.5 text-[11px] font-medium text-background">
                        Research
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-hairline bg-background px-3 py-2">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-xs font-medium">{value}</div>
      </div>
    </div>
  );
}
