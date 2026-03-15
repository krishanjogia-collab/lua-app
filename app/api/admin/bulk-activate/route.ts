import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ActivationEmail } from '@/components/emails/ActivationEmail'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

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

    const body = await request.json()
    const { usersToActivate } = body as { usersToActivate: Array<{ id: string, email: string }> }

    if (!usersToActivate || usersToActivate.length === 0) {
      return NextResponse.json({ error: 'No users provided' }, { status: 400 })
    }

    const currentMonth = new Date().toISOString().substring(0, 7)
    const userIds = usersToActivate.map(u => u.id)

    // Bulk update Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ active_subscription_month: currentMonth })
      .in('id', userIds)

    if (updateError) {
      console.error('[API/BulkActivate] Supabase Update Error:', updateError)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    // Send the activation emails using Resend Batch API
    if (!MOCK_MODE && resend) {
      const emailPayloads = usersToActivate.map(u => ({
        from: 'Lua Learn <hello@lualearn.com>',
        to: [u.email],
        subject: 'Your Lua Learn dashboard is ready!',
        react: ActivationEmail({ email: u.email }) as React.ReactElement,
      }))

      // Batch send emails (Up to 100 per batch according to Resend API)
      for (let i = 0; i < emailPayloads.length; i += 100) {
        const batch = emailPayloads.slice(i, i + 100)
        const { error: resendError } = await resend.batch.send(batch)

        if (resendError) {
          console.error('[API/BulkActivate] Resend Batch Error:', resendError)
          // We can't rollback the DB easily here, we just continue or alert
        }
      }
    }

    return NextResponse.json({ success: true, active_subscription_month: currentMonth })
  } catch (err: any) {
    console.error('[API/BulkActivate] Unhandled error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
