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
      month: 'short',
      day: 'numeric'
    })

    const domains = dayEntry.domains || {}
    const activeDomains = Object.keys(DOMAIN_ICONS).filter(
      key => domains[key] != null && key !== 'parent_bridge'
    )

    const parentBridge = domains.parent_bridge

    // 2. Generate the vertical 1080x1920 edge ImageResponse
    return new ImageResponse(
      (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FBF9F6', // cream
          padding: '80px',
          fontFamily: 'sans-serif',
        }}>
          {/* Logo Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 40,
            color: '#5C2D26', // deep-espresso-500
            fontWeight: 700,
            marginBottom: '60px',
            alignSelf: 'center'
          }}>
            <span style={{ marginRight: '16px', fontSize: 48 }}>🌙</span>
            Lua Learn
          </div>

          {/* Top Info Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            borderRadius: '40px',
            padding: '50px',
            boxShadow: '0 20px 40px rgba(160, 107, 95, 0.08)',
            border: '2px solid rgba(160, 107, 95, 0.1)',
            marginBottom: '60px'
          }}>
            <div style={{
              fontSize: 32,
              color: '#E2725B', // terracotta
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              Curriculum Theme
            </div>
            <div style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#6e453c',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '24px'
            }}>
              "{plan.theme_name}"
            </div>
            <div style={{
              fontSize: 36,
              color: '#718579', // sage-600
              fontWeight: 500,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span>Day {dayEntry.day_number} of Month</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Activities List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            marginBottom: 'auto'
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#5C2D26', // deep-espresso-500
              marginBottom: '8px'
            }}>
              Today's Activities:
            </div>
            
            {activeDomains.map(key => {
              const info = DOMAIN_ICONS[key]
              const activity = domains[key]
              return (
                <div key={key} style={{
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    fontSize: 44,
                    marginRight: '24px',
                    width: '60px',
                    textAlign: 'center'
                  }}>
                    {info.icon}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <span style={{
                      fontSize: 40,
                      fontWeight: 700,
                      color: '#4B5563',
                      lineHeight: 1.2
                    }}>
                      {activity.title}
                    </span>
                    <span style={{
                      fontSize: 32,
                      color: '#718579',
                      fontWeight: 500,
                      marginTop: '4px'
                    }}>
                      {info.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Divider */}
          <div style={{
            height: '2px',
            backgroundColor: '#EBE4DA', // cream-200
            width: '100%',
            margin: '60px 0'
          }}></div>

          {/* Parent Bridge Teaser */}
          {parentBridge && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FBF2F0', // terracotta-50 approx
              borderRadius: '32px',
              padding: '40px',
              border: '1px solid #FCD3D3',
              marginBottom: '60px'
            }}>
              <div style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#E2725B', // terracotta
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '16px', fontSize: 36 }}>👨‍👩‍👧</span>
                Parent Bridge:
              </div>
              <div style={{
                fontSize: 34,
                color: '#6e453c',
                lineHeight: 1.4,
                fontStyle: 'italic'
              }}>
                "{parentBridge.en.slice(0, 110)}..."
              </div>
            </div>
          )}

          {/* Bottom call to action */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#E2725B', // terracotta
            color: 'white',
            borderRadius: '24px',
            padding: '36px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 36, fontWeight: 700, marginBottom: '12px' }}>
              Swipe up to see full plan
            </div>
            <div style={{ fontSize: 28, opacity: 0.9 }}>
              lualearn.com/preview/day/{planId.slice(0, 8)}/{date}
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
      }
    )
  } catch (error: any) {
    console.error('Share Card generation error:', error)
    return new Response(`Failed to generate share card: ${error.message}`, { status: 500 })
  }
}
