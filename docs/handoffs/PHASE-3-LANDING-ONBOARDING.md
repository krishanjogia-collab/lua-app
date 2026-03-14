# Phase 3: Landing Page + Onboarding — Handoff Spec

> **Purpose:** `lualearn.com` needs a public-facing landing page that explains the product and converts visitors into subscribers. Once signed up, new users need a guided introduction to the app. Currently, unauthenticated visitors hit a login wall with no context about what Lua is.

---

## Context

- Domain: `lualearn.com` (purchased, needs DNS pointed to Vercel)
- Instagram: `@lua_learn`
- Phase 1 already created public preview routes at `/preview/day/[planId]/[date]` — the landing page can link to these as "See an example"
- Phase 0.7 already improved empty states with warmer copy — verify these are sufficient before building more
- The landing page lives in the same Next.js app (Option C from architecture discussion)

---

## 3.1 — Public Landing Page

**Goal:** When someone visits `lualearn.com` without being logged in, they see a compelling marketing page that explains Lua and drives sign-ups.

**New file:** `app/(marketing)/page.tsx` (or replace existing `app/page.tsx`)

**The landing page should answer these questions in order:**
1. What is this? (hero)
2. Who is it for? (audience)
3. How does it work? (features)
4. What does it look like? (example)
5. How much does it cost? (pricing — can be "Coming soon" or "Free during beta")
6. How do I get it? (CTA)

**Section-by-section spec:**

### Hero Section
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Cream background with subtle pattern]     │
│                                             │
│  🌙 Lua                                    │
│                                             │
│  AI-Powered Pre-K Curriculum                │
│  That Covers Every Domain, Every Day.       │
│                                             │
│  Plan a full month of play-based,           │
│  bilingual activities in minutes —          │
│  not hours.                                 │
│                                             │
│  [Get Started Free]  [See an Example Day]   │
│                                             │
│  ✨ Bilingual EN/PT • 🎯 6 Domains Daily   │
│  📱 Mobile-First • 🖨️ Print-Ready          │
│                                             │
└─────────────────────────────────────────────┘
```

- "Get Started Free" → links to `/login` (or `/signup` if we split the flow)
- "See an Example Day" → links to a public preview of a sample curriculum day (use mock data or a published plan)
- Hero badges highlight the 4 key differentiators

### "How It Works" Section (3 steps)
```
┌─────────────────────────────────────────────┐
│  How It Works                               │
│                                             │
│  1. Choose Your Theme                       │
│     Pick a monthly theme like "Ocean        │
│     Explorers" or "Garden Scientists"       │
│     and your teaching philosophy.           │
│                                             │
│  2. AI Generates Your Curriculum            │
│     Lua creates a full month of daily       │
│     activities across 6 developmental       │
│     domains — in English and Portuguese.    │
│                                             │
│  3. Teach, Print, Share                     │
│     View on your phone, print for your      │
│     classroom wall, or share with parents.  │
│                                             │
└─────────────────────────────────────────────┘
```

### "The 6 Domains" Section
Show the 6 developmental domains as cards — this is the "educational macros" concept made visible:
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🎨       │ │ 📖       │ │ 🏃       │
│ Sensory  │ │ Cognitive│ │ Physical │
│ & Layout │ │ Literacy │ │ & Motor  │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🤝       │ │ 🌍       │ │ 👨‍👩‍👧       │
│ Social & │ │ Cultural │ │ Parent   │
│ Creative │ │ Awareness│ │ Bridge   │
└──────────┘ └──────────┘ └──────────┘
```

Subtitle: "Every day covers all 6 domains — so you never have to wonder if your classroom is balanced."

### "Built for You" Section (target audience)
```
┌─────────────────────────────────────────────┐
│  Built for Pre-K Educators Who Care         │
│                                             │
│  • Home daycare providers planning solo     │
│  • Lead teachers designing for their room   │
│  • Bilingual educators (EN/PT) serving      │
│    immigrant communities                    │
│  • Anyone tired of the Pinterest-to-Google  │
│    Docs-to-printer planning workflow        │
│                                             │
└─────────────────────────────────────────────┘
```

