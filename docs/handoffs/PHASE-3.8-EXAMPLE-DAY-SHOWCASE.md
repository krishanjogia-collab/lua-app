# Phase 3.8: Gated Example Day Showcase

> **Purpose:** The "See an Example Day" CTA on the landing page should capture the visitor's email (via signup) before showing them a curated, best-in-class example day. This serves as lead capture (they join the waitlist) AND product showcase (they see the depth of content).

---

## Context

- The landing page currently has a "See an Example Day" button that links to a hardcoded fake URL (`/preview/day/123/2026-03-14`) — this 404s.
- We need this to be a lead-capture gate: visitor signs up first, then sees the example day.
- After viewing the example day, the user is on the waitlist (Supabase has their email).
- The example day content must be **hardcoded curated mock data** — not pulled from the database. We control exactly what visitors see.

---

## User Flows (CRITICAL — read carefully)

There are **four distinct user types** that might interact with this feature. Each must be handled correctly.

### Flow A: Brand New Visitor → "See an Example Day"
```
Landing page → clicks "See an Example Day"
  → /login?redirect=example
  → enters email, receives OTP, enters code
  → login page reads ?redirect=example from URL
  → window.location.href = '/example' (NOT /dashboard)
  → /example route renders curated example day
  → at bottom: "You're on the list!" CTA + Instagram link + sign out
```

### Flow B: Brand New Visitor → "Get Started Free" (normal signup)
```
Landing page → clicks "Get Started Free"
  → /login (no redirect param)
  → enters email, receives OTP, enters code
  → window.location.href = '/dashboard' (default behavior, unchanged)
  → dashboard shows early access waitlist screen
```

### Flow C: Returning Early Access User (already signed up)
```
Landing page → redirects to /dashboard (already authenticated)
  → dashboard shows waitlist screen as before
  → BUT: if they somehow navigate to /example, it should work (they're authenticated)
```

### Flow D: Admin / Active Subscriber
```
Landing page → redirects to /dashboard (already authenticated)
  → sees normal dashboard with plan data
  → can access /example if they want (no harm, it's just a showcase)
```

**Key rule:** The `/example` route requires authentication but does NOT require `active_subscription_month` or `has_onboarded`. Any authenticated user can view it. It sits outside the early access lockdown.

---

## Implementation

### 1. Update Login Page — Add `?redirect` param support

**File:** `app/(auth)/login/page.tsx`

The login page is a client component. Add support for a `redirect` query param:

```tsx
'use client'

import { useSearchParams } from 'next/navigation'

// Inside LoginPage component:
const searchParams = useSearchParams()
const redirectTo = searchParams.get('redirect')

// In handleVerifyCode, after successful OTP verification:
// Replace the existing hard redirect:
// window.location.href = '/dashboard'
// With:
if (redirectTo === 'example') {
  window.location.href = '/example'
} else {
  window.location.href = '/dashboard'
}
```

**Important:** Only honor known redirect values (whitelist approach). Do NOT blindly redirect to any URL — that's an open redirect vulnerability. Only `'example'` is valid for now. Everything else falls through to `/dashboard`.

**Wrap the component** in a `<Suspense>` boundary if `useSearchParams()` requires it (Next.js 15 may require this for static rendering). The login page is already `'use client'` so this should work, but if build errors occur, wrap the page export:

```tsx
import { Suspense } from 'react'

function LoginForm() {
  // ... existing component code with useSearchParams
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <LoginForm />
    </Suspense>
  )
}
```

### 2. Update Landing Page CTA

**File:** `app/(marketing)/LandingClient.tsx`

Change line 7:
```tsx
// OLD:
const MOCK_PREVIEW_LINK = '/preview/day/123/2026-03-14'

// NEW: Remove this constant entirely
```

Change the "See an Example Day" button href (line 49):
```tsx
// OLD:
<a href={MOCK_PREVIEW_LINK} ...>

// NEW:
<a href="/login?redirect=example" ...>
```

### 3. Create Example Day Route

**New file:** `app/(subscriber)/example/page.tsx`

This is a **server component** that checks auth, then renders the example client.

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExampleDayClient } from './ExampleDayClient'

