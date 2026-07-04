import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "user" | "assistant"; content: string };

export type ScoutlyAskDetail = { prompt: string; context?: string };

export function AIAssistant({ context }: { context?: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [contextOverride, setContextOverride] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey — I'm Scout. Ask me about any business you're researching, how to price a project, or how to write a first-touch DM.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const runSend = async (text: string, ctx?: string) => {
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context: ctx ?? contextOverride ?? context }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "Sorry, I couldn't respond." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Network hiccup — please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  // Listen for external "ask" events (e.g. from Business Profile quick-action chips)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ScoutlyAskDetail>).detail;
      if (!detail?.prompt) return;
      if (detail.context) setContextOverride(detail.context);
      setOpen(true);
      // Fire after paint so message list update batches cleanly
      setTimeout(() => runSend(detail.prompt, detail.context), 50);
    };
    window.addEventListener("scoutly:ask", handler as EventListener);
    return () => window.removeEventListener("scoutly:ask", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, busy, context, contextOverride]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy text-navy-foreground shadow-elevated transition hover:scale-105"
        aria-label="Open Scout assistant"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      <div
        className={`fixed bottom-24 right-6 z-40 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-hairline bg-card shadow-elevated transition-all duration-300 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ height: "min(560px, calc(100vh - 8rem))" }}
      >
        <div className="flex items-center gap-3 border-b border-hairline bg-surface px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy text-navy-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold tracking-tight">Scout</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {contextOverride ? "Focused on this business" : "Your Scoutly assistant"}
            </div>
          </div>
          {contextOverride && (
            <button
              onClick={() => setContextOverride(undefined)}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "whitespace-pre-wrap bg-navy text-navy-foreground"
                    : "prose prose-sm max-w-none bg-surface text-foreground [&_p]:my-1.5 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_code]:rounded [&_code]:bg-background [&_code]:px-1 [&_code]:py-0.5 [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-navy [&_pre]:p-3 [&_pre]:text-navy-foreground [&_a]:text-navy [&_a]:underline [&_table]:my-2 [&_th]:border [&_th]:border-hairline [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-hairline [&_td]:px-2 [&_td]:py-1"
                }`}
              >
                {m.role === "user" ? (
                  m.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          )}
        </div>

        <div className="border-t border-hairline bg-background p-3">
          <div className="flex items-end gap-2 rounded-xl border border-hairline bg-surface px-3 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  runSend(input.trim());
                }
              }}
              placeholder="Ask Scout anything…"
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => runSend(input.trim())}
              disabled={busy || !input.trim()}
              className="grid h-8 w-8 place-items-center rounded-lg bg-navy text-navy-foreground disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
