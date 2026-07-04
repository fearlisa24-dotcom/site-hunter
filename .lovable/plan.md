# Scoutly v2 — Core Experience Rebuild

This is a large scope. I'll ship it in a single coordinated pass, keeping the landing page and existing functionality intact.

## 1. Google Maps — Fix & Upgrade
- Rewrite `/api/places/search`: geocode with detailed error surfacing (INVALID_REQUEST, ZERO_RESULTS, REQUEST_DENIED, OVER_QUERY_LIMIT), fall back to Places text search when geocode returns zero results, log server-side, return structured `{error, code, hint}` instead of a flat "Location not found".
- New `/api/places/autocomplete` route → Places Autocomplete (New) via server proxy (keeps key server-side).
- New `/api/places/geocode` for resolving a selected place_id.
- Radius clamped 500m–50km, paginated (Google returns ≤20 per call; page through nextPageToken up to ~50).

## 2. Search UX
- **Location field**: debounced autocomplete dropdown (📍 icon, formatted suggestions, keyboard nav).
- **Industry field**: searchable Combobox with ~25 preset industries + free text.
- **Radius**: slider 1–25 mi.
- Results render instantly as skeleton→basic cards; each card fetches AI research independently and updates in place ("🤖 AI Researching..." → Opportunity Score + summary).
- Pagination: 50/page with Prev/Next/page numbers.

## 3. Backend / Auth
- Enable **Lovable Cloud** (Supabase) for auth + persistence.
- Google Sign-In via managed provider (`configure_social_auth`) + email/password fallback.
- Tables: `profiles`, `saved_leads`, `searches`, `outreach_messages`, `user_roles` (+ RLS, grants, `has_role` fn).
- Protected app moves under `_authenticated/` layout (auto-managed).

## 4. New App Shell (authenticated area)
Sidebar nav: Dashboard · Find · Saved Leads · Outreach · Settings.

Routes:
- `/app` — **Dashboard**: welcome, stat cards (saved, researched, contacted, avg score), recent searches, recent activity, quick actions, mini charts (recharts).
- `/app/find` — current search/results experience (redesigned).
- `/app/saved` — saved leads with search/sort/filter, remove, empty state.
- `/app/outreach` — tabs: Ready · Drafts · Sent · Follow-ups; email/DM composer with AI-generated templates.
- `/app/settings` — Profile · Account · Subscription · Notifications · Appearance · Connected Accounts · Security · Danger Zone.
- Old `/dashboard` redirects to `/app`.

## 5. Onboarding
First-login modal: 4 steps (location, industry, radius, launch) with "Get Started" / "Don't show again" (stored on profile).

## 6. Business Analysis + AI Research
Per-business background research call returns: summary, presence analysis, website status (none/social-only/outdated/modern/broken), opportunity score 0–100, why-good-lead, recommended website type, outreach strategy, email draft, DM draft, notes. Streamed per-card; cached in `research_cache` table by place_id (7-day TTL).

## 7. AI Chat — Markdown
Swap current renderer for `react-markdown` + `remark-gfm` + `rehype-highlight` (bold, italics, lists, tables, links, code blocks).

## 8. Polish
- Consistent spacing, hairline borders, soft shadows, Manrope/Inter typography (already in place).
- Meaningful empty states on every page.
- Toast errors for API failures instead of blank cards.
- Skeleton loaders throughout.

## Technical notes
- Cloud enablement is required — I'll enable it as step 1.
- Google Places (New) Autocomplete goes through a server route (key stays server-side; browser key not configured yet and not needed).
- Research runs client-triggered per card via `useQuery` with `staleTime: Infinity` + server-side cache.
- Sidebar layout lives in `src/routes/_authenticated/app.tsx` with `<Outlet />`.

## Out of scope (call out)
- Actual Gmail/Outlook/LinkedIn/WhatsApp sending — UI + drafts only, marked "Coming soon".
- Stripe subscription billing — Settings shows plan UI but no checkout wired.
- Dark mode toggle wired to a preference (theme system already dark).

Approve and I'll build it end-to-end.