export default async function ExampleDayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=example')

  return <ExampleDayClient />
}
```

**No profile check, no subscription check, no onboarding check.** Any authenticated user can see this page. This is intentional — it's a showcase, not a feature.

### 4. Build Example Day Client

**New file:** `app/(subscriber)/example/ExampleDayClient.tsx`

This is where the magic happens. This page must **sell the product**. It should showcase:

- A themed day title with the theme name and date
- All 6 Lua Cycle domains with expandable activity cards
- Rich content: steps, materials table with quantities and substitutes, duration breakdown, differentiation (easier/harder), safety notes, vocabulary pills
- Bilingual toggle (EN/PT) so visitors can see the translation capability
- A print/PDF teaser ("Teachers can print this as a PDF")

**Use the existing `DailyFlowCard.tsx` component** if possible — this is the same card the real product uses. Import it and pass it the curated mock data. This way the example day looks exactly like the real product.

**Curated mock data:** Use the "Galactic Gardens - Day 1" data from `lib/mock-data.ts` (the `sensory_layout` entry with the full rich schema). This is already the best showcase content. Import it or duplicate it as a constant in this file.

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│  🌱 Lua Learn — Example Day            │
│                                         │
│  Theme: Galactic Gardens                │
│  Monday, February 2                     │
│                                         │
│  This is what a day on Lua Learn        │
│  looks like. Tap any activity to        │
│  see the full plan.                     │
│                                         │
│  [EN / PT toggle]                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🖐️ Starlight Sensory Station    │   │
│  │ (expandable card with full      │   │
│  │  rich content — steps,          │   │
│  │  materials, differentiation...) │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📚 Planet Names Vocabulary       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏃 Rocket Ship Blast-Off Run    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ... (all 6 domains)                   │
│                                         │
│  ────────────────────────────────────  │
│                                         │
│  ✨ This plan covers all 6 learning    │
│  areas. Every day is different.        │
│  Classroom-ready in minutes.           │
│                                         │
│  ────────────────────────────────────  │
│                                         │
│  🌱 You're on the list!               │
│                                         │
│  Lua Learn is launching soon with      │
│  classroom-ready Pre-K curriculum...   │
│                                         │
│  [Follow @lua_learn]                   │
│  Sign out                              │
│                                         │
└─────────────────────────────────────────┘
```

The bottom section reuses the same waitlist messaging from `DashboardClient.tsx` early access state. Copy the same copy and styling.

**Do NOT show the Navbar** on this page. The subscriber layout already hides the navbar for early access users (`!isEarlyAccess && <Navbar />`), so this should work automatically for new signups. For admin/subscriber users who visit this page, the navbar will show — that's fine.

### 5. Bypass Early Access Route Lockdown for /example

If there are redirect guards on subscriber pages that send early access users to `/dashboard`, make sure `/example` is excluded. Check:

- `app/(subscriber)/layout.tsx` — if it has any pathname-based redirect for early access users, whitelist `/example`
- Individual page guards in `calendar/page.tsx`, `vault/page.tsx` etc. already redirect to `/dashboard` — those are fine. We're adding a new page that intentionally skips that check.

The `/example/page.tsx` server component only checks for auth (user exists), not subscription status. So the layout's isEarlyAccess logic doesn't need to change — it just hides the navbar, which is the desired behavior.

---

## Tone & Copy

- The page header should feel like a guided tour: "Here's what a day on Lua Learn looks like"
- The activities speak for themselves — the rich content IS the sales pitch
- After the activities, a gentle value prop: "Every day covers all 6 learning areas. Ready to teach, not just inspire."
- The waitlist section at the bottom should feel like a natural conclusion, not a hard sell
- All copy bilingual (EN/PT) — the language toggle is part of the showcase
- **No "AI-powered" language.** Use "Created by an educator with 15+ years of experience across 3 continents."

---

## Design Guidelines

- **Mobile-first** — most visitors will come from Instagram on their phones
- **Cream background** inherited from subscriber layout
- **Brand colors** — terracotta CTAs, sage accents, espresso text
- **Framer Motion** — fade-in on load, expand/collapse on activity cards
- **Reuse `DailyFlowCard.tsx`** if possible for authenticity
- **No navbar** for early access users (handled by layout)
- **Sprout icon** header matching login page style

---

## Security Considerations

- **Open redirect prevention:** Login page must whitelist redirect values. Only `'example'` is valid. Do not accept arbitrary URLs or paths.
- **Auth required:** The `/example` route requires authentication. Unauthenticated users redirect to `/login?redirect=example`.
- **No sensitive data:** The example day is hardcoded mock data, not real user content.

---

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `app/(auth)/login/page.tsx` | MODIFY | Add `useSearchParams` + redirect whitelist |
| `app/(marketing)/LandingClient.tsx` | MODIFY | Change CTA href to `/login?redirect=example` |
| `app/(subscriber)/example/page.tsx` | CREATE | Server component, auth check only |
| `app/(subscriber)/example/ExampleDayClient.tsx` | CREATE | Curated showcase + waitlist CTA |

---

## Acceptance Criteria

- [ ] "See an Example Day" on landing page goes to `/login?redirect=example`
- [ ] New visitor: signup → lands on `/example` (not `/dashboard`)
- [ ] New visitor via "Get Started Free": signup → lands on `/dashboard` (unchanged)
- [ ] `/example` page shows all 6 domains with rich expandable cards
- [ ] Language toggle (EN/PT) works on the example page
- [ ] Waitlist messaging appears at the bottom of the example page
- [ ] User is on the waitlist after viewing (Supabase has their email from signup)
- [ ] Returning early access users can access `/example` if they navigate to it
- [ ] Admin/subscriber users can access `/example` (navbar shows, no harm)
- [ ] Login page only honors `redirect=example` — all other values redirect to `/dashboard`
- [ ] No "AI-powered" language anywhere on the page
- [ ] Page works on mobile (375px)
- [ ] Unauthenticated direct access to `/example` redirects to `/login?redirect=example`

---

## What NOT to Do

- Do NOT pull example data from Supabase — use hardcoded mock data
- Do NOT add this page to the Navbar
- Do NOT require `active_subscription_month` or `has_onboarded` to view this page
- Do NOT accept arbitrary redirect URLs in the login page — whitelist only
- Do NOT show print/PDF/share buttons on the example page (those are product features for subscribers)
