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
    const { userId, email } = body

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    // Set active_subscription_month to current month (YYYY-MM)
    const currentMonth = new Date().toISOString().substring(0, 7)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ active_subscription_month: currentMonth })
      .eq('id', userId)

    if (updateError) {
      console.error('[API/Activate] Supabase Update Error:', updateError)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    // Send the activation email using Resend
    if (!MOCK_MODE && resend) {
      const { data, error: resendError } = await resend.emails.send({
        from: 'Lua Learn <hello@lualearn.com>',
        to: [email],
        subject: 'Your Lua Learn dashboard is ready!',
        react: ActivationEmail({ email }) as React.ReactElement,
      })

      if (resendError) {
        console.error('[API/Activate] Resend Error:', resendError)
        // We still return success because the DB updated, but notify UI the email failed
        return NextResponse.json({ success: true, warning: 'User activated, but email failed to send.' })
      }
    }

    return NextResponse.json({ success: true, active_subscription_month: currentMonth })
  } catch (err: any) {
    console.error('[API/Activate] Unhandled error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
