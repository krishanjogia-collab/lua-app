'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { ChevronRight, ChevronLeft, Sparkles, BookOpen, Leaf, Users } from 'lucide-react'

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [step, setStep] = useState<OnboardingStep>(1)
  
  // Collected State
  const [ageGroup, setAgeGroup] = useState<'3-4' | '4-5' | 'mixed'>('4-5')
  const [cadence, setCadence] = useState<'weekly' | 'monthly'>('monthly')
  const [theme, setTheme] = useState<string>('Ocean Explorers')
  const [customTheme, setCustomTheme] = useState('')
  const [isCustomTheme, setIsCustomTheme] = useState(false)
  const [philosophy, setPhilosophy] = useState<'montessori' | 'reggio' | 'play-based' | 'flexible'>('flexible')

  const [isGenerating, setIsGenerating] = useState(false)

  const handleNext = () => setStep(s => Math.min(6, s + 1) as OnboardingStep)
  const handleBack = () => setStep(s => Math.max(1, s - 1) as OnboardingStep)

  const generateAndFinish = async () => {
    setIsGenerating(true)

    const finalTheme = isCustomTheme && customTheme.trim().length > 0 ? customTheme : theme
    const finalPhilosophy = philosophy === 'flexible' ? 'custom' : philosophy

    // 1. Update Profile natively
    if (process.env.NEXT_PUBLIC_MOCK_MODE !== 'true') {
      await supabase
        .from('profiles')
        .update({ 
          has_onboarded: true,
          planning_cadence: cadence,
          age_group: ageGroup
        })
        .eq('id', userId)
    }

    try {
      // 2. Trigger Generation Pipeline in the Background
      await fetch('/api/generate-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          theme: finalTheme,
          philosophy: finalPhilosophy,
          age_group: ageGroup,
          planning_cadence: cadence,
          month_year: new Date().toISOString().slice(0, 7) // E.g., '2026-03'
        }),
      })
    } catch (e) {
      console.error('Generation hit a snag, progressing to calendar anyway', e)
    }

    // Give the animation 4s minimum even if api is fast so it feels magical
    setTimeout(() => {
      router.push('/calendar')
      router.refresh()
    }, 4000)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  }

  const renderStepIndicators = () => (
    <div className="flex justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div 
          key={i} 
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? 'w-6 bg-terracotta-500' : 
            i < step ? 'w-2 bg-terracotta-300' : 'w-2 bg-cream-500' // cream-500 works well here usually as a greyish proxy
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter overflow-hidden relative">
      <div className="w-full max-w-lg">
        {renderStepIndicators()}
        
        <div className="relative min-h-[450px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute inset-x-0 bg-white rounded-3xl p-6 sm:p-8 shadow-soft"
            >
              
              {/* ------------ STEP 1: WELCOME ------------ */}
              {step === 1 && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-50 text-sage-600 mb-6">
                    <Leaf className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-lexend font-semibold text-deep-espresso mb-4">
                    Welcome to Lua Learn
                  </h2>
                  <p className="text-deep-espresso/70 text-base leading-relaxed mb-10">
                    We're so glad you're here. Let's set up your first curriculum together. It only takes a minute.
                  </p>
                  <button 
                    onClick={handleNext}
                    className="w-full bg-terracotta-500 text-white font-medium py-3.5 px-6 rounded-2xl hover:bg-terracotta-600 transition shadow-soft flex items-center justify-center gap-2"
                  >
                    Let's get started <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ------------ STEP 2: AGE GROUP ------------ */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-lexend font-semibold text-deep-espresso mb-2">Tell us about your little learners</h2>
                  <p className="text-deep-espresso/60 text-sm mb-6">What age group is your classroom?</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button 
                      onClick={() => setAgeGroup('3-4')}
                      className={`text-left p-4 rounded-2xl border-2 transition ${ageGroup === '3-4' ? 'border-terracotta-500 bg-terracotta-50' : 'border-gray-100 bg-white hover:border-terracotta-200'}`}
                    >
                      <span className="text-2xl block mb-2">🌱</span>
                      <strong className="block text-sm text-deep-espresso mb-1">3-4 years</strong>
                      <span className="text-xs text-deep-espresso/60">Early Pre-K</span>
                    </button>
                    
                    <button 
                      onClick={() => setAgeGroup('4-5')}
                      className={`text-left p-4 rounded-2xl border-2 transition ${ageGroup === '4-5' ? 'border-terracotta-500 bg-terracotta-50' : 'border-gray-100 bg-white hover:border-terracotta-200'}`}
                    >
                      <span className="text-2xl block mb-2">🌿</span>
                      <strong className="block text-sm text-deep-espresso mb-1">4-5 years</strong>
                      <span className="text-xs text-deep-espresso/60">Pre-K</span>
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setAgeGroup('mixed')}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition mb-8 ${ageGroup === 'mixed' ? 'border-terracotta-500 bg-terracotta-50' : 'border-gray-100 bg-white hover:border-terracotta-200'}`}
                  >
                    <span className="text-2xl block mb-2">🌳</span>
                    <strong className="block text-sm text-deep-espresso mb-1">Mixed ages (3-5)</strong>
                    <span className="text-xs text-deep-espresso/60">Multi-age classroom</span>
                  </button>

                  <div className="flex justify-between">
                    <button onClick={handleBack} className="flex items-center gap-1 text-sm text-deep-espresso/50 hover:text-deep-espresso transition font-medium">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handleNext} className="bg-deep-espresso text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* ------------ STEP 3: CADENCE ------------ */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-lexend font-semibold text-deep-espresso mb-2">How do you like to plan?</h2>
                  <p className="text-deep-espresso/60 text-sm mb-6">Choose the pacing that works for you.</p>
                  
                  <div className="space-y-3 mb-8">
                    <button 
                      onClick={() => setCadence('weekly')}
                      className={`w-full flex items-start text-left p-4 rounded-2xl border-2 transition gap-4 ${cadence === 'weekly' ? 'border-terracotta-500 bg-terracotta-50' : 'border-gray-100 bg-white hover:border-terracotta-200'}`}
                    >
                      <span className="text-2xl pt-1">📅</span>
                      <div>
                        <strong className="block text-base text-deep-espresso mb-1">Week by week</strong>
                        <span className="text-sm text-deep-espresso/70 leading-snug">Plan one week at a time. Great if you like to stay flexible and adjust as you go.</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setCadence('monthly')}
                      className={`w-full flex items-start text-left p-4 rounded-2xl border-2 transition gap-4 ${cadence === 'monthly' ? 'border-terracotta-500 bg-terracotta-50' : 'border-gray-100 bg-white hover:border-terracotta-200'}`}
                    >
                      <span className="text-2xl pt-1">🗓️</span>
                      <div>
                        <strong className="block text-base text-deep-espresso mb-1">A full month at a time</strong>
                        <span className="text-sm text-deep-espresso/70 leading-snug">Get the whole month ready in one go. Perfect if you like to see the big picture.</span>
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-between">
                    <button onClick={handleBack} className="flex items-center gap-1 text-sm text-deep-espresso/50 hover:text-deep-espresso transition font-medium">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handleNext} className="bg-deep-espresso text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* ------------ STEP 4: THEMES ------------ */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-lexend font-semibold text-deep-espresso mb-2">What will your classroom explore?</h2>
                  <p className="text-deep-espresso/60 text-sm mb-6">Pick a theme, or tell us your own.</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { emoji: '🌊', label: 'Ocean Explorers' },
                      { emoji: '🌱', label: 'Garden Scientists' },
                      { emoji: '🦋', label: 'Bugs & Butterflies' },
                      { emoji: '🏗️', label: 'Building & Making' },
                      { emoji: '🎨', label: 'Colors & Patterns' },
                    ].map(t => (
                      <button 
                        key={t.label}
                        onClick={() => { setIsCustomTheme(false); setTheme(t.label); }}
                        className={`text-left p-4 rounded-2xl border-2 transition ${!isCustomTheme && theme === t.label ? 'border-terracotta-500 bg-terracotta-50' : 'border-gray-100 bg-white hover:border-terracotta-200'}`}
                      >
                        <span className="text-2xl block mb-2">{t.emoji}</span>
                        <strong className="block text-sm text-deep-espresso">{t.label}</strong>
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => setIsCustomTheme(true)}
                      className={`text-left p-4 rounded-2xl border-2 transition ${isCustomTheme ? 'border-terracotta-500 bg-terracotta-50' : 'border-gray-100 bg-white hover:border-terracotta-200'}`}
                    >
                      <span className="text-2xl block mb-2">✨</span>
                      <strong className="block text-sm text-deep-espresso">My own idea...</strong>
                    </button>
                  </div>
                  
                  {isCustomTheme && (
                    <div className="mb-6 animate-fade-in">
                      <input 
                        type="text" 
                        value={customTheme}
                        onChange={(e) => setCustomTheme(e.target.value)}
                        placeholder="e.g. Dinosaurs, Our Community..."
                        className="w-full border border-terracotta-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <button onClick={handleBack} className="flex items-center gap-1 text-sm text-deep-espresso/50 hover:text-deep-espresso transition font-medium">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handleNext} disabled={isCustomTheme && !customTheme} className="bg-deep-espresso text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* ------------ STEP 5: PHILOSOPHY ------------ */}
              {step === 5 && (
                <div>
                  <h2 className="text-xl font-lexend font-semibold text-deep-espresso mb-2">How do you like to teach?</h2>
                  <p className="text-deep-espresso/60 text-sm mb-6">This helps us shape activities that feel right for your classroom.</p>
                  
                  <div className="space-y-3 mb-8">
                    {[
                      { id: 'montessori', emoji: '🧩', label: 'Montessori', desc: 'Child-led, hands-on, independent exploration' },
                      { id: 'reggio', emoji: '🎨', label: 'Reggio Emilia', desc: 'Project-based, creative, environment as teacher' },
                      { id: 'play-based', emoji: '🌈', label: 'Play-Based', desc: 'Learning through play, structured and free' },
                      { id: 'flexible', emoji: '🌿', label: 'I\'m flexible', desc: 'A balanced mix. Surprise me!' }
                    ].map(p => (
                      <button 
                        key={p.id}
                        onClick={() => setPhilosophy(p.id as any)}
                        className={`w-full flex items-center text-left p-3 sm:p-4 rounded-2xl border-2 transition gap-3 
                          ${philosophy === p.id ? 'border-terracotta-500 bg-terracotta-50' : 'border-gray-100 bg-white hover:border-terracotta-200'}`}
                      >
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <strong className="block text-sm text-deep-espresso">{p.label}</strong>
                          <span className="text-xs text-deep-espresso/60">{p.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button onClick={handleBack} className="flex items-center gap-1 text-sm text-deep-espresso/50 hover:text-deep-espresso transition font-medium">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => { handleNext(); generateAndFinish(); }} className="bg-terracotta-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-terracotta-600 transition flex items-center gap-2">
                       Let's build! <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ------------ STEP 6: GENERATING ------------ */}
              {step === 6 && (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-50 text-sage-600 mb-6 shadow-inner"
                  >
                    <Leaf className="w-10 h-10" strokeWidth={1.5} />
                  </motion.div>
                  
                  <h2 className="text-2xl font-lexend font-semibold text-deep-espresso mb-3">
                    Preparing your plan...
                  </h2>
                  <p className="text-deep-espresso/70 text-base mb-8">
                    Setting up <span className="font-semibold">{isCustomTheme ? customTheme : theme}</span> for your {ageGroup} year olds...
                  </p>

                  <div className="flex justify-center gap-2">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 rounded-full bg-sage-400" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 rounded-full bg-sage-400" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 rounded-full bg-sage-400" />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
