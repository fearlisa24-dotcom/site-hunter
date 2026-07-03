import { createFileRoute } from "@tanstack/react-router";
import { chat } from "@/lib/ai.server";

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages: { role: "user" | "assistant"; content: string }[];
            context?: string;
          };
          const sys = `You are Scout, Scoutly's in-app AI assistant for freelance web designers. You help users:
- Understand Scoutly's opportunity scores, website recommendations, and outreach strategies
- Draft cold emails and DMs
- Answer questions about specific businesses they've researched
- Give tactical advice on winning website clients
Keep replies concise, actionable, and friendly. Use markdown lists when helpful.${body.context ? `\n\nCurrent context:\n${body.context}` : ""}`;
          const reply = await chat([
            { role: "system", content: sys },
            ...body.messages,
          ]);
          return Response.json({ reply });
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
