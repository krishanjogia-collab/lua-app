import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetUserId, isAdmin } = await request.json()

    if (!targetUserId || typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('[API/Roles] Error updating role:', updateError)
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    return NextResponse.json({ success: true, is_admin: isAdmin })
  } catch (err: any) {
    console.error('[API/Roles] Unhandled error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
