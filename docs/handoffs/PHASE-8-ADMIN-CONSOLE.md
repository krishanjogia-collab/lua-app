# Phase 8: Admin Console — Handoff Spec

> **Status:** IN PROGRESS (AG implementing)
> **Priority:** HIGH — Luana needs this before launch
> **Depends on:** Phase 3.9.1 (early access dashboard — DONE)

---

## Overview

Give Luana a native admin experience to manage her waitlist, activate subscribers, and communicate — without touching Supabase directly. The admin console lives at `/admin` and is only accessible to users with `is_admin = true`.

---

## What Already Exists

AG has scaffolded the following before this phase's tasks were formally assigned:

### Files in place:
- `app/(admin)/admin/layout.tsx` — Admin layout with auth guard, redirects non-admins to `/dashboard`
- `app/(admin)/admin/page.tsx` — Server component, calls `getAdminUsers()`
- `app/(admin)/admin/AdminDashboardClient.tsx` — Stats widget, user table with search/filter, placeholder buttons
- `app/actions/admin.ts` — `getAdminUsers()` server action using `createAdminClient()` (service role)
- `lib/supabase/server.ts` — `createAdminClient()` function using `SUPABASE_SERVICE_ROLE_KEY`

### What works:
- Admin guard (layout redirects non-admins)
- User list fetched via `auth.admin.listUsers()` joined with `profiles`
- Stats widget (total, waitlist, active, admin counts)
- Search by email + status filter tabs (all/waitlist/active/admin)
- Status badges with icons (ShieldAlert/CheckCircle/Clock)
- Sorted newest first

### What's placeholder / needs wiring:
- "Activate" button on waitlist rows — renders but does nothing
- "Edit" button on active rows — renders but does nothing
- "Broadcast" button in header — placeholder
- "Bulk Activate" button in header — placeholder
- No email sending capability (Resend not yet installed)
- No admin link in Navbar

---

## Critical Discovery: Resend NOT Yet Configured

The AG-QUEUE notes "Resend already configured for OTP" — this is **incorrect**. OTP emails use Supabase Auth's built-in email system. Resend needs to be:

1. Installed: `npm install resend`
2. API key added to `.env.local` and Vercel: `RESEND_API_KEY`
3. Email routes created from scratch

---

## Architecture

### Route Structure
```
app/(admin)/admin/
├── layout.tsx          ← Admin guard + Navbar (EXISTS)
├── page.tsx            ← Dashboard entry (EXISTS)
├── AdminDashboardClient.tsx  ← Main UI (EXISTS, needs wiring)
└── broadcast/          ← Future: broadcast composer page (or modal)
```

### API Routes
```
app/api/admin/
├── activate/route.ts       ← Individual activation (8.3 + 8.4)
├── bulk-activate/route.ts  ← Bulk activation (8.5)
├── broadcast/route.ts      ← Send broadcast emails (8.6)
├── update-role/route.ts    ← Toggle admin role (8.8)
└── update-subscription/route.ts  ← Manual subscription management (8.9)
```

All admin API routes MUST:
1. Verify user is authenticated (`supabase.auth.getUser()`)
2. Verify user is admin (`profile.is_admin`)
3. Use `createAdminClient()` for writes that bypass RLS

### Email Templates
```
lib/email/
├── templates.ts        ← HTML email template functions
└── send.ts             ← Resend wrapper
```

---

## User Flows

### Flow 1: Luana activates a waitlist user
```
Admin Dashboard → sees waitlist user → taps "Activate"
  → confirmation modal: "Activate [email] for [current month]?"
  → POST /api/admin/activate { userId, month }
  → API: updates profile.active_subscription_month = "2026-03"
  → API: sends activation email via Resend
  → UI: optimistic update — row status changes to Active, button disappears
  → User receives: "Your Lua Learn dashboard is ready!" email with login CTA
```

### Flow 2: Luana bulk-activates on launch day
```
Admin Dashboard → taps "Bulk Activate"
  → modal shows: "Activate 47 waitlist users for March 2026?"
  → POST /api/admin/bulk-activate { month }
  → API: loops through all waitlist profiles, sets active_subscription_month
  → API: sends activation email to each via Resend
  → UI: shows progress (e.g., "Activating 12/47..."), then refreshes table
```

