'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { CurriculumPlan, DailyEntry } from '@/lib/types'

const WeeklyPlanPDFLink = dynamic(
  () => import('@/components/pdf/WeeklyPlanPDFLink').then(mod => mod.WeeklyPlanPDFLink),
  { 
    ssr: false,
    loading: () => (
      <div className="px-3 py-1.5 rounded-lg border border-sage-200 text-sage-400 bg-white flex items-center gap-1.5 text-xs font-medium font-inter shadow-sm absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 cursor-not-allowed">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Loading...</span>
      </div>
    )
  }
)

interface DownloadWeekButtonProps {
  plan: CurriculumPlan
  days: DailyEntry[]
  weekLabel: string
  lang: 'en' | 'pt'
  filename: string
}

export function DownloadWeekButton(props: DownloadWeekButtonProps) {
  return <WeeklyPlanPDFLink {...props} />
}
