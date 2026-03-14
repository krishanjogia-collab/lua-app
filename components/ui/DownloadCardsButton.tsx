'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { DailyEntry } from '@/lib/types'

const ActivityCardsPDFLink = dynamic(
  () => import('@/components/pdf/ActivityCardsPDFLink').then(mod => mod.ActivityCardsPDFLink),
  { 
    ssr: false,
    loading: () => (
      <div className="px-3 py-2 rounded-2xl border border-sage-200 text-sage-400 flex items-center gap-2 text-sm font-medium font-lexend cursor-not-allowed">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    )
  }
)

interface DownloadCardsButtonProps {
  dayEntry: DailyEntry
  lang: 'en' | 'pt'
  filename: string
}

export function DownloadCardsButton(props: DownloadCardsButtonProps) {
  return <ActivityCardsPDFLink {...props} />
}