### Flow 3: Luana sends a broadcast
```
Admin Dashboard → taps "Broadcast"
  → modal or inline form: audience selector (waitlist / active / all)
  → subject line input + body textarea
  → "Preview" button shows email preview
  → "Send" button → confirmation: "Send to 47 waitlist users?"
  → POST /api/admin/broadcast { audience, subject, body }
  → API: queries profiles for audience, sends individual emails via Resend
  → UI: success toast with send count
```

### Flow 4: Luana manages a user's subscription
```
Admin Dashboard → active user row → taps "Edit"
  → inline or modal: month picker for active_subscription_month
  → can clear it (revoke access) or change month
  → POST /api/admin/update-subscription { userId, month }
```

### Flow 5: Luana toggles admin role
```
Admin Dashboard → user row → role management action
  → confirmation modal: "Make [email] an admin? They will have full Studio access."
  → POST /api/admin/update-role { userId, isAdmin: true/false }
  → Warning for removing own admin: "You cannot remove your own admin access."
```

---

## Email Template Design

### Activation Email
```
Subject: Your Lua Learn dashboard is ready! 🌱

[Lua Learn logo header — terracotta background]

Hi there!

Great news — your Lua Learn account has been activated.

Your expert-crafted Pre-K curriculum is waiting for you.
Log in now to explore this month's daily plans, activities,
and resources designed by an educator with 15+ years of
experience across 3 continents.

[Log In to Lua Learn]  ← terracotta CTA button → lualearn.com/login

Questions? Reach us on Instagram @lua_learn

— The Lua Learn Team
```

### Broadcast Email
```
Subject: [Custom subject from Luana]

[Lua Learn logo header — terracotta background]

[Custom body from Luana — plain text, no rich formatting needed]

[Optional CTA button if body contains a link]

— Luana, Lua Learn

Follow us on Instagram @lua_learn
```

### Template Constants
- Header background: Terracotta #D27A65
- CTA button: Terracotta #D27A65, white text, rounded corners
- Body font: system-ui, -apple-system, sans-serif (email-safe)
- Footer: sage gray text, Instagram link

---

## Navbar Integration

The Navbar (`components/subscriber/Navbar.tsx`) needs an admin link:
- Only visible when `isAdmin === true`
- Desktop: after Studio link
- Mobile: additional tab in bottom nav
- Icon: `ShieldAlert` or `Users` from lucide-react
- Label: "Admin"
- Active state: `pathname.startsWith('/admin')`
- Style: same sage color scheme as Studio link

---

## Data Model

### AdminUser interface (EXISTS in `app/actions/admin.ts`)
```typescript
interface AdminUser {
  id: string
  email: string
  created_at: string
  is_admin: boolean
  active_subscription_month: string | null
}
```

No schema changes needed — all fields already exist in `profiles`.

---

## Edge Cases

1. **Self-demotion:** Luana should NOT be able to remove her own admin role. API must check `userId !== currentUser.id` for role changes.
2. **Re-activation:** If a user was previously active (has `active_subscription_month` set to an old month), "Activate" should update to the current month.
3. **Email failures:** If Resend fails for one user during bulk activate, continue with remaining users. Log failures. Show partial success: "Activated 45/47. 2 email failures."
4. **Rate limits:** Resend free tier allows 100 emails/day, 3000/month. Bulk activate of 50+ users may need batching or rate awareness.
5. **Empty waitlist:** "Bulk Activate" should be disabled or show "No waitlist users to activate" when waitlist count is 0.
6. **Duplicate activation:** If Luana taps "Activate" on an already-active user (race condition), the API should be idempotent — just update the month, don't error.

---

## Acceptance Criteria

- [ ] Admin-only access enforced at layout AND API levels
- [ ] Navbar shows "Admin" link for admin users (desktop + mobile)
- [ ] Waitlist dashboard loads all users with correct status badges
- [ ] Search filters by email, status tabs filter correctly
- [ ] Individual activate: sets `active_subscription_month`, sends email, updates UI
- [ ] Bulk activate: activates all waitlist users, sends emails, shows progress
- [ ] Broadcast: compose subject + body, select audience, preview, send
- [ ] Role toggle: confirmation modal, self-demotion prevented
- [ ] Subscription management: update/clear month for any user
- [ ] All emails use branded Lua Learn template
- [ ] Mobile-friendly — all actions work on phone screens
- [ ] `npm run build` compiles cleanly

---

## Dependencies

- `resend` npm package (needs to be installed)
- `RESEND_API_KEY` env var (needs to be set in .env.local + Vercel)
- Resend account — Krish needs to sign up at resend.com and verify the `lualearn.com` domain (or use their test domain initially)
