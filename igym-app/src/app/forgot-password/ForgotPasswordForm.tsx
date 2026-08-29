'use client'

import Link from 'next/link'

export default function ForgotPasswordForm() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94761643242'
  const rawMessage = `Hello iGYM Support, I forgot my password and need a reset.

Member ID: [Type your ID here]
Name: [Type your Name here]

Please help me reset my account.`

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(rawMessage)}`

  return (
    <div className="igym-login-root">
      {/* Background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <main className="login-card" role="main">
        {/* Brand Header */}
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
          <h1 className="brand-name">Account Assistance</h1>
          <p className="brand-tagline">iGYM Member Portal</p>
        </header>

        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
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

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '0.75rem' }}>
            Forgot your password?
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#a1a1aa', lineHeight: '1.5', marginBottom: '1.5rem' }}>
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
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Message on WhatsApp</span>
            </a>

            <Link
              href="/login"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '0.625rem',
                backgroundColor: '#27272a',
                color: '#e4e4e7',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
                border: '1px solid #3f3f46',
              }}
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <footer className="login-footer">
          <p>Need help? Contact your gym&apos;s front desk.</p>
        </footer>
      </main>
    </div>
  )
}
