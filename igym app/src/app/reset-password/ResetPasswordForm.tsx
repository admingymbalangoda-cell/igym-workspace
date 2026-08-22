'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      setIsPending(true)

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        toast.error(error.message || 'Failed to reset password. Link may have expired.')
      } else {
        toast.success('Password reset successfully! Redirecting to sign in...')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      }
    } catch (err: any) {
      console.error('Reset Password Exception:', err)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="igym-login-root">
      {/* Background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <main className="login-card" role="main">
        {/* Header */}
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
          <h1 className="brand-name">Set New Password</h1>
          <p className="brand-tagline">iGYM Member Portal</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.5' }}>
            Please enter your new password below.
          </p>

          {/* New Password */}
          <div className="field-group">
            <label htmlFor="newPassword" className="field-label">
              New Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="newPassword"
                type={showNewPw ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isPending}
                className="field-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPw((v) => !v)}
                aria-label={showNewPw ? 'Hide password' : 'Show password'}
              >
                {showNewPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label htmlFor="confirmPassword" className="field-label">
              Confirm New Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="confirmPassword"
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isPending}
                className="field-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPw((v) => !v)}
                aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
              >
                {showConfirmPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button id="reset-submit-btn" type="submit" disabled={isPending} className="submit-btn">
            {isPending ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Updating Password…</span>
              </>
            ) : (
              <span>Save New Password</span>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link href="/login" className="forgot-link">
              &larr; Return to Sign In
            </Link>
          </div>
        </form>

        <footer className="login-footer">
          <p>Need help? Contact your gym&apos;s front desk.</p>
        </footer>
      </main>
    </div>
  )
}
