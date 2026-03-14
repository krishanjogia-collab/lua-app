import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Short-circuit auth callback BEFORE initialising Supabase client ──
  // This preserves the PKCE code-verifier cookie untouched for the handler.
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // ── Mock mode: bypass all auth checks for local preview ──
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/calendar'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add any logic between createServerClient and getUser()
  const { data: { user } } = await supabase.auth.getUser()

  // Helper: create a redirect that preserves any cookies Supabase set during getUser()
  function redirectWithCookies(destination: string) {
    const url = request.nextUrl.clone()
    url.pathname = destination
    const redirectResponse = NextResponse.redirect(url)
    // Copy all cookies from supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    })
    return redirectResponse
  }

  // Public routes — no auth required (Landing page '/' is handled separately below)
  const publicRoutes = ['/login', '/auth/processing', '/api/auth', '/preview', '/api/og', '/api/share-card']
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    return supabaseResponse
  }

  // Handle Landing Page explicitly
  if (pathname === '/') {
    if (user) {
      return redirectWithCookies('/calendar')
    } else {
      return supabaseResponse
    }
  }

  // Unauthenticated visitors trying to access the app → redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    })
    return redirectResponse
  }

  // Studio routes → admin only
  if (pathname.startsWith('/studio')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return redirectWithCookies('/calendar')
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
