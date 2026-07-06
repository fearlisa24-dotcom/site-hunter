import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Search, Bookmark, MessageCircle, Settings, Compass, Bell,
  ChevronDown, LogOut, User as UserIcon, Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { readLeads } from "@/lib/leads-store";

type NavItem = { to: string; label: string; icon: any; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/find", label: "Find Businesses", icon: Search },
  { to: "/saved", label: "Saved Leads", icon: Bookmark },
  { to: "/outreach", label: "Outreach", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [savedCount, setSavedCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setSavedCount(readLeads().length);
    update();
    window.addEventListener("scoutly:leads-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("scoutly:leads-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "You")
    .split(/\s+/)
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background">
      <aside className="sticky top-0 flex h-screen flex-col border-r border-hairline bg-sidebar px-4 py-5">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 pb-8">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy text-navy-foreground">
            <Compass className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Scoutly</span>
        </Link>
        <nav className="space-y-0.5">
          {NAV.map((i) => {
            const active = i.exact ? pathname === i.to : pathname.startsWith(i.to);
            return (
              <Link
                key={i.to}
                to={i.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                <i.icon className="h-4 w-4" />
                <span className="flex-1">{i.label}</span>
                {i.to === "/saved" && savedCount > 0 && (
                  <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-semibold text-navy-foreground">
                    {savedCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-hairline bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-soft-blue" /> Free plan
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
            <div className="h-full w-1/3 rounded-full bg-navy" />
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {savedCount} saved · unlimited searches
          </div>
          <button className="mt-4 inline-flex h-8 w-full items-center justify-center rounded-lg bg-navy text-xs font-medium text-navy-foreground hover:opacity-90">
            Upgrade to Pro
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-hairline bg-background/80 px-6 backdrop-blur lg:px-10">
          <div className="flex h-9 w-96 max-w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span className="text-xs">Search leads, cities, notes…</span>
            <span className="ml-auto rounded border border-hairline bg-background px-1.5 py-0.5 text-[10px]">⌘K</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
              <Bell className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-hairline py-1 pl-1 pr-2.5"
              >
                <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-soft-blue to-subtle-purple text-[10px] font-bold text-white">
                  {user ? initials : <UserIcon className="h-3 w-3" />}
                </div>
                <span className="max-w-[140px] truncate text-xs font-medium">
                  {user?.user_metadata?.full_name ?? user?.email ?? "Guest"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-48 overflow-hidden rounded-xl border border-hairline bg-card shadow-elevated">
                  {user ? (
                    <>
                      <div className="border-b border-hairline px-3 py-2.5">
                        <div className="truncate text-xs font-medium">{user.email}</div>
                        <div className="text-[10px] text-muted-foreground">Signed in</div>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent"
                      >
                        <Settings className="h-3.5 w-3.5" /> Settings
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut();
                          setMenuOpen(false);
                          navigate({ to: "/" });
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-accent"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
