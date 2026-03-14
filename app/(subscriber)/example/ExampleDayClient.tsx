'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sprout, Globe } from 'lucide-react'
import { DailyFlowCard } from '@/components/subscriber/DailyFlowCard'
import { MOCK_DAILY_DATA } from '@/lib/mock-data'
import { Language } from '@/lib/types'

export default function ExampleDayClient() {
  const router = useRouter()
  const supabase = createClient()
  const [lang, setLang] = useState<Language>('en')
  
  const dayData = MOCK_DAILY_DATA.days[0]
  if (!dayData) return null

  // Explicitly render all 6 domains in standard Lua Cycle order
  const domainKeys = [
    'sensory_layout',
    'cognitive_literacy',
    'physical_outdoor',
    'social_emotional',
    'cultural_global',
    'parent_bridge'
  ] as const

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-cream pb-24 font-inter">
      {/* Header */}
      <motion.div 
        className="bg-white border-b border-cream-200 pt-16 pb-12 px-4 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-terracotta-50 text-terracotta-600 mb-6 border border-terracotta-100 shadow-sm">
            <Sprout className="w-7 h-7" strokeWidth={1.5} />
          </div>
          
          <h1 className="font-lexend text-2xl text-terracotta-900 mb-2 font-bold">
            {lang === 'en' ? 'Lua Learn — Example Day' : 'Lua Learn — Dia de Exemplo'}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-3 text-sage-600 font-inter text-sm mb-6">
            <span className="font-semibold">{MOCK_DAILY_DATA.theme}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cream-300" />
            <span>{lang === 'en' ? 'Day 1' : 'Dia 1'}</span>
          </div>

          <p className="font-inter text-sage-700 leading-relaxed max-w-lg mx-auto mb-8 text-base/relaxed">
            {lang === 'en' 
              ? "Here's what a day on Lua Learn looks like. Tap any activity to see the full plan."
              : "Veja como é um dia no Lua Learn. Toque em qualquer atividade para ver o plano completo."}
          </p>

          <button 
            onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')}
            className="inline-flex items-center gap-2 bg-white border-2 border-cream-300 text-terracotta-800 px-5 py-2.5 rounded-full font-lexend font-semibold text-sm hover:bg-cream-50 hover:border-terracotta-300 transition shadow-sm active:scale-95"
          >
            <Globe className="w-4 h-4 text-terracotta-500" />
            {lang === 'en' ? 'View in Portuguese' : 'View in English'}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-xl md:max-w-2xl mx-auto px-4 mt-8">
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {domainKeys.map((key, idx) => {
            const domain = dayData.domains[key]
            if (!domain) return null
            return (
              <DailyFlowCard 
                key={key}
                domainKey={key}
                domain={domain}
                lang={lang}
                index={idx}
                initialCompleted={false}
              />
            )
          })}
        </motion.div>

        {/* Value Prop Banner */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="my-16 bg-white rounded-[2rem] border border-cream-200 p-8 sm:p-10 text-center shadow-soft relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta-50 rounded-full mix-blend-multiply opacity-50 -z-10 -translate-y-1/2 translate-x-1/2" />
          
          <div className="inline-flex p-3 bg-terracotta-50 text-terracotta-500 rounded-2xl mb-5 shadow-sm border border-terracotta-100">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="font-lexend text-xl text-terracotta-900 font-bold mb-3 tracking-tight">
            {lang === 'en' ? 'Every day is balanced.' : 'Todos os dias são equilibrados.'}
          </h3>
          <p className="font-inter text-sage-700 leading-relaxed max-w-sm mx-auto">
            {lang === 'en' 
              ? 'This plan covers all 6 learning areas. Every day is different. Classroom-ready in minutes.'
              : 'Este plano cobre todas as 6 áreas. Cada dia é diferente. Pronto para a sala de aula em minutos.'}
          </p>
        </motion.div>

        {/* Waitlist CTA Footer */}
        <motion.div
           variants={itemVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="border-t border-cream-200 pt-16 pb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-terracotta shadow-soft mb-6 hover:shadow-lg transition-shadow">
            <Sprout className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>

          <h2 className="font-lexend text-2xl font-semibold text-terracotta-900 mb-3 tracking-tight">
            {lang === 'en' ? "You're on the list!" : 'Você está na lista!'}
          </h2>

          <p className="text-sage-600 font-inter text-sm leading-relaxed mb-8 max-w-[22rem] mx-auto opacity-90">
            {lang === 'en'
              ? "Lua Learn is launching soon with classroom-ready Pre-K curriculum designed by educators with 15+ years of experience. We'll let you know when your dashboard is ready."
              : 'O Lua Learn está chegando com currículo de Educação Infantil pronto para a sala de aula. Avisaremos quando seu painel estiver pronto.'}
          </p>

          <a
            href="https://instagram.com/lua_learn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-auto min-w-[200px] gap-2 px-8 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-2xl font-lexend font-medium transition shadow-soft-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 mb-6"
          >
            {lang === 'en' ? 'Follow @lua_learn' : 'Siga @lua_learn'}
          </a>

          <div>
            <button
              onClick={handleSignOut}
              className="text-sm text-sage-400 hover:text-terracotta-500 font-inter font-medium underline-offset-4 hover:underline transition-all"
            >
              {lang === 'en' ? 'Sign out' : 'Sair'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
