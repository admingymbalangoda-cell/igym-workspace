import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { emailToMemberId } from '@/lib/auth/helpers'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'My Profile',
}

interface MemberRow {
  id: string
  full_name: string | null
  phone: string | null
  weight_kg: number | null
  height_cm: number | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  plan_name: string | null
  membership_status: string | null
  joined_at: string | null
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // Auth guard
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) redirect('/login')

  const memberId = emailToMemberId(user.email ?? '')

  // Fetch member row
  const { data: member } = await supabase
    .from('members')
    .select(
      'id, full_name, phone, weight_kg, height_cm, emergency_contact_name, emergency_contact_phone, plan_name, membership_status, joined_at'
    )
    .eq('auth_user_id', user.id)
    .maybeSingle<MemberRow>()

  return (
    <div className="dash-root">
      {/* ── App bar ────────────────────────────────────────────────────────── */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <span className="dash-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <rect x="2"  y="14" width="6"  height="8" rx="2" fill="currentColor" />
              <rect x="28" y="14" width="6"  height="8" rx="2" fill="currentColor" />
              <rect x="8"  y="10" width="4"  height="16" rx="2" fill="currentColor" />
              <rect x="24" y="10" width="4"  height="16" rx="2" fill="currentColor" />
              <rect x="12" y="16" width="12" height="4"  rx="2" fill="currentColor" />
            </svg>
          </span>
          <span className="dash-logo-text">iGYM</span>
        </div>
        <span className="dash-page-title" aria-hidden="true">My Profile</span>
      </header>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <main className="dash-body">
        <ProfileForm
          memberId={memberId}
          fullName={member?.full_name ?? null}
          phone={member?.phone ?? null}
          weightKg={member?.weight_kg ?? null}
          heightCm={member?.height_cm ?? null}
          emergencyContactName={member?.emergency_contact_name ?? null}
          emergencyContactPhone={member?.emergency_contact_phone ?? null}
          planName={member?.plan_name ?? null}
          membershipStatus={member?.membership_status ?? null}
          joinedAt={member?.joined_at ?? null}
        />
      </main>
    </div>
  )
}
