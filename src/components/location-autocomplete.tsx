import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

type Suggestion = { placeId: string; text: string; main: string; secondary: string };

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (s: Suggestion) => void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const debouncer = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = (q: string) => {
    if (debouncer.current) window.clearTimeout(debouncer.current);
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debouncer.current = window.setTimeout(async () => {
      setBusy(true);
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setActive(0);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setBusy(false);
      }
    }, 220);
  };

  const pick = (s: Suggestion) => {
    onChange(s.text);
    onSelect?.(s);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          fetchSuggestions(e.target.value);
        }}
        onFocus={() => value && suggestions.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && suggestions[active]) {
            e.preventDefault();
            pick(suggestions[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="City, neighborhood, or address"
        className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
      />
      {busy && <Loader2 className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />}

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 max-h-80 overflow-y-auto rounded-2xl border border-hairline bg-card shadow-elevated">
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(s)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                i === active ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-soft-blue" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.main}</div>
                {s.secondary && (
                  <div className="truncate text-xs text-muted-foreground">{s.secondary}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
