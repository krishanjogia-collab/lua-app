import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Navbar } from '@/components/subscriber/Navbar'
import { LanguageProvider } from '@/app/(subscriber)/LanguageContext'
import { MOCK_PROFILE } from '@/lib/mock-data'
import type { Language } from '@/lib/types'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let isAdmin: boolean = false
  let initialLang: Language = 'en'

  if (MOCK_MODE) {
    isAdmin = MOCK_PROFILE.is_admin
    initialLang = MOCK_PROFILE.language_preference
  } else {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/login?redirect=admin')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, language_preference')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[AdminLayout] Error fetching profile:', profileError)
      throw new Error(`[AdminLayout] Profile fetch failed: ${profileError.message}`)
    }

    isAdmin = profile?.is_admin ?? false
    initialLang = (profile?.language_preference ?? 'en') as Language

    if (!isAdmin) {
      redirect('/dashboard')
    }
  }

  return (
    <LanguageProvider initial={initialLang}>
      <Navbar isAdmin={isAdmin} />
      <main className="min-h-screen bg-cream">
        {children}
      </main>
    </LanguageProvider>
  )
}
