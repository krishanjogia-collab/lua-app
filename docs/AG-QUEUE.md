# AG-QUEUE: Lua App Task Queue

> **Protocol:** Claude writes tasks with status `PENDING`. AG picks up tasks, marks `IN-PROGRESS`, then `DONE` when complete. Both agents add delivery notes documenting changes. Tasks within a phase should be completed in order unless marked as parallelizable.

---

## Phase 0: Foundation Sprint (Hygiene)
> Clean up technical debt and app hygiene before building new features.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0.1 | Replace `input[type="month"]` with custom month picker in Studio (broken on iOS Safari) | `DONE` | AG | See handoff: `PHASE-0-FOUNDATION.md` |
| 0.2 | Add error boundaries around Gemini generation + graceful failure UI | `DONE` | AG | |
| 0.3 | Add skeleton/shimmer loading states to Calendar, Day, and Vault views | `DONE` | AG | |
| 0.4 | Fix calendar grid touch targets (minimum 48px on mobile) | `DONE` | AG | |
| 0.5 | Add OpenGraph + Twitter Card metadata to root layout + per-page routes | `DONE` | AG | |
| 0.6 | Set up `public/` directory properly (favicon, apple-touch-icon, basic manifest) | `DONE` | AG | |
| 0.7 | Improve empty states (calendar with no plan, vault with no assets) with helpful copy + illustrations | `DONE` | AG | |

---

## Phase 1: Shareable Output
> Make the app's output shareable on Instagram, WhatsApp, and Facebook. This is critical because the creator's distribution channel is social media.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 1.1 | Implement Web Share API + fallback share buttons (`navigator.share` / clipboard) | `DONE` | AG | |
| 1.2 | Build public preview routes for daily plans (bypassing auth middleware) | `DONE` | AG | Needs to fetch `is_published` plans only without RLS blocking |
| 1.3 | Create dynamic OG image route (`@vercel/og`) for rich link previews | `DONE` | AG | |
| 1.4 | Add Instagram Story share card generation (1080x1920) | `DONE` | AG | |

---

## Phase 2: Printable/PDF Output
> Teachers need to print daily and weekly plans for their classroom walls, plus activity cards.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 2.1 | Add `@media print` stylesheet to globals.css + "Print Day" button on DayClient | `DONE` | AG | Quick win |
| 2.2 | Add client-side PDF generation for individual day plans (using `@react-pdf/renderer` or similar) | `DONE` | AG | |
| 2.3 | Add weekly plan PDF bundle (cover page + 5 daily plans) | `DONE` | AG | |
| 2.4 | Auto-generate printable activity cards from structured domain data | `DONE` | AG | |

---

## Phase 2.5: Brand Alignment
> Align the codebase with the official Brand System v2.0 before building the landing page.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 2.5.1 | Update `tailwind.config.ts` color palette to match Brand System v2.0 (see `docs/brand/`) | `DONE` | AG | See handoff below. Do this BEFORE Phase 3. |
| 2.5.2 | Update OG images, share cards, and PDF templates to use new brand colors | `DONE` | AG | Ripple from 2.5.1 |
| 2.5.3 | Replace placeholder brand assets in `public/` with Imagen-generated source images | `DONE` | AG | Processed via `sharp` into `favicon`, `apple-touch-icon`, and `og-default`. Removed source templates. |

### Brand System v2.0 Color Changes:
```
OLD → NEW
Terracotta:  #E2725B → #D27A65 (Lua Terracotta — primary CTAs, icons, bold headers)
Sage:        #8A9A5B → #8C9764 (Lua Sage — secondary icons, pedagogical details)
Cream:       #FFFDD0 → #FDF8E2 (Soft Cream — page backgrounds)
Dusty Rose:  #C08081 → REMOVE (not in brand system v2.0)
NEW:         Deep Espresso #5C2D26 (text color — headings, high-contrast text)
Keep:        White #FFFFFF (card backgrounds)
```

