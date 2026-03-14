'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, BookOpen, Activity, Heart, Globe, Users,
  Clock, Package, Check, ChevronDown, ListChecks, AlertTriangle
} from 'lucide-react'
import { 
  DomainActivity, 
  Language, 
  isRichActivity, 
  getActivityDescription, 
  getActivityDuration, 
  getActivityMaterials 
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { toggleDomainCompletion } from '@/app/actions/gamification'

const DOMAIN_ICONS = {
  sensory_layout:     Eye,
  cognitive_literacy: BookOpen,
  physical_outdoor:   Activity,
  social_emotional:   Heart,
  cultural_global:    Globe,
  parent_bridge:      Users,
}

const DOMAIN_COLORS = {
  sensory_layout:     { border: 'border-terracotta-200', bg: 'bg-terracotta-50',  icon: 'text-terracotta-500',  badge: 'bg-terracotta-100 text-terracotta-700' },
  cognitive_literacy: { border: 'border-sage-200',       bg: 'bg-sage-50',        icon: 'text-sage-600',        badge: 'bg-sage-100 text-sage-700'             },
  physical_outdoor:   { border: 'border-terracotta-200', bg: 'bg-terracotta-50',  icon: 'text-terracotta-500',  badge: 'bg-terracotta-100 text-terracotta-700' },
  social_emotional:   { border: 'border-cream-200',      bg: 'bg-cream-50',       icon: 'text-terracotta-600',  badge: 'bg-cream-400 text-terracotta-700'      },
  cultural_global:    { border: 'border-sage-300',       bg: 'bg-sage-50',        icon: 'text-sage-700',        badge: 'bg-sage-100 text-sage-700'             },
  parent_bridge:      { border: 'border-terracotta-300', bg: 'bg-terracotta-50',  icon: 'text-terracotta-600',  badge: 'bg-terracotta-100 text-terracotta-700' },
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
  planId?:   string
  date?:     string
  initialCompleted?: boolean
}

export function DailyFlowCard({ domainKey, domain, lang, index, planId, date, initialCompleted = false }: DailyFlowCardProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPT, setShowPT] = useState(false)

  const Icon   = DOMAIN_ICONS[domainKey]
  const colors = DOMAIN_COLORS[domainKey]
  const label  = lang === 'en' ? DOMAIN_LABELS_EN[domainKey] : DOMAIN_LABELS_PT[domainKey]
  
  const isRich = isRichActivity(domain)
  const description = getActivityDescription(domain, lang)
  const duration = getActivityDuration(domain)
  const materials = getActivityMaterials(domain)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      className={cn(
        'rounded-[2rem] border p-6 shadow-soft flex flex-col transition-colors duration-500',
        colors.border, 
        isCompleted ? 'bg-white/60 border-sage-200/50' : colors.bg
      )}
    >
      <motion.div 
        animate={{ opacity: isCompleted ? 0.6 : 1 }} 
        transition={{ duration: 0.4 }}
        className="flex-1"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0 transition-colors duration-500',
              isCompleted ? 'bg-sage-50' : 'bg-white'
            )}>
              <Icon className={cn('w-6 h-6', colors.icon)} strokeWidth={1.5} />
            </div>
            <div>
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase font-inter mb-1', colors.badge)}>
                {label}
              </span>
              <h3 className="font-lexend font-bold text-[#5C2D26] text-lg leading-tight">
                {domain.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Description (Scanning Mode) */}
        <p className="text-sm text-terracotta-800 font-inter leading-relaxed mb-4">
          {description}
          {!isRich && showPT && domain.description_pt && (
            <span className="block mt-2 text-sage-700 italic">{domain.description_pt}</span>
          )}
        </p>

        {/* Core Badges (Always visible on rich cards) */}
        {isRich && (
          <div className="flex flex-wrap gap-2 mb-4">
            {duration && (
              <span className="flex items-center gap-1.5 bg-terracotta-50 text-terracotta-700 rounded-full px-3 py-1 text-xs font-inter font-semibold border border-terracotta-100">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                {duration}
              </span>
            )}
            {domain.group_size && (
              <span className="flex items-center gap-1.5 bg-sage-50 text-sage-700 rounded-full px-3 py-1 text-xs font-inter font-semibold border border-sage-100">
                <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                {domain.group_size}
              </span>
            )}
            {domain.space && (
              <span className="flex items-center gap-1.5 bg-cream-200 text-[#5C2D26] rounded-full px-3 py-1 text-xs font-inter font-semibold border border-cream-300">
                <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="capitalize">{domain.space}</span>
              </span>
            )}
          </div>
        )}

        {/* Expand Action for Rich Cards */}
        {isRich && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-sm text-terracotta-600 font-semibold hover:text-terracotta-800 w-full mb-1 transition-colors"
          >
            {isExpanded ? (lang === 'en' ? 'Show less' : 'Mostrar menos') : (lang === 'en' ? 'Show full activity' : 'Ver atividade completa')}
            <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isExpanded && "rotate-180")} strokeWidth={2} />
          </button>
        )}

        {/* Legacy Fallback Materials */}
        {!isRich && materials.length > 0 && (
          <div className="flex items-start gap-2 mb-4">
            <Package className="w-3.5 h-3.5 text-sage-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div className="flex flex-wrap gap-1.5">
              {materials.map((m, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-xl bg-white/70 text-xs text-sage-700 font-inter border border-white/80">
                  {m.item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* EXPANDED STATE (Rich Data) */}
        <AnimatePresence>
          {isRich && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-cream-200 space-y-6">
                
                {/* Translator Toggle */}
                {(domain.description_pt || domain.steps_pt) && (
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setShowPT(!showPT)}
                      className="text-[11px] font-bold uppercase tracking-wide text-sage-600 flex items-center gap-1.5 bg-sage-50 border border-sage-100 px-3 py-1.5 rounded-full hover:bg-sage-100 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" strokeWidth={2} />
                      {showPT ? (lang === 'en' ? 'Hide Portuguese' : 'Ocultar Português') : (lang === 'en' ? 'Show Portuguese' : 'Mostrar Português')}
                    </button>
                  </div>
                )}

                {/* Safety Note */}
                {domain.safety_note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 text-sm font-inter items-start shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="font-medium leading-relaxed">{domain.safety_note}</p>
                  </div>
                )}

                {/* Extended Durations */}
                {typeof domain.duration === 'object' && (
                  <div className="flex bg-white rounded-2xl border border-cream-200 divide-x divide-cream-200 overflow-hidden shadow-sm">
                    {['setup', 'activity', 'cleanup'].map((key) => {
                      const val = (domain.duration as any)[key]
                      if (!val) return null
                      return (
                        <div key={key} className="flex-1 p-3 text-center">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-sage-500 mb-0.5">{key}</div>
                          <div className="text-sm font-semibold text-[#5C2D26]">{val}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Steps */}
                {domain.steps && domain.steps.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-lexend font-bold text-sm text-[#5C2D26] flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-terracotta-500" strokeWidth={2} />
                      {lang === 'en' ? 'Step by Step' : 'Passo a Passo'}
                    </h4>
                    <div className="space-y-3">
                      {domain.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 text-sm text-terracotta-800 font-inter">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cream-200 text-[#5C2D26] flex items-center justify-center text-xs font-bold mt-0.5 border border-cream-300">
                            {i + 1}
                          </span>
                          <div className="pt-0.5 leading-relaxed">
                            <p>{step}</p>
                            {showPT && domain.steps_pt?.[i] && (
                              <p className="text-sage-700 mt-1.5 italic font-medium">{domain.steps_pt[i]}</p>   
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials List */}
                {materials && materials.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-lexend font-bold text-sm text-[#5C2D26] flex items-center gap-2">
                      <Package className="w-4 h-4 text-terracotta-500" strokeWidth={2} />
                      {lang === 'en' ? 'Required Materials' : 'Materiais Necessários'}
                    </h4>
                    <div className="bg-white rounded-2xl p-4 border border-cream-200 space-y-3 shadow-sm">
                      {materials.map((m, i) => (
                        <div key={i} className="flex justify-between items-start text-sm border-b border-cream-100 last:border-0 pb-3 last:pb-0">
                          <div className="text-[#5C2D26] font-semibold pr-4 font-inter leading-tight">{m.item}</div>
                          <div className="text-right text-sage-600 flex-shrink-0 max-w-[50%]">
                            {m.quantity && <div className="font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded-lg inline-block text-xs mb-1">{m.quantity}</div>}
                            {m.substitute && <div className="text-[11px] leading-tight flex items-center gap-1 justify-end"><span className="text-sage-400 font-medium">Sub:</span> <span className="italic">{m.substitute}</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Differentiation */}
                {domain.differentiation && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {domain.differentiation.easier && (
                      <div className="bg-sage-50/70 p-4 rounded-2xl border border-sage-100 shadow-sm">
                        <div className="text-[10px] font-bold text-sage-600 uppercase tracking-widest mb-1.5">
                          {lang === 'en' ? 'Make it easier' : 'Tornar mais fácil'}
                        </div>
                        <p className="text-sm font-inter text-sage-800 leading-relaxed font-medium">{domain.differentiation.easier}</p>
                      </div>
                    )}
                    {domain.differentiation.harder && (
                      <div className="bg-terracotta-50/70 p-4 rounded-2xl border border-terracotta-100 shadow-sm">
                        <div className="text-[10px] font-bold text-terracotta-600 uppercase tracking-widest mb-1.5">
                          {lang === 'en' ? 'Make it harder' : 'Tornar mais difícil'}
                        </div>
                        <p className="text-sm font-inter text-terracotta-800 leading-relaxed font-medium">{domain.differentiation.harder}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Transition & Cleanup */}
                {(domain.cleanup_protocol || domain.transition_cue) && (
                  <div className="space-y-4">
                    {domain.transition_cue && (
                      <div className="bg-white border-l-[3px] border-sage-400 pl-4 py-3 rounded-r-xl shadow-sm italic text-sm text-sage-800 font-medium leading-relaxed">
                        &quot;{domain.transition_cue}&quot;
                      </div>
                    )}
                    {domain.cleanup_protocol && (
                      <div className="text-sm leading-relaxed border border-cream-200 p-4 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm">
                        <span className="font-bold text-[#5C2D26] block mb-1 text-xs uppercase tracking-wider">{lang === 'en' ? 'Cleanup Protocol' : 'Protocolo de Limpeza'}</span>
                        <span className="text-terracotta-800 font-medium font-inter">{domain.cleanup_protocol}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Assessment Cue */}
                {domain.assessment_cue && (
                  <div className="text-sm bg-sky-50 text-sky-900 rounded-2xl p-4 border border-sky-100 shadow-sm leading-relaxed">
                    <span className="font-bold text-[10px] tracking-wider uppercase text-sky-700 block mb-1.5 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Observation Cue' : 'Dica de Observação'}
                    </span>
                    <span className="font-medium">{domain.assessment_cue}</span>
                  </div>
                )}

                {/* Vocabulary */}
                {domain.vocabulary && domain.vocabulary.length > 0 && (
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      {domain.vocabulary.map((v, i) => (
                        <span key={i} className="bg-white text-[#5C2D26] rounded-full px-3 py-1.5 text-xs font-inter font-bold border border-cream-300 shadow-sm">
                          {v}
                          {showPT && domain.vocabulary_pt?.[i] && (
                            <span className="text-sage-500 ml-1 font-medium">/ {domain.vocabulary_pt[i]}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Gamification Action (Always visible, pinned to bottom) */}
      <div className="pt-5 border-t border-black/5 mt-5">
        <button
          onClick={async () => {
            const nextState = !isCompleted
            setIsCompleted(nextState)
            try {
              if (planId && date) {
                await toggleDomainCompletion(planId, date, domainKey, nextState)
              }
            } catch (err) {
              console.error('Failed to save completion state:', err)
              setIsCompleted(!nextState) // revert on failure
            }
          }}
          className={cn(
            "flex items-center justify-center gap-2.5 text-sm font-lexend font-bold transition-all w-full py-3 rounded-2xl",
            isCompleted 
              ? `bg-white/50 border border-sage-200 text-${colors.icon.replace('text-', '')} shadow-sm` 
              : "bg-white border border-cream-200 text-[#5C2D26] shadow-soft hover:shadow-soft-lg hover:border-cream-300 hover:bg-cream-50"
          )}
        >
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            isCompleted 
              ? `border-${colors.icon.replace('text-', '')} bg-${colors.icon.replace('text-', '')}` 
              : "border-sage-300"
          )}>
            {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          {lang === 'en' 
            ? (isCompleted ? "Marked as complete" : "Mark as complete") 
            : (isCompleted ? "Marcado como concluído" : "Marcar como concluído")}
        </button>
      </div>
    </motion.div>
  )
}

