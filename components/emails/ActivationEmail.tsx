import * as React from 'react'

interface ActivationEmailProps {
  email: string
}

export const ActivationEmail: React.FC<Readonly<ActivationEmailProps>> = ({
  email,
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
        <h2 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '20px', fontWeight: 600, color: '#4a2c20', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
          Your dashboard is ready!
        </h2>
        
        <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
          Hi there,
        </p>
        
        <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px' }}>
          We're thrilled to officially welcome you to Lua Learn. Your account has been activated, and you can now log in to the dashboard to access all features, curricula, and resources for this month.
        </p>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a
            href="https://lualearn.com/login"
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
            Log in to your dashboard
          </a>
        </div>
        
        <p style={{ fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
          Happy teaching,<br />
          <strong style={{ color: '#4a2c20' }}>Luana and the Lua Learn team</strong>
        </p>
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