### Lua Cycle Iconography (for reference):
1. Sensory & Layout → hand/workstation icon
2. Cognitive & Literacy → book/building block icon
3. Physical & Outdoor → sprout/leaf icon
4. Social-Emotional → interlinked circles/heart icon
5. Cultural & Global → earth/crescent moon icon
6. Parent Bridge → message bubble/bridge icon

---

## Phase 3: Landing Page + Onboarding
> The app needs a public face. Visitors to lualearn.com should understand the product and want to sign up. New subscribers need a guided first experience.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.1 | Build public landing page at `/` (hero, features, example day preview, CTA) | `DONE` | AG | See handoff: `PHASE-3-LANDING-ONBOARDING.md` |
| 3.2 | Update middleware to serve landing page to unauthenticated visitors, redirect authenticated users to `/calendar` | `DONE` | AG | Claude also fixed auth cookie propagation on redirects |
| 3.3 | Add first-time user detection (`has_onboarded` profile flag or creation timestamp check) | `DONE` | AG | Migration file created; needs manual SQL execution in Supabase |
| 3.4 | Build welcome modal/walkthrough explaining Calendar, Daily Flow, Domains, Parent Bridge, and Vault | `DONE` | AG | |
| 3.5 | Update login/signup page copy and flow (distinguish new vs returning users) | `DONE` | AG | Claude updated copy for brand alignment |
| 3.6 | Improve empty states with actionable guidance (e.g., "Your teacher is preparing this month's curriculum!") | `DONE` | AG | Verified sufficient from Phase 0.7 |

---

## Phase 3.5: Brand Voice & Naming Sweep
> Align all copy with the "Lua Learn" brand name and educator-first positioning. AI is the enabler behind the scenes, NOT the brand identity.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.5.1 | Replace all instances of "Lua" (standalone) with "Lua Learn" across the app (Navbar, footer, metadata, PDF headers, OG images, share cards, email templates) | `DONE` | AG | Verified across metadata, Auth, PDF & OG |
| 3.5.2 | Remove or rephrase all "AI-powered" / "AI generates" messaging throughout the app | `DONE` | AG | Replaced "Generated by" with "Created by" and cleaned up OG labels |
| 3.5.3 | Update `app/layout.tsx` root metadata — title, description, OG defaults — to use "Lua Learn" and educator-first copy | `DONE` | AG | Verified previously updated by Claude |
| 3.5.4 | Update Navbar logo/text from "Lua" to "Lua Learn" | `DONE` | AG | Verified previously updated by Claude |

### Brand Voice Guidelines for AG:
- **DO:** "Created by an educator with 15+ years across 3 continents", "Designed by teachers, for teachers", "Expert-crafted curriculum"
- **DON'T:** "AI-powered", "AI generates", "Artificial intelligence", "Machine learning"
- **Brand name:** Always "Lua Learn" (two words), never just "Lua"
- **Luana's credentials:** 15+ years early childhood education, taught in Brazil/Australia/Canada, pedagogy degrees from Brazil (including special needs post-grad), diplomas from Australia

---

## Phase 3.7: Guided Onboarding Flow (Sprout Tier)
> Replace the welcome modal with a guided onboarding flow that produces real curriculum on a teacher's first visit. No empty calendars.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.7.1 | Create `/onboarding` route + middleware redirect for unonboarded users | `DONE` | AG | Already completed previously |
| 3.7.2 | Build 6-step guided flow (welcome → age group → planning cadence → theme → philosophy → generate + preview) | `DONE` | AG | Advanced 7-step flow (w/ bilingual) previously implemented |
| 3.7.3 | Add `planning_cadence` and `age_group` columns to profiles table | `DONE` | AG | Schema added to lib/types.ts previously |
| 3.7.4 | Connect flow to curriculum generation pipeline (weekly or monthly based on cadence) | `DONE` | AG | Integrated in OnboardingClient.tsx |
| 3.7.5 | Retire WelcomeModal.tsx — onboarding flow replaces it | `DONE` | AG | Removed from codebase |

