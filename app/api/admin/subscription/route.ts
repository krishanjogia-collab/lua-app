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

    const { targetUserId, activeSubscriptionMonth } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ active_subscription_month: activeSubscriptionMonth || null })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('[API/Subscription] Error updating subscription:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true, active_subscription_month: activeSubscriptionMonth || null })
  } catch (err: any) {
    console.error('[API/Subscription] Unhandled error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
