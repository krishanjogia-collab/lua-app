import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReviewClient } from './ReviewClient'
import { MOCK_PLAN } from '@/lib/mock-data'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

interface Props {
  params: { planId: string }
}

export default async function ReviewPage({ params }: Props) {
  if (MOCK_MODE) {
    return <ReviewClient plan={MOCK_PLAN} />
  }

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin) redirect('/calendar')

  const { data: plan } = await supabase
    .from('curriculum_plans')
    .select('*')
    .eq('id', params.planId)
    .maybeSingle()

  if (!plan) notFound()

  return <ReviewClient plan={plan} />
}
