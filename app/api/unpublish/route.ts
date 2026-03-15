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

  if (profileError || !profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { planId } = await request.json()
    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 })

    const { error } = await supabase
      .from('curriculum_plans')
      .update({ is_published: false })
      .eq('id', planId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[unpublish] Error:', err)
    return NextResponse.json({ error: 'Unpublish failed', detail: String(err) }, { status: 500 })
  }
}
