// Google Places (New) helpers — server only.
const GOOGLE_KEY = () => {
  const k = process.env.GOOGLE_MAPS_API_KEY;
  if (!k) throw new Error("Missing GOOGLE_MAPS_API_KEY");
  return k;
};

export type Place = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  categories: string[];
  primaryCategory?: string;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  openingHours?: string[];
  photoNames: string[];
  logoUri?: string;
  iconUri?: string;
};

// Geocode a free-form location.
export async function geocode(location: string): Promise<{ lat: number; lng: number; formatted: string } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_KEY()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocode ${res.status}`);
  const data = (await res.json()) as any;
  const r = data?.results?.[0];
  if (!r) return null;
  return { lat: r.geometry.location.lat, lng: r.geometry.location.lng, formatted: r.formatted_address };
}

// Nearby search with Places API (New) — text query + location bias.
export async function searchBusinesses(params: {
  query: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}): Promise<Place[]> {
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.types",
    "places.primaryTypeDisplayName",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.regularOpeningHours",
    "places.photos",
    "places.iconMaskBaseUri",
  ].join(",");

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_KEY(),
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({
      textQuery: params.query,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude: params.lat, longitude: params.lng },
          radius: Math.min(Math.max(params.radiusMeters, 500), 50000),
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Places search ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as any;
  const places = (data?.places ?? []) as any[];
  return places.map(mapPlace);
}

export async function placeDetails(placeId: string): Promise<Place> {
  const fieldMask = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "rating",
    "userRatingCount",
    "types",
    "primaryTypeDisplayName",
    "nationalPhoneNumber",
    "internationalPhoneNumber",
    "websiteUri",
    "googleMapsUri",
    "regularOpeningHours",
    "photos",
    "iconMaskBaseUri",
    "editorialSummary",
  ].join(",");
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { "X-Goog-Api-Key": GOOGLE_KEY(), "X-Goog-FieldMask": fieldMask },
  });
  if (!res.ok) throw new Error(`Place details ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as any;
  return mapPlace(data);
}

function mapPlace(p: any): Place {
  const photos = (p.photos ?? []) as any[];
  return {
    placeId: p.id,
    name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? "",
    lat: p.location?.latitude ?? 0,
    lng: p.location?.longitude ?? 0,
    rating: p.rating,
    reviewCount: p.userRatingCount,
    categories: p.types ?? [],
    primaryCategory: p.primaryTypeDisplayName?.text,
    phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber,
    website: p.websiteUri,
    googleMapsUrl: p.googleMapsUri,
    openingHours: p.regularOpeningHours?.weekdayDescriptions,
    photoNames: photos.map((ph) => ph.name).filter(Boolean),
    iconUri: p.iconMaskBaseUri ? `${p.iconMaskBaseUri}.png` : undefined,
  };
}

// Build a proxied photo URL served by our /api/places/photo route.
export function photoProxyUrl(photoName: string, maxWidth = 1200): string {
  return `/api/places/photo?name=${encodeURIComponent(photoName)}&w=${maxWidth}`;
}
