# Phase 3.7: Guided Onboarding Flow — Handoff Spec

> **Purpose:** Replace the current welcome modal (Phase 3.4) with a guided onboarding flow that produces a real curriculum on the teacher's first visit. A new Sprout-tier teacher should never land on an empty calendar. By the time they see the calendar, it should be full of content they helped shape.

---

## Context

- The current welcome modal (WelcomeModal.tsx) explains features but doesn't produce value. It should be replaced by this flow.
- `has_onboarded` flag in `profiles` table already exists (Phase 3.3). Reuse it.
- The existing Studio (`app/studio/`) handles curriculum generation via the Gemini pipeline. This flow wraps the same pipeline in a friendlier, guided experience.
- Two tiers exist: **Sprout** (free, self-serve) and **Bloom** (premium, Luana's curated plans). This flow is for Sprout-tier users. Bloom users will see pre-populated content.
- Teachers plan either **week by week** or **a full month at a time**. The flow must ask which.

---

## Tone & Language Guidelines

**This is the most important section.** Every word in this flow should feel like a supportive colleague, not a software product.

| Instead of... | Say... |
|---|---|
| Configure your settings | Tell us about your classroom |
| Select your preferences | What works best for you? |
| Generate curriculum | Let's build your plan |
| Submit | Let's go! |
| Processing... | Preparing your plan... |
| Error occurred | Something didn't go as planned — let's try again |
| Input your data | Share a little about your teaching |
| Monthly/Weekly cadence | How do you like to plan? |

**Voice:** Warm, encouraging, collaborative. Like a mentor teacher helping a colleague set up their classroom for the year.

---

## 3.7.1 — Onboarding Route

**New file:** `app/(subscriber)/onboarding/page.tsx` + `OnboardingClient.tsx`

**Trigger:** When a user with `has_onboarded = false` navigates to any subscriber route, middleware redirects them to `/onboarding` instead of `/calendar`.

**Middleware update** (in `middleware.ts`):
```tsx
// After confirming user is authenticated and NOT on a public route:
if (user && !pathname.startsWith('/onboarding')) {
  // Check if user needs onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_onboarded')
    .eq('id', user.id)
    .single()

  if (profile && !profile.has_onboarded) {
    const onboardingUrl = request.nextUrl.clone()
    onboardingUrl.pathname = '/onboarding'
    return redirectWithCookies('/onboarding')
  }
}
```

Add `/onboarding` to subscriber routes (requires auth, but not onboarded status).

---

## 3.7.2 — The Flow (6 Steps)

The onboarding is a single-page, multi-step flow with smooth transitions between steps. Think of it like a friendly conversation, not a form.

### Step 1: Welcome
```
┌─────────────────────────────────────────┐
│                                         │
│  🌱 Welcome to Lua Learn               │
│                                         │
│  We're so glad you're here.             │
│  Let's set up your first curriculum     │
│  together — it only takes a minute.     │
│                                         │
│  [Let's get started →]                  │
│                                         │
└─────────────────────────────────────────┘
```

### Step 2: "Tell us about your little learners"
```
┌─────────────────────────────────────────┐
│                                         │
│  Tell us about your little learners     │
│                                         │
│  What age group is your classroom?      │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ 🌱          │  │ 🌿          │      │
│  │ 3-4 years   │  │ 4-5 years   │      │
│  │ Early Pre-K │  │ Pre-K       │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│  ┌─────────────────────────────┐       │
│  │ 🌳                          │       │
│  │ Mixed ages (3-5)            │       │
│  │ Multi-age classroom         │       │
│  └─────────────────────────────┘       │
│                                         │
│  [← Back]              [Next →]        │
│                                         │
└─────────────────────────────────────────┘
```

- Store selection in local state (not DB yet)
- Cards are tappable, with a subtle selected state (terracotta border + check)

### Step 3: "How do you like to plan?"
```
┌─────────────────────────────────────────┐
│                                         │
│  How do you like to plan?               │
│                                         │
│  ┌──────────────────────────────┐      │
│  │ 📅  Week by week             │      │
│  │ Plan one week at a time.     │      │
│  │ Great if you like to stay    │      │
│  │ flexible and adjust as you   │      │
│  │ go.                          │      │
│  └──────────────────────────────┘      │
│                                         │
│  ┌──────────────────────────────┐      │
│  │ 🗓️  A full month at a time   │      │
│  │ Get the whole month ready    │      │
│  │ in one go. Perfect if you    │      │
│  │ like to see the big picture. │      │
│  └──────────────────────────────┘      │
│                                         │
│  [← Back]              [Next →]        │
│                                         │
└─────────────────────────────────────────┘
```

- Store `planning_cadence: 'weekly' | 'monthly'` in profile (new column — see migration below)
- This affects how the calendar displays and how curriculum is generated

### Step 4: "What will your classroom explore?"
```
┌─────────────────────────────────────────┐
│                                         │
│  What will your classroom explore       │
│  this month?                            │
│                                         │
│  Pick a theme — or tell us your own.    │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ 🌊       │  │ 🌱       │            │
│  │ Ocean    │  │ Garden   │            │
│  │ Explorers│  │Scientists│            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │ 🦋       │  │ 🏗️       │            │
│  │ Bugs &   │  │ Building │            │
│  │ Butterfl.│  │ & Making │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │ 🎨       │  │ ✨       │            │
│  │ Colors & │  │ My own   │            │
│  │ Patterns │  │ idea...  │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  [← Back]              [Next →]        │
│                                         │
└─────────────────────────────────────────┘
```

- Curated theme suggestions with emoji + short name
- "My own idea" opens a text input for custom theme
- Each theme card has a warm 1-line description on tap/hover
- Theme list should be seasonally aware (spring themes in spring, etc.)

### Step 5: "How do you like to teach?"
```
┌─────────────────────────────────────────┐
│                                         │
│  How do you like to teach?              │
│                                         │
│  This helps us shape activities that    │
│  feel right for your classroom.         │
│                                         │
│  ┌──────────────────────────────┐      │
│  │ 🧩 Montessori                │      │
│  │ Child-led, hands-on,         │      │
│  │ independent exploration      │      │
│  └──────────────────────────────┘      │
│                                         │
│  ┌──────────────────────────────┐      │
│  │ 🎨 Reggio Emilia             │      │
│  │ Project-based, creative,     │      │
│  │ environment as teacher       │      │
│  └──────────────────────────────┘      │
│                                         │
│  ┌──────────────────────────────┐      │
│  │ 🌈 Play-Based                │      │
│  │ Learning through play,       │      │
│  │ structured and free          │      │
│  └──────────────────────────────┘      │
│                                         │
│  ┌──────────────────────────────┐      │
│  │ 🌿 I'm flexible              │      │
│  │ A balanced mix — surprise me │      │
│  └──────────────────────────────┘      │
│                                         │
│  [← Back]         [Let's build! →]     │
│                                         │
└─────────────────────────────────────────┘
```

- Philosophy descriptions are friendly, not academic
- "I'm flexible" maps to "Signature Pre-K" in the Gemini pipeline

### Step 6: Building + Preview
```
┌─────────────────────────────────────────┐
│                                         │
│  🌱 Preparing your plan...              │
│                                         │
│  [Animated sprout growing into          │
│   a small plant, then blooming]         │
│                                         │
│  "Setting up Ocean Explorers for        │
│   your 4-5 year olds..."               │
│                                         │
│  [Progress indicator — gentle,          │
│   not a loading bar]                    │
│                                         │
│  ────────────────────────────────       │
│  After generation completes:            │
│                                         │
│  Your plan is ready! 🎉                 │
│                                         │
│  Here's a peek at Day 1:               │
│  [Preview card showing one day          │
│   with all 6 domains]                   │
│                                         │
│  [Explore your calendar →]              │
│                                         │
└─────────────────────────────────────────┘
```

- While generating: show a warm animation (sprout growing, or dots pulsing gently)
- Status messages rotate: "Choosing activities...", "Balancing your domains...", "Adding the finishing touches..."
- After completion: show a preview of Day 1
- "Explore your calendar" sets `has_onboarded = true` and navigates to `/calendar`

---

## 3.7.3 — Profile Schema Updates

**Migration:**
```sql
-- Add planning cadence and age group to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS planning_cadence TEXT DEFAULT 'monthly'
    CHECK (planning_cadence IN ('weekly', 'monthly')),
  ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT '4-5'
    CHECK (age_group IN ('3-4', '4-5', 'mixed'));
```

**Update `lib/types.ts`:**
```tsx
interface Profile {
  // ... existing fields
  has_onboarded: boolean
  planning_cadence: 'weekly' | 'monthly'
  age_group: '3-4' | '4-5' | 'mixed'
}
```

---

## 3.7.4 — Curriculum Generation Integration

The onboarding flow's final step triggers the same Gemini pipeline used by Studio, but with the selections from the flow:

```tsx
const response = await fetch('/api/generate-curriculum', {
  method: 'POST',
  body: JSON.stringify({
    theme: selectedTheme,
    philosophy: selectedPhilosophy,
    month_year: currentMonth, // or current week if weekly cadence
    age_group: selectedAgeGroup,
    planning_cadence: selectedCadence,
  }),
})
```

**If weekly cadence:** Only generate for the current week (Mon-Fri), not the full month. The teacher can generate the next week later.

**If monthly cadence:** Generate the full month as current Studio does.

The API route may need minor updates to accept `age_group` and `planning_cadence` and pass them to the Gemini prompt context.

---

## 3.7.5 — Retire Welcome Modal

Once this flow is live:
- Remove or disable `WelcomeModal.tsx`
- The `has_onboarded` flag now gates the onboarding flow route, not the modal
- Returning users (`has_onboarded = true`) go straight to `/calendar` as before

---

## Design Guidelines

- **Mobile-first** — this flow will mostly be used on phones
- **Single column** — each step fills the screen, no side-by-side on mobile
- **Framer Motion** — slide transitions between steps (left-to-right, like turning pages)
- **Progress indicator** — subtle dots at the top showing current step (not a numbered stepper)
- **Brand colors** — cream backgrounds, terracotta CTAs, sage accents
- **Illustrations** — use emoji + Lucide icons, no custom art needed
- **Bilingual** — detect from profile.language_preference, all copy in both EN and PT

---

## Implementation Order

1. **3.7.3 first** — DB migration (new profile columns)
2. **3.7.1 second** — Route + middleware redirect for unonboarded users
3. **3.7.2 third** — The multi-step flow UI (biggest piece)
4. **3.7.4 fourth** — Connect to curriculum generation pipeline
5. **3.7.5 last** — Remove WelcomeModal

---

## Acceptance Criteria

- [ ] New user signs up → redirected to `/onboarding` (not `/calendar`)
- [ ] Flow has 6 steps with smooth transitions
- [ ] All copy uses warm, educator-friendly language (no tech jargon)
- [ ] Age group, planning cadence, theme, and philosophy are captured
- [ ] Curriculum is generated at the end (weekly or monthly based on selection)
- [ ] User lands on `/calendar` with real content after completing the flow
- [ ] `has_onboarded` is set to `true` after completion
- [ ] Returning users skip onboarding entirely
- [ ] Flow works in both EN and PT
- [ ] Flow works on mobile (375px) and desktop (1280px)
- [ ] "Back" button works on every step
- [ ] User can't skip to calendar without completing the flow
- [ ] Loading state during generation is warm and informative (not a spinner)
