'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export interface AdminUser {
  id: string
  email: string
  created_at: string
  is_admin: boolean
  active_subscription_month: string | null
}

export async function getAdminUsers(): Promise<{ users: AdminUser[] }> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Forbidden')

  const adminClient = createAdminClient()
  
  // Get all auth users
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    perPage: 1000
  })
  
  if (authError) throw new Error(`Auth fetch failed: ${authError.message}`)

  // Get all profiles
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('*')
    
  if (profilesError) throw new Error(`Profiles fetch failed: ${profilesError.message}`)

  const profilesMap = new Map(profiles.map((p: any) => [p.id, p]))

  const users: AdminUser[] = authData.users.map(u => {
    const p = profilesMap.get(u.id)
    return {
      id: u.id,
      email: u.email || p?.email || '',
      created_at: u.created_at,
      is_admin: p?.is_admin ?? false,
      active_subscription_month: p?.active_subscription_month ?? null,
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return { users }
}
