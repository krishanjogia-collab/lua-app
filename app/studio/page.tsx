import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudioClient } from './StudioClient'
import { MOCK_PLANS } from '@/lib/mock-data'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function StudioPage() {
  if (MOCK_MODE) {
    return <StudioClient plans={MOCK_PLANS} />
  }

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profileError) console.error('[StudioPage] Profile query error:', profileError.message)

  if (!profile?.is_admin) redirect('/calendar')

  const { data: plans, error: plansError } = await supabase
    .from('curriculum_plans')
    .select('id, month_year, theme_name, is_published, created_at')
    .order('month_year', { ascending: false })

  if (plansError) console.error('[StudioPage] Plans query error:', plansError.message)

  return <StudioClient plans={plans ?? []} />
}
