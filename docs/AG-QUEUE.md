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
| 2.5.3 | Add brand assets to `public/` (favicon, apple-touch-icon, OG default image using Imagen-generated assets from Krish) | `PENDING` | AG | Krish to provide PNGs from Imagen |

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
| 3.5.1 | Replace all instances of "Lua" (standalone) with "Lua Learn" across the app (Navbar, footer, metadata, PDF headers, OG images, share cards, email templates) | `PENDING` | AG | Claude already updated login page and landing page hero. AG to sweep the rest. |
| 3.5.2 | Remove or rephrase all "AI-powered" / "AI generates" messaging throughout the app | `PENDING` | AG | Replace with educator-expertise framing. See `memory/feedback_branding.md` for guidance. The value prop is Luana's 15+ years across 3 continents, not the technology. |
| 3.5.3 | Update `app/layout.tsx` root metadata — title, description, OG defaults — to use "Lua Learn" and educator-first copy | `PENDING` | AG | |
| 3.5.4 | Update Navbar logo/text from "Lua" to "Lua Learn" | `PENDING` | AG | |

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
| 3.7.1 | Create `/onboarding` route + middleware redirect for unonboarded users | `PENDING` | AG | See handoff: `PHASE-3.7-GUIDED-ONBOARDING.md` |
| 3.7.2 | Build 6-step guided flow (welcome → age group → planning cadence → theme → philosophy → generate + preview) | `PENDING` | AG | All copy must use warm educator-friendly tone. See handoff for language table. |
| 3.7.3 | Add `planning_cadence` and `age_group` columns to profiles table | `PENDING` | AG | Migration in handoff. Support weekly + monthly cadence. |
| 3.7.4 | Connect flow to curriculum generation pipeline (weekly or monthly based on cadence) | `PENDING` | AG | Reuse existing `/api/generate-curriculum` with new params |
| 3.7.5 | Retire WelcomeModal.tsx — onboarding flow replaces it | `PENDING` | AG | |

### Tone Benchmark (Sprout/Bloom metaphor):
- **Sprout** = free tier, self-serve, "I'll build my own curriculum"
- **Bloom** = premium tier, Luana's expert-crafted plans, "ready to teach"
- All language should feel like a supportive colleague, never like software
- See `docs/handoffs/PHASE-3.7-GUIDED-ONBOARDING.md` for the full language table

---

## Phase 4: Weekly View & Flexibility
> Some teachers plan week-by-week. Add weekly view and generation options.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 4.1 | Add week view toggle/tab to subscriber calendar page | `PENDING` | AG | |
| 4.2 | Build "This Week at a Glance" summary card component | `PENDING` | AG | |
| 4.3 | Add weekly generation option to Studio (pass week's dates to existing Gemini pipeline) | `PENDING` | AG | |
| 4.4 | Consider schema changes: weekly plans as subset of monthly, or separate entries | `PENDING` | Claude | Architecture decision needed |

---

## Phase 5: Gamification Foundations
> Make planning sticky. Start with completion tracking, then build streaks and badges on top.

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 5.1 | Create `completions` DB table + migration (user_id, date, domains_completed JSONB) | `PENDING` | AG | |
| 5.2 | Add "Mark Day Complete" button to DayClient + domain-level completion checkboxes | `PENDING` | AG | |
| 5.3 | Replace passive date-based checkmarks in CalendarGrid with action-based completion indicators | `PENDING` | AG | |
| 5.4 | Build streak counter (computed from completions) + display in calendar header | `PENDING` | AG | |
| 5.5 | Add monthly completion badge/celebration when all school days marked complete | `PENDING` | AG | |

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
