import type { Metadata } from 'next'
import { Lexend, Inter } from 'next/font/google'
import './globals.css'

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-lexend',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'Lua — Pre-K Curriculum Engine',
    template: '%s | Lua',
  },
  description: 'AI-powered, bilingual Pre-K curriculum planning. Daily activities covering all developmental domains.',
  keywords:    ['pre-k', 'early childhood', 'curriculum', 'montessori', 'reggio', 'AI'],
  openGraph: {
    title: 'Lua — Pre-K Curriculum Engine',
    description: 'AI-powered, bilingual Pre-K curriculum planning. Daily activities covering all developmental domains.',
    type: 'website',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lua — Pre-K Curriculum Engine',
    description: 'AI-powered, bilingual Pre-K curriculum planning.',
    images: ['/og-default.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.variable} ${inter.variable} min-h-screen bg-cream antialiased`}>
        {children}
      </body>
    </html>
  )
}
