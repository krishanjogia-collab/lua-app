import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarClient } from './CalendarClient'
import { MOCK_PLAN, MOCK_PROFILE } from '@/lib/mock-data'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { month: requestedMonth } = await searchParams

  if (MOCK_MODE) {
    return (
      <CalendarClient
        userId="mock-user-id"
        plan={MOCK_PLAN}
        profile={{ active_subscription_month: MOCK_PROFILE.active_subscription_month, is_admin: MOCK_PROFILE.is_admin }}
        availableMonths={[MOCK_PLAN.month_year]}
      />
    )
  }

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('active_subscription_month, language_preference, is_admin, has_onboarded')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[CalendarPage] Error fetching profile:', profileError)
    throw new Error(`[CalendarPage] Profile fetch failed: ${profileError.message}`)
  }

  if (!profile) redirect('/login')

  let plan = null
  let availableMonths: string[] = []

  if (profile.is_admin) {
    // Get all published plan months for navigation
    const { data: allPlans } = await supabase
      .from('curriculum_plans')
      .select('month_year')
      .order('month_year', { ascending: false })

    availableMonths = (allPlans ?? []).map(p => p.month_year)

    // Load requested month or most recent
    const targetMonth = requestedMonth && availableMonths.includes(requestedMonth)
      ? requestedMonth
      : availableMonths[0] ?? null

    if (targetMonth) {
      const { data } = await supabase
        .from('curriculum_plans')
        .select('*')
        .eq('month_year', targetMonth)
        .maybeSingle()
      plan = data
    }
  } else if (profile.active_subscription_month) {
    const { data } = await supabase
      .from('curriculum_plans')
      .select('*')
      .eq('month_year', profile.active_subscription_month)
      .eq('is_published', true)
      .maybeSingle()
    plan = data
    if (plan) availableMonths = [plan.month_year]
  }

  let completions: any[] = []
  if (plan) {
    const { data } = await supabase
      .from('completions')
      .select('*')
      .eq('user_id', user.id)
    completions = data || []
  }

  return (
    <div className="min-h-screen bg-[#FDF8E2]">
      <div className="pb-24 lg:pb-8">
        <CalendarClient
          userId={user.id}
          plan={plan}
          profile={profile}
          completions={completions}
          availableMonths={availableMonths}
        />
      </div>
    </div>
  )
}
