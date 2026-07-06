import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — Scoutly" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Supabase auto-detects `#access_token` in the URL and hydrates the session.
    // Wait briefly for it to land, then route based on whether we have one.
    const check = async () => {
      // Give detectSessionInUrl a tick to run.
      for (let i = 0; i < 30; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) navigate({ to: "/dashboard", replace: true } as any);
          return;
        }
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!cancelled) {
        // Look for provider error in the hash.
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
        const err = params.get("error_description") || params.get("error");
        setError(err || "We couldn't finish signing you in.");
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session && !cancelled) navigate({ to: "/dashboard", replace: true } as any);
    });

    check();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-card p-8 text-center">
        {error ? (
          <>
            <div className="text-sm font-semibold text-destructive">Sign-in failed</div>
            <p className="mt-2 text-xs text-muted-foreground">{error}</p>
            <a
              href="/auth"
              className="mt-6 inline-flex h-9 items-center justify-center rounded-full bg-navy px-4 text-xs font-medium text-navy-foreground"
            >
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            <div className="mt-4 text-sm font-medium">Signing you in…</div>
            <p className="mt-1 text-xs text-muted-foreground">Just a moment.</p>
          </>
        )}
      </div>
    </div>
  );
}
