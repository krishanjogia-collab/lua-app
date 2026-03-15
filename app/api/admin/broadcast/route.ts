import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { BroadcastEmail } from '@/components/emails/BroadcastEmail'

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

    const { subject, body, recipients } = await request.json() as { 
      subject: string
      body: string
      recipients: string[] 
    }

    if (!subject || !body || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Missing broadcast data' }, { status: 400 })
    }

    // Send the broadcast emails using Resend Batch API
    if (!MOCK_MODE && resend) {
      const emailPayloads = recipients.map(email => ({
        from: 'Lua Learn <hello@lualearn.com>',
        to: [email],
        subject: subject,
        react: BroadcastEmail({ body }) as React.ReactElement,
      }))

      // Batch send emails (Up to 100 per batch according to Resend API)
      for (let i = 0; i < emailPayloads.length; i += 100) {
        const batch = emailPayloads.slice(i, i + 100)
        const { error: resendError } = await resend.batch.send(batch)

        if (resendError) {
          console.error('[API/Broadcast] Resend Batch Error:', resendError)
          // Since it's a batch, we probably shouldn't crash entirely
        }
      }
    }

    return NextResponse.json({ success: true, count: recipients.length })
  } catch (err: any) {
    console.error('[API/Broadcast] Unhandled error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
