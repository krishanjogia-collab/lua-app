'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, BookOpen, Layers, Users, Globe, Frame } from 'lucide-react'

// Replace PLACEHOLDER with a real published plan ID for the "See Example" link down the line
const MOCK_PREVIEW_LINK = '/preview/day/123/2026-03-14'

export default function LandingClient() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  }

  return (
    <div className="overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-32 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-terracotta-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-sage-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10" />

        <motion.div initial="hidden" animate="show" variants={staggerContainer} className="max-w-3xl">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 text-terracottaDark text-xs font-semibold uppercase tracking-wider mb-8 border border-cream-300 shadow-sm">
            <Sparkles className="w-3 h-3" /> Early Access Beta
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-lexend font-extrabold text-terracotta-900 leading-tight mb-8">
            Pre-K Curriculum <span className="text-terracotta">That Covers Every Area of Growth, Every Day.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl font-inter text-sage-700 leading-relaxed mb-10 max-w-2xl mx-auto">
            Created by an educator with 15+ years of experience across 3 continents. Plan a full month of play-based, classroom-ready activities in minutes, not hours.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-terracotta text-white font-semibold font-lexend text-lg hover:bg-terracotta-600 transition shadow-soft-lg hover:shadow-xl hover:-translate-y-1 transform duration-200">
              Get Started Free
            </a>
            <a href={MOCK_PREVIEW_LINK} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-terracotta-800 font-semibold font-lexend text-lg border-2 border-cream-300 hover:border-terracotta-300 hover:bg-cream-50 transition flex items-center justify-center gap-2 group shadow-sm">
              See an Example Day <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>
          </motion.div>

          {/* Differentiators */}
          <motion.div variants={fadeUp} className="mt-16 flex flex-wrap justify-center gap-6 text-sm font-medium font-inter text-sage-600">
            <div className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-terracotta-400" /> 6 Learning Areas Daily</div>
            <div className="flex items-center gap-1.5"><Frame className="w-4 h-4 text-terracotta-400" /> Print-Ready PDFs</div>
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-terracotta-400" /> Optional Bilingual (EN/PT)</div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-24 border-y border-cream-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-lexend font-bold text-terracottaDark mb-4">How it works</h2>
            <p className="text-sage-600 font-inter">Say goodbye to the Pinterest-to-Google-Docs pipeline. Lua Learn transforms your theme ideas into structured, actionable lesson plans.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-cream-50 p-8 rounded-3xl border border-cream-200 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold font-lexend text-terracotta mb-6 shadow-sm border border-cream-100">1</div>
              <h3 className="text-xl font-semibold font-lexend text-terracotta-900 mb-3">Choose Your Theme</h3>
              <p className="text-sm text-sage-600 font-inter leading-relaxed">Pick a monthly theme like "Ocean Explorers" or "Garden Scientists" along with your teaching philosophy.</p>
            </div>
            <div className="bg-cream-50 p-8 rounded-3xl border border-cream-200 flex flex-col items-center text-center shadow-sm relative md:-top-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold font-lexend text-terracotta mb-6 shadow-sm border border-cream-100">2</div>
              <h3 className="text-xl font-semibold font-lexend text-terracotta-900 mb-3">Your Curriculum Is Generated</h3>
              <p className="text-sm text-sage-600 font-inter leading-relaxed">Lua Learn creates a full month of daily activities across 6 areas of child development, with step-by-step instructions, materials lists, and differentiation tips.</p>
            </div>
            <div className="bg-cream-50 p-8 rounded-3xl border border-cream-200 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold font-lexend text-terracotta mb-6 shadow-sm border border-cream-100">3</div>
              <h3 className="text-xl font-semibold font-lexend text-terracotta-900 mb-3">Teach, Print, Share</h3>
              <p className="text-sm text-sage-600 font-inter leading-relaxed">View fluidly on your phone, print PDFs for the classroom wall, and share daily snippets with parents in one tap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Learning Areas */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-lexend font-bold text-terracotta-900 mb-4">Every day is balanced.</h2>
          <p className="text-sage-600 font-inter text-lg">Every single day touches all 6 areas of child development. You never have to wonder if your little learners are missing out.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-cream-100 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h4 className="font-lexend font-semibold text-terracottaDark">Sensory & Layout</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-cream-100 text-center">
            <div className="text-4xl mb-4">📖</div>
            <h4 className="font-lexend font-semibold text-terracottaDark">Cognitive & Literacy</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-cream-100 text-center">
            <div className="text-4xl mb-4">🏃</div>
            <h4 className="font-lexend font-semibold text-terracottaDark">Physical & Motor</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-cream-100 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h4 className="font-lexend font-semibold text-terracottaDark">Social & Creative</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-cream-100 text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h4 className="font-lexend font-semibold text-terracottaDark">Cultural Awareness</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-cream-100 text-center">
            <div className="text-4xl mb-4">👨‍👩‍👧</div>
            <h4 className="font-lexend font-semibold text-terracottaDark">Parent Bridge</h4>
          </div>
        </div>
      </section>

      {/* Target Audience / CTA Panel */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="bg-terracotta-900 rounded-3xl p-10 md:p-16 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta-800 rounded-full mix-blend-overlay filter blur-3xl opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-lexend font-bold text-cream mb-6">Built for Pre-K Educators Who Care</h2>
            <ul className="text-terracotta-100 font-inter text-left max-w-md mx-auto space-y-3 mb-10 text-lg">
              <li className="flex gap-3"><Check /> Home daycare providers planning solo</li>
              <li className="flex gap-3"><Check /> Lead teachers designing for their room</li>
              <li className="flex gap-3"><Check /> Educators wanting classroom-ready plans</li>
            </ul>
            <a href="/login" className="inline-block px-10 py-4 rounded-full bg-white text-terracotta-900 font-bold font-lexend text-lg hover:bg-cream-100 transition shadow-lg hover:-translate-y-1 transform duration-200">
              Join the Early Access Beta
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}

function Check() {
  return <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-terracotta-400 text-white flex items-center justify-center text-xs">✓</div>
}
