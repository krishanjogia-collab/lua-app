import { ImageResponse } from '@vercel/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Minimal mapping of domain keys to their icons and labels
const DOMAIN_ICONS: Record<string, { icon: string; label: string }> = {
  sensory_layout: { icon: '🎨', label: 'Sensory' },
  cognitive_literacy: { icon: '📖', label: 'Cognitive' },
  physical_outdoor: { icon: '🏃', label: 'Physical' },
  social_emotional: { icon: '🤝', label: 'Social' },
  cultural_global: { icon: '🌍', label: 'Cultural' },
  parent_bridge: { icon: '👨‍👩‍👧', label: 'Parent' },
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')
    const date = searchParams.get('date')

    if (!planId || !date) {
      return new Response('Missing planId or date', { status: 400 })
    }

    // 1. Fetch data
    const { data: plan } = await supabase
      .from('curriculum_plans')
      .select('theme_name, is_published, daily_data')
      .eq('id', planId)
      .single()

    if (!plan || !plan.is_published) {
      return new Response('Plan not found or not published', { status: 404 })
    }

    const dayEntry = plan.daily_data?.days?.find((d: any) => d.date === date)
    if (!dayEntry) {
      return new Response('Day not found in plan', { status: 404 })
    }

    const dateObj = new Date(date + 'T12:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })

    const domains = dayEntry.domains || {}
    const activeDomains = Object.keys(DOMAIN_ICONS).filter(
      key => domains[key] != null
    )

    // 2. Generate the edge ImageResponse
    return new ImageResponse(
      (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FBF9F6', // cream
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative'
        }}>
          {/* Top subtle bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '16px',
            backgroundColor: '#E2725B' // terracotta
          }} />

          {/* Logo / Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 48,
            color: '#5C2D26', // deep-espresso-500
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '60px'
          }}>
            <span style={{ marginRight: '16px', fontSize: 56 }}>🌙</span>
            Lua
          </div>

          {/* Main Content Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            borderRadius: '40px',
            padding: '60px',
            boxShadow: '0 20px 40px rgba(160, 107, 95, 0.08)',
            border: '2px solid rgba(160, 107, 95, 0.1)',
            flexGrow: 1
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: 'auto'
            }}>
              <div style={{
                fontSize: 32,
                color: '#E2725B', // terracotta
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                Daily Curriculum
              </div>
              <div style={{
                fontSize: 72,
                fontWeight: 800,
                color: '#6e453c', // terracotta-900 approx
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '24px'
              }}>
                {plan.theme_name}
              </div>
              <div style={{
                fontSize: 40,
                color: '#718579', // sage-600
                fontWeight: 500
              }}>
                {formattedDate} • Day {dayEntry.day_number}
              </div>
            </div>

            {/* Domains */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              marginTop: '40px'
            }}>
              {activeDomains.map(key => {
                const info = DOMAIN_ICONS[key]
                return (
                  <div key={key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#FBF9F6', // cream
                    padding: '16px 24px',
                    borderRadius: '24px',
                    fontSize: 32,
                    color: '#4B5563',
                    border: '1px solid #EBE4DA' // cream-200
                  }}>
                    <span style={{ marginRight: '16px', fontSize: 36 }}>{info.icon}</span>
                    <span style={{ fontWeight: 600, color: '#4a5b51' }}>{info.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
            fontSize: 28,
            color: '#5C2D26', // deep-espresso-500
            fontWeight: 500
          }}>
            <span>Pre-K Curriculum Engine</span>
            <span style={{ color: '#E2725B', fontWeight: 600 }}>luaapp.com</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error: any) {
    console.error('OG Image generation error:', error)
    return new Response(`Failed to generate image: ${error.message}`, { status: 500 })
  }
}
