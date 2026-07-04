import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/places/autocomplete")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = process.env.GOOGLE_MAPS_API_KEY;
        if (!key) return Response.json({ error: "Missing GOOGLE_MAPS_API_KEY" }, { status: 500 });
        const q = new URL(request.url).searchParams.get("q")?.trim();
        if (!q || q.length < 2) return Response.json({ suggestions: [] });
        try {
          const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": key,
            },
            body: JSON.stringify({
              input: q,
              includedPrimaryTypes: ["(regions)"],
            }),
          });
          if (!res.ok) {
            const text = await res.text();
            console.warn("[autocomplete] upstream error:", res.status, text);
            return Response.json({ suggestions: [], error: `Autocomplete ${res.status}` });
          }
          const data = (await res.json()) as any;
          const suggestions = (data?.suggestions ?? [])
            .map((s: any) => {
              const p = s.placePrediction;
              if (!p) return null;
              return {
                placeId: p.placeId,
                text: p.text?.text ?? "",
                main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
                secondary: p.structuredFormat?.secondaryText?.text ?? "",
              };
            })
            .filter(Boolean);
          return Response.json({ suggestions });
        } catch (e) {
          console.error("[autocomplete] fatal:", e);
          return Response.json({ suggestions: [], error: (e as Error).message });
        }
      },
    },
  },
});
