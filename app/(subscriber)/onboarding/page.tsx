import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OnboardingClient from '@/app/(subscriber)/onboarding/OnboardingClient'
import type { Profile } from '@/lib/types'
import { MOCK_PROFILE } from '@/lib/mock-data'

export default async function OnboardingPage() {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    // If mock mode is on and you artificially haven't onboarded yet
    return <OnboardingClient userId={MOCK_PROFILE.id} />
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component edge case skip
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ensure they actually need onboarding
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('has_onboarded')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[OnboardingPage] Error fetching profile:', profileError)
    throw new Error(`[OnboardingPage] Profile fetch failed: ${profileError.message}`)
  }

  if (profile?.has_onboarded) {
    redirect('/calendar')
  }

  return <OnboardingClient userId={user.id} />
}
