// Local-storage backed saved leads (per-browser).
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

const KEY = "scoutly.savedLeads.v1";

export function readLeads(): StoredLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredLead[]) : [];
  } catch {
    return [];
  }
}

export function writeLeads(leads: StoredLead[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(leads));
  window.dispatchEvent(new Event("scoutly:leads-changed"));
}

export function upsertLead(lead: StoredLead) {
  const all = readLeads();
  const idx = all.findIndex((l) => l.placeId === lead.placeId);
  if (idx >= 0) all[idx] = { ...all[idx], ...lead };
  else all.unshift(lead);
  writeLeads(all);
}

export function removeLead(placeId: string) {
  writeLeads(readLeads().filter((l) => l.placeId !== placeId));
}

export function isSaved(placeId: string) {
  return readLeads().some((l) => l.placeId === placeId);
}
