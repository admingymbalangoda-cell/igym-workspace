import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CoachesView from './CoachesView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Personal Coaches',
}

export default async function CoachesPage() {
  const supabase = await createClient()

  // Auth guard
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) redirect('/login')

  return (
    <div className="dash-root">
      {/* ── App Bar ────────────────────────────────────────────────────────── */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <span className="dash-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <rect x="2" y="14" width="6" height="8" rx="2" fill="currentColor" />
              <rect x="28" y="14" width="6" height="8" rx="2" fill="currentColor" />
              <rect x="8" y="10" width="4" height="16" rx="2" fill="currentColor" />
              <rect x="24" y="10" width="4" height="16" rx="2" fill="currentColor" />
              <rect x="12" y="16" width="12" height="4" rx="2" fill="currentColor" />
            </svg>
          </span>
          <span className="dash-logo-text">iGYM</span>
        </div>
        <span className="dash-page-title" aria-hidden="true">
          Personal Coaches
        </span>
      </header>

      {/* ── Scrollable Body ─────────────────────────────────────────────────── */}
      <main className="dash-body">
        <CoachesView />
      </main>
    </div>
  )
}
