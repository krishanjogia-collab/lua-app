'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { ParentBridgeSnippet } from '@/components/subscriber/ParentBridgeSnippet'
import { formatDate } from '@/lib/utils'
import { getActivityDescription, type DailyEntry } from '@/lib/types'

interface PreviewClientProps {
  plan: {
    id: string
    theme_name: string
  }
  dayEntry: DailyEntry
  date: string
  lang: 'en' | 'pt'
}

const DOMAIN_ICONS: Record<string, { icon: string; en: string; pt: string }> = {
  sensory_layout: { icon: '🎨', en: 'Sensory', pt: 'Sensorial' },
  cognitive_literacy: { icon: '📖', en: 'Cognitive', pt: 'Cognitivo' },
  physical_outdoor: { icon: '🏃', en: 'Physical', pt: 'Físico' },
  social_emotional: { icon: '🤝', en: 'Social', pt: 'Social' },
  cultural_global: { icon: '🌍', en: 'Cultural', pt: 'Cultural' },
  parent_bridge: { icon: '👨‍👩‍👧', en: 'Parent', pt: 'Família' },
}

  export function PreviewClient({ plan, dayEntry, date, lang }: PreviewClientProps) {
  const dateLabel = formatDate(date, lang)
  
  // Extract domains safely
  const domains = dayEntry.domains || {}
  
  // Get domains that have content for this day
  const activeDomains = Object.keys(DOMAIN_ICONS).filter(
    key => domains[key as keyof typeof domains] != null
  )

  // Get a teaser description from the first available activity
  let teaserActivity = null
  for (const key of Object.keys(domains)) {
    if (key !== 'parent_bridge' && domains[key as keyof typeof domains]) {
      teaserActivity = domains[key as keyof typeof domains]
      break
    }
  }

  const teaserText = teaserActivity
    ? getActivityDescription(teaserActivity, lang).slice(0, 120) + '...'
    : ''

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-soft-xl overflow-hidden border border-cream-200"
      >
        {/* Header Area */}
        <div className="bg-terracotta text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Sparkles className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-terracotta-100 text-sm font-inter tracking-wide uppercase mb-3">
              <span>🌙 Lua Learn</span>
            </div>
            <h1 className="font-lexend text-2xl font-bold mb-1">
              {plan.theme_name}
            </h1>
            <p className="text-terracotta-100 font-inter text-sm flex items-center gap-2">
              <span>{dateLabel}</span>
              <span className="opacity-50">•</span>
              <span>{lang === 'en' ? `Day ${dayEntry.day_number}` : `Dia ${dayEntry.day_number}`}</span>
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <h2 className="font-lexend text-sm font-semibold text-terracotta-900 mb-4 tracking-wide uppercase">
            {lang === 'en' ? "Today's Learning Domains" : 'Domínios de Aprendizagem de Hoje'}
          </h2>
          
          {/* Domain Badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {activeDomains.map((key) => {
              const info = DOMAIN_ICONS[key]
              return (
                <div 
                  key={key} 
                  className="bg-cream-100 border border-cream-200 rounded-xl px-3 py-2 flex items-center gap-2"
                >
                  <span className="text-lg">{info.icon}</span>
                  <span className="text-xs font-inter font-medium text-sage-700">
                    {lang === 'en' ? info.en : info.pt}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Activity Teaser */}
          {teaserActivity && (
            <div className="mb-8 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-terracotta-200 rounded-full"></div>
              <div className="pl-4">
                <h3 className="font-lexend font-medium text-terracotta-800 mb-1">
                  {teaserActivity.title}
                </h3>
                <p className="font-inter text-sage-600 text-sm leading-relaxed italic">
                  "{teaserText}"
                </p>
              </div>
            </div>
          )}

          {/* Parent Bridge Teaser */}
          {domains.parent_bridge && (
            <div className="mb-2">
              <ParentBridgeSnippet 
                domain={domains.parent_bridge} 
                lang={lang} 
                date={date} 
                hideShare // Don't show share button inside a share preview
              />
            </div>
          )}
        </div>

        {/* Call to Action Footer */}
        <div className="bg-cream-100 p-6 flex flex-col gap-3">
          <Link 
            href="/calendar"
            className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-inter font-medium py-3 px-4 rounded-xl hover:bg-terracotta-600 transition"
          >
            {lang === 'en' ? 'Subscribe to see full activities' : 'Assine para ver as atividades'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-center font-inter text-xs text-sage-500 mt-2">
            {lang === 'en' ? 'Already an educator? ' : 'Já é educador? '}
            <Link href="/login" className="text-terracotta-600 hover:underline font-medium">
              {lang === 'en' ? 'Log in' : 'Entrar'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
