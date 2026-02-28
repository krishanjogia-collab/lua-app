import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Philosophy, DailyData, DomainActivity } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ── Philosophy descriptions ───────────────────────────────────────────────────
const PHILOSOPHY_DESCRIPTIONS: Record<Philosophy, string> = {
  montessori: 'Montessori methodology — child-led exploration, hands-on materials, uninterrupted work periods, mixed-age collaboration, intrinsic motivation over praise.',
  reggio:     'Reggio Emilia approach — environment as third teacher, project-based documentation, expressive arts integration, community relationships, emergent curriculum.',
  custom:     'Signature approach — balanced blend of structured intentional teaching and child-led discovery. Nurturing, professional tone. Emphasis on joy, curiosity, and mastery.',
}

// ── Domain keys ───────────────────────────────────────────────────────────────
const DOMAIN_KEYS = [
  'sensory_layout',
  'cognitive_literacy',
  'physical_outdoor',
  'social_emotional',
  'cultural_global',
  'parent_bridge',
] as const

type DomainKey = typeof DOMAIN_KEYS[number]

// ── Specialist domain prompts ─────────────────────────────────────────────────
const DOMAIN_PROMPTS: Record<DomainKey, string> = {
  sensory_layout:     'You are a Sensory Environment Design Specialist for Pre-K education (ages 3–5). Design rich tactile environment setups and sensory station activities. Focus on physical space arrangement, materials selection, and multi-sensory engagement.',
  cognitive_literacy: 'You are a Cognitive and Literacy Development Specialist for Pre-K education (ages 3–5). Design age-appropriate literacy, early numeracy, vocabulary building, and critical thinking activities.',
  physical_outdoor:   'You are a Physical Development and Outdoor Learning Specialist for Pre-K education (ages 3–5). Design gross motor, nature-based, and outdoor exploration activities that are safe and developmentally joyful.',
  social_emotional:   'You are a Social-Emotional Learning Specialist for Pre-K education (ages 3–5). Design group play, self-regulation, empathy-building, and conflict resolution activities.',
  cultural_global:    'You are a Cultural and Global Awareness Specialist for Pre-K education (ages 3–5). Design activities celebrating diverse cultures, global perspectives, and world events in an age-appropriate, joyful way.',
  parent_bridge:      'You are a Family Engagement Specialist for Pre-K education. Write warm, clear parent communication messages (2–3 sentences each) explaining the day\'s learning goals and how families can extend learning at home.',
}

// ── Director Agent ────────────────────────────────────────────────────────────
async function runDirectorAgent(
  theme: string,
  monthYear: string,
  philosophy: Philosophy,
  weekdays: { date: string; weekday: string }[]
): Promise<{ date: string; sub_theme: string }[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature:      0.9,
    },
  })

  const prompt = `You are the Director Agent for a Pre-K Curriculum Engine.
Create a monthly narrative roadmap for this curriculum.

THEME: "${theme}"
MONTH/YEAR: ${monthYear}
EDUCATIONAL PHILOSOPHY: ${PHILOSOPHY_DESCRIPTIONS[philosophy]}

Map each school day to a specific sub-theme that builds a coherent narrative arc across the month.
Sub-themes should progressively deepen the main theme with age-appropriate angles for Pre-K (ages 3–5).

School days:
${weekdays.map(d => `${d.date} (${d.weekday})`).join('\n')}

RETURN: ONLY valid JSON. No markdown, no code fences.
{
  "roadmap": [
    { "date": "YYYY-MM-DD", "sub_theme": "descriptive sub-theme" }
  ]
}`

  const result = await model.generateContent(prompt)
  const text   = result.response.text()
  const data   = JSON.parse(text) as { roadmap: { date: string; sub_theme: string }[] }
  return data.roadmap
}

