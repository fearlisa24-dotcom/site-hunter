import { createFileRoute } from "@tanstack/react-router";
import { searchBusinesses, photoProxyUrl } from "@/lib/places.server";

// Geocode with detailed error surfacing.
async function geocodeDetailed(location: string): Promise<
  | { ok: true; lat: number; lng: number; formatted: string }
  | { ok: false; code: string; message: string }
> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { ok: false, code: "MISSING_KEY", message: "GOOGLE_MAPS_API_KEY not configured on server." };
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return { ok: false, code: "HTTP_" + res.status, message: `Geocode HTTP ${res.status}` };
  const data = (await res.json()) as any;
  const status = data?.status as string;
  if (status === "OK" && data.results?.[0]) {
    const r = data.results[0];
    return { ok: true, lat: r.geometry.location.lat, lng: r.geometry.location.lng, formatted: r.formatted_address };
  }
  const msg =
    status === "ZERO_RESULTS"
      ? "No results for that location — try a more specific city or address."
      : status === "REQUEST_DENIED"
        ? `Google Geocoding API is not enabled for this key: ${data?.error_message ?? ""}`.trim()
        : status === "OVER_QUERY_LIMIT"
          ? "Google Maps quota exceeded. Try again in a moment."
          : status === "INVALID_REQUEST"
            ? "That location couldn't be parsed. Try adding a city or country."
            : `Geocode error: ${status}${data?.error_message ? " — " + data.error_message : ""}`;
  return { ok: false, code: status || "UNKNOWN", message: msg };
}

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
            return Response.json({ error: "Location and industry are required." }, { status: 400 });
          }

          let center: { lat: number; lng: number; formatted: string } | null = null;
          const g = await geocodeDetailed(body.location);
          if (g.ok) {
            center = { lat: g.lat, lng: g.lng, formatted: g.formatted };
          } else {
            console.warn("[places/search] geocode failed:", g.code, g.message);
            // Fallback: Places text search may still succeed for informal names.
            // We just search by "industry in location" without a location bias.
            try {
              const results = await searchBusinesses({
                query: `${body.industry} in ${body.location}`,
                lat: 0,
                lng: 0,
                radiusMeters: 50000,
              });
              if (results.length > 0) {
                const mapped = results.map((p) => ({
                  ...p,
                  photos: p.photoNames.slice(0, 8).map((n) => photoProxyUrl(n, 1200)),
                  heroPhoto: p.photoNames[0] ? photoProxyUrl(p.photoNames[0], 1600) : null,
                }));
                return Response.json({
                  location: { formatted: body.location, lat: null, lng: null },
                  count: mapped.length,
                  results: mapped,
                  fallback: true,
                });
              }
            } catch (fallbackErr) {
              console.error("[places/search] fallback failed:", fallbackErr);
            }
            return Response.json({ error: g.message, code: g.code }, { status: 400 });
          }

          const radiusMeters = Math.round((body.radiusMiles ?? 10) * 1609.34);
          const places = await searchBusinesses({
            query: `${body.industry} in ${center.formatted}`,
            lat: center.lat,
            lng: center.lng,
            radiusMeters,
          });
          const results = places.map((p) => ({
            ...p,
            photos: p.photoNames.slice(0, 8).map((n) => photoProxyUrl(n, 1200)),
            heroPhoto: p.photoNames[0] ? photoProxyUrl(p.photoNames[0], 1600) : null,
          }));
          return Response.json({ location: center, count: results.length, results });
        } catch (e) {
          console.error("[places/search] fatal:", e);
          return Response.json({ error: (e as Error).message ?? "Search failed." }, { status: 500 });
        }
      },
    },
  },
});
