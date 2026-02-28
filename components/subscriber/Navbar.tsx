'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sprout, CalendarDays, BookOpen, LogOut, Pencil, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/app/(subscriber)/LanguageContext'
import { cn } from '@/lib/utils'

interface NavbarProps {
  isAdmin?: boolean
}

export function Navbar({ isAdmin }: NavbarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const { lang, setLang } = useLanguage()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/calendar', label: lang === 'en' ? 'Calendar' : 'Calendário', icon: CalendarDays },
    { href: '/vault',    label: lang === 'en' ? 'Resources' : 'Recursos',   icon: BookOpen },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-cream-400 shadow-soft">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/calendar" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-terracotta flex items-center justify-center shadow-soft group-hover:bg-terracotta-600 transition">
            <Sprout className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-lexend font-semibold text-terracotta-900 text-lg tracking-tight">Lua</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium font-inter transition',
                pathname.startsWith(href)
                  ? 'bg-terracotta-50 text-terracotta-700'
                  : 'text-sage-700 hover:bg-cream-200'
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/studio"
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium font-inter transition',
                pathname.startsWith('/studio')
                  ? 'bg-sage-100 text-sage-700'
                  : 'text-sage-600 hover:bg-sage-50'
              )}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
              Studio
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
            aria-label={lang === 'en' ? 'Switch to Portuguese' : 'Switch to English'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-cream-400 text-xs font-medium font-inter text-sage-700 hover:bg-cream-200 transition"
          >
            <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
            {lang === 'en' ? 'PT' : 'EN'}
          </button>

          <button
            onClick={handleSignOut}
            aria-label={lang === 'en' ? 'Sign out' : 'Sair'}
            className="p-2 rounded-2xl text-sage-400 hover:text-dusty-rose-500 hover:bg-dusty-rose-50 transition"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="sm:hidden flex border-t border-cream-300 divide-x divide-cream-300">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-inter transition',
              pathname.startsWith(href)
                ? 'text-terracotta bg-terracotta-50'
                : 'text-sage-500 hover:bg-cream-200'
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/studio"
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-inter transition',
              pathname.startsWith('/studio')
                ? 'text-sage-700 bg-sage-50'
                : 'text-sage-400 hover:bg-sage-50'
            )}
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
            Studio
          </Link>
        )}
      </nav>
    </header>
  )
}
