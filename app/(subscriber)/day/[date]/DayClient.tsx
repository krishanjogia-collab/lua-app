'use client'

import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { motion } from 'framer-motion'
import { DailyFlowCard } from '@/components/subscriber/DailyFlowCard'
import { ParentBridgeSnippet } from '@/components/subscriber/ParentBridgeSnippet'
import { ShareButton } from '@/components/ui/ShareButton'
import { DownloadPDFButton } from '@/components/ui/DownloadPDFButton'
import { DownloadCardsButton } from '@/components/ui/DownloadCardsButton'
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
  plan:             { id: string; theme_name: string }
  dayEntry:         DailyEntry
  date:             string
  completedDomains: string[]
}

export function DayClient({ plan, dayEntry, date, completedDomains }: DayClientProps) {
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
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <p className="text-xs text-sage-400 font-inter uppercase tracking-widest mb-1">
            {lang === 'en' ? "Today's Curriculum" : 'Currículo de Hoje'}
          </p>
          <h1 className="font-lexend text-2xl font-semibold text-terracotta-900 leading-tight">
            {dateLabel}
          </h1>
          <p className="text-sm text-sage-500 font-inter mt-1">
            {lang === 'en' ? `Day ${dayEntry.day_number}` : `Dia ${dayEntry.day_number}`}
          </p>
        </div>
        <div className="pt-2 flex flex-col items-end gap-2" data-hide-print>
          <div className="flex items-center gap-2">
            <DownloadCardsButton
              dayEntry={dayEntry}
              lang={lang}
              filename={`lua-activity-cards-${date}.pdf`}
            />
            <DownloadPDFButton
              plan={plan}
              dayEntry={dayEntry}
              dateLabel={dateLabel}
              lang={lang}
              filename={`lua-${plan.theme_name.toLowerCase().replace(/\s+/g, '-')}-${date}.pdf`}
            />
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-2xl border border-sage-200 text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition flex items-center gap-2 text-sm font-medium font-lexend"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Print' : 'Imprimir'}</span>
            </button>
            <ShareButton
              title={lang === 'en' ? `Lua Learn | ${dateLabel}` : `Currículo Lua Learn | ${dateLabel}`}
              text={lang === 'en' ? "Check out today's Pre-K activities!" : "Confira as atividades da Educação Infantil de hoje!"}
              url={typeof window !== 'undefined' ? `${window.location.origin}/preview/day/PLACEHOLDER/${date}` : ''}
              lang={lang}
              variant="secondary"
            />
          </div>
          <a 
            href={`/api/share-card/day?planId=PLACEHOLDER&date=${date}`} 
            download={`lua-story-${date}.png`}
            className="text-xs font-inter text-sage-500 hover:text-terracotta-600 transition underline decoration-sage-300 underline-offset-4"
          >
            {lang === 'en' ? 'Download for Stories' : 'Baixar para Stories'}
          </a>
        </div>
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
              planId={plan.id}
              date={date}
              initialCompleted={completedDomains.includes(key)}
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
