'use client'

import { CalendarDays, Sprout } from 'lucide-react'
import { CalendarGrid } from '@/components/subscriber/CalendarGrid'
import { useLanguage } from '@/app/(subscriber)/LanguageContext'
import { formatMonthYear } from '@/lib/utils'
import type { CurriculumPlan, CompletionRecord } from '@/lib/types'

interface CalendarClientProps {
  userId: string
  plan:    CurriculumPlan | null
  profile: { active_subscription_month: string | null; is_admin: boolean }
  completions?: CompletionRecord[]
}

export function CalendarClient({ userId, plan, profile, completions = [] }: CalendarClientProps) {
  const { lang } = useLanguage()

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-cream-200 border border-cream-300 flex items-center justify-center mx-auto mb-5 shadow-soft">
          <Sprout className="w-8 h-8 text-sage-500" strokeWidth={1.5} />
        </div>
        <h2 className="font-lexend text-2xl font-semibold text-terracotta-900 mb-3">
          {lang === 'en' ? 'Your curriculum is being crafted!' : 'Seu currículo está sendo preparado!'}
        </h2>
        <p className="text-sage-600 font-inter text-sm max-w-sm mx-auto leading-relaxed">
          {lang === 'en'
            ? "Your teacher is preparing an amazing month of activities. You'll see your daily plans here as soon as they're ready."
            : 'Seu professor está preparando um mês incrível de atividades. Você verá seus planos diários aqui assim que estiverem prontos.'}
        </p>
      </div>
    )
  }

  const theme      = plan.daily_data?.theme ?? plan.theme_name
  const monthLabel = formatMonthYear(plan.month_year, lang)

  // Compute Streak
  const validDates = completions
    .filter(c => Object.values(c.domains_completed || {}).some(val => val === true))
    .map(c => c.date)
  const uniqueDates = validDates.sort().reverse()
  const isMonthComplete = !!(plan.daily_data?.days?.length && plan.daily_data.days.every(d => uniqueDates.includes(d.date)))
  
  const todayStr = new Date().toISOString().split('T')[0]
  let streak = 0
  let checkDate = new Date()
  checkDate.setHours(12, 0, 0, 0)
  
  let isActive = true
  while (isActive && streak < 500) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6
    const hasCompletion = uniqueDates.includes(dateStr)

    if (hasCompletion) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      if (isWeekend) {
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (streak === 0 && dateStr === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        isActive = false
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-terracotta-400" strokeWidth={1.5} />
            <span className="text-xs text-sage-500 font-inter uppercase tracking-wide">
              {lang === 'en' ? 'Monthly Curriculum' : 'Currículo Mensal'}
            </span>
          </div>
          <h1 className="font-lexend text-3xl font-semibold text-terracotta-900 leading-tight">
            {monthLabel}
          </h1>
          <p className="text-sage-600 font-inter mt-1">
            {lang === 'en' ? 'Theme:' : 'Tema:'}{' '}
            <span className="text-terracotta-700 font-medium">{theme}</span>
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 self-start flex-wrap">
          {isMonthComplete && (
            <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-3 py-2 rounded-2xl shadow-sm">
              <span className="text-xl">🌟</span>
              <div className="flex flex-col">
                <span className="font-lexend font-bold text-sky-700 leading-none">
                  {lang === 'en' ? 'Master' : 'Mestre'}
                </span>
                <span className="text-[10px] font-inter uppercase tracking-wider text-sky-600 font-semibold leading-none mt-0.5">
                  {lang === 'en' ? 'Month Complete' : 'Mês Concluído'}
                </span>
              </div>
            </div>
          )}
          
          {streak > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-2 rounded-2xl shadow-sm">
              <span className="text-xl">🔥</span>
              <div className="flex flex-col">
                <span className="font-lexend font-bold text-orange-600 leading-none">{streak}</span>
                <span className="text-[10px] font-inter uppercase tracking-wider text-orange-500 font-semibold leading-none mt-0.5">
                  {lang === 'en' ? 'Day Streak' : 'Dias Seguidos'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <CalendarGrid
          plan={plan}
          monthYear={plan.month_year}
          days={plan.daily_data?.days ?? []}
          lang={lang}
          completions={completions}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-5 text-xs font-inter text-sage-500">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-4 h-4 rounded-lg bg-terracotta inline-block" />
          {lang === 'en' ? 'Today' : 'Hoje'}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-4 h-4 rounded-lg bg-sage-100 shadow-inner inline-block" />
          {lang === 'en' ? 'Completed' : 'Concluído'}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-4 h-4 rounded-lg bg-white border border-cream-400 shadow-soft inline-block" />
          {lang === 'en' ? 'Upcoming' : 'Próximo'}
        </span>
      </div>
    </div>
  )
}