### Social Proof / Coming Soon
For now (pre-launch), this section can be aspirational:
```
┌─────────────────────────────────────────────┐
│  Join Our Early Access                      │
│                                             │
│  Lua is in beta. Sign up to be among the    │
│  first educators to try AI-powered          │
│  curriculum planning.                       │
│                                             │
│  [Get Started Free]                         │
│                                             │
│  Follow us: @lua_learn on Instagram         │
│                                             │
└─────────────────────────────────────────────┘
```

### Footer
```
┌─────────────────────────────────────────────┐
│  🌙 Lua  •  lualearn.com                   │
│  AI-powered Pre-K curriculum planning       │
│  © 2026 Lua Learn. All rights reserved.     │
│                                             │
│  Instagram: @lua_learn                      │
└─────────────────────────────────────────────┘
```

**Styling:**
- Use the full brand palette (cream backgrounds, terracotta CTAs, sage accents, dusty-rose highlights)
- Lexend for headings, Inter for body
- Generous whitespace — this should feel calm and nurturing, not busy
- Framer Motion fade-in animations on scroll (staggered, subtle)
- Mobile-first — single column on phones, 2-3 columns on desktop for the domain cards and features
- The hero CTA buttons should be large and obvious (terracotta background, white text, rounded-3xl)

**Acceptance criteria:**
- Landing page loads at `/` for unauthenticated visitors
- All sections render correctly on mobile (375px) and desktop (1280px)
- "Get Started Free" links to `/login`
- "See an Example Day" links to a public preview route
- Instagram handle is linked
- Page is fast — no heavy images or JS on initial load
- OG metadata works for the landing page specifically (when sharing `lualearn.com`)

---

## 3.2 — Middleware Update

**Goal:** Route unauthenticated visitors to the landing page, authenticated users to the app.

**File:** `middleware.ts`

**Current behavior:**
- Unauthenticated → redirects to `/login`
- Authenticated → serves the requested route

**New behavior:**
- Unauthenticated + visiting `/` → serve the landing page (no redirect needed if landing page IS `/`)
- Unauthenticated + visiting app routes (`/calendar`, `/studio`, etc.) → redirect to `/login`
- Authenticated + visiting `/` → redirect to `/calendar`
- All other auth logic stays the same

**Implementation:**
Add `/` to the special handling in middleware:
```tsx
// Authenticated user hitting the landing page → send to app
if (user && pathname === '/') {
  const calendarUrl = request.nextUrl.clone()
  calendarUrl.pathname = '/calendar'
  return NextResponse.redirect(calendarUrl)
}
```

The landing page route itself should be in the public routes list so it's always accessible:
```tsx
const publicRoutes = ['/login', '/auth/processing', '/api/auth', '/preview', '/api/og', '/']
```

**Acceptance criteria:**
- Visitor (not logged in) goes to `lualearn.com` → sees landing page
- Visitor clicks "Get Started" → goes to `/login`
- Logged-in user goes to `lualearn.com` → redirected to `/calendar`
- All existing auth flows still work

---

## 3.3 — First-Time User Detection

**Goal:** Know when a subscriber is brand new so we can show them a welcome experience.

**Option A (simple):** Add `has_onboarded BOOLEAN DEFAULT FALSE` to the `profiles` table. Set to `TRUE` after they dismiss the welcome modal.

**Option B (timestamp-based):** Check `profiles.created_at` — if created within the last 5 minutes, treat as new. No schema change needed but less reliable.

**Recommendation:** Option A. Clean, explicit, no edge cases.

**Migration:**
```sql
ALTER TABLE public.profiles ADD COLUMN has_onboarded BOOLEAN DEFAULT FALSE;
```

**Files to update:**
- `supabase/migrations/` — new migration file
- `lib/types.ts` — add `has_onboarded` to `Profile` type

