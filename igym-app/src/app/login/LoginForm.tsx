'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { loginAction } from './actions'

interface LoginFormProps {
  errorMessage: string | null
}

export default function LoginForm({ errorMessage }: LoginFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    supabase.auth.getSession().then((res: { data: { session: Session | null } }) => {
      const session = res.data?.session
      if (!isMounted) return
      if (session?.user) {
        router.replace('/dashboard')
      } else {
        setCheckingSession(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        router.replace('/dashboard')
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await loginAction(formData)
    })
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94761643242'
  const rawMessage = `Hello iGYM Support, I forgot my password and need a reset.

Member ID: [Type your ID here]
Name: [Type your Name here]

Please help me reset my account.`

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(rawMessage)}`

  if (checkingSession) {
    return (
      <div className="igym-login-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div className="brand-icon" style={{ width: '56px', height: '56px' }}>
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="14" width="6" height="8" rx="2" fill="currentColor" />
              <rect x="28" y="14" width="6" height="8" rx="2" fill="currentColor" />
              <rect x="8" y="10" width="4" height="16" rx="2" fill="currentColor" />
              <rect x="24" y="10" width="4" height="16" rx="2" fill="currentColor" />
              <rect x="12" y="16" width="12" height="4" rx="2" fill="currentColor" />
            </svg>
          </div>
          <span className="spinner" aria-hidden="true" style={{ width: '24px', height: '24px' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="igym-login-root">
      {/* Decorative background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <main className="login-card" role="main">
        {/* Logo / Brand */}
        <header className="login-header">
          <div className="brand-icon" aria-label="iGYM logo">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="14" width="6" height="8" rx="2" fill="currentColor" />
              <rect x="28" y="14" width="6" height="8" rx="2" fill="currentColor" />
              <rect x="8" y="10" width="4" height="16" rx="2" fill="currentColor" />
              <rect x="24" y="10" width="4" height="16" rx="2" fill="currentColor" />
              <rect x="12" y="16" width="12" height="4" rx="2" fill="currentColor" />
            </svg>
          </div>
          <h1 className="brand-name">iGYM</h1>
          <p className="brand-tagline">Member Portal</p>
        </header>

        {/* Error Banner */}
        {errorMessage && (
          <div className="error-banner" role="alert" aria-live="assertive">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="login-form"
          noValidate
        >
          {/* Member ID */}
          <div className="field-group">
            <label htmlFor="memberId" className="field-label">
              Member ID
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="memberId"
                name="memberId"
                type="text"
                autoComplete="username"
                placeholder="e.g. M1001"
                required
                disabled={isPending}
                className="field-input"
                aria-describedby={errorMessage ? 'login-error' : undefined}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                disabled={isPending}
                className="field-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                    <path d="M10.748 13.93l2.523 2.523a10.285 10.285 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot password button */}
          <div className="forgot-row">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="forgot-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isPending}
            className="submit-btn"
          >
            {isPending ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Signing in…</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <footer className="login-footer">
          <p>Need help? Contact your gym&apos;s front desk.</p>
        </footer>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '1.25rem',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              color: '#f4f4f5',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.75rem', color: '#fff' }}>
              Forgot your password?
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#a1a1aa', textAlign: 'center', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Forgot your password? Please contact the Gym Front Desk or message us on WhatsApp to reset your account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.625rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  transition: 'opacity 0.2s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Message on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.625rem',
                  backgroundColor: '#27272a',
                  color: '#e4e4e7',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  border: '1px solid #3f3f46',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

