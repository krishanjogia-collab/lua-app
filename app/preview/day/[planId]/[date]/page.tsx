import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PreviewClient } from './PreviewClient'

// We use the service role key to bypass RLS for public previews, 
// BUT we strictly ensure we only fetch is_published=true plans.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Props {
  params: { planId: string; date: string }
}

async function getPreviewData(planId: string, date: string) {
  const { data: plan } = await supabaseAdmin
    .from('curriculum_plans')
    .select('id, theme_name, is_published, daily_data')
    .eq('id', planId)
    .single()

  if (!plan || !plan.is_published) return null

  const dayEntry = plan.daily_data?.days?.find((d: any) => d.date === date)
  if (!dayEntry) return null

  return { plan, dayEntry }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPreviewData(params.planId, params.date)
  if (!data) return {}

  const { plan, dayEntry } = data
  const theme = plan.theme_name

  const dateObj = new Date(dayEntry.date + 'T12:00:00')
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  })

  // Get first 50 chars of the first activity description as a teaser
  const firstActivity = dayEntry.activities?.[0]
  const teaserDesc = firstActivity ? firstActivity.en.slice(0, 50) + '...' : ''

  const domainNames = dayEntry.activities?.map((a: any) => a.domain) || []
  const uniqueDomains = Array.from(new Set(domainNames)).slice(0, 3)

  const title = `${theme} — ${formattedDate} | Lua`
  const desc = `Pre-K activities: ${uniqueDomains.join(', ')}. ${teaserDesc}`
  const ogUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/og/day?planId=${params.planId}&date=${params.date}`

  return {
    title,
    description: desc,
    openGraph: {
      title: `${theme} — ${formattedDate}`,
      description: `Today's Pre-K curriculum covers ${uniqueDomains.join(', ')}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogUrl],
    }
  }
}

export default async function PreviewPage({ params, searchParams }: Props & { searchParams: { lang?: string } }) {
  const data = await getPreviewData(params.planId, params.date)
  if (!data) notFound()

  // Default to english if no lang query matches
  const lang = searchParams.lang === 'pt' ? 'pt' : 'en'

  return <PreviewClient plan={data.plan} dayEntry={data.dayEntry} date={params.date} lang={lang} />
}
