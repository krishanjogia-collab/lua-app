'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronUp, Edit3, Check, X,
  Eye, BookOpen, Activity, Heart, Globe, Users
} from 'lucide-react'
import type { DailyData, DayDomains } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const DOMAIN_KEYS = [
  'sensory_layout', 'cognitive_literacy', 'physical_outdoor',
  'social_emotional', 'cultural_global', 'parent_bridge',
] as const

const DOMAIN_LABELS: Record<string, string> = {
  sensory_layout:     'Sensory & Layout',
  cognitive_literacy: 'Cognitive & Literacy',
  physical_outdoor:   'Physical & Outdoor',
  social_emotional:   'Social-Emotional',
  cultural_global:    'Cultural & Global',
  parent_bridge:      'Parent Bridge',
}

const DOMAIN_ICONS = {
  sensory_layout:     Eye,
  cognitive_literacy: BookOpen,
  physical_outdoor:   Activity,
  social_emotional:   Heart,
  cultural_global:    Globe,
  parent_bridge:      Users,
}

interface DraftReviewProps {
  data:     DailyData
  planId:   string
  onChange: (data: DailyData) => void
}

export function DraftReview({ data, planId, onChange }: DraftReviewProps) {
  const [expandedDay,    setExpandedDay]    = useState<string | null>(data.days[0]?.date ?? null)
  const [editingField,   setEditingField]   = useState<{ date: string; domain: string; field: 'en' | 'pt' } | null>(null)
  const [editValue,      setEditValue]      = useState('')
  const [translating,    setTranslating]    = useState<string | null>(null)
  const [publishing,     setPublishing]     = useState(false)
  const [published,      setPublished]      = useState(false)
  const [error,          setError]          = useState<string | null>(null)

  function startEdit(date: string, domain: string, field: 'en' | 'pt', currentValue: string) {
    setEditingField({ date, domain, field })
    setEditValue(currentValue)
  }

  function saveEdit() {
    if (!editingField) return
    const { date, domain, field } = editingField

    const updatedDays = data.days.map(day => {
      if (day.date !== date) return day
      return {
        ...day,
        domains: {
          ...day.domains,
          [domain]: {
            ...(day.domains as DayDomains)[domain as keyof DayDomains],
            [field]: editValue,
          },
        },
      }
    })

    onChange({ ...data, days: updatedDays })
    setEditingField(null)
  }

  async function autoTranslate(date: string, domain: string, enText: string) {
    const key = `${date}-${domain}`
    setTranslating(key)
    setError(null)
    try {
      const res  = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: enText }),
      })
      if (!res.ok) throw new Error('Translation failed')
      const json = await res.json()
      if (json.translated) {
        const updatedDays = data.days.map(day => {
          if (day.date !== date) return day
          return {
            ...day,
            domains: {
              ...day.domains,
              [domain]: {
                ...(day.domains as DayDomains)[domain as keyof DayDomains],
                pt: json.translated,
              },
            },
          }
        })
        onChange({ ...data, days: updatedDays })
      }
    } catch {
      setError('Auto-translate failed. Please try again.')
    } finally {
      setTranslating(null)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    try {
      const res = await fetch('/api/publish', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId, dailyData: data }),
      })
      if (!res.ok) throw new Error('Publish failed')
      setPublished(true)
    } catch {
      setError('Failed to publish. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  if (published) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 rounded-3xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-sage-600" strokeWidth={1.5} />
        </div>
        <h2 className="font-lexend text-2xl font-semibold text-terracotta-900 mb-2">Published!</h2>
        <p className="text-sage-600 font-inter text-sm">
          Subscribers can now access this month&apos;s curriculum.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Publish bar */}
      <div className="sticky top-20 z-10 flex items-center justify-between bg-white/90 backdrop-blur-md rounded-3xl shadow-soft px-5 py-3.5 border border-cream-300">
        <div>
          <p className="font-lexend font-semibold text-terracotta-900 text-sm">
            {data.theme} — {data.month_year}
          </p>
          <p className="text-xs text-sage-500 font-inter">{data.days.length} days generated · Draft</p>
        </div>
        <Button onClick={handlePublish} loading={publishing} size="sm">
          Publish to Subscribers
        </Button>
      </div>

      {error && (
        <p className="text-xs text-dusty-rose-600 font-inter text-center px-2">
          {error}
        </p>
      )}

      {/* Day accordion */}
      {data.days.map((day, dayIdx) => (
        <div key={day.date} className="rounded-3xl border border-cream-400 bg-white shadow-soft overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream-50 transition"
            onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
          >
            <div className="text-left">
              <p className="font-lexend font-semibold text-terracotta-900 text-sm">
                Day {day.day_number} — {day.weekday}
              </p>
              <p className="text-xs text-sage-400 font-inter">{day.date}</p>
            </div>
            {expandedDay === day.date
              ? <ChevronUp className="w-4 h-4 text-sage-400" strokeWidth={1.5} />
              : <ChevronDown className="w-4 h-4 text-sage-400" strokeWidth={1.5} />
            }
          </button>

          <AnimatePresence initial={false}>
            {expandedDay === day.date && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4 border-t border-cream-200 pt-4">
                  {DOMAIN_KEYS.map(dKey => {
                    const domain = (day.domains as DayDomains)[dKey]
                    if (!domain) return null
                    const Icon          = DOMAIN_ICONS[dKey]
                    const isEditing     = editingField?.date === day.date && editingField?.domain === dKey
                    const isTranslating = translating === `${day.date}-${dKey}`

                    return (
                      <div key={dKey} className="rounded-2xl border border-cream-300 bg-cream-50 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-4 h-4 text-terracotta-400" strokeWidth={1.5} />
                          <span className="font-lexend font-semibold text-terracotta-900 text-xs uppercase tracking-wide">
                            {DOMAIN_LABELS[dKey]}
                          </span>
                          <span className="ml-auto text-xs text-sage-400 font-inter">{domain.title}</span>
                        </div>

                        {/* EN field */}
                        <FieldEditor
                          label="EN"
                          value={domain.en}
                          isEditing={isEditing && editingField?.field === 'en'}
                          editValue={editValue}
                          onEdit={v => startEdit(day.date, dKey, 'en', v)}
                          onSave={saveEdit}
                          onCancel={() => setEditingField(null)}
                          onEditValueChange={setEditValue}
                        />

                        {/* PT field */}
                        <FieldEditor
                          label="PT"
                          value={domain.pt}
                          isEditing={isEditing && editingField?.field === 'pt'}
                          editValue={editValue}
                          onEdit={v => startEdit(day.date, dKey, 'pt', v)}
                          onSave={saveEdit}
                          onCancel={() => setEditingField(null)}
                          onEditValueChange={setEditValue}
                          extra={
                            <button
                              className="text-xs text-sage-400 hover:text-sage-600 font-inter transition ml-1"
                              onClick={() => autoTranslate(day.date, dKey, domain.en)}
                              disabled={!!isTranslating}
                            >
                              {isTranslating ? 'Translating…' : 'Auto-translate'}
                            </button>
                          }
                        />
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

interface FieldEditorProps {
  label:              string
  value:              string
  isEditing:          boolean
  editValue:          string
  onEdit:             (current: string) => void
  onSave:             () => void
  onCancel:           () => void
  onEditValueChange:  (v: string) => void
  extra?:             React.ReactNode
}

function FieldEditor({ label, value, isEditing, editValue, onEdit, onSave, onCancel, onEditValueChange, extra }: FieldEditorProps) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs font-medium font-inter text-sage-500 uppercase">{label}</span>
        {extra}
        {!isEditing && (
          <button onClick={() => onEdit(value)} className="ml-auto text-sage-300 hover:text-terracotta transition">
            <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editValue}
            onChange={e => onEditValueChange(e.target.value)}
            rows={3}
            autoFocus
            className="w-full rounded-2xl border border-terracotta-200 bg-white text-sm text-terracotta-900 font-inter p-3 focus:outline-none focus:ring-2 focus:ring-terracotta-300 resize-none"
          />
          <div className="flex gap-2 mt-1.5">
            <button onClick={onSave} className="flex items-center gap-1 text-xs text-sage-600 hover:text-sage-800 font-inter transition">
              <Check className="w-3.5 h-3.5" strokeWidth={2} /> Save
            </button>
            <button onClick={onCancel} className="flex items-center gap-1 text-xs text-dusty-rose-400 hover:text-dusty-rose-600 font-inter transition">
              <X className="w-3.5 h-3.5" strokeWidth={2} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-terracotta-800 font-inter leading-relaxed">{value}</p>
      )}
    </div>
  )
}
