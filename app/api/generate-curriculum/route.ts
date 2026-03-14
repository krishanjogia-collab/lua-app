import { createClient } from '@/lib/supabase/server'
import { generateCurriculum } from '@/lib/gemini'
import { getWeekdaysInMonth } from '@/lib/utils'
import { NextResponse } from 'next/server'
import type { Philosophy } from '@/lib/types'

export async function POST(request: Request) {
  const supabase = createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Removed admin check to allow Sprout onboarding generation
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin, bilingual_mode')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[generate-curriculum] Profile query error:', profileError)
    return NextResponse.json({ error: `Profile query error: ${profileError.message}` }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { theme, monthYear, philosophy } = body as {
      theme:      string
      monthYear:  string
      philosophy: Philosophy
    }

    if (!theme || !monthYear || !philosophy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const weekdays = getWeekdaysInMonth(monthYear)
    const dailyData = await generateCurriculum(theme, monthYear, philosophy, weekdays, !!profile.bilingual_mode)

    // Upsert into curriculum_plans (draft — not yet published)
    const { data: plan, error: dbError } = await supabase
      .from('curriculum_plans')
      .upsert(
        {
          month_year:  monthYear,
          theme_name:  theme,
          daily_data:  dailyData,
          is_published: false,
        },
        { onConflict: 'month_year' }
      )
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ success: true, planId: plan.id, preview: dailyData.days.slice(0, 2) })
  } catch (err) {
    console.error('Curriculum generation error:', err)
    return NextResponse.json({ error: 'Generation failed', detail: String(err) }, { status: 500 })
  }
}
