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

    // First ensure it's not published (safety check)
    const { data: plan } = await supabase
      .from('curriculum_plans')
      .select('is_published')
      .eq('id', planId)
      .single()

    if (plan?.is_published) {
      return NextResponse.json({ error: 'Cannot delete a published plan. Unpublish it first.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('curriculum_plans')
      .delete()
      .eq('id', planId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[delete-plan] Error:', err)
    return NextResponse.json({ error: 'Delete failed', detail: String(err) }, { status: 500 })
  }
}
