'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { EmailOtpType } from '@supabase/supabase-js'
import { Loader2, Sprout } from 'lucide-react'

async function persistSessionServerSide(access_token: string, refresh_token: string) {
  await fetch('/api/auth/set-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token, refresh_token }),
  })
}

export default function AuthProcessingPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function handleAuth() {
      const code = searchParams.get('code')
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type') as EmailOtpType | null

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.session) {
          await persistSessionServerSide(data.session.access_token, data.session.refresh_token)
          window.location.href = '/calendar'
          return
        }
      }

      if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (!error && data.session) {
          await persistSessionServerSide(data.session.access_token, data.session.refresh_token)
          window.location.href = '/calendar'
          return
        }
      }

      // Hash-based implicit flow — SDK processes tokens automatically
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await persistSessionServerSide(session.access_token, session.refresh_token)
        window.location.href = '/calendar'
        return
      }

      setError('Sign-in failed. Please try again.')
      setTimeout(() => { window.location.href = '/login' }, 2000)
    }

    handleAuth()
  }, [searchParams])

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <p className="text-sage-600 font-inter text-sm">{error}</p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-terracotta shadow-soft">
              <Sprout className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2 text-sage-500 font-inter text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing you in…
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
