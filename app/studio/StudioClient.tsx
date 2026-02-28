'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles, CalendarRange, CheckCircle2, Clock, Plus, Sprout
} from 'lucide-react'
import { PhilosophyToggle } from '@/components/studio/PhilosophyToggle'
import { Button } from '@/components/ui/Button'
import { formatMonthYear } from '@/lib/utils'
import type { Philosophy } from '@/lib/types'

interface PlanSummary {
  id:           string
  month_year:   string
  theme_name:   string
  is_published: boolean
  created_at:   string
}

interface StudioClientProps {
  plans: PlanSummary[]
}

export function StudioClient({ plans }: StudioClientProps) {
  const router = useRouter()

  // Form state
  const [theme,       setTheme]       = useState('')
  const [monthYear,   setMonthYear]   = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [philosophy,  setPhilosophy]  = useState<Philosophy>('custom')
  const [generating,  setGenerating]  = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [showForm,    setShowForm]    = useState(plans.length === 0)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setError(null)

    try {
      const res  = await fetch('/api/generate-curriculum', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ theme, monthYear, philosophy }),
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Generation failed')

      router.push(`/studio/${json.planId}/review`)
    } catch (err) {
      setError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Studio header */}
      <div className="bg-white border-b border-cream-300 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta flex items-center justify-center shadow-soft">
              <Sprout className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-lexend font-semibold text-terracotta-900 text-lg leading-tight">Creator Studio</h1>
              <p className="text-xs text-sage-400 font-inter">AI Curriculum Engine</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(v => !v)}
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            New Plan
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar — Plans list */}
        <aside className="md:col-span-1 space-y-3">
          <h2 className="font-lexend font-semibold text-terracotta-800 text-sm mb-3 px-1">
            Curriculum Plans
          </h2>
          {plans.length === 0 && (
            <p className="text-sm text-sage-400 font-inter px-1">No plans yet. Generate your first one!</p>
          )}
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => router.push(`/studio/${plan.id}/review`)}
              className="w-full text-left rounded-3xl bg-white border border-cream-300 shadow-soft p-4 hover:border-terracotta-200 hover:shadow-soft-lg transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-lexend font-semibold text-terracotta-900 text-sm leading-tight">
                    {plan.theme_name}
                  </p>
                  <p className="text-xs text-sage-400 font-inter mt-0.5">
                    {formatMonthYear(plan.month_year)}
                  </p>
                </div>
                {plan.is_published ? (
                  <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                ) : (
                  <Clock className="w-4 h-4 text-dusty-rose-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                )}
              </div>
              <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-xl text-xs font-medium font-inter ${
                plan.is_published
                  ? 'bg-sage-100 text-sage-700'
                  : 'bg-dusty-rose-100 text-dusty-rose-600'
              }`}>
                {plan.is_published ? 'Published' : 'Draft'}
              </span>
            </button>
          ))}
        </aside>

        {/* Main — Generator form */}
        <main className="md:col-span-2">
          {showForm || plans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-soft p-7"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-terracotta-400" strokeWidth={1.5} />
                <h2 className="font-lexend font-semibold text-terracotta-900 text-lg">
                  Theme Orchestrator
                </h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                {/* Theme input */}
                <div>
                  <label className="block text-sm font-medium text-terracotta-800 font-inter mb-1.5">
                    Monthly Theme
                    <span className="text-sage-400 font-normal ml-2 text-xs">e.g. "Galactic Gardens", "Ocean Explorers"</span>
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                    required
                    placeholder="Enter your thematic concept…"
                    className="w-full px-4 py-3 rounded-3xl border border-cream-400 bg-cream-50 text-terracotta-900 placeholder-sage-300 focus:outline-none focus:ring-2 focus:ring-terracotta-300 font-inter text-sm transition"
                  />
                </div>

                {/* Month picker */}
                <div>
                  <label className="block text-sm font-medium text-terracotta-800 font-inter mb-1.5">
                    <CalendarRange className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={1.5} />
                    Target Month
                  </label>
                  <input
                    type="month"
                    value={monthYear}
                    onChange={e => setMonthYear(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-3xl border border-cream-400 bg-cream-50 text-terracotta-900 focus:outline-none focus:ring-2 focus:ring-terracotta-300 font-inter text-sm transition"
                  />
                </div>

                {/* Philosophy toggle */}
                <div>
                  <label className="block text-sm font-medium text-terracotta-800 font-inter mb-3">
                    Educational Philosophy
                  </label>
                  <PhilosophyToggle value={philosophy} onChange={setPhilosophy} />
                </div>

                {error && (
                  <div className="rounded-3xl bg-dusty-rose-50 border border-dusty-rose-200 px-4 py-3 text-sm text-dusty-rose-700 font-inter">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  loading={generating}
                  disabled={!theme}
                  size="lg"
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                  {generating ? 'Generating curriculum…' : 'Generate Monthly Curriculum'}
                </Button>

                {generating && (
                  <p className="text-center text-xs text-sage-400 font-inter">
                    Crafting {theme ? `"${theme}"` : 'your theme'} across all 6 developmental domains. This may take 30–60 seconds…
                  </p>
                )}
              </form>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 rounded-3xl border-2 border-dashed border-cream-400">
              <div className="text-center">
                <p className="text-sage-400 font-inter text-sm mb-3">Select a plan to review, or</p>
                <Button variant="ghost" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  Create new plan
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
