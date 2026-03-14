'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { DailyEntry } from '@/lib/types'

// Dynamically load the component that imports @react-pdf/renderer 
// to avoid SSR "window is not defined" or Node polyfill errors.
const DayPlanPDFLink = dynamic(
  () => import('@/components/pdf/DayPlanPDFLink').then(mod => mod.DayPlanPDFLink),
  { 
    ssr: false,
    loading: () => (
      <div className="px-3 py-2 rounded-2xl border border-sage-200 text-sage-400 flex items-center gap-2 text-sm font-medium font-lexend cursor-not-allowed">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    )
  }
)

interface DownloadPDFButtonProps {
  plan: { theme_name: string }
  dayEntry: DailyEntry
  dateLabel: string
  lang: 'en' | 'pt'
  filename: string
}

export function DownloadPDFButton(props: DownloadPDFButtonProps) {
  return <DayPlanPDFLink {...props} />
}
