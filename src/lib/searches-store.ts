// Per-user recent searches, mirrored to Supabase.
import { supabase } from "@/integrations/supabase/client";

export type RecentSearch = {
  id?: string;
  location: string;
  industry: string;
  radius: number;
  count: number;
  when: string;
};

const LEGACY_KEY = "scoutly.recentSearches.v1";
let currentUserId: string | null = null;
let cache: RecentSearch[] = [];

function storageKey(uid: string | null) {
  return uid ? `scoutly.recentSearches.${uid}.v2` : LEGACY_KEY;
}

function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(storageKey(currentUserId), JSON.stringify(cache)); } catch { /* noop */ }
  window.dispatchEvent(new Event("scoutly:searches-changed"));
}

export function readRecentSearches(): RecentSearch[] {
  return cache;
}

export async function initSearchesStore(userId: string | null) {
  currentUserId = userId;
  if (typeof window !== "undefined") {
    try { cache = JSON.parse(localStorage.getItem(storageKey(userId)) || "[]"); } catch { cache = []; }
    window.dispatchEvent(new Event("scoutly:searches-changed"));
  }
  if (!userId) return;
  try {
    const { data, error } = await supabase
      .from("searches")
      .select("id,location,industry,radius_miles,result_count,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    cache = (data ?? []).map((r: any) => ({
      id: r.id,
      location: r.location,
      industry: r.industry,
      radius: r.radius_miles,
      count: r.result_count,
      when: r.created_at,
    }));
    persist();
  } catch (e) {
    console.warn("[searches-store] hydrate failed", e);
  }
}

export async function recordSearch(s: Omit<RecentSearch, "id" | "when">) {
  const entry: RecentSearch = { ...s, when: new Date().toISOString() };
  cache = [entry, ...cache.filter((x) => !(x.location === entry.location && x.industry === entry.industry))].slice(0, 20);
  persist();
  if (!currentUserId) return;
  try {
    const { error } = await supabase.from("searches").insert({
      user_id: currentUserId,
      location: entry.location,
      industry: entry.industry,
      radius_miles: entry.radius,
      result_count: entry.count,
    });
    if (error) console.warn("[searches-store] insert failed", error);
  } catch (e) {
    console.warn("[searches-store] insert exception", e);
  }
}

export function clearSearchesStore() {
  cache = [];
  currentUserId = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("scoutly:searches-changed"));
  }
}
