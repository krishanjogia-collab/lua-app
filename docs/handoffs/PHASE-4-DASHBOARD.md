# Phase 4: Post-Login Dashboard

## Summary
Replace `/calendar` as the post-login landing with a purpose-built `/dashboard` route. The dashboard shows today's plan, this week at a glance, quick actions, and the current month's theme. Calendar remains accessible as a dedicated view from the nav.

## Files to Create

### 1. `app/(subscriber)/dashboard/page.tsx` (Server Component)

Fetch data using existing Supabase patterns (copy from `calendar/page.tsx`):

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { MOCK_PLAN, MOCK_PROFILE } from '@/lib/mock-data'
import type { DailyEntry } from '@/lib/types'

function getWeekEntries(days: DailyEntry[]): DailyEntry[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)

  const monStr = monday.toISOString().split('T')[0]
  const friStr = friday.toISOString().split('T')[0]

  return days.filter(d => d.date >= monStr && d.date <= friStr)
}

function getTodayEntry(days: DailyEntry[]): DailyEntry | null {
  const todayStr = new Date().toISOString().split('T')[0]
  return days.find(d => d.date === todayStr) ?? null
}

export default async function DashboardPage() {
  // --- Mock mode ---
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    const days = MOCK_PLAN.daily_data.days
    return (
      <DashboardClient
        profile={{ is_admin: MOCK_PROFILE.is_admin, active_subscription_month: MOCK_PROFILE.active_subscription_month }}
        plan={MOCK_PLAN}
        todayEntry={getTodayEntry(days)}
        weekEntries={getWeekEntries(days)}
      />
    )
  }

  // --- Real mode ---
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('active_subscription_month, language_preference, is_admin, has_onboarded')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[DashboardPage] Profile fetch error:', profileError)
  }

  if (!profile) redirect('/login')

  if (!profile.has_onboarded) redirect('/onboarding')

  // Fetch plan (same logic as calendar page)
  let plan = null
  if (profile.is_admin) {
    const { data } = await supabase
      .from('curriculum_plans')
      .select('*')
      .order('month_year', { ascending: false })
      .limit(1)
    plan = data?.[0] ?? null
  } else if (profile.active_subscription_month) {
    const { data } = await supabase
      .from('curriculum_plans')
      .select('*')
      .eq('month_year', profile.active_subscription_month)
      .eq('is_published', true)
      .maybeSingle()
    plan = data
  }

  const days = plan?.daily_data?.days ?? []

  return (
    <DashboardClient
      profile={{ is_admin: profile.is_admin, active_subscription_month: profile.active_subscription_month }}
      plan={plan}
      todayEntry={getTodayEntry(days)}
      weekEntries={getWeekEntries(days)}
    />
  )
}
```

### 2. `app/(subscriber)/dashboard/DashboardClient.tsx` (Client Component)

```
'use client'
```

Props:
```ts
interface DashboardClientProps {
  profile: { is_admin: boolean; active_subscription_month: string | null }
  plan: CurriculumPlan | null
  todayEntry: DailyEntry | null
  weekEntries: DailyEntry[]
}
```

#### UI Sections (top to bottom):

**A) Greeting Header**
```
Good morning, Educator!              Friday, March 14
Bom dia, Educador(a)!
```
- Use `useLanguage()` for EN/PT
- Time-of-day greeting: morning (<12), afternoon (<18), evening
- `font-lexend text-2xl text-terracotta-900` for greeting
- `font-inter text-sage-600` for date

**B) Today's Plan Card** (hero)
- White card, `rounded-3xl shadow-soft p-6`
- If `todayEntry`:
  - Theme name as subtitle: `font-lexend text-lg text-terracotta-700`
  - Row of 5 domain icons with labels (use same icons from `DailyFlowCard` / `DOMAIN_META`)
  - "View Today's Plan" button (primary, terracotta) → `/day/[todayEntry.date]`
- If no entry:
  - Sprout icon + "No plan for today. Enjoy your day!" / "Sem plano para hoje. Aproveite!"
  - Sage-toned, relaxed

**C) This Week Strip**
- Section heading: "This Week" / "Esta Semana"
- Horizontal flex row of 5 day cards (Mon-Fri)
- Each card: `w-full sm:w-auto flex-1 rounded-2xl p-3 text-center`
  - Day abbreviation: Mon, Tue, Wed...
  - Date number below
  - States:
    - Today: `bg-terracotta text-white ring-2 ring-terracotta-300`
    - Has entry (past): `bg-sage-100 text-sage-700`
    - Has entry (future): `bg-white border border-cream-400`
    - No entry: `bg-cream-200 text-sage-300`
  - Clickable if has entry → `/day/[date]`

**D) Quick Actions**
- `grid grid-cols-2 lg:grid-cols-4 gap-3`
- Cards with icon + label:
  1. CalendarDays icon → "Calendar" / "Calendario" → `/calendar`
  2. BookOpen icon → "Resources" / "Recursos" → `/vault`
  3. (admin only) Pencil icon → "Studio" → `/studio`
  4. Share2 icon → "Share Plan" / "Compartilhar" → triggers share API or goes to day

**E) Month Theme Banner**
- If `plan`:
  - `bg-gradient-to-r from-cream-100 to-terracotta-50 rounded-3xl p-6`
  - Theme name: `font-lexend text-xl text-espresso`
  - Philosophy badge: `bg-sage-100 text-sage-700 rounded-full px-3 py-1 text-xs`
  - Month label: formatted `month_year`
- If no plan: omit section

**F) Empty State** (when `plan` is null)
- Center-aligned Sprout icon (64px)
- "Your curriculum is being prepared!" / "Seu curriculo esta sendo preparado!"
- Subtle sage text, cream card
- Same pattern as `CalendarClient` empty state

#### Design rules
- All motion: `framer-motion`, `initial={{ opacity: 0, y: 16 }}`, `animate={{ opacity: 1, y: 0 }}`, stagger children by 0.1s
- Mobile-first, responsive breakpoints at `sm:` and `lg:`
- No em-dashes in any copy
- Brand fonts: `font-lexend` headings, `font-inter` body
- DOMAIN_META icons — reuse from `DailyFlowCard.tsx` or define inline:
  - sensory_layout: Sparkles (terracotta)
  - cognitive_literacy: BookOpen (sage)
  - physical_outdoor: Wind (sky)
  - social_emotional: Heart (rose)
  - cultural_global: Globe (amber)
  - parent_bridge: MessageCircle (sage)

## Files to Modify

### 3. `app/(auth)/login/page.tsx`
Line 52: Change `window.location.href = '/calendar'` → `'/dashboard'`

### 4. `app/(subscriber)/onboarding/page.tsx`
Line 55: Change `redirect('/calendar')` → `redirect('/dashboard')`

### 5. `middleware.ts`
Line 17: Change mock mode redirect from `/calendar` to `/dashboard`

### 6. `app/(marketing)/page.tsx`
Change logged-in redirect from `/calendar` to `/dashboard`

### 7. `components/subscriber/Navbar.tsx`
- Add Dashboard as first nav link: `{ href: '/dashboard', label: 'Home' / 'Inicio', icon: Home }`
- Keep Calendar as second link
- Logo `<Link href>` change from `/calendar` to `/dashboard`
- Mobile bottom nav: add Dashboard tab

### 8. `app/(subscriber)/calendar/page.tsx`
Remove the `has_onboarded` check and redirect (it's now handled by dashboard). Keep the auth check and plan fetch.

## Implementation Order
1. Create `dashboard/page.tsx` + `DashboardClient.tsx`
2. Update routing in login, onboarding, middleware, marketing page
3. Update Navbar
4. Clean up calendar page
5. Test in mock mode locally
6. Deploy

## Out of Scope
- Attendance, student management, parent messaging (no data model)
- Gamification / streaks (Phase 5)
- "Lua Cycles" concept (needs definition)
