'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Language } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface LanguageContextValue {
  lang:    Language
  setLang: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang:    'en',
  setLang: () => {},
})

export function LanguageProvider({ children, initial }: { children: ReactNode; initial: Language }) {
  const [lang, setLangState] = useState<Language>(initial)
  const supabase = createClient()

  async function setLang(newLang: Language) {
    setLangState(newLang)
    // Persist preference to profile
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ language_preference: newLang })
          .eq('id', user.id)
      }
    } catch (err) {
      console.error('Failed to persist language preference:', err)
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
