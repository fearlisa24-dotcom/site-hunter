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
  websiteRecommendation: { type: string; rationale: string; features: string[] };
  websiteAnalysis: string;
  websiteQualityScore?: number;
  websiteIssues: string[];
  seoOpportunities: string[];
  marketingOpportunities: string[];
  competitiveAdvantages: string[];
  potentialMonthlyLeads: string;
  estimatedWebsiteValue: string;
  priceRange: { min: number; max: number; currency: string };
  outreachStrategy: string;
  outreachEmail: { subject: string; body: string };
  instagramDm: string;
  facebookMessage: string;
  coldCallScript: string;
  quickBadges: string[];
  socials: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    x?: string;
    youtube?: string;
    whatsapp?: string;
    pinterest?: string;
  };
  email?: string;
};

export const Route = createFileRoute("/api/research")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const b = (await request.json()) as ResearchInput;
          const sys = `You are Scoutly's AI research analyst. You help freelance web designers evaluate small businesses as potential website clients. Return STRICT JSON matching the schema. Be realistic, specific, and useful.`;
          const user = `Business to analyze:
Name: ${b.name}
Address: ${b.address ?? "unknown"}
Primary category: ${b.category ?? "unknown"}
All categories: ${(b.categories ?? []).join(", ")}
Google rating: ${b.rating ?? "n/a"} (${b.reviewCount ?? 0} reviews)
Current website (from Google Maps): ${b.website ?? "NONE LISTED"}
Phone: ${b.phone ?? "unknown"}

Return ONLY JSON with this exact shape (no commentary):
{
 "opportunityScore": number (0-100; popular+no-site 85-98, popular+outdated 70-85, modern 20-45),
 "websiteStatus": "None"|"Outdated"|"Template"|"Modern",
 "onlinePresenceStrength": "Weak"|"Moderate"|"Strong",
 "summary": string (<= 160 chars, single sentence),
 "whyGoodOpportunity": string[] (3-5 bullets),
 "onlinePresenceAnalysis": string (2-3 sentences),
 "websiteAnalysis": string (2-4 sentences on the current site or its absence),
 "websiteQualityScore": number (0-100, omit if no site),
 "websiteIssues": string[] (short labels like "Slow", "Outdated", "Not mobile friendly", "No SSL", "Broken links", "Poor design"; empty if modern site),
 "websiteRecommendation": {"type": string, "rationale": string, "features": string[] (4-6)},
 "seoOpportunities": string[] (3-5 concrete tactics),
 "marketingOpportunities": string[] (3-5 concrete ideas),
 "competitiveAdvantages": string[] (3-5 traits the business already has),
 "potentialMonthlyLeads": string (e.g. "20-40 new inquiries / month"),
 "estimatedWebsiteValue": string (e.g. "$8k-$14k in new revenue / year"),
 "priceRange": {"min": number, "max": number, "currency": "USD"} (freelancer project fee),
 "outreachStrategy": string (2-3 sentences),
 "outreachEmail": {"subject": string, "body": string (90-140 words, warm, references specifics)},
 "instagramDm": string (40-70 words, friendly, references their content),
 "facebookMessage": string (40-70 words, personable),
 "coldCallScript": string (60-100 words, natural spoken tone, includes opening + hook + close),
 "quickBadges": string[] (0-4 short labels; choose from "High Opportunity","Popular","Social Only","No Website","Trending","Underrated","Great Reviews","Outdated Site"),
 "socials": {"website"?: string, "facebook"?: string, "instagram"?: string, "linkedin"?: string, "tiktok"?: string, "x"?: string, "youtube"?: string, "whatsapp"?: string, "pinterest"?: string} (only include URLs you're reasonably confident about; guess handles from the business name only if plausible),
 "email"?: string (only if you can reasonably infer a public one; else omit)
}`;
          const out = await chatJSON<ResearchResult>([
            { role: "system", content: sys },
            { role: "user", content: user },
          ]);
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
