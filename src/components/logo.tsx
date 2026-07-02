import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy text-navy-foreground shadow-soft">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="m14.5 9.5-2.5 5-5 2.5 2.5-5z" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-foreground">Scoutly</span>
    </Link>
  );
}
