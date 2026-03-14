export type Language = 'en' | 'pt'
export type Philosophy = 'montessori' | 'reggio' | 'custom'
export type AssetType = 'Printable' | 'Signage' | 'Guide'

export interface DomainActivity {
  title: string
  description?: string                // 1-2 sentence overview for scanning
  steps?: string[]                    // Ordered activity steps
  materials?: (MaterialItem | string)[]
  duration?: {
    setup: string                    // "5 min"
    activity: string                 // "15-20 min"
    cleanup: string                  // "5 min"
  } | string                         // string is for legacy
  group_size?: string                 // "4-5 children" | "Whole class" | "Pairs"
  space?: 'indoor' | 'outdoor' | 'both'
  differentiation?: {
    easier: string                   // For younger 3s or children needing support
    harder: string                   // For school-ready 5s or advanced learners
  }
  safety_note?: string               // Allergy, choking, supervision warnings
  cleanup_protocol?: string          // "Wipe tables with sanitizing solution"
  transition_cue?: string            // "When the timer rings, we wash our hands for..."
  assessment_cue?: string            // "Watch for children who can sort by two attributes"
  vocabulary?: string[]               // Key English vocabulary for this activity
  home_extension?: string            // Suggested home activity (for parent_bridge domain)

  // Bilingual fields — only populated when educator has bilingual_mode enabled
  description_pt?: string
  steps_pt?: string[]
  vocabulary_pt?: string[]

  // Legacy fallback fields
  activity?: string
  en?: string
  pt?: string
}

export interface MaterialItem {
  item: string
  quantity?: string                  // "2 cups", "1 per child"
  substitute?: string               // "corn starch if wheat allergy"
}

export interface DayDomains {
  sensory_layout:     DomainActivity
  cognitive_literacy: DomainActivity
  physical_outdoor:   DomainActivity
  social_emotional:   DomainActivity
  cultural_global:    DomainActivity
  parent_bridge:      DomainActivity
}

export interface DailyEntry {
  date:       string   // ISO: "2024-03-04"
  weekday:    string   // "Monday"
  day_number: number
  domains:    DayDomains
}

export interface DailyData {
  philosophy: Philosophy
  theme:      string
  month_year: string
  days:       DailyEntry[]
}

export interface CurriculumPlan {
  id:           string
  month_year:   string   // "2024-03"
  theme_name:   string
  daily_data:   DailyData
  is_published: boolean
  created_at:   string
}

export interface Asset {
  id:         string
  plan_id:    string
  file_url:   string
  asset_type: AssetType
  title:      string
  created_at: string
}

export interface Profile {
  id:                        string
  email:                     string
  has_onboarded:             boolean
  active_subscription_month: string | null   // "2024-03"
  language_preference:       Language
  is_admin:                  boolean
  planning_cadence:          'weekly' | 'monthly'
  age_group:                 '3-4' | '4-5' | 'mixed'
  bilingual_mode?:           boolean
  secondary_language?:       'pt' | null
}

export interface CompletionRecord {
  id: string
  user_id: string
  plan_id: string
  date: string
  domains_completed: Record<string, boolean>
  created_at: string
  updated_at: string
}

export const DOMAIN_META: Record<keyof DayDomains, { label: string; labelPt: string; color: string; bg: string }> = {
  sensory_layout:    { label: 'Sensory & Layout',     labelPt: 'Sensorial & Ambiente',  color: 'text-terracotta-600', bg: 'bg-terracotta-50'  },
  cognitive_literacy:{ label: 'Cognitive & Literacy', labelPt: 'Cognição & Literacia',  color: 'text-sage-700',       bg: 'bg-sage-50'        },
  physical_outdoor:  { label: 'Physical & Outdoor',   labelPt: 'Físico & Ar Livre',     color: 'text-terracotta-700', bg: 'bg-terracotta-50'  },
  social_emotional:  { label: 'Social-Emotional',     labelPt: 'Sócio-Emocional',       color: 'text-terracotta-600', bg: 'bg-cream-300'      },
  cultural_global:   { label: 'Cultural & Global',    labelPt: 'Cultural & Global',     color: 'text-sage-600',       bg: 'bg-sage-50'        },
  parent_bridge:     { label: 'Parent Bridge',         labelPt: 'Ponte com os Pais',    color: 'text-terracotta-700', bg: 'bg-terracotta-50'  },
}

export function isRichActivity(a: any): boolean {
  return Array.isArray(a.steps) && a.steps.length > 0;
}

// Map legacy fields to new schema for rendering
export function getActivityDescription(a: any, lang: Language): string {
  if (isRichActivity(a)) {
    return lang === 'pt' && a.description_pt ? a.description_pt : a.description
  }
  // Legacy: fall back to en/pt fields
  return (lang === 'en' ? a.en : a.pt) || ''
}

export function getActivityDuration(a: any): string {
  if (typeof a.duration === 'object' && a.duration.activity) {
    const d = a.duration
    const parts = [d.setup, d.activity, d.cleanup].filter(Boolean)
    return parts.join(' + ')  // "5 min + 20 min + 10 min"
  }
  return a.duration || ''  // Legacy: plain string
}

export function getActivityMaterials(a: any): { item: string; quantity?: string; substitute?: string }[] {
  if (!a.materials?.length) return []
  if (typeof a.materials[0] === 'string') {
    // Legacy: string[] → MaterialItem[]
    return a.materials.map((m: string) => ({ item: m }))
  }
  return a.materials
}
