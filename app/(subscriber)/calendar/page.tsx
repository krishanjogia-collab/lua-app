import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarClient } from './CalendarClient'
import { MOCK_PLAN, MOCK_PROFILE } from '@/lib/mock-data'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function CalendarPage() {
  if (MOCK_MODE) {
    return (
      <CalendarClient
        userId="mock-user-id"
        plan={MOCK_PLAN}
        profile={{ active_subscription_month: MOCK_PROFILE.active_subscription_month, is_admin: MOCK_PROFILE.is_admin }}
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
  if (profile.is_admin) {
    const { data } = await supabase
      .from('curriculum_plans')
      .select('*')
      .order('month_year', { ascending: false })
      .limit(1)
      .maybeSingle()
    plan = data
  } else if (profile.active_subscription_month) {
    const { data } = await supabase
      .from('curriculum_plans')
      .select('*')
      .eq('month_year', profile.active_subscription_month)
      .eq('is_published', true)
      .maybeSingle()
    plan = data
  }

  if (!profile.has_onboarded) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#FDF8E2]">
      <div className="pb-24 lg:pb-8">
        <CalendarClient 
          userId={user.id}
          plan={plan} 
          profile={profile}
        />
      </div>
    </div>
  )
}
