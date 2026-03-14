'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Calendar, Layers, Printer, Sparkles } from 'lucide-react'

// Slide data defined outside to keep component clean
const ONBOARDING_SLIDES_EN = [
  {
    title: 'Welcome to Lua!',
    description: 'Your Pre-K curriculum is ready. Here is a quick tour.',
    icon: Sparkles,
  },
  {
    title: 'Your Calendar',
    description: 'This is your calendar. Tap any day to see that day\'s activities across 6 developmental domains.',
    icon: Calendar,
  },
  {
    title: 'The Daily Flow',
    description: 'Each day covers Sensory, Cognitive, Physical, Social, Cultural, and Parent Bridge activities. Everything is available in English and Portuguese.',
    icon: Layers,
  },
  {
    title: 'Export & Share',
    description: 'You can print daily plans, download weekly PDFs, and share beautiful activities with parents — all from the day view.',
    icon: Printer,
  }
]

const ONBOARDING_SLIDES_PT = [
  {
    title: 'Bem-vindo ao Lua!',
    description: 'Seu currículo infantil está pronto. Aqui está um tour rápido.',
    icon: Sparkles,
  },
  {
    title: 'Seu Calendário',
    description: 'Este é o seu calendário. Toque em qualquer dia para ver as atividades em 6 domínios de desenvolvimento.',
    icon: Calendar,
  },
  {
    title: 'O Fluxo Diário',
    description: 'Cada dia cobre atividades Sensoriais, Cognitivas, Físicas, Sociais, Culturais e Ponte com os Pais. Tudo disponível em Inglês e Português.',
    icon: Layers,
  },
  {
    title: 'Exportar & Compartilhar',
    description: 'Você pode imprimir planos diários, baixar PDFs semanais e compartilhar atividades com os pais.',
    icon: Printer,
  }
]

interface WelcomeModalProps {
  userId: string
  lang: 'en' | 'pt'
  hasOnboarded: boolean
}

export function WelcomeModal({ userId, lang, hasOnboarded }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const [isDismissing, setIsDismissing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Only open if the prop says they haven't onboarded
  useEffect(() => {
    if (!hasOnboarded) {
      setIsOpen(true)
    }
  }, [hasOnboarded])

  const handleDismiss = async () => {
    setIsDismissing(true)
    
    // Optimistic close
    setIsOpen(false)
    
    // Update DB
    await supabase
      .from('profiles')
      .update({ has_onboarded: true })
      .eq('id', userId)

    router.refresh()
  }

  const handleNext = () => {
    if (slide < 3) {
      setSlide(s => s + 1)
    } else {
      handleDismiss()
    }
  }

  if (!isOpen) return null

  const slides = lang === 'en' ? ONBOARDING_SLIDES_EN : ONBOARDING_SLIDES_PT
  const CurrentIcon = slides[slide].icon

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-sage-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-cream rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Close Button X */}
          <button 
            onClick={handleDismiss}
            disabled={isDismissing}
            className="absolute top-4 right-4 p-2 text-sage-400 hover:text-terracotta-500 transition-colors z-10 bg-cream/50 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Slide Content Area */}
          <div className="flex-1 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-cream-200 flex items-center justify-center mb-6 text-terracotta">
                  <CurrentIcon className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-lexend font-bold text-terracotta-900 mb-3">
                  {slides[slide].title}
                </h2>
                <p className="text-sage-600 font-inter leading-relaxed text-[15px]">
                  {slides[slide].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls Footer */}
          <div className="p-6 bg-white border-t border-cream-200">
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === slide ? 'bg-terracotta' : 'bg-cream-300'}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                disabled={isDismissing}
                className="flex-[0.4] py-3.5 rounded-2xl text-sage-500 font-inter font-medium text-sm hover:bg-cream-100 transition"
              >
                {lang === 'en' ? 'Skip' : 'Pular'}
              </button>
              <button
                onClick={handleNext}
                disabled={isDismissing}
                className="flex-1 py-3.5 rounded-2xl bg-terracotta text-white font-lexend font-semibold shadow-soft hover:bg-terracotta-600 transition hover:-translate-y-0.5 active:translate-y-0"
              >
                {slide === 3 
                  ? (lang === 'en' ? "Let's Go!" : "Vamos Lá!") 
                  : (lang === 'en' ? "Next" : "Próximo")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
