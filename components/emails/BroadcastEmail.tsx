import * as React from 'react'

interface BroadcastEmailProps {
  body: string
}

export const BroadcastEmail: React.FC<Readonly<BroadcastEmailProps>> = ({
  body,
}) => (
  <div style={{ fontFamily: '"Inter", sans-serif', color: '#55695a', backgroundColor: '#fcfdfa', margin: 0, padding: '40px 20px' }}>
    <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8df', boxShadow: '0 8px 30px rgba(85, 105, 90, 0.04)' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#c46a4f', padding: '32px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '24px', fontWeight: 600, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
          Lua Learn
        </h1>
      </div>
      
      {/* Body */}
      <div style={{ padding: '32px 24px' }}>
        {body.split('\n').map((paragraph, index) => (
          <p key={index} style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px', minHeight: '1em' }}>
            {paragraph}
          </p>
        ))}
        
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <a
            href="https://lualearn.com/dashboard"
            style={{
              display: 'inline-block',
              backgroundColor: '#c46a4f',
              color: '#ffffff',
              padding: '12px 28px',
              fontFamily: '"Inter", sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '16px',
            }}
          >
            Visit Lua Learn
          </a>
        </div>
      </div>
    </div>
    
    {/* Footer */}
    <div style={{ textAlign: 'center', padding: '24px', fontSize: '13px', color: '#889e8e' }}>
      <p style={{ margin: '0 0 8px' }}>
        <a href="https://instagram.com/lua_learn" style={{ color: '#889e8e', textDecoration: 'underline' }}>
          Follow us on Instagram
        </a>
      </p>
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} Lua Learn. All rights reserved.
      </p>
    </div>
  </div>
)