### Tone Benchmark (Sprout/Bloom metaphor):
- **Sprout** = free tier, self-serve, "I'll build my own curriculum"
- **Bloom** = premium tier, Luana's expert-crafted plans, "ready to teach"
- All language should feel like a supportive colleague, never like software
- See `docs/handoffs/PHASE-3.7-GUIDED-ONBOARDING.md` for the full language table

---

## Phase 3.8: Gated Example Day Showcase
> The "See an Example Day" CTA on the landing page captures the visitor's email (via signup) before showing a curated example day. Lead capture + product showcase in one flow.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.8.1 | Login page redirect support (`?redirect=example`) | `DONE` | AG | |
| 3.8.2 | Update landing page CTA | `DONE` | AG | |
| 3.8.3 | Create `/example` route | `DONE` | AG | Layout also tracks pathname via middleware headers |
| 3.8.4 | Build ExampleDayClient | `DONE` | AG | Uses `MOCK_DAILY_DATA.days[0]` directly |Any authenticated user can view. Uses hardcoded mock data, not DB. |

---

## Phase 3.9: Post-Login Dashboard
> Replace `/calendar` as the post-login landing with a purpose-built dashboard. Today's plan, this week, quick actions, month theme.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.9.1 | Create `app/(subscriber)/dashboard/page.tsx` (server component) + `DashboardClient.tsx` (client UI) | `DONE` | AG | |
| 3.9.2 | Update routing: login → `/dashboard`, onboarding → `/dashboard`, middleware mock → `/dashboard`, marketing page → `/dashboard` | `DONE` | AG | |
| 3.9.3 | Update Navbar: add Home/Dashboard as first link, logo links to `/dashboard` | `DONE` | AG | |
| 3.9.4 | Clean up calendar page (remove `has_onboarded` check, keep as standalone view) | `DONE` | AG | |

---

## Phase 3.9.1: Early Access Dashboard State
> When non-admin users sign up from Instagram, show a warm early access confirmation instead of an empty dashboard. Supabase auth.users is the waitlist.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 3.9.1.1 | Add early access branch to `DashboardClient.tsx` — detect `!is_admin && !active_subscription_month`, render waitlist confirmation with Instagram CTA + sign-out | `DONE` | AG | See handoff: `PHASE-3.9.1-EARLY-ACCESS.md` |
| 3.9.1.2 | Fix `dashboard/page.tsx` — early access users hit `has_onboarded` redirect before early access screen renders. Skip onboarding redirect when `!is_admin && !active_subscription_month` | `DONE` | AG | Bug found in live testing. Fixed and deployed. |
| 3.9.2.1 | Hide Navbar for early access users in subscriber layout + add redirect guards to calendar/vault pages | `DONE` | AG | See handoff: `PHASE-3.9.2-EARLY-ACCESS-LOCKDOWN.md` |
| 3.9.2.2 | Fix onboarding generation: `month_year` → `monthYear` param mismatch in OnboardingClient.tsx, redirect to `/dashboard` not `/calendar` | `DONE` | AG | See handoff: `PHASE-3.9.2-EARLY-ACCESS-LOCKDOWN.md` |

---

## Phase 4.1: Execution-Ready Activity Cards (HIGH PRIORITY)
> The core product differentiator. Current activity cards are inspiration-level; teachers need execution-ready content with steps, materials quantities, differentiation, safety notes, and more. Also makes bilingual content opt-in rather than forced.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 4.1.1 | Update `lib/types.ts` — new DomainActivity interface (steps, MaterialItem, duration breakdown, differentiation, etc.) + backward compat helper `isRichActivity()` | `DONE` | AG | See handoff: `PHASE-4.1-ACTIVITY-DEPTH.md`. Must support legacy data. |
| 4.1.2 | Update `lib/mock-data.ts` — add rich mock data for at least 1 full day using new schema | `DONE` | AG | Example "Starlight Sensory Station" in handoff |
| 4.1.3 | Redesign `DailyFlowCard.tsx` — collapsed/expanded card with all new fields, legacy fallback | `DONE` | AG | Collapsed: title + description + badges. Expanded: steps, materials table, differentiation, safety, vocabulary pills |
| 4.1.4 | Update `lib/gemini.ts` — new specialist prompts requesting rich output, bilingual conditional block | `DONE` | AG | Critical: bilingual fields only generated when `bilingualMode === true` |
| 4.1.5 | Update `app/api/generate-curriculum/route.ts` — pass `bilingualMode` from profile to generation pipeline | `DONE` | AG | |
| 4.1.6 | Add `bilingual_mode` and `secondary_language` columns to profiles table (migration) | `DONE` | AG | `ALTER TABLE profiles ADD COLUMN bilingual_mode BOOLEAN DEFAULT FALSE` |
| 4.1.7 | Update onboarding flow — add bilingual opt-in step | `DONE` | AG | Default: English only. Optional: "Add Portuguese translations?" |
| 4.1.8 | Test — generate one plan with new prompts, verify output quality and card rendering | `DONE` | AG | Show to Luana for feedback |

