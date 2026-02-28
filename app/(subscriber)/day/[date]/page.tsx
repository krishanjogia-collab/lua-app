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
    return <DayClient dayEntry={dayEntry} date={dayEntry.date} />
  }

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_subscription_month, language_preference, is_admin')
    .eq('id', user.id)
    .maybeSingle()

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

  return <DayClient dayEntry={dayEntry} date={date} />
}
