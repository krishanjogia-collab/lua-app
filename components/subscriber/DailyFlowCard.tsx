'use client'

import { motion } from 'framer-motion'
import {
  Eye, BookOpen, Activity, Heart, Globe, Users,
  Clock, Package
} from 'lucide-react'
import type { DomainActivity } from '@/lib/types'
import type { Language } from '@/lib/types'
import { cn } from '@/lib/utils'

const DOMAIN_ICONS = {
  sensory_layout:     Eye,
  cognitive_literacy: BookOpen,
  physical_outdoor:   Activity,
  social_emotional:   Heart,
  cultural_global:    Globe,
  parent_bridge:      Users,
}

const DOMAIN_COLORS = {
  sensory_layout:     { border: 'border-dusty-rose-200', bg: 'bg-dusty-rose-50',  icon: 'text-dusty-rose-500',  badge: 'bg-dusty-rose-100 text-dusty-rose-700' },
  cognitive_literacy: { border: 'border-sage-200',       bg: 'bg-sage-50',        icon: 'text-sage-600',        badge: 'bg-sage-100 text-sage-700'             },
  physical_outdoor:   { border: 'border-terracotta-200', bg: 'bg-terracotta-50',  icon: 'text-terracotta-500',  badge: 'bg-terracotta-100 text-terracotta-700' },
  social_emotional:   { border: 'border-cream-200',      bg: 'bg-cream-50',       icon: 'text-terracotta-600',  badge: 'bg-cream-400 text-terracotta-700'      },
  cultural_global:    { border: 'border-sage-300',       bg: 'bg-sage-50',        icon: 'text-sage-700',        badge: 'bg-sage-100 text-sage-700'             },
  parent_bridge:      { border: 'border-dusty-rose-300', bg: 'bg-dusty-rose-50',  icon: 'text-dusty-rose-600',  badge: 'bg-dusty-rose-100 text-dusty-rose-700' },
}

const DOMAIN_LABELS_EN = {
  sensory_layout:     'Sensory & Layout',
  cognitive_literacy: 'Cognitive & Literacy',
  physical_outdoor:   'Physical & Outdoor',
  social_emotional:   'Social-Emotional',
  cultural_global:    'Cultural & Global',
  parent_bridge:      'Parent Bridge',
}

const DOMAIN_LABELS_PT = {
  sensory_layout:     'Sensorial & Ambiente',
  cognitive_literacy: 'Cognição & Literacia',
  physical_outdoor:   'Físico & Ar Livre',
  social_emotional:   'Sócio-Emocional',
  cultural_global:    'Cultural & Global',
  parent_bridge:      'Ponte com os Pais',
}

interface DailyFlowCardProps {
  domainKey: keyof typeof DOMAIN_ICONS
  domain:    DomainActivity
  lang:      Language
  index:     number
}

export function DailyFlowCard({ domainKey, domain, lang, index }: DailyFlowCardProps) {
  const Icon   = DOMAIN_ICONS[domainKey]
  const colors = DOMAIN_COLORS[domainKey]
  const label  = lang === 'en' ? DOMAIN_LABELS_EN[domainKey] : DOMAIN_LABELS_PT[domainKey]
  const text   = lang === 'en' ? domain.en : domain.pt

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      className={cn(
        'rounded-3xl border p-5 shadow-soft',
        colors.border, colors.bg
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-soft flex-shrink-0')}>
            <Icon className={cn('w-5 h-5', colors.icon)} strokeWidth={1.5} />
          </div>
          <div>
            <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-medium font-inter mb-1', colors.badge)}>
              {label}
            </span>
            <h3 className="font-lexend font-semibold text-terracotta-900 text-base leading-tight">
              {domain.title}
            </h3>
          </div>
        </div>
        {domain.duration && (
          <div className="flex items-center gap-1 text-xs text-sage-500 font-inter flex-shrink-0 mt-1">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
            {domain.duration}
          </div>
        )}
      </div>

      {/* Body text */}
      <p className="text-sm text-terracotta-800 font-inter leading-relaxed mb-4">
        {text}
      </p>

      {/* Materials */}
      {domain.materials && domain.materials.length > 0 && (
        <div className="flex items-start gap-2">
          <Package className="w-3.5 h-3.5 text-sage-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <div className="flex flex-wrap gap-1.5">
            {domain.materials.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-0.5 rounded-xl bg-white/70 text-xs text-sage-700 font-inter border border-white/80"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
