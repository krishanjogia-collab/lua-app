'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sprout, Clock } from 'lucide-react'
import { DraftReview } from '@/components/studio/DraftReview'
import type { CurriculumPlan, DailyData } from '@/lib/types'

interface ReviewClientProps {
  plan: CurriculumPlan
}

export function ReviewClient({ plan }: ReviewClientProps) {
  const [data, setData] = useState<DailyData | null>(plan.daily_data ?? null)

  return (
    <div className="min-h-screen bg-cream">
      {/* Studio nav */}
      <div className="bg-white border-b border-cream-300 shadow-soft sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-terracotta flex items-center justify-center">
            <Sprout className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/studio" className="flex items-center gap-1.5 text-sm text-sage-500 hover:text-terracotta-600 font-inter transition">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              Studio
            </Link>
            <span className="text-sage-300 font-inter">/</span>
            <span className="text-sm font-medium text-terracotta-900 font-inter">Draft Review</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-lexend text-2xl font-semibold text-terracotta-900">
            {plan.theme_name}
          </h1>
          <p className="text-sm text-sage-500 font-inter mt-1">
            Review and edit each day before publishing to subscribers.
          </p>
        </div>

        {data ? (
          <DraftReview
            data={data}
            planId={plan.id}
            onChange={setData}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-3xl bg-cream-100 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-sage-400" strokeWidth={1.5} />
            </div>
            <h2 className="font-lexend text-lg font-semibold text-terracotta-900 mb-1">
              Curriculum not yet available
            </h2>
            <p className="text-sm text-sage-500 font-inter max-w-xs">
              The daily content for this plan is still generating or hasn&apos;t been created yet. Check back shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
