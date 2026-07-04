import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Compass, Loader2, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Scoutly" },
      { name: "description", content: "Sign in to Scoutly to save leads and sync across devices." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  const google = async () => {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app",
    });
    if (result.error) {
      setError(result.error.message ?? "Google sign-in failed.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/app" },
        });
        if (error) throw error;
        setInfo("Check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background">
      <div className="relative hidden overflow-hidden bg-navy text-navy-foreground lg:block">
        <div className="absolute inset-0 opacity-20 soft-grid-bg" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-foreground/10 backdrop-blur">
              <Compass className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Scoutly</span>
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-navy-foreground/70">For freelancers</p>
            <h1 className="text-display mt-4 text-5xl leading-[1.05]">
              Find your next website client{" "}
              <span className="italic text-soft-blue">before anyone else.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm text-navy-foreground/70">
              Scoutly turns Google Maps + AI into a repeatable pipeline for winning website work.
            </p>
          </div>
          <div className="text-xs text-navy-foreground/50">© {new Date().getFullYear()} Scoutly</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-navy-foreground">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-[15px] font-semibold">Scoutly</span>
            </Link>
          </div>
          <h2 className="text-display text-3xl">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to sync saved leads and outreach." : "Free forever plan. No credit card."}
          </p>

          <button
            onClick={google}
            disabled={busy}
            className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-hairline bg-card px-4 text-sm font-medium transition hover:bg-accent disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-hairline" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-hairline bg-surface px-3 focus-within:border-navy/40">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-hairline bg-surface px-3 focus-within:border-navy/40">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}
            {info && <div className="rounded-lg bg-success/10 px-3 py-2 text-xs text-success">{info}</div>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy text-sm font-medium text-navy-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New to Scoutly?" : "Already have an account?"}{" "}
            <button
              className="font-medium text-foreground underline-offset-2 hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
