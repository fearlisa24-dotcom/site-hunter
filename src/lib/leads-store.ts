// Per-user leads store, hydrated from Supabase and mirrored in-memory + localStorage.
// Reads are synchronous so existing components don't need to change; writes are
// applied optimistically and persisted to Supabase in the background.
import { supabase } from "@/integrations/supabase/client";

export type StoredLead = {
  placeId: string;
  name: string;
  address?: string;
  primaryCategory?: string;
  rating?: number;
  reviewCount?: number;
  website?: string;
  phone?: string;
  heroPhoto?: string | null;
  opportunityScore?: number;
  websiteStatus?: string;
  savedAt: string;
  notes?: string;
  status?: "new" | "contacted" | "responded" | "closed";
};

const LEGACY_KEY = "scoutly.savedLeads.v1";
let currentUserId: string | null = null;
let cache: StoredLead[] = [];
let hydrated = false;

function storageKey(uid: string | null) {
  return uid ? `scoutly.savedLeads.${uid}.v2` : LEGACY_KEY;
}

function readFromStorage(uid: string | null): StoredLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(uid));
    return raw ? (JSON.parse(raw) as StoredLead[]) : [];
  } catch {
    return [];
  }
}

function persistCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(currentUserId), JSON.stringify(cache));
  } catch {
    /* ignore quota errors */
  }
  window.dispatchEvent(new Event("scoutly:leads-changed"));
}

function rowToLead(row: any): StoredLead {
  return {
    placeId: row.place_id,
    name: row.name,
    address: row.address ?? undefined,
    primaryCategory: row.primary_category ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
    website: row.website ?? undefined,
    phone: row.phone ?? undefined,
    heroPhoto: row.hero_photo ?? null,
    opportunityScore: row.opportunity_score ?? undefined,
    websiteStatus: row.website_status ?? undefined,
    savedAt: row.created_at ?? new Date().toISOString(),
    notes: row.notes ?? undefined,
    status: (row.status as StoredLead["status"]) ?? "new",
  };
}

function leadToRow(lead: StoredLead, userId: string) {
  return {
    user_id: userId,
    place_id: lead.placeId,
    name: lead.name,
    address: lead.address ?? null,
    primary_category: lead.primaryCategory ?? null,
    rating: lead.rating ?? null,
    review_count: lead.reviewCount ?? null,
    website: lead.website ?? null,
    phone: lead.phone ?? null,
    hero_photo: lead.heroPhoto ?? null,
    opportunity_score: lead.opportunityScore ?? null,
    website_status: lead.websiteStatus ?? null,
    notes: lead.notes ?? null,
    status: lead.status ?? "new",
  };
}

export async function initLeadsStore(userId: string | null) {
  currentUserId = userId;
  // Load cache from per-user localStorage first (fast synchronous reads).
  cache = readFromStorage(userId);
  hydrated = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("scoutly:leads-changed"));
  }
  if (!userId) return;

  try {
    const { data, error } = await supabase
      .from("saved_leads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    cache = (data ?? []).map(rowToLead);
    hydrated = true;
    persistCache();

    // One-time migration from legacy anonymous cache.
    const legacy = readFromStorage(null);
    if (legacy.length && !cache.length) {
      for (const l of legacy) await upsertLead(l);
      try { localStorage.removeItem(LEGACY_KEY); } catch { /* noop */ }
    }
  } catch (e) {
    console.warn("[leads-store] hydrate failed", e);
  }
}

export function readLeads(): StoredLead[] {
  return cache;
}

export function isSaved(placeId: string) {
  return cache.some((l) => l.placeId === placeId);
}

export async function upsertLead(lead: StoredLead) {
  const idx = cache.findIndex((l) => l.placeId === lead.placeId);
  if (idx >= 0) cache[idx] = { ...cache[idx], ...lead };
  else cache = [lead, ...cache];
  persistCache();
  if (!currentUserId) return;
  try {
    const { error } = await supabase
      .from("saved_leads")
      .upsert(leadToRow(lead, currentUserId), { onConflict: "user_id,place_id" });
    if (error) console.warn("[leads-store] upsert failed", error);
  } catch (e) {
    console.warn("[leads-store] upsert exception", e);
  }
}

export async function removeLead(placeId: string) {
  cache = cache.filter((l) => l.placeId !== placeId);
  persistCache();
  if (!currentUserId) return;
  try {
    const { error } = await supabase
      .from("saved_leads")
      .delete()
      .eq("user_id", currentUserId)
      .eq("place_id", placeId);
    if (error) console.warn("[leads-store] delete failed", error);
  } catch (e) {
    console.warn("[leads-store] delete exception", e);
  }
}

export function clearLeadsStore() {
  cache = [];
  currentUserId = null;
  hydrated = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("scoutly:leads-changed"));
  }
}

export function isHydrated() {
  return hydrated;
}
