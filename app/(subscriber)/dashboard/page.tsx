import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { MOCK_PLAN, MOCK_PROFILE } from '@/lib/mock-data'
import type { DailyEntry } from '@/lib/types'

function getWeekEntries(days: DailyEntry[]): DailyEntry[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  // Shift to monday as start of week (1=Mon, ..., 7=Sun relative to monday)
  // Get monday date
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  
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
        plan={MOCK_PLAN as any}
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

  const isEarlyAccess = !profile.is_admin && !profile.active_subscription_month
  if (!profile.has_onboarded && !isEarlyAccess) redirect('/onboarding')

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
      plan={plan as any}
      todayEntry={getTodayEntry(days)}
      weekEntries={getWeekEntries(days)}
    />
  )
}