**Acceptance criteria:**
- New users have `has_onboarded = false` by default
- After completing onboarding, flag is set to `true`
- Existing users in the DB get `false` (they'll see onboarding once, which is fine)

---

## 3.4 — Welcome Modal / Walkthrough

**Goal:** When a new subscriber (`has_onboarded = false`) first lands on `/calendar`, show a welcome overlay that explains the app.

**New file:** `components/subscriber/WelcomeModal.tsx`

**Trigger:** Check `profile.has_onboarded` in the subscriber layout or CalendarClient. If `false`, render the modal.

**Walkthrough content (3-4 slides):**

**Slide 1: Welcome**
> "Welcome to Lua! Your Pre-K curriculum is ready. Here's a quick tour."

**Slide 2: Calendar**
> "This is your calendar. Tap any day to see that day's activities across 6 developmental domains."

**Slide 3: Daily Flow**
> "Each day covers Sensory, Cognitive, Physical, Social, Cultural, and Parent Bridge activities. Everything is available in English and Portuguese."

**Slide 4: Tools**
> "You can print daily plans, download PDFs, and share activities with parents — all from the day view. Explore the Vault for printable resources."

**Final slide CTA:** "Let's Go!" → dismisses modal, updates `has_onboarded = true` via API call.

**Design:**
- Full-screen overlay with semi-transparent backdrop
- Card-style modal in the center (cream background, rounded-3xl)
- Dot indicators for slide position
- "Next" / "Skip" / "Let's Go!" buttons
- Subtle illustrations or icons for each slide (use Lucide icons, no need for custom art)
- Bilingual — detect from `profile.language_preference`

**Acceptance criteria:**
- Modal appears on first login for new subscribers
- Does NOT appear on subsequent logins
- "Skip" dismisses and marks onboarded
- Works in both EN and PT
- Modal is dismissible (clicking outside or pressing Escape)
- Doesn't block the page if JS fails to load the modal

---

## 3.5 — Login/Signup Page Update

**Goal:** Make the login page feel welcoming to new users, not just returning ones.

**File:** `app/(auth)/login/page.tsx`

**Current copy:** "Welcome back" — assumes returning user.

**New copy:**
- Default state: "Welcome to Lua" (neutral, works for both new and returning)
- Subtext: "Enter your email to sign in or create an account"
- After OTP sent: "Check your email for a sign-in code"
- Below the form: brief value prop — "AI-powered Pre-K curriculum planning, bilingual in English & Portuguese"

**Optional enhancement:** If the user came from the landing page (check `?ref=landing` or similar), show more context. If they came from a `/preview` link, show "Sign up to see the full curriculum."

**Acceptance criteria:**
- Login page copy is welcoming to both new and returning users
- Bilingual labels (EN/PT toggle or auto-detect)
- Brief value prop below the form
- No functional changes to auth flow

---

## 3.6 — Empty State Verification

**Goal:** Verify that Phase 0.7 empty states are sufficient. If the CalendarClient and VaultClient already have warm, helpful empty states, this task is just a review — no new work needed.

**Action:** AG to review current empty states and confirm they match the SME-EDUCATOR.md tone. If adjustments are needed, make them. If they're good, mark as `DONE`.

---

## Implementation Order

1. **3.3 first** (DB migration for `has_onboarded`) — needed before the modal
2. **3.2 second** (middleware update) — needed before the landing page works correctly
3. **3.1 third** (landing page) — the biggest piece, but independent of onboarding modal
4. **3.4 + 3.5 parallel** (welcome modal + login page update) — both depend on 3.3
5. **3.6 last** (review existing empty states)

---

## Testing Checklist

- [ ] Visit `lualearn.com` logged out → see landing page
- [ ] Click "Get Started Free" → go to login
- [ ] Click "See an Example Day" → see public preview
- [ ] Log in as existing user → go to `/calendar` (skip onboarding if already onboarded)
- [ ] Log in as brand new user → see welcome modal
- [ ] Complete welcome walkthrough → `has_onboarded` set to true, modal doesn't reappear
- [ ] Skip welcome walkthrough → same result
- [ ] Visit `lualearn.com` while logged in → redirect to `/calendar`
- [ ] Landing page looks good on mobile (375px)
- [ ] Landing page looks good on desktop (1280px)
- [ ] Share `lualearn.com` on WhatsApp → shows branded OG card
- [ ] Login page copy is welcoming, not "returning user" only
- [ ] All text works in both EN and PT
