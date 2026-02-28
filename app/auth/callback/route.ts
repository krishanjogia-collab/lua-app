export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/calendar'

  if (code || (token_hash && type)) {
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash })
      if (!error) return response
      console.error('[auth/callback] verifyOtp failed:', error.message)
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return response
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
