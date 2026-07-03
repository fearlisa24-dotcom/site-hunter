// Server-only helpers for Lovable AI Gateway (chat completions).
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function chat(messages: Msg[], opts?: { model?: string; temperature?: number }): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: opts?.model ?? DEFAULT_MODEL,
      temperature: opts?.temperature ?? 0.4,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

export async function chatJSON<T = unknown>(messages: Msg[], opts?: { model?: string }): Promise<T> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: opts?.model ?? DEFAULT_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages,
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(text) as T;
  } catch {
    // try to extract JSON block
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : "{}") as T;
  }
}
