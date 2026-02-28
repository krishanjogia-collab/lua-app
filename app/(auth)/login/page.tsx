'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sprout } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail]   = useState('')
  const [otp, setOtp]       = useState('')
  const [step, setStep]     = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const supabase = createClient()

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({ email })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: otp }),
    })

    setLoading(false)
    if (res.ok) {
      window.location.href = '/calendar'
    } else {
      const data = await res.json()
      setError(data.error || 'Invalid code. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-terracotta shadow-soft mb-4">
            <Sprout className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="font-lexend text-3xl font-semibold text-terracotta-900 tracking-tight">
            Lua
          </h1>
          <p className="text-sm text-sage-600 mt-1 font-inter">
            Pre-K Curriculum Engine
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-soft p-8">
          {step === 'email' ? (
            <>
              <h2 className="font-lexend text-xl font-medium text-terracotta-900 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-sage-600 font-inter mb-6">
                Enter your email and we'll send you a sign-in code.
              </p>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-terracotta-800 font-inter mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@school.edu"
                    className="w-full px-4 py-3 rounded-2xl border border-cream-400 bg-cream-50 text-terracotta-900 placeholder-sage-300 focus:outline-none focus:ring-2 focus:ring-terracotta-300 font-inter text-sm transition"
                  />
                </div>

                {error && <p className="text-sm text-dusty-rose-600 font-inter">{error}</p>}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!email}
                  size="lg"
                  className="w-full"
                >
                  {loading ? 'Sending…' : 'Send Code'}
                </Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <h2 className="font-lexend text-xl font-medium text-terracotta-900 mb-1">
                Check your inbox
              </h2>
              <p className="text-sm text-sage-600 font-inter mb-6">
                We sent a 6-digit code to <strong className="text-terracotta-800">{email}</strong>. Enter it below.
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-terracotta-800 font-inter mb-1.5">
                    Sign-in code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    placeholder="12345678"
                    className="w-full px-4 py-3 rounded-2xl border border-cream-400 bg-cream-50 text-terracotta-900 placeholder-sage-300 focus:outline-none focus:ring-2 focus:ring-terracotta-300 font-inter text-sm tracking-widest text-center transition"
                  />
                </div>

                {error && <p className="text-sm text-dusty-rose-600 font-inter">{error}</p>}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={otp.length < 6 || otp.length > 8}
                  size="lg"
                  className="w-full"
                >
                  {loading ? 'Verifying…' : 'Sign In'}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError(null) }}
                  className="w-full text-sm text-dusty-rose-500 underline font-inter hover:text-dusty-rose-700 transition"
                >
                  Use a different email
                </button>
              </form>
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-sage-400 mt-6 font-inter">
          Nurturing minds, one day at a time.
        </p>
      </motion.div>
    </main>
  )
}
