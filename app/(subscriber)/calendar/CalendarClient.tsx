'use client'

import { CalendarDays, Sprout } from 'lucide-react'
import { CalendarGrid } from '@/components/subscriber/CalendarGrid'
import { WelcomeModal } from '@/components/subscriber/WelcomeModal'
import { useLanguage } from '@/app/(subscriber)/LanguageContext'
import { formatMonthYear } from '@/lib/utils'
import type { CurriculumPlan } from '@/lib/types'

interface CalendarClientProps {
  userId: string
  plan:    CurriculumPlan | null
  profile: { active_subscription_month: string | null; is_admin: boolean }
  hasOnboarded: boolean
}

export function CalendarClient({ userId, plan, profile, hasOnboarded }: CalendarClientProps) {
  const { lang } = useLanguage()

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <WelcomeModal userId={userId} lang={lang} hasOnboarded={hasOnboarded} />
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <WelcomeModal userId={userId} lang={lang} hasOnboarded={hasOnboarded} />
      {/* Header */}
      <div className="mb-8">
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

      {/* Calendar grid */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <CalendarGrid
          plan={plan}
          monthYear={plan.month_year}
          days={plan.daily_data?.days ?? []}
          lang={lang}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-5 text-xs font-inter text-sage-500">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-4 h-4 rounded-lg bg-terracotta inline-block" />
          {lang === 'en' ? 'Today' : 'Hoje'}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-4 h-4 rounded-lg bg-sage-100 inline-block" />
          {lang === 'en' ? 'Past day' : 'Dia anterior'}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-4 h-4 rounded-lg bg-white border border-cream-400 shadow-soft inline-block" />
          {lang === 'en' ? 'Upcoming' : 'Próximo'}
        </span>
      </div>
    </div>
  )
}
