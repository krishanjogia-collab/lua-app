'use client'

import { cn } from '@/lib/utils'
import type { Philosophy } from '@/lib/types'

interface PhilosophyToggleProps {
  value:    Philosophy
  onChange: (v: Philosophy) => void
}

const OPTIONS: { value: Philosophy; label: string; description: string }[] = [
  {
    value:       'montessori',
    label:       'Montessori',
    description: 'Child-led exploration, uninterrupted work periods, intrinsic motivation.',
  },
  {
    value:       'reggio',
    label:       'Reggio Emilia',
    description: 'Environment as third teacher, expressive arts, emergent curriculum.',
  },
  {
    value:       'custom',
    label:       'Custom Signature',
    description: 'Our balanced blend of structured teaching and child-led discovery.',
  },
]

export function PhilosophyToggle({ value, onChange }: PhilosophyToggleProps) {
  return (
    <div role="radiogroup" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'text-left p-4 rounded-3xl border transition-all duration-200',
            value === opt.value
              ? 'border-terracotta-300 bg-terracotta-50 shadow-soft'
              : 'border-cream-400 bg-white hover:border-terracotta-200 hover:bg-terracotta-50/50'
          )}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn(
              'w-4 h-4 rounded-full border-2 flex-shrink-0 transition',
              value === opt.value
                ? 'border-terracotta bg-terracotta'
                : 'border-sage-300 bg-white'
            )} />
            <span className={cn(
              'font-lexend font-semibold text-sm',
              value === opt.value ? 'text-terracotta-800' : 'text-terracotta-900'
            )}>
              {opt.label}
            </span>
          </div>
          <p className="text-xs text-sage-600 font-inter leading-relaxed pl-6">
            {opt.description}
          </p>
        </button>
      ))}
    </div>
  )
}
