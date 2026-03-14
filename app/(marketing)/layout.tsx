import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lua — AI-Powered Pre-K Curriculum',
  description: 'Plan a full month of play-based, bilingual Pre-K activities in minutes. Covers all 6 developmental domains every single day.',
  openGraph: {
    title: 'Lua — AI-Powered Pre-K Curriculum',
    description: 'Plan a full month of play-based, bilingual Pre-K activities in minutes.',
    url: 'https://lualearn.com',
    siteName: 'Lua',
    images: [{ url: 'https://lualearn.com/og-default.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Lua Curriculum' },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-textMain selection:bg-terracotta-200">
      {/* Global Marketing Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-lexend text-2xl font-bold text-terracottaDark tracking-tight">Lua</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium font-inter text-sage-600 hover:text-sage-900 transition">
              Log in
            </a>
            <a href="/login" className="bg-terracotta text-white px-4 py-2 rounded-full text-sm font-medium font-inter hover:bg-terracotta-600 transition shadow-soft hover:shadow-soft-lg">
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {children}
      </main>

      {/* Global Marketing Footer */}
      <footer className="bg-white border-t border-cream-200 py-12 mt-20 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <span className="font-lexend text-xl font-bold text-terracottaDark flex items-center gap-2 mb-2">
              🌙 Lua
            </span>
            <p className="text-sm text-sage-600 font-inter">AI-powered Pre-K curriculum planning.</p>
          </div>
          <div className="flex flex-col md:items-end text-sm text-sage-500 font-inter gap-2">
             <p>© {new Date().getFullYear()} Lua Learn. All rights reserved.</p>
             <a href="https://instagram.com/lua_learn" target="_blank" rel="noreferrer" className="text-terracotta hover:underline">
               Follow us @lua_learn
             </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
