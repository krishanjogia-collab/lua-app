import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format "2024-03" → "March 2024" */
export function formatMonthYear(monthYear: string, lang: 'en' | 'pt' = 'en'): string {
  const [year, month] = monthYear.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/** Format ISO date "2024-03-04" → "Monday, March 4" */
export function formatDate(iso: string, lang: 'en' | 'pt' = 'en'): string {
  const date = new Date(iso + 'T12:00:00')
  return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/** Get ISO date string for today */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/** Get current month_year string "2024-03" */
export function currentMonthYear(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** Generate all weekday dates for a month */
export function getWeekdaysInMonth(monthYear: string): string[] {
  const [year, month] = monthYear.split('-').map(Number)
  const dates: string[] = []
  const lastDay = new Date(year, month, 0).getDate()
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d)
    const dow = date.getDay()
    if (dow !== 0 && dow !== 6) {
      dates.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }
  }
  return dates
}

/** Capitalize first letter */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
