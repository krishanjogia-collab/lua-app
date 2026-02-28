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
  description: 'AI-powered Pre-K curriculum platform for early childhood educators. Thematic, bilingual, and developmentally designed.',
  keywords:    ['pre-k', 'early childhood', 'curriculum', 'montessori', 'reggio', 'AI'],
  icons: {
    icon: '/favicon.svg',
  },
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
