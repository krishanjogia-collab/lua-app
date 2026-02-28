export type Language = 'en' | 'pt'
export type Philosophy = 'montessori' | 'reggio' | 'custom'
export type AssetType = 'Printable' | 'Signage' | 'Guide'

export interface DomainActivity {
  title: string
  activity: string
  materials: string[]
  duration: string
  en: string
  pt: string
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
  active_subscription_month: string | null   // "2024-03"
  language_preference:       Language
  is_admin:                  boolean
}

export const DOMAIN_META: Record<keyof DayDomains, { label: string; labelPt: string; color: string; bg: string }> = {
  sensory_layout:    { label: 'Sensory & Layout',     labelPt: 'Sensorial & Ambiente',  color: 'text-dusty-rose-600', bg: 'bg-dusty-rose-50'  },
  cognitive_literacy:{ label: 'Cognitive & Literacy', labelPt: 'Cognição & Literacia',  color: 'text-sage-700',       bg: 'bg-sage-50'        },
  physical_outdoor:  { label: 'Physical & Outdoor',   labelPt: 'Físico & Ar Livre',     color: 'text-terracotta-700', bg: 'bg-terracotta-50'  },
  social_emotional:  { label: 'Social-Emotional',     labelPt: 'Sócio-Emocional',       color: 'text-terracotta-600', bg: 'bg-cream-300'      },
  cultural_global:   { label: 'Cultural & Global',    labelPt: 'Cultural & Global',     color: 'text-sage-600',       bg: 'bg-sage-50'        },
  parent_bridge:     { label: 'Parent Bridge',         labelPt: 'Ponte com os Pais',    color: 'text-dusty-rose-700', bg: 'bg-dusty-rose-50'  },
}
