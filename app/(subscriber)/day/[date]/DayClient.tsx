'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { DailyFlowCard } from '@/components/subscriber/DailyFlowCard'
import { ParentBridgeSnippet } from '@/components/subscriber/ParentBridgeSnippet'
import { useLanguage } from '@/app/(subscriber)/LanguageContext'
import { formatDate } from '@/lib/utils'
import type { DailyEntry, DayDomains } from '@/lib/types'

const DOMAIN_ORDER: (keyof DayDomains)[] = [
  'sensory_layout',
  'cognitive_literacy',
  'physical_outdoor',
  'social_emotional',
  'cultural_global',
]

interface DayClientProps {
  dayEntry: DailyEntry
  date:     string
}

export function DayClient({ dayEntry, date }: DayClientProps) {
  const { lang } = useLanguage()

  const dateLabel = formatDate(date, lang)
  const domains = dayEntry.domains || {}

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/calendar"
        className="inline-flex items-center gap-1.5 text-sm text-sage-600 hover:text-terracotta-600 font-inter mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        {lang === 'en' ? 'Back to Calendar' : 'Voltar ao Calendário'}
      </Link>

      {/* Day header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs text-sage-400 font-inter uppercase tracking-widest mb-1">
          {lang === 'en' ? "Today's Curriculum" : 'Currículo de Hoje'}
        </p>
        <h1 className="font-lexend text-2xl font-semibold text-terracotta-900 leading-tight">
          {dateLabel}
        </h1>
        <p className="text-sm text-sage-500 font-inter mt-1">
          {lang === 'en' ? `Day ${dayEntry.day_number}` : `Dia ${dayEntry.day_number}`}
        </p>
      </motion.div>

      {/* Domain cards — "Daily Flow Feed" */}
      <div className="space-y-4 mb-6">
        {DOMAIN_ORDER.map((key, i) => {
          const domain = domains[key]
          if (!domain) return null
          return (
            <DailyFlowCard
              key={key}
              domainKey={key}
              domain={domain}
              lang={lang}
              index={i}
            />
          )
        })}
      </div>

      {/* Parent Bridge — separated at bottom */}
      <ParentBridgeSnippet
        domain={domains.parent_bridge}
        lang={lang}
        date={date}
      />
    </div>
  )
}
