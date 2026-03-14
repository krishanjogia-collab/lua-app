import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExampleDayClient from './ExampleDayClient'

export default async function ExampleDayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=example')

  return <ExampleDayClient />
}
