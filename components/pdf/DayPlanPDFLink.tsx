'use client'

import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import { DayPlanPDF } from './DayPlanPDF'
import type { DailyEntry } from '@/lib/types'

interface DayPlanPDFLinkProps {
  plan: { theme_name: string }
  dayEntry: DailyEntry
  dateLabel: string
  lang: 'en' | 'pt'
  filename: string
}

export function DayPlanPDFLink({ plan, dayEntry, dateLabel, lang, filename }: DayPlanPDFLinkProps) {
  return (
    <PDFDownloadLink
      document={<DayPlanPDF plan={plan} dayEntry={dayEntry} dateLabel={dateLabel} lang={lang} />}
      fileName={filename}
      className="px-3 py-2 rounded-2xl border border-sage-200 text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition flex items-center gap-2 text-sm font-medium font-lexend"
    >
      {/* 
        react-pdf child function pattern:
        Note: The actual render might flash loading initially as the blob is generated.
      */}
      {({ loading }) => (
        <>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {loading 
              ? (lang === 'en' ? 'Preparing...' : 'Preparando...') 
              : (lang === 'en' ? 'Download PDF' : 'Baixar PDF')}
          </span>
        </>
      )}
    </PDFDownloadLink>
  )
}
