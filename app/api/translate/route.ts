import { createClient } from '@/lib/supabase/server'
import { translateText } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { text } = await request.json()
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 })

  try {
    const translated = await translateText(text)
    return NextResponse.json({ translated })
  } catch (err) {
    return NextResponse.json({ error: 'Translation failed', detail: String(err) }, { status: 500 })
  }
}
