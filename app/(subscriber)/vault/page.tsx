import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VaultClient } from './VaultClient'
import { MOCK_ASSETS } from '@/lib/mock-data'
import type { Asset } from '@/lib/types'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function VaultPage() {
  if (MOCK_MODE) {
    return <VaultClient assets={MOCK_ASSETS} />
  }

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_subscription_month, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/login')

  let assets: Asset[] = []

  if (profile.is_admin) {
    // Admins see all assets
    const { data } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })
    assets = (data as Asset[]) ?? []
  } else if (profile.active_subscription_month) {
    // Subscribers see assets linked to their subscribed plan
    const { data: plan } = await supabase
      .from('curriculum_plans')
      .select('id')
      .eq('month_year', profile.active_subscription_month)
      .eq('is_published', true)
      .maybeSingle()

    if (plan) {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('plan_id', plan.id)
        .order('asset_type')
      assets = (data as Asset[]) ?? []
    }
  }

  return <VaultClient assets={assets} />
}
