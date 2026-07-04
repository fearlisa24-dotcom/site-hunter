import { useEffect, useRef, useState } from "react";
import { Building2, Check } from "lucide-react";
import { INDUSTRIES } from "@/lib/industries";

export function IndustryCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = q
    ? INDUSTRIES.filter((i) => i.toLowerCase().includes(q.toLowerCase()))
    : INDUSTRIES;

  return (
    <div ref={ref} className="relative">
      <input
        value={open ? q : value}
        onFocus={() => {
          setQ("");
          setOpen(true);
        }}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q) {
            onChange(q);
            setOpen(false);
          }
        }}
        placeholder="Restaurants, salons, gyms…"
        className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
      />
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 max-h-80 overflow-y-auto rounded-2xl border border-hairline bg-card shadow-elevated">
          {filtered.length === 0 ? (
            <button
              type="button"
              onClick={() => {
                onChange(q);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-accent"
            >
              <Building2 className="h-4 w-4 text-soft-blue" /> Use "{q}"
            </button>
          ) : (
            filtered.slice(0, 40).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(i);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-accent"
              >
                <span>{i}</span>
                {i === value && <Check className="h-4 w-4 text-navy" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
