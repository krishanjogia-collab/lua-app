import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DayClient } from './DayClient'
import { MOCK_PLAN } from '@/lib/mock-data'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

interface Props {
  params: { date: string }
}

export default async function DayPage({ params }: Props) {
  const { date } = params

  if (MOCK_MODE) {
    const dayEntry =
      MOCK_PLAN.daily_data.days.find(d => d.date === date) ??
      MOCK_PLAN.daily_data.days[0]
    if (!dayEntry) notFound()
    return <DayClient plan={{ id: MOCK_PLAN.id, theme_name: MOCK_PLAN.theme_name }} dayEntry={dayEntry} date={dayEntry.date} completedDomains={[]} />
  }

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('active_subscription_month, language_preference, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[DayPage] Error fetching profile:', profileError)
    throw new Error(`[DayPage] Profile fetch failed: ${profileError.message}`)
  }

  if (!profile) redirect('/login')

  // Derive the month_year from the date param
  const monthYear = date.substring(0, 7)

  // Fetch the plan — admin sees any, subscriber sees published + subscribed month
  const query = supabase
    .from('curriculum_plans')
    .select('*')
    .eq('month_year', monthYear)

  if (!profile.is_admin) {
    query.eq('is_published', true)
    if (profile.active_subscription_month !== monthYear) {
      notFound()
    }
  }

  const { data: plan } = await query.maybeSingle()
  if (!plan) notFound()

  // Find the day entry
  const dayEntry = plan.daily_data?.days?.find((d: { date: string }) => d.date === date)
  if (!dayEntry) notFound()

  // Fetch completion state for this user/date
  const { data: completion } = await supabase
    .from('completions')
    .select('domains_completed')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle()
    
  // Convert JSONB object keys where value is true into an array
  const completedDomains = completion?.domains_completed 
    ? Object.keys(completion.domains_completed).filter(k => completion.domains_completed[k] === true)
    : []

  return <DayClient plan={{ id: plan.id, theme_name: plan.theme_name }} dayEntry={dayEntry} date={date} completedDomains={completedDomains} />
}
