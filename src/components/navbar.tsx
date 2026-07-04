import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";

const links = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-hairline/70 bg-background/80 backdrop-blur-xl">
      <div className="container-scoutly flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/auth" className="text-sm text-muted-foreground transition hover:text-foreground">
            Sign in
          </Link>
          <Link
            to="/auth"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy px-4 text-sm font-medium text-navy-foreground transition hover:opacity-90"
          >
            Start free
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-hairline md:hidden">
          <div className="container-scoutly flex flex-col gap-3 py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
                {l.label}
              </a>
            ))}
            <Link to="/dashboard" className="inline-flex h-10 items-center justify-center rounded-full bg-navy px-4 text-sm font-medium text-navy-foreground">
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
