import { createFileRoute } from "@tanstack/react-router";
import { geocode, searchBusinesses, photoProxyUrl } from "@/lib/places.server";

export const Route = createFileRoute("/api/places/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            location?: string;
            industry?: string;
            radiusMiles?: number;
          };
          if (!body.location || !body.industry) {
            return new Response(JSON.stringify({ error: "location and industry required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const g = await geocode(body.location);
          if (!g) return Response.json({ error: "Location not found" }, { status: 404 });
          const radiusMeters = Math.round((body.radiusMiles ?? 10) * 1609.34);
          const places = await searchBusinesses({
            query: body.industry,
            lat: g.lat,
            lng: g.lng,
            radiusMeters,
          });
          const results = places.map((p) => ({
            ...p,
            photos: p.photoNames.slice(0, 8).map((n) => photoProxyUrl(n, 1200)),
            heroPhoto: p.photoNames[0] ? photoProxyUrl(p.photoNames[0], 1600) : null,
          }));
          return Response.json({ location: g, count: results.length, results });
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
