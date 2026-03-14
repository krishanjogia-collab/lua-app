'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleDomainCompletion(
  planId: string,
  date: string,
  domainKey: string,
  isCompleted: boolean
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Fetch existing completion record for this date
  const { data: existing } = await supabase
    .from('completions')
    .select('id, domains_completed')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle()

  const currentDomains = existing?.domains_completed || {}
  
  // 2. Toggle the specific domain key
  if (isCompleted) {
    currentDomains[domainKey] = true
  } else {
    delete currentDomains[domainKey]
  }

  // 3. Upsert the record
  if (existing) {
    // If no domains remain, we can optionally delete the record, or just save the empty JSON
    const { error } = await supabase
      .from('completions')
      .update({ domains_completed: currentDomains, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      
    if (error) throw new Error(`Gamification update failed: ${error.message}`)
  } else {
    // Creating new record for today
    const { error } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        date: date,
        domains_completed: currentDomains
      })
      
    if (error) throw new Error(`Gamification insert failed: ${error.message}`)
  }

  // Revalidate the calendar and day views so UI is fresh
  revalidatePath('/calendar')
  revalidatePath(`/day/${date}`)
  
  return { success: true, domains_completed: currentDomains }
}
