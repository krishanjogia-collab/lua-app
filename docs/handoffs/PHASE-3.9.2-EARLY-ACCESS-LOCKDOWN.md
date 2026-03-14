# Phase 3.9.2: Early Access Route Lockdown + Onboarding Generation Fix

## Summary
Two bugs discovered in live testing:
1. Early access users can navigate to Calendar, Resources, etc. via the navbar — they should be locked to `/dashboard`
2. Onboarding generation silently fails due to a parameter name mismatch — curriculum never gets created

## Bug 1: Early Access Users Can Browse the Whole App

### Problem
The early access check only exists in `DashboardClient.tsx`. Users can click Calendar, Resources, etc. in the navbar and reach those pages (which show empty/confusing states).

### Fix: `app/(subscriber)/layout.tsx`

After fetching the profile, check if the user is early access. If so, and they're NOT on `/dashboard`, redirect them there. This locks them to the waitlist screen.

Add these imports at the top:
```tsx
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
```

(`redirect` is already imported. `headers` is new.)

After the profile fetch (after line 34), add:

```tsx
// Lock early access users to /dashboard only
const isEarlyAccess = !isAdmin && !profile?.active_subscription_month
if (isEarlyAccess) {
  const headersList = await headers()
  const pathname = headersList.get('x-next-pathname') || ''
  // Allow /dashboard, redirect everything else
  if (pathname && !pathname.startsWith('/dashboard')) {
    redirect('/dashboard')
  }
}
```

**Wait — `x-next-pathname` may not be available.** A simpler approach: fetch `active_subscription_month` in the layout query and pass `isEarlyAccess` to a wrapper that handles the redirect client-side. But the cleanest server-side approach is:

**Alternative (recommended):** Update the layout's profile query to also select `active_subscription_month`, then conditionally hide the Navbar for early access users and only render the dashboard content:

Change the profile select on line 24 from:
```tsx
.select('is_admin, language_preference')
```
to:
```tsx
.select('is_admin, language_preference, active_subscription_month')
```

Then after line 34, add:
```tsx
const isEarlyAccess = !isAdmin && !profile?.active_subscription_month
```

Then change the return JSX to conditionally hide the Navbar:
```tsx
return (
  <LanguageProvider initial={initialLang}>
    {!isEarlyAccess && <Navbar isAdmin={isAdmin} />}
    <main className="min-h-screen bg-cream">
      {children}
    </main>
  </LanguageProvider>
)
```

This hides the nav entirely for early access users so they can't navigate away. The dashboard's early access screen already has its own sign-out button.

**Also:** Add redirect guards to the individual page server components (`calendar/page.tsx`, `vault/page.tsx`, any other subscriber pages) so that direct URL access is also blocked:

In each subscriber page's server component, after fetching the profile, add:
```tsx
const isEarlyAccess = !profile.is_admin && !profile.active_subscription_month
if (isEarlyAccess) redirect('/dashboard')
```

This provides defense in depth — navbar hidden + server redirect.

## Bug 2: Onboarding Generation Silently Fails

### Problem
`OnboardingClient.tsx` line 65 sends `month_year` (snake_case):
```tsx
body: JSON.stringify({
  month_year: new Date().toISOString().slice(0, 7)
})
```

But `app/api/generate-curriculum/route.ts` line 28 expects `monthYear` (camelCase):
```tsx
const { theme, monthYear, philosophy } = body
```

Result: `monthYear` is `undefined`, validation fails on line 34, API returns 400 "Missing required fields". The catch block on line 68-70 swallows the error, and after 4 seconds the user is redirected to `/calendar` with no plan.

### Fix: `app/(subscriber)/onboarding/OnboardingClient.tsx`

Change line 65 from:
```tsx
month_year: new Date().toISOString().slice(0, 7)
```
to:
```tsx
monthYear: new Date().toISOString().slice(0, 7)
```

### Additional fix: redirect to `/dashboard` not `/calendar`

On line 74, change:
```tsx
router.push('/calendar')
```
to:
```tsx
router.push('/dashboard')
```

Dashboard is the post-login landing page now (since Phase 3.9).

### Additional fix: don't swallow errors silently

The try/catch on lines 54-70 catches errors and ignores them ("progressing to calendar anyway"). At minimum, show the user something went wrong. Change lines 68-70:

```tsx
} catch (e) {
  console.error('[Onboarding] Curriculum generation failed:', e)
  // Don't silently continue — user should know
}
```

And wrap the setTimeout in a check — if generation failed, still redirect but to dashboard (which will show the "being crafted" state since no plan exists yet).

## Testing
1. Sign up with a new email → should see early access screen, NO navbar
2. Try navigating directly to `/calendar` via URL → should redirect to `/dashboard`
3. Admin login → should see full navbar and normal dashboard
4. Go through onboarding flow as admin/subscriber → generation should actually trigger and create a plan
