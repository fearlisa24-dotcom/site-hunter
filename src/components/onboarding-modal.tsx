import { useEffect, useState } from "react";
import { MapPin, Building2, Sparkles, Compass, Ruler, X } from "lucide-react";

const KEY = "scoutly.onboarded.v1";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  const close = (dontShow: boolean) => {
    if (dontShow) localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  const steps = [
    { icon: Compass, title: "Welcome to Scoutly", body: "Scoutly helps freelancers find businesses that need websites — in minutes, not hours." },
    { icon: MapPin, title: "Pick a location", body: "Start typing any city, neighborhood, or address. Autocomplete keeps it snappy." },
    { icon: Building2, title: "Pick an industry", body: "Choose from Restaurants, Salons, Contractors and 60+ more. Or type your own." },
    { icon: Ruler, title: "Set a radius", body: "Anywhere from 1 to 30 miles. Wider for rural areas, tighter for downtowns." },
    { icon: Sparkles, title: "Find opportunities", body: "Scoutly ranks every business by how much they'd benefit from a new website." },
  ];

  const s = steps[step];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-hairline bg-card p-8 shadow-elevated">
        <button
          onClick={() => close(false)}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-navy text-navy-foreground">
          <s.icon className="h-6 w-6" />
        </div>
        <h2 className="text-display mt-6 text-3xl leading-tight">{s.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>

        <div className="mt-6 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition ${i <= step ? "bg-navy" : "bg-hairline"}`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => close(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Don't show again
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex h-10 items-center rounded-full border border-hairline px-4 text-sm font-medium hover:bg-accent"
              >
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex h-10 items-center rounded-full bg-navy px-5 text-sm font-medium text-navy-foreground hover:opacity-90"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => close(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-navy px-5 text-sm font-medium text-navy-foreground hover:opacity-90"
              >
                Get started <Sparkles className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
