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

const DOMAIN_PROMPTS: Record<DomainKey, string> = {
  sensory_layout:     'You are a Sensory Environment Design Specialist for Pre-K education (ages 3–5). Design rich tactile environment setups and sensory station activities. Focus on physical space arrangement, materials selection, and multi-sensory engagement. Specify exact bin/station contents with quantities. Include setup diagram description (left-to-right station flow). Flag materials requiring extra supervision. Include cleanup protocol with sanitization steps.',
  cognitive_literacy: 'You are a Cognitive and Literacy Development Specialist for Pre-K education (ages 3–5). Design age-appropriate literacy, early numeracy, vocabulary building, and critical thinking activities. Include specific book titles or song names where applicable. Vocabulary must include 4-6 theme words. Include assessment cue for pre-literacy milestones (letter recognition, phonemic awareness, 1:1 correspondence).',
  physical_outdoor:   'You are a Physical Development and Outdoor Learning Specialist for Pre-K education (ages 3–5). Design gross motor, nature-based, and outdoor exploration activities that are safe and developmentally joyful. Provide BOTH indoor (rainy day) and outdoor versions. Specify space requirements (e.g., "10ft x 10ft clear area"). Include movement transition to next activity.',
  social_emotional:   'You are a Social-Emotional Learning Specialist for Pre-K education (ages 3–5). Design group play, self-regulation, empathy-building, and conflict resolution activities. Specify group size explicitly. Include emotional vocabulary words. Describe teacher role (facilitator vs. participant). Include de-escalation note for common conflicts.',
  cultural_global:    'You are a Cultural and Global Awareness Specialist for Pre-K education (ages 3–5). Design activities celebrating diverse cultures, global perspectives, and world events in an age-appropriate, joyful way. Name specific books, songs, or traditions by title and origin. Follow secular framing by default. Include "Adapt to your classroom community" note. Never reduce cultures to costumes or food.',
  parent_bridge:      'You are a Family Engagement Specialist for Pre-K education. Write a 2-3 sentence parent message explaining educational purpose in warm family-friendly language. Include one home extension activity requiring NO special materials. If bilingual mode is on, provide the message in both EN and PT.',
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

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature:      0.9,
      }
    }) 
    const text   = result.response.text()
    const data   = JSON.parse(text) as { roadmap: { date: string; sub_theme: string }[] }
    return data.roadmap
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new Error(`Director Agent timed out after 60 seconds.`)
    }
    throw new Error(`Director Agent failed: ${error.message}`)
  }
}

// ── Specialist Domain Agent ───────────────────────────────────────────────────
async function runSpecialistAgent(
  domain: DomainKey,
  theme: string,
  philosophy: Philosophy,
  roadmap: { date: string; sub_theme: string }[],
  bilingualMode: boolean
): Promise<(DomainActivity & { date: string })[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature:      0.85,
    },
  })

  const bilingualInstruction = bilingualMode 
    ? `\nBILINGUAL MODE: This educator uses bilingual EN/PT curriculum.
For EACH activity, also include these additional fields:
  "description_pt": "Natural Brazilian Portuguese translation of description"
  "steps_pt": ["Portuguese translation of each step, same order"]
  "vocabulary_pt": ["Portuguese equivalent of each vocabulary word"]

Portuguese translations must be natural and culturally appropriate, NOT literal.
Use Brazilian Portuguese conventions.\n` 
    : ''

  const prompt = `${DOMAIN_PROMPTS[domain]}

MONTHLY THEME: "${theme}"
EDUCATIONAL PHILOSOPHY: ${PHILOSOPHY_DESCRIPTIONS[philosophy]}

Generate ONE activity per school day for your specific developmental domain, aligned to each day's sub-theme.

CRITICAL REQUIREMENTS:
- Activities must be developmentally appropriate for Pre-K (ages 3–5)
- Materials must be simple, widely available classroom items
- Durations realistic for Pre-K attention spans (15–30 minutes)
- Weave the main theme "${theme}" naturally into each activity
${bilingualInstruction}
Daily roadmap:
${roadmap.map(d => `${d.date}: ${d.sub_theme}`).join('\n')}

RETURN: ONLY valid JSON. No markdown, no code fences.
{
  "activities": [
    {
      "date": "YYYY-MM-DD",
      "title": "Short engaging title (max 6 words)",
      "description": "1-2 sentence overview a busy teacher can scan in 5 seconds",
      "steps": [
        "Step 1: Set up the station by...",
        "Step 2: Invite children to..."
      ],
      "materials": [
        { "item": "sensory bin", "quantity": "1 large", "substitute": null },
        { "item": "dried rice", "quantity": "4 cups", "substitute": "dried pasta for different texture" }
      ],
      "duration": {
        "setup": "5 min",
        "activity": "20 min",
        "cleanup": "10 min"
      },
      "group_size": "4-5 children at the station",
      "space": "indoor",
      "differentiation": {
        "easier": "Use larger scoops. Reduce number of materials to 2.",
        "harder": "Add counting cards. Ask children to sort by size before pouring."
      },
      "safety_note": "Supervise closely if using small items. Not suitable for children who mouth objects.",
      "cleanup_protocol": "Have children help transfer rice back to container. Sweep floor. Wipe table.",
      "transition_cue": "When you hear the rain stick, it's time to pour your rice back into the big bin!",
      "assessment_cue": "Watch for children demonstrating 1:1 correspondence when filling containers.",
      "vocabulary": ["pour", "scoop", "texture", "full", "empty"]
    }
  ]
}`

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature:      0.85,
      }
    })
    const text   = result.response.text()
    const data   = JSON.parse(text) as { activities: (DomainActivity & { date: string })[] }
    return data.activities
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new Error(`Specialist Agent (${domain}) timed out after 60 seconds.`)
    }
    // Specific error mapping for Gemini payload errors / rate limits
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('API Rate limit exceeded. Please wait a moment and try again.')
    }
    throw new Error(`Specialist Agent (${domain}) failed: ${error.message}`)
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateCurriculum(
  theme: string,
  monthYear: string,
  philosophy: Philosophy,
  weekdays: string[],
  bilingualMode: boolean = false
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
    runSpecialistAgent('sensory_layout',     theme, philosophy, roadmap, bilingualMode),
    runSpecialistAgent('cognitive_literacy', theme, philosophy, roadmap, bilingualMode),
    runSpecialistAgent('physical_outdoor',   theme, philosophy, roadmap, bilingualMode),
    runSpecialistAgent('social_emotional',   theme, philosophy, roadmap, bilingualMode),
    runSpecialistAgent('cultural_global',    theme, philosophy, roadmap, bilingualMode),
    runSpecialistAgent('parent_bridge',      theme, philosophy, roadmap, bilingualMode),
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
