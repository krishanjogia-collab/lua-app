'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock } from 'lucide-react'
import type { DailyEntry } from '@/lib/types'
import { cn, todayISO } from '@/lib/utils'

interface CalendarGridProps {
  monthYear: string
  days:      DailyEntry[]
  lang:      'en' | 'pt'
}

const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAY_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarGrid({ monthYear, days, lang }: CalendarGridProps) {
  const router = useRouter()
  const today  = todayISO()

  const [year, month] = monthYear.split('-').map(Number)

  // Build full month grid
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const daysInMonth     = new Date(year, month, 0).getDate()

  const dayMap = new Map(days.map(d => [d.date, d]))

  const headers = lang === 'en' ? WEEKDAY_EN : WEEKDAY_PT

  // Leading empty cells
  const cells: Array<{ date: string | null; num: number }> = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push({ date: null, num: 0 })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ date, num: d })
  }

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {headers.map(h => (
          <div key={h} className="text-center text-xs font-medium text-sage-500 font-inter py-2">
            {h}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (!cell.date) {
            return <div key={`empty-${i}`} />
          }

          const entry     = dayMap.get(cell.date)
          const isToday   = cell.date === today
          const isPast    = cell.date < today
          const hasEntry  = !!entry
          const isSunday  = new Date(cell.date + 'T12:00:00').getDay() === 0
          const isSaturday = new Date(cell.date + 'T12:00:00').getDay() === 6
          const isWeekend = isSunday || isSaturday

          const formatted = new Date(cell.date + 'T12:00:00').toLocaleDateString(
            lang === 'en' ? 'en-US' : 'pt-BR',
            { weekday: 'long', month: 'long', day: 'numeric' }
          )
          const ariaLabel = isToday   ? (lang === 'en' ? `Today, ${formatted}`                : `Hoje, ${formatted}`)
            : hasEntry && isPast      ? (lang === 'en' ? `Completed, ${formatted}`             : `Concluído, ${formatted}`)
            : hasEntry                ? (lang === 'en' ? `Curriculum available, ${formatted}`  : `Currículo disponível, ${formatted}`)
            : isWeekend               ? (lang === 'en' ? `Weekend, ${formatted}`               : `Fim de semana, ${formatted}`)
            :                           (lang === 'en' ? `Locked, ${formatted}`                : `Bloqueado, ${formatted}`)

          return (
            <motion.button
              key={cell.date}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01, duration: 0.2 }}
              aria-current={isToday ? 'date' : undefined}
              aria-label={ariaLabel}
              onClick={() => hasEntry && router.push(`/day/${cell.date}`)}
              disabled={!hasEntry}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-medium font-inter transition-all duration-200',
                isToday && 'bg-terracotta text-white shadow-soft ring-2 ring-terracotta-300',
                !isToday && hasEntry && isPast  && 'bg-sage-100 text-sage-700 hover:bg-sage-200 cursor-pointer',
                !isToday && hasEntry && !isPast && 'bg-white text-terracotta-800 shadow-soft hover:shadow-soft-lg hover:bg-terracotta-50 cursor-pointer',
                !hasEntry && isWeekend && 'bg-cream-200 text-sage-300 cursor-default',
                !hasEntry && !isWeekend && 'bg-cream-200 text-sage-300 cursor-not-allowed',
              )}
            >
              <span className={cn('text-sm', isToday && 'font-bold')}>{cell.num}</span>
              {hasEntry && isPast && !isToday && (
                <CheckCircle2 className="w-3 h-3 text-sage-400 mt-0.5" strokeWidth={1.5} />
              )}
              {!hasEntry && !isWeekend && (
                <Lock className="w-3 h-3 opacity-30 mt-0.5" strokeWidth={1.5} />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