// ── Specialist Domain Agent ───────────────────────────────────────────────────
async function runSpecialistAgent(
  domain: DomainKey,
  theme: string,
  philosophy: Philosophy,
  roadmap: { date: string; sub_theme: string }[]
): Promise<(DomainActivity & { date: string })[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature:      0.85,
    },
  })

  const prompt = `${DOMAIN_PROMPTS[domain]}

MONTHLY THEME: "${theme}"
EDUCATIONAL PHILOSOPHY: ${PHILOSOPHY_DESCRIPTIONS[philosophy]}

Generate ONE activity per school day for your specific developmental domain, aligned to each day's sub-theme.

CRITICAL REQUIREMENTS:
- Every activity must include BOTH language fields:
  "en": Full narrative description in English (2–4 sentences, warm educator tone)
  "pt": Natural, fluent Brazilian Portuguese translation — NOT literal, culturally appropriate
- Activities must be developmentally appropriate for Pre-K (ages 3–5)
- Materials must be simple, widely available classroom items
- Durations realistic for Pre-K attention spans (15–30 minutes)
- Weave the main theme "${theme}" naturally into each activity

Daily roadmap:
${roadmap.map(d => `${d.date}: ${d.sub_theme}`).join('\n')}

RETURN: ONLY valid JSON. No markdown, no code fences.
{
  "activities": [
    {
      "date": "YYYY-MM-DD",
      "title": "Short engaging title",
      "activity": "Detailed educator instructions",
      "materials": ["item1", "item2"],
      "duration": "20 minutes",
      "en": "Full narrative in English",
      "pt": "Descrição completa em português"
    }
  ]
}`

  const result = await model.generateContent(prompt)
  const text   = result.response.text()
  const data   = JSON.parse(text) as { activities: (DomainActivity & { date: string })[] }
  return data.activities
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateCurriculum(
  theme: string,
  monthYear: string,
  philosophy: Philosophy,
  weekdays: string[]
): Promise<DailyData> {
  const weekdayMeta = weekdays.map((date, i) => ({
    date,
    weekday:    new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
    day_number: i + 1,
  }))

  // Step 1: Director Agent — generate monthly narrative roadmap
  const roadmap = await runDirectorAgent(theme, monthYear, philosophy, weekdayMeta)

  // Step 2: 6 Specialist Domain Agents — run concurrently
  const [sensory, cognitive, physical, social, cultural, parentBridge] = await Promise.all([
    runSpecialistAgent('sensory_layout',     theme, philosophy, roadmap),
    runSpecialistAgent('cognitive_literacy', theme, philosophy, roadmap),
    runSpecialistAgent('physical_outdoor',   theme, philosophy, roadmap),
    runSpecialistAgent('social_emotional',   theme, philosophy, roadmap),
    runSpecialistAgent('cultural_global',    theme, philosophy, roadmap),
    runSpecialistAgent('parent_bridge',      theme, philosophy, roadmap),
  ])

  // Step 3: Merge into final DailyData structure
  const domainMap: Record<DomainKey, (DomainActivity & { date: string })[]> = {
    sensory_layout:     sensory,
    cognitive_literacy: cognitive,
    physical_outdoor:   physical,
    social_emotional:   social,
    cultural_global:    cultural,
    parent_bridge:      parentBridge,
  }

  const days = weekdayMeta.map(({ date, weekday, day_number }) => {
    const domains = {} as Record<DomainKey, DomainActivity>
    for (const key of DOMAIN_KEYS) {
      const match = domainMap[key].find(a => a.date === date)
      if (match) {
        const { date: _date, ...activity } = match
        domains[key] = activity as DomainActivity
      }
    }
    return { date, weekday, day_number, domains }
  })

  return { philosophy, theme, month_year: monthYear, days }
}

export async function translateText(englishText: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(
    `Translate the following Pre-K educational activity description into fluent Brazilian Portuguese.
     Preserve the warm, professional tone. Return ONLY the translation, no extra text.\n\n${englishText}`
  )
  return result.response.text().trim()
}
