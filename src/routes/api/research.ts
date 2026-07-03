import { createFileRoute } from "@tanstack/react-router";
import { chatJSON } from "@/lib/ai.server";

type ResearchInput = {
  name: string;
  address?: string;
  website?: string | null;
  phone?: string | null;
  category?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  categories?: string[];
};

type ResearchResult = {
  opportunityScore: number;
  websiteStatus: "None" | "Outdated" | "Template" | "Modern";
  onlinePresenceStrength: "Weak" | "Moderate" | "Strong";
  summary: string;
  whyGoodOpportunity: string[];
  onlinePresenceAnalysis: string;
  websiteRecommendation: {
    type: string;
    rationale: string;
    features: string[];
  };
  outreachStrategy: string;
  outreachMessage: string;
  socials: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    x?: string;
    youtube?: string;
    whatsapp?: string;
  };
  email?: string;
};

export const Route = createFileRoute("/api/research")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const b = (await request.json()) as ResearchInput;
          const sys = `You are Scoutly's AI research analyst. You help freelance web designers evaluate small businesses as potential website clients. Return STRICT JSON matching the schema. Be realistic and specific.`;
          const user = `Business to analyze:
Name: ${b.name}
Address: ${b.address ?? "unknown"}
Primary category: ${b.category ?? "unknown"}
All categories: ${(b.categories ?? []).join(", ")}
Google rating: ${b.rating ?? "n/a"} (${b.reviewCount ?? 0} reviews)
Current website (from Google Maps): ${b.website ?? "NONE LISTED"}
Phone: ${b.phone ?? "unknown"}

Tasks:
1) Infer likely social media profile URLs (guess handles from the business name only if plausible; leave empty if uncertain). Platforms: website, facebook, instagram, linkedin, tiktok, x, youtube, whatsapp.
2) Infer a plausible public business email if one commonly follows the pattern (info@domain.com only if a website exists). Otherwise leave empty.
3) Assess websiteStatus. If no website: "None". If website looks like a Facebook page / Linktree / directory only: still "None". Otherwise best guess: Outdated, Template, or Modern.
4) onlinePresenceStrength based on rating volume + likely social activity.
5) opportunityScore (0-100): higher when business is popular locally AND lacks a modern website. Popular + no website = 85-98. Popular + outdated = 70-85. Modern site = 20-45.
6) summary: one crisp sentence (< 140 chars) explaining the opportunity.
7) whyGoodOpportunity: 3-5 bullet reasons.
8) onlinePresenceAnalysis: 2-3 sentences.
9) websiteRecommendation: {type (e.g., "One-page Framer site with online menu"), rationale (1-2 sentences), features (4-6 items)}.
10) outreachStrategy: 2-3 sentences on how to approach this owner.
11) outreachMessage: a short (90-120 words) personalized cold email/DM, warm but professional, references specifics.

Respond ONLY with JSON of shape:
{
 "opportunityScore": number,
 "websiteStatus": "None"|"Outdated"|"Template"|"Modern",
 "onlinePresenceStrength": "Weak"|"Moderate"|"Strong",
 "summary": string,
 "whyGoodOpportunity": string[],
 "onlinePresenceAnalysis": string,
 "websiteRecommendation": {"type": string, "rationale": string, "features": string[]},
 "outreachStrategy": string,
 "outreachMessage": string,
 "socials": {"website"?: string, "facebook"?: string, "instagram"?: string, "linkedin"?: string, "tiktok"?: string, "x"?: string, "youtube"?: string, "whatsapp"?: string},
 "email"?: string
}`;
          const out = await chatJSON<ResearchResult>([
            { role: "system", content: sys },
            { role: "user", content: user },
          ]);
          // Prefer known website
          if (b.website && !out.socials?.website) {
            out.socials = { ...out.socials, website: b.website };
          }
          return Response.json(out);
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
