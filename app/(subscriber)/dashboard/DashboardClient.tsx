'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CalendarDays, BookOpen, Pencil, Share2, Sparkles, Wind, Heart, Globe, MessageCircle } from 'lucide-react'
import type { CurriculumPlan, DailyEntry } from '@/lib/types'
import { useLanguage } from '@/app/(subscriber)/LanguageContext'
import { cn } from '@/lib/utils'

interface DashboardClientProps {
  profile: { is_admin: boolean; active_subscription_month: string | null }
  plan: CurriculumPlan | null
  todayEntry: DailyEntry | null
  weekEntries: DailyEntry[]
}

const DOMAIN_ICONS = {
  sensory_layout:     { icon: Sparkles, color: 'text-terracotta-500' },
  cognitive_literacy: { icon: BookOpen, color: 'text-sage-600' },
  physical_outdoor:   { icon: Wind, color: 'text-sky-500' },
  social_emotional:   { icon: Heart, color: 'text-rose-500' },
  cultural_global:    { icon: Globe, color: 'text-amber-500' },
  parent_bridge:      { icon: MessageCircle, color: 'text-sage-500' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.4 } }
}

export default function DashboardClient({ profile, plan, todayEntry, weekEntries }: DashboardClientProps) {
  const { lang } = useLanguage()

  // Time-of-day greeting
  const hour = new Date().getHours()
  let greetingEn = 'Good evening'
  let greetingPt = 'Boa noite'
  if (hour < 12) {
    greetingEn = 'Good morning'
    greetingPt = 'Bom dia'
  } else if (hour < 18) {
    greetingEn = 'Good afternoon'
    greetingPt = 'Boa tarde'
  }

  // Format today's date
  const todayFormatEn = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayFormatPt = new Date().toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })

  // Current day string for comparison
  const todayStr = new Date().toISOString().split('T')[0]

  // Weekdays layout setup (Monday to Friday)
  const weekDayLabelsEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const weekDayLabelsPt = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

  const getWeekDayIndex = (dateStr: string) => {
    // Note: getDay() returns 0 for Sunday. We want Mon=0, Fri=4.
    // If it's a weekend, it won't be in the 0-4 range logically for this strip, but we filter weekEntries anyway.
    const dt = new Date(dateStr)
    const day = dt.getDay()
    return day === 0 ? 6 : day - 1 // Mon=0, Sun=6
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* A) Greeting Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
        <div>
          <h1 className="font-lexend text-2xl text-terracotta-900 leading-tight">
            {lang === 'en' ? `${greetingEn}, Educator!` : `${greetingPt}, Educador(a)!`}
          </h1>
        </div>
        <p className="font-inter text-sage-600 text-sm">
          {lang === 'en' ? todayFormatEn : todayFormatPt}
        </p>
      </motion.div>

      {/* B) Today's Plan Card (hero) */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-soft p-6">
        {todayEntry ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-4">
              <h2 className="font-lexend text-lg text-terracotta-700">
                {plan?.theme_name}
              </h2>
              <div className="flex flex-wrap gap-4">
                {(Object.keys(DOMAIN_ICONS) as Array<keyof typeof DOMAIN_ICONS>).map((key) => {
                  if (!todayEntry.domains || !todayEntry.domains[key as keyof typeof todayEntry.domains]) return null
                  const domainData = DOMAIN_ICONS[key]
                  const Icon = domainData.icon
                  return (
                    <div key={key} className="flex items-center gap-2">
                       <span className={cn('p-2 rounded-xl bg-sage-50', domainData.color)}>
                         <Icon className="w-5 h-5" strokeWidth={1.5} />
                       </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <Link 
              href={`/day/${todayEntry.date}`}
              className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-2xl font-lexend font-medium transition text-center sm:text-left shadow-sm whitespace-nowrap"
            >
              {lang === 'en' ? "View Today's Plan" : "Ver Plano de Hoje"}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-sage-500 space-y-3">
            <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center text-sage-400">
              <SproutIcon className="w-8 h-8" />
            </div>
            <p className="font-inter text-center">
              {lang === 'en' ? "No plan for today. Enjoy your day!" : "Sem plano para hoje. Aproveite!"}
            </p>
          </div>
        )}
      </motion.div>

      {/* C) This Week Strip */}
      <motion.div variants={itemVariants}>
        <h3 className="font-lexend text-lg text-terracotta-900 mb-4">
          {lang === 'en' ? "This Week" : "Esta Semana"}
        </h3>
        <div className="flex flex-row justify-between gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          {[0, 1, 2, 3, 4].map((dayIdx) => {
            // Reconstruct the date for this slot based on today's week
            const today = new Date()
            const dayOfWeek = today.getDay()
            const monday = new Date(today)
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
            const slotDate = new Date(monday)
            slotDate.setDate(monday.getDate() + dayIdx)
            const slotDateStr = slotDate.toISOString().split('T')[0]
            
            const entry = weekEntries.find(d => d.date === slotDateStr)
            
            const isToday = slotDateStr === todayStr
            const isPast = slotDateStr < todayStr
            
            let stateClass = 'bg-cream-200 text-sage-400' // No entry
            if (isToday) {
               stateClass = 'bg-terracotta-500 text-white ring-2 ring-terracotta-300 ring-offset-2'
            } else if (entry && isPast) {
               stateClass = 'bg-sage-100 text-sage-700'
            } else if (entry && !isPast) {
               stateClass = 'bg-white border text-terracotta-800 border-cream-400 shadow-sm'
            }

            const cardContent = (
              <div className={cn('w-full min-w-[3.5rem] sm:w-auto flex-1 rounded-2xl p-3 text-center transition', stateClass)}>
                <div className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">
                  {lang === 'en' ? weekDayLabelsEn[dayIdx] : weekDayLabelsPt[dayIdx]}
                </div>
                <div className="text-lg font-lexend font-semibold">
                  {slotDate.getDate()}
                </div>
              </div>
            )

            return entry ? (
              <Link key={dayIdx} href={`/day/${slotDateStr}`} className="flex-1 outline-none focus:ring-2 focus:ring-terracotta-200 rounded-2xl">
                {cardContent}
              </Link>
            ) : (
              <div key={dayIdx} className="flex-1 opacity-60">
                {cardContent}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* D) Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/calendar" className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-cream-200 hover:border-terracotta-200 hover:shadow-soft transition group">
          <div className="p-2 bg-cream-50 rounded-xl text-terracotta-500 group-hover:bg-terracotta-50 transition">
            <CalendarDays strokeWidth={1.5} className="w-5 h-5" />
          </div>
          <span className="font-lexend text-sm text-terracotta-900">{lang === 'en' ? "Calendar" : "Calendário"}</span>
        </Link>
        
        <Link href="/vault" className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-cream-200 hover:border-terracotta-200 hover:shadow-soft transition group">
          <div className="p-2 bg-cream-50 rounded-xl text-terracotta-500 group-hover:bg-terracotta-50 transition">
            <BookOpen strokeWidth={1.5} className="w-5 h-5" />
          </div>
          <span className="font-lexend text-sm text-terracotta-900">{lang === 'en' ? "Resources" : "Recursos"}</span>
        </Link>

        {profile.is_admin && (
          <Link href="/studio" className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-cream-200 hover:border-terracotta-200 hover:shadow-soft transition group">
            <div className="p-2 bg-cream-50 rounded-xl text-terracotta-500 group-hover:bg-terracotta-50 transition">
              <Pencil strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <span className="font-lexend text-sm text-terracotta-900">Studio</span>
          </Link>
        )}

        {todayEntry && (
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: lang === 'en' ? `Lua Learn | Today's Plan` : `Lua Learn | Plano de Hoje`,
                  url: `${window.location.origin}/preview/day/${plan?.id || 'PLACEHOLDER'}/${todayEntry.date}`
                }).catch(() => {})
              } else {
                navigator.clipboard.writeText(`${window.location.origin}/preview/day/${plan?.id || 'PLACEHOLDER'}/${todayEntry.date}`)
                alert(lang === 'en' ? "Link copied to clipboard!" : "Link copiado para a área de transferência!")
              }
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-cream-200 hover:border-terracotta-200 hover:shadow-soft transition group text-left"
          >
            <div className="p-2 bg-cream-50 rounded-xl text-terracotta-500 group-hover:bg-terracotta-50 transition">
              <Share2 strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <span className="font-lexend text-sm text-terracotta-900">{lang === 'en' ? "Share Plan" : "Compartilhar"}</span>
          </button>
        )}
      </motion.div>

      {/* E) Month Theme Banner or F) Empty State */}
      <motion.div variants={itemVariants}>
        {plan ? (
           <div className="bg-gradient-to-r from-cream-100 to-terracotta-50 rounded-3xl p-6 relative overflow-hidden group border border-cream-200/50">
             <div className="relative z-10">
               <div className="flex items-start justify-between">
                 <div>
                   <p className="font-inter text-xs font-semibold text-sage-600 uppercase tracking-widest mb-2">
                     {plan.month_year}
                   </p>
                   <h3 className="font-lexend text-xl text-[#5C2D26] mb-3 max-w-sm">
                     {plan.theme_name}
                   </h3>
                 </div>
                 <div className="hidden sm:block">
                   <span className="bg-sage-100 text-sage-700 rounded-full px-3 py-1 font-inter text-xs font-medium">
                     {plan.daily_data?.philosophy ? plan.daily_data.philosophy.charAt(0).toUpperCase() + plan.daily_data.philosophy.slice(1) : ''}
                   </span>
                 </div>
               </div>
               <Link href="/calendar" className="inline-flex items-center text-sm font-medium text-terracotta-600 hover:text-terracotta-700 font-inter mt-2 transition">
                 {lang === 'en' ? 'View month calendar →' : 'Ver calendário do mês →'}
               </Link>
             </div>
             {/* Decorative element */}
             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cream-200 rounded-full mix-blend-multiply opacity-50 group-hover:scale-110 transition duration-700 ease-out" />
           </div>
        ) : (
          <div className="bg-cream-50 rounded-3xl border border-cream-200 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center text-sage-400 mb-4">
              <SproutIcon className="w-8 h-8" />
            </div>
            <h3 className="font-lexend text-lg text-terracotta-900 mb-1">
               {lang === 'en' ? "Your curriculum is being prepared!" : "Seu currículo está sendo preparado!"}
            </h3>
            <p className="font-inter text-sage-600 max-w-sm text-sm">
               {lang === 'en' 
                 ? "We are gathering resources and building your custom learning experiences based on your preferences."
                 : "Estamos reunindo recursos e construindo suas experiências de aprendizagem personalizadas com base em suas preferências."}
            </p>
          </div>
        )}
      </motion.div>

    </motion.div>
  )
}

function SproutIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-1.25 6-11.5 6-11.5s-5.33 3.17-6 11.5z" />
      <path d="M10 8.5c-4.5 1.75-6 6.5-6 6.5s3.5-.5 6-6.5z" />
    </svg>
  )
}
