'use client'

import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Scissors, Loader2 } from 'lucide-react'
import { ActivityCardsPDF } from './ActivityCardsPDF'
import type { DailyEntry } from '@/lib/types'

interface ActivityCardsPDFLinkProps {
  dayEntry: DailyEntry
  lang: 'en' | 'pt'
  filename: string
}

export function ActivityCardsPDFLink({ dayEntry, lang, filename }: ActivityCardsPDFLinkProps) {
  return (
    <PDFDownloadLink
      document={<ActivityCardsPDF dayEntry={dayEntry} lang={lang} />}
      fileName={filename}
      className="px-3 py-2 rounded-2xl border border-sage-200 text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition flex items-center gap-2 text-sm font-medium font-lexend"
    >
      {({ loading }) => (
        <>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {loading 
              ? (lang === 'en' ? 'Preparing...' : 'Preparando...') 
              : (lang === 'en' ? 'Activity Cards' : 'Cartões')}
          </span>
        </>
      )}
    </PDFDownloadLink>
  )
}