### Implementation priority:
Tasks 4.1.1-4.1.3 (schema + mock + UI) can be done immediately with mock data.
Tasks 4.1.4-4.1.5 (Gemini prompt + API) are the generation pipeline changes.
Tasks 4.1.6-4.1.7 (DB + onboarding) are the bilingual opt-in plumbing.
Task 4.1.8 is end-to-end validation.

---

## Phase 4.5: Weekly View & Flexibility
> Some teachers plan week-by-week. Add weekly view and generation options.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 4.5.1 | Add week view toggle/tab to subscriber calendar page | `PENDING` | AG | |
| 4.5.2 | Build "This Week at a Glance" summary card component | `PENDING` | AG | |
| 4.5.3 | Add weekly generation option to Studio (pass week's dates to existing Gemini pipeline) | `PENDING` | AG | |
| 4.5.4 | Consider schema changes: weekly plans as subset of monthly, or separate entries | `PENDING` | Claude | Architecture decision needed |

---

## Phase 5: Gamification Foundations
> Make planning sticky. Start with completion tracking, then build streaks and badges on top.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 5.1 | Create `completions` DB table + migration (user_id, date, domains_completed JSONB) | `DONE` | AG | |
| 5.2 | Add "Mark Day Complete" button to DayClient + domain-level completion checkboxes | `DONE` | AG | Added Checkboxes to the DailyFlowCard |
| 5.3 | Replace passive date-based checkmarks in CalendarGrid with action-based completion indicators | `DONE` | AG | |
| 5.4 | Build streak counter (computed from completions) + display in calendar header | `DONE` | AG | |
| 5.5 | Add monthly completion badge/celebration when all school days marked complete | `DONE` | AG | |

---

## Phase 6: Mobile Polish
> Refine the mobile experience beyond the foundation fixes.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 6.1 | Add swipe navigation between days using Framer Motion gesture handlers | `PENDING` | AG | |
| 6.2 | Add pull-to-refresh behavior on calendar and day views | `PENDING` | AG | |
| 6.3 | Replace Studio `input[type="month"]` with custom picker (if not done in Phase 0) | `PENDING` | AG | Duplicate check with 0.1 |

---

## Phase 7: PWA / Offline (Future)
> Only if connectivity is a real issue for the target audience.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 7.1 | Add web app manifest + PWA icons for installability | `PENDING` | AG | |
| 7.2 | Add service worker for static asset caching | `PENDING` | AG | |
| 7.3 | Cache previously viewed curriculum data for offline reading | `PENDING` | AG | |

---

## Phase 4.6: Studio Generation Guardrails
> Prevent accidental overwrites when generating plans for months that already have content.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 4.6.1 | Add pre-generation check — query `curriculum_plans` for existing plan when admin selects a month in Studio | `DONE` | AG | Before calling generate API |
| 4.6.2 | Show confirmation modal when plan exists for selected month — different severity for draft vs published | `DONE` | AG | Draft: "You have a draft for June 2026 ('Ocean Explorers'). Generating will replace it." Published: "June 2026 is published and visible to subscribers. Generating will replace it with a new draft." |
| 4.6.3 | Add visual indicators to month picker — dot/badge showing which months already have plans (green=published, amber=draft) | `DONE` | AG | Helps Luana see at a glance which months are taken |
| 4.6.4 | Add `is_published` guard in API — if overwriting a published plan, require explicit `confirmOverwrite: true` param | `DONE` | AG | Defense in depth — API rejects accidental overwrites of published plans |
| 4.6.5 | Add unpublish action — button on published plans in Studio sidebar to set `is_published = false` (returns to draft state) | `DONE` | AG | Confirmation modal: "This will remove the plan from subscribers' view." |
| 4.6.6 | Add delete plan action — button on draft plans in Studio sidebar to permanently delete from `curriculum_plans` | `DONE` | AG | Only drafts can be deleted. Published plans must be unpublished first. Confirmation modal required. |

---

## Phase 8: Admin Console
> Give Luana a native admin experience to manage her waitlist, activate subscribers, and communicate with her audience — without leaving the app or touching Supabase directly.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 8.1 | Create `/admin` route group with admin middleware guard (redirect non-admins) | `PENDING` | AG | |
| 8.2 | Build waitlist dashboard — show all signups (from `profiles` joined with `auth.users`), signup date, status (waitlist/active/admin), search/filter | `PENDING` | AG | This is Luana's primary view |
| 8.3 | Add individual "Activate" button — sets `active_subscription_month` on a user's profile, transitions them from waitlist to active subscriber | `PENDING` | AG | |
| 8.4 | Add activation email trigger — when Luana activates a user, auto-send "Your Lua Learn dashboard is ready!" email via Resend | `PENDING` | AG | Resend already configured for OTP. Template should match brand. |
| 8.5 | Add bulk activation — "Activate all waitlist users for [month]" for launch day | `PENDING` | AG | |
| 8.6 | Add simple broadcast composer — write a message, send to all waitlist users via Resend (launch announcements, updates) | `PENDING` | AG | Keeps Luana out of Mailchimp. Simple subject + body, no drag-and-drop needed. |
| 8.7 | Add waitlist stats widget — total signups, signups this week, simple growth chart | `PENDING` | AG | Motivating for Luana to see Instagram → signup traction |
| 8.8 | Add role management — view/change user roles (admin, subscriber, waitlist) | `PENDING` | AG | |
| 8.9 | Add subscription management — assign/revoke `active_subscription_month`, future tier management (Sprout/Bloom) | `PENDING` | AG | |

### Design Notes for AG:
- Admin console should feel like part of the app, not a separate tool — same brand, same nav
- Waitlist dashboard is the hero view. Luana checks this to see who signed up from Instagram
- Activation flow should be one tap: see user → tap Activate → email sent, done
- Broadcast emails use Resend (already in stack). Brand-consistent HTML template with Lua Learn header, terracotta CTA button
- Stats should be glanceable — big number + sparkline, not a full analytics suite
- Mobile-friendly — Luana will check this from her phone

---

## Phase 9: Subscription Tiers & Payments
> Introduce the Sprout/Bloom tier system and Stripe payment integration. This phase requires clear separation between self-serve content (Sprout) and Luana's curated content (Bloom).

### Tier Architecture

**Current state (broken):** There's no tier concept. `active_subscription_month` is a single field that unlocks "a plan." The onboarding flow generates a plan for the user (Sprout behavior), but the Studio publish flow pushes a plan to ALL subscribers (Bloom behavior). These are conflated — a Sprout user who generates their own plan and a Bloom subscriber who receives Luana's plan both just "have a plan for March 2026." No distinction.

**Target state:**

| Aspect | Sprout (Free) | Bloom (Premium) |
|--------|--------------|-----------------|
| **Price** | Free | $9.99/month (or annual) |
| **Content source** | Self-generated via onboarding/Studio-lite | Luana's expert-curated via Studio |
| **Plan ownership** | User owns their plans (stored per-user) | Luana's published plans (shared across Bloom subscribers) |
| **Experience** | "I'll build my own curriculum" | "Open app, today's plan is ready" |
| **Generation** | User picks theme, philosophy, age group → Gemini generates | Luana generates, reviews, edits, publishes |
| **Editing** | Can regenerate, can't edit individual activities (yet) | Read-only for subscribers; Luana edits in Studio |
| **Limits** | 1 active plan at a time? Monthly generation cap? | Full month published, new month every month |
| **Upsell path** | "Want expert-crafted plans? Upgrade to Bloom" | N/A — this is the top tier |

### Data Model Changes

**Profile table:**
```sql
ALTER TABLE profiles
  ADD COLUMN subscription_tier TEXT DEFAULT 'sprout'
    CHECK (subscription_tier IN ('sprout', 'bloom')),
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled'));
```

**Plan ownership:** Currently `curriculum_plans` has no `user_id` — plans are global. For Sprout, plans need to be per-user:
```sql
ALTER TABLE curriculum_plans
  ADD COLUMN user_id UUID REFERENCES auth.users(id),
  ADD COLUMN plan_type TEXT DEFAULT 'curated'
    CHECK (plan_type IN ('curated', 'self_generated'));
```
- `curated` + `user_id = NULL` = Luana's published Bloom plans (current behavior)
- `self_generated` + `user_id = {user}` = Sprout user's own plans

**RLS policy updates:**
- Sprout users can only read their own `self_generated` plans
- Bloom users can read `curated` + `is_published = true` plans for their subscription month
- Admins can read/write everything

### User Journey Changes

**Sprout user journey (free):**
```
Landing page → "Get Started Free" → signup → onboarding flow
  → picks theme, philosophy, age group → generates plan
  → lands on dashboard with THEIR OWN plan
  → can view calendar, day view, print PDFs
  → sees gentle "Upgrade to Bloom" upsell on dashboard
  → can regenerate next month for free
```

**Bloom user journey (paid):**
```
Landing page → "Subscribe to Bloom" → signup → Stripe Checkout
  → payment succeeds → webhook sets subscription_tier='bloom', subscription_status='active'
  → redirected to dashboard
  → if Luana has published a plan for this month → shows it
  → if not yet published → "Your expert-crafted curriculum is being prepared"
  → each month: Luana publishes → Bloom users see it automatically
```

**Upgrade path (Sprout → Bloom):**
```
Dashboard (Sprout user) → "Upgrade to Bloom" banner/card
  → Stripe Checkout → payment
  → webhook upgrades tier → user now sees Luana's plans instead of self-generated
  → self-generated plans still accessible? (Decision needed)
```

### Tasks

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 9.1 | Add `subscription_tier`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status` columns to profiles | `PENDING` | AG | Migration SQL. Default tier = 'sprout'. |
| 9.2 | Add `user_id` and `plan_type` columns to `curriculum_plans` + update RLS policies | `PENDING` | AG | Sprout plans are per-user. Bloom plans are global curated. Backward compat: existing plans get `plan_type='curated'`, `user_id=NULL`. |
| 9.3 | Update `lib/types.ts` — add tier fields to Profile, plan_type to CurriculumPlan | `PENDING` | AG | |
| 9.4 | Update onboarding generation — set `user_id` and `plan_type='self_generated'` on plans created by Sprout users | `PENDING` | AG | Currently the API uses upsert on `month_year` — needs to also key on `user_id` for Sprout plans |
| 9.5 | Update dashboard/calendar queries — Sprout users see their own plans, Bloom users see Luana's published plans | `PENDING` | AG | The dashboard `page.tsx` and calendar `page.tsx` need tier-aware queries |
| 9.6 | Create Stripe account + products — one product "Lua Learn Bloom", one price (monthly recurring) | `PENDING` | Krish | Manual setup in Stripe Dashboard. Get API keys. |
| 9.7 | Add Stripe env vars to Vercel — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `PENDING` | Krish | |
| 9.8 | Create `/api/checkout` route — creates Stripe Checkout Session, redirects to Stripe | `PENDING` | AG | Pass user email as customer_email for matching. Success URL: `/dashboard?upgraded=true`. Cancel URL: `/`. |
| 9.9 | Create `/api/webhooks/stripe` route — handle `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted` | `PENDING` | AG | Map Stripe customer email → Supabase profile. Set `subscription_tier='bloom'`, `subscription_status='active'`, `active_subscription_month` to current month. |
| 9.10 | Add "Upgrade to Bloom" card to Sprout dashboard — describes what Bloom includes, CTA to `/api/checkout` | `PENDING` | AG | Warm, not pushy. "Ready for expert-crafted plans?" |
| 9.11 | Add pricing section to landing page — show Sprout (free) vs Bloom (paid) side by side | `PENDING` | AG | |
| 9.12 | Handle subscription renewal — `invoice.paid` webhook updates `active_subscription_month` to next month | `PENDING` | AG | Bloom subscribers auto-renew monthly. |
| 9.13 | Handle cancellation — `customer.subscription.deleted` webhook sets `subscription_status='canceled'`, shows "Your subscription ended" state | `PENDING` | AG | User keeps access until end of billing period. |
| 9.14 | Add Stripe Customer Portal link — "Manage Subscription" button in settings or dashboard for Bloom users | `PENDING` | AG | Stripe's hosted portal handles plan changes, payment method updates, cancellation. |

### Key Decisions (for Krish/Claude to resolve before implementation):

1. **Price point:** $9.99/month? $7.99/month with annual discount? Need to decide before creating Stripe products.
2. **Sprout generation limits:** Unlimited? 1 plan per month? 3 per month? Unlimited is simplest for MVP.
3. **What happens to Sprout plans when user upgrades to Bloom?** Keep them accessible in a "My Plans" section? Or replace entirely with Luana's plans?
4. **Trial period:** Should Bloom have a 7-day free trial? Stripe supports this natively.
5. **Multiple admins/creators:** For now it's just Luana. But should the system support multiple creators eventually? (Not for MVP — just noting.)
6. **Currency:** USD only? CAD? BRL? Stripe handles multi-currency but pricing display needs to match.

### Implementation Order:
1. **9.1–9.3 first** — Schema changes. Non-breaking if defaults are correct.
2. **9.4–9.5 second** — Query changes. Sprout users see their own plans.
3. **9.6–9.7 third** — Stripe setup (Krish does this manually).
4. **9.8–9.9 fourth** — Payment routes. This is where money flows.
5. **9.10–9.11 fifth** — UI for upgrade and pricing.
6. **9.12–9.14 last** — Lifecycle management (renewal, cancellation, portal).

### What NOT to build for MVP:
- No annual billing (add later)
- No coupon/promo codes (add later)
- No team/school plans (add later)
- No invoicing (Stripe handles this)
- No refund flow (handle manually via Stripe dashboard)
- No usage analytics for Stripe (Stripe dashboard is sufficient)

---

## Backlog: Gamification Ideas (Future Phases)
> Captured from ideation. Prioritize after Phase 5 foundations are validated.

- Planning streaks with streak freezes (vacation weeks)
- Seasonal badges ("Fall Planner", "Holiday Hero", "Spring Into Science")
- Community stats ("47 teachers used your Ocean Explorers theme this month")
- Parent engagement score (track Parent Bridge snippet copy/share usage)
- Themed challenges ("March Reading Month: add extra literacy activity")
- Share-and-earn system (share activities to community library, earn recognition)
- XP/Leveling system for creators
- Opt-in collaborative leaderboards

---

## Deployment & Cost Notes
- **Current stack:** Vercel (hosting) + GitHub (source) + Supabase (DB/Auth)
- **Available:** Google Cloud (Krish has GCP access)
- **AI:** Gemini API (Google AI Studio) — Krish has Google One Ultra
- **Principle:** Maximize ROI on existing Google One Ultra + Claude Max subscriptions. Minimize additional paid services.
- **Decision needed:** Evaluate whether to consolidate hosting on GCP (Cloud Run) or stay on Vercel free tier. Not blocking — revisit after MVP.
