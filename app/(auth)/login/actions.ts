'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function sendOtp(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOtp({ email })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function verifyOtp(email: string, token: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  // redirect() throws internally — Next.js catches it and navigates.
  // Cookies were already set by the server client's setAll callback.
  redirect('/calendar')
}
