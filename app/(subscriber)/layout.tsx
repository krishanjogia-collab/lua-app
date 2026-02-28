import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/subscriber/Navbar'
import { LanguageProvider } from './LanguageContext'
import { MOCK_PROFILE } from '@/lib/mock-data'
import type { Language } from '@/lib/types'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function SubscriberLayout({ children }: { children: React.ReactNode }) {
  let isAdmin:     boolean  = false
  let initialLang: Language = 'en'

  if (MOCK_MODE) {
    isAdmin     = MOCK_PROFILE.is_admin
    initialLang = MOCK_PROFILE.language_preference
  } else {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, language_preference')
      .eq('id', user.id)
      .maybeSingle()

    isAdmin     = profile?.is_admin ?? false
    initialLang = (profile?.language_preference ?? 'en') as Language
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
