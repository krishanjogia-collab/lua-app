import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profileError) console.error('[publish] Profile query error:', profileError.message)

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { planId, dailyData } = await request.json()

    if (!planId || !dailyData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('curriculum_plans')
      .update({ daily_data: dailyData, is_published: true })
      .eq('id', planId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[publish] Error:', err)
    return NextResponse.json({ error: 'Publish failed', detail: String(err) }, { status: 500 })
  }
}
