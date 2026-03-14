# Phase 3.9.1: Early Access Dashboard State

## Summary
When a non-admin user signs up and has no `active_subscription_month`, the dashboard should show a warm early access confirmation instead of the normal plan-based dashboard. This is the experience for people signing up from Instagram (@lua_learn). Supabase `auth.users` serves as the waitlist — no extra infrastructure needed.

## Context
- Instagram is live at @lua_learn with a link to lualearn.com
- New users can sign up via OTP email login
- After signing up, non-admin users with no plan currently see a mostly empty dashboard
- We need to make this feel intentional: "You're in! We're building something special."

## Files to Modify

### 1. `app/(subscriber)/dashboard/DashboardClient.tsx`

Add an early access branch at the top of the component render. The condition is:

```
!profile.is_admin && !profile.active_subscription_month
```

When this is true, render the early access state INSTEAD of the normal dashboard (greeting, today's plan, week strip, quick actions, month theme).

#### Early Access UI Spec

Centered layout, max-w-md, matching the login page's visual style.

```tsx
// Inside DashboardClient, before the normal dashboard return:
if (!profile.is_admin && !profile.active_subscription_month) {
  return (
    <motion.div
      className="max-w-md mx-auto px-4 py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Sprout icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-terracotta shadow-soft mb-6">
        <Sprout className="w-8 h-8 text-white" strokeWidth={1.5} />
      </div>

      <h1 className="font-lexend text-2xl font-semibold text-terracotta-900 mb-3">
        {lang === 'en' ? "You're on the list!" : 'Você está na lista!'}
      </h1>

      <p className="text-sage-600 font-inter text-sm leading-relaxed mb-8">
        {lang === 'en'
          ? "Lua Learn is launching soon with classroom-ready Pre-K curriculum designed by educators with 15+ years of experience across 3 continents. We'll let you know when your dashboard is ready."
          : 'O Lua Learn está chegando com currículo de Educação Infantil pronto para a sala de aula, criado por educadores com mais de 15 anos de experiência em 3 continentes. Avisaremos quando seu painel estiver pronto.'}
      </p>

      {/* Instagram CTA */}
      <a
        href="https://instagram.com/lua_learn"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-2xl font-lexend font-medium transition shadow-sm mb-4"
      >
        {lang === 'en' ? 'Follow @lua_learn' : 'Siga @lua_learn'}
      </a>

      <div>
        <button
          onClick={handleSignOut}
          className="text-sm text-sage-400 hover:text-terracotta-500 font-inter underline transition"
        >
          {lang === 'en' ? 'Sign out' : 'Sair'}
        </button>
      </div>
    </motion.div>
  )
}
```

#### Changes needed in DashboardClient:
1. Import `Sprout` from `lucide-react` (already imported? check — if not, add it)
2. Add a `handleSignOut` function (same as Navbar pattern):
   ```tsx
   const router = useRouter()
   const supabase = createClient()

   async function handleSignOut() {
     await supabase.auth.signOut()
     router.push('/login')
   }
   ```
3. Import `useRouter` from `next/navigation` and `createClient` from `@/lib/supabase/client`
4. Add the early return block before the existing `return` statement

### 2. `app/(subscriber)/dashboard/page.tsx` (Server Component) — BUG FIX

**Problem:** Line 60 has `if (!profile.has_onboarded) redirect('/onboarding')`. New signups don't have `has_onboarded = true`, so they get redirected to `/onboarding` before `DashboardClient` ever renders the early access screen.

**Fix:** Early access users must skip the onboarding redirect. Change line 60 from:

```tsx
if (!profile.has_onboarded) redirect('/onboarding')
```

to:

```tsx
// Early access users (no subscription, not admin) skip onboarding — show waitlist screen
const isEarlyAccess = !profile.is_admin && !profile.active_subscription_month
if (!profile.has_onboarded && !isEarlyAccess) redirect('/onboarding')
```

This ensures the onboarding redirect still works for users who DO have a subscription but haven't onboarded, while letting early access users through to the dashboard.

## Design Notes
- Use the same Sprout-in-rounded-square motif from the login page
- Cream background inherited from parent layout
- No navbar links to Calendar/Resources/etc. — those pages would be empty anyway. The Navbar still renders (it's in the layout), which is fine — the nav links won't show anything useful but that's acceptable for now.
- The sign-out button is important so users aren't trapped

## What NOT to do
- Do NOT create a separate waitlist table or API
- Do NOT add email collection — Supabase already has their email from signup
- Do NOT use "AI-powered" language — use "designed by educators" framing
- Do NOT add any onboarding redirect for these users — they go straight to dashboard
- Do NOT modify the Navbar or layout — only DashboardClient changes

## Testing
1. Create a test user (non-admin, no `active_subscription_month`)
2. Login → should see early access state
3. Admin user → should see normal dashboard
4. User with `active_subscription_month` → should see normal dashboard
