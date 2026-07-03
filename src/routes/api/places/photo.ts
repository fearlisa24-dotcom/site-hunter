import { createFileRoute } from "@tanstack/react-router";

// Proxies the Google Places Photo (New) endpoint so we never expose the API key.
export const Route = createFileRoute("/api/places/photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = process.env.GOOGLE_MAPS_API_KEY;
        if (!key) return new Response("Missing key", { status: 500 });
        const url = new URL(request.url);
        const name = url.searchParams.get("name");
        const w = Number(url.searchParams.get("w") ?? "1200");
        if (!name) return new Response("Missing name", { status: 400 });
        const upstream = `https://places.googleapis.com/v1/${encodeURI(name)}/media?maxWidthPx=${Math.min(Math.max(w, 200), 1600)}&key=${key}`;
        const res = await fetch(upstream, { redirect: "follow" });
        if (!res.ok) return new Response("Photo not available", { status: res.status });
        const buf = await res.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
