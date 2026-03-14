'use client'

import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import { WeeklyPlanPDF } from './WeeklyPlanPDF'
import type { CurriculumPlan, DailyEntry } from '@/lib/types'

interface WeeklyPlanPDFLinkProps {
  plan: CurriculumPlan
  days: DailyEntry[]
  weekLabel: string
  lang: 'en' | 'pt'
  filename: string
}

export function WeeklyPlanPDFLink({ plan, days, weekLabel, lang, filename }: WeeklyPlanPDFLinkProps) {
  return (
    <PDFDownloadLink
      document={<WeeklyPlanPDF plan={plan} days={days} weekLabel={weekLabel} lang={lang} />}
      fileName={filename}
      className="px-3 py-1.5 rounded-lg border border-sage-200 text-sage-600 bg-white hover:bg-sage-50 hover:text-sage-800 transition flex items-center gap-1.5 text-xs font-medium font-inter shadow-sm absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100"
    >
      {({ loading }) => (
        <>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          <span>
            {loading 
              ? (lang === 'en' ? 'Preparing...' : 'Preparando...') 
              : (lang === 'en' ? 'Download Week' : 'Baixar Semana')}
          </span>
        </>
      )}
    </PDFDownloadLink>
  )
}
