'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles, CalendarRange, CheckCircle2, Clock, Plus, Sprout, EyeOff, Trash2, AlertTriangle, Loader2
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
  
  // Optimistic UI state
  const [localPlans,  setLocalPlans]  = useState(plans)
  const [showForm,    setShowForm]    = useState(plans.length === 0)

  const [activePlan, setActivePlan]   = useState<PlanSummary | null>(null)
  const [actionType, setActionType]   = useState<'unpublish' | 'delete' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Overwrite safeguard state
  const [overwriteWarning, setOverwriteWarning] = useState<PlanSummary | null>(null)

  async function confirmAction() {
    if (!activePlan || !actionType) return
    setActionLoading(true)

    try {
      const endpoint = actionType === 'unpublish' ? '/api/unpublish' : '/api/delete-plan'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: activePlan.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Failed to ${actionType}`)

      // Refresh page to reflect state changes on server
      router.refresh()
      
      // Optimistic UI update
      if (actionType === 'delete') {
        setLocalPlans(prev => prev.filter(p => p.id !== activePlan.id))
        if (localPlans.length <= 1) setShowForm(true)
      } else if (actionType === 'unpublish') {
        setLocalPlans(prev => prev.map(p => 
          p.id === activePlan.id ? { ...p, is_published: false } : p
        ))
      }

    } catch (err) {
      alert(String(err))
    } finally {
      setActionLoading(false)
      setActivePlan(null)
      setActionType(null)
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    
    // Check if target month is already occupied
    const existing = localPlans.find(p => p.month_year === monthYear)
    if (existing) {
      setOverwriteWarning(existing)
      return
    }

    await executeGeneration()
  }

  async function executeGeneration(confirmOverwrite = false) {
    setOverwriteWarning(null)
    setGenerating(true)
    setError(null)

    try {
      const res  = await fetch('/api/generate-curriculum', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ theme, monthYear, philosophy, confirmOverwrite }),
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
              <p className="text-xs text-sage-400 font-inter">Expert Curriculum Engine</p>
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
          {localPlans.length === 0 && (
            <p className="text-sm text-sage-400 font-inter px-1">No plans yet. Generate your first one!</p>
          )}
          {localPlans.map(plan => (
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
                  <Clock className="w-4 h-4 text-terracotta-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-medium font-inter ${
                  plan.is_published
                    ? 'bg-sage-100 text-sage-700'
                    : 'bg-terracotta-100 text-terracotta-600'
                }`}>
                  {plan.is_published ? 'Published' : 'Draft'}
                </span>

                <div className="flex items-center gap-1">
                  {plan.is_published ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActivePlan(plan)
                        setActionType('unpublish')
                      }}
                      title="Unpublish"
                      className="p-1.5 text-sage-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActivePlan(plan)
                        setActionType('delete')
                      }}
                      title="Delete Draft"
                      className="p-1.5 text-terracotta-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </button>
          ))}
        </aside>

        {/* Main — Generator form */}
        <main className="md:col-span-2">
          {showForm || localPlans.length === 0 ? (
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

                {/* Custom Month Picker */}
                <div>
                  <label className="block text-sm font-medium text-terracotta-800 font-inter mb-1.5">
                    <CalendarRange className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={1.5} />
                    Target Month
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={monthYear.split('-')[1]}
                      onChange={e => setMonthYear(`${monthYear.split('-')[0]}-${e.target.value}`)}
                      className="flex-1 px-4 py-3 rounded-3xl border border-cream-400 bg-cream-50 text-terracotta-900 focus:outline-none focus:ring-2 focus:ring-terracotta-300 font-inter text-sm transition appearance-none"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i + 1).padStart(2, '0')
                        const name = new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
                        
                        const targetMonthYear = `${monthYear.split('-')[0]}-${m}`
                        const existing = localPlans.find(p => p.month_year === targetMonthYear)
                        
                        let indicator = ''
                        if (existing) {
                          indicator = existing.is_published ? ' ● (Published)' : ' ● (Draft)'
                        }

                        return <option key={m} value={m}>{name}{indicator}</option>
                      })}
                    </select>
                    <select
                      value={monthYear.split('-')[0]}
                      onChange={e => setMonthYear(`${e.target.value}-${monthYear.split('-')[1]}`)}
                      className="w-32 px-4 py-3 rounded-3xl border border-cream-400 bg-cream-50 text-terracotta-900 focus:outline-none focus:ring-2 focus:ring-terracotta-300 font-inter text-sm transition appearance-none"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const y = new Date().getFullYear() + i
                        return <option key={y} value={y}>{y}</option>
                      })}
                    </select>
                  </div>
                </div>

                {/* Philosophy toggle */}
                <div>
                  <label className="block text-sm font-medium text-terracotta-800 font-inter mb-3">
                    Educational Philosophy
                  </label>
                  <PhilosophyToggle value={philosophy} onChange={setPhilosophy} />
                </div>

                {error && (
                  <div className="rounded-3xl bg-terracotta-50 border border-terracotta-200 px-4 py-3 text-sm text-terracotta-700 font-inter">
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

      {/* Confirmation Modal */}
      {activePlan && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-soft-xl"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${actionType === 'delete' ? 'bg-rose-100' : 'bg-amber-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${actionType === 'delete' ? 'text-rose-600' : 'text-amber-600'}`} strokeWidth={1.5} />
            </div>
            
            <h3 className="font-lexend font-bold text-lg text-terracotta-900 mb-2">
              {actionType === 'unpublish' ? 'Unpublish Plan?' : 'Delete Draft?'}
            </h3>
            
            <p className="font-inter text-sage-600 text-sm mb-6 leading-relaxed">
              {actionType === 'unpublish' 
                ? "This will remove the plan from subscribers' view and move it back to your drafts."
                : "This draft plan will be permanently deleted from the database. This action cannot be undone."}
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setActivePlan(null)
                  setActionType(null)
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={actionLoading}
                className={`flex-1 ${actionType === 'delete' ? 'bg-rose-600 hover:bg-rose-700 text-white border-0' : 'bg-amber-500 hover:bg-amber-600 text-white border-0'}`}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : actionType === 'unpublish' ? 'Unpublish' : 'Delete'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Overwrite Safeguard Modal */}
      {overwriteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-soft-xl"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${overwriteWarning.is_published ? 'bg-rose-100' : 'bg-amber-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${overwriteWarning.is_published ? 'text-rose-600' : 'text-amber-600'}`} strokeWidth={1.5} />
            </div>
            
            <h3 className="font-lexend font-bold text-lg text-terracotta-900 mb-2">
              Overwrite Plan?
            </h3>
            
            <p className="font-inter text-sage-600 text-sm mb-6 leading-relaxed">
              {overwriteWarning.is_published 
                ? `${formatMonthYear(overwriteWarning.month_year)} is currently published and visible to subscribers. Generating will replace it with a new draft. Subscribers will lose access until you re-publish.`
                : `You already have a draft for ${formatMonthYear(overwriteWarning.month_year)} ('${overwriteWarning.theme_name}'). Generating will replace it with a new plan.`}
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setOverwriteWarning(null)}
                disabled={generating}
              >
                Cancel
              </Button>
              <Button
                onClick={() => executeGeneration(true)}
                disabled={generating}
                className={`flex-1 ${overwriteWarning.is_published ? 'bg-rose-600 hover:bg-rose-700 text-white border-0' : 'bg-amber-500 hover:bg-amber-600 text-white border-0'}`}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : 'Generate Anyway'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
