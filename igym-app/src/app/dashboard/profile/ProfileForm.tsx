'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

import { uploadAndReplaceImage } from '@/lib/imageUpload'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileFormProps {
  memberId: string
  fullName: string | null
  phone: string | null
  weightKg: number | null
  heightCm: number | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  planName: string | null
  membershipStatus: string | null
  joinedAt: string | null
}

interface ToastState {
  success: boolean
  message: string
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastState
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={`profile-toast profile-toast--${toast.success ? 'success' : 'error'}`}
      role="status"
      aria-live="polite"
    >
      <span className="profile-toast-icon" aria-hidden="true">
        {toast.success ? (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
        )}
      </span>
      <span>{toast.message}</span>
      <button
        onClick={onDismiss}
        className="profile-toast-dismiss"
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  )
}

// ─── Section Card Component ───────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="pf-card">
      <div className="pf-card-header">
        <span className="pf-card-icon" aria-hidden="true">{icon}</span>
        <h2 className="pf-card-title">{title}</h2>
      </div>
      <div className="pf-card-body">{children}</div>
    </div>
  )
}

// ─── Main Form Component ──────────────────────────────────────────────────────
export default function ProfileForm(props: ProfileFormProps) {
  const supabase = createClient()

  // Read-only state
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null)
  const [displayMemberId, setDisplayMemberId] = useState<string>(props.memberId || '—')
  const [planName, setPlanName] = useState<string>(props.planName || 'Standard')
  const [membershipStatus, setMembershipStatus] = useState<string>(props.membershipStatus || 'Active')
  const [joinedAt, setJoinedAt] = useState<string | null>(props.joinedAt)

  // Editable Form State
  const [fullName, setFullName] = useState<string>(props.fullName || '')
  const [phone, setPhone] = useState<string>(props.phone || '')
  const [weightKg, setWeightKg] = useState<string>(props.weightKg ? props.weightKg.toString() : '')
  const [heightCm, setHeightCm] = useState<string>(props.heightCm ? props.heightCm.toString() : '')
  const [emergencyContactName, setEmergencyContactName] = useState<string>(props.emergencyContactName || '')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>(props.emergencyContactPhone || '')
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)
  const [uploadingPic, setUploadingPic] = useState<boolean>(false)

  // UI state
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [toastState, setToastState] = useState<ToastState | null>(null)
  const [signOutPending, setSignOutPending] = useState<boolean>(false)

  // Change Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      setToastState({ success: false, message: 'New password must be at least 6 characters.' })
      toast.error('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setToastState({ success: false, message: 'New passwords do not match.' })
      toast.error('New passwords do not match.')
      return
    }

    try {
      setIsChangingPassword(true)

      // Directly update password via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

      if (updateError) {
        setToastState({ success: false, message: updateError.message })
        toast.error(updateError.message)
      } else {
        setToastState({ success: true, message: 'Password updated successfully!' })
        toast.success('Password updated successfully!')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      console.error('Password Change Exception:', err)
      setToastState({ success: false, message: 'Failed to update password. Please try again.' })
      toast.error('Failed to update password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // 1. Fetch data on load from `members` table
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const userEmail = user.email ?? ''
      const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()
      const cleanId = emailPrefix.toUpperCase().replace(/^MEM-/, 'MEM')
      const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

      // Query `members` table
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .or(`auth_user_id.eq.${user.id},member_id.eq.${cleanId},member_id.eq.${hyphenId},id.eq.${user.id}`)
        .maybeSingle()

      if (error) {
        console.error('Error fetching member profile:', error)
      } else if (member) {
        setActiveMemberId(member.id || null)
        setDisplayMemberId(member.member_id || cleanId)
        
        // Map top cards (read-only)
        setPlanName(member.package || member.plan_name || 'Standard')
        setMembershipStatus(member.status || member.membership_status || 'Active')
        setJoinedAt(member.created_at || member.joined_at || member.created_date || null)
        setProfilePicUrl(member.profile_pic_url || null)

        // Map form fields (editable)
        setFullName(member.full_name || member.name || '')
        setPhone(member.phone || '')
        setWeightKg((member.weight_kg ?? member.weight ?? '').toString())
        setHeightCm((member.height_cm ?? member.height ?? '').toString())
        setEmergencyContactName(member.emergency_contact_name || '')
        setEmergencyContactPhone(member.emergency_contact_phone || '')
      }
    } catch (err) {
      console.error('Exception fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  // Profile Picture Upload Handler
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPic(true)
    setToastState({ success: true, message: 'Compressing & uploading profile picture...' })

    try {
      const targetId = activeMemberId || displayMemberId || 'MEM001'
      const { publicUrl, error: uploadErr } = await uploadAndReplaceImage({
        supabase,
        file,
        memberId: targetId,
        fieldName: 'profile_pic_url',
        oldPhotoUrl: profilePicUrl,
      })

      if (uploadErr || !publicUrl) {
        setToastState({ success: false, message: `Upload failed: ${uploadErr?.message || 'Error uploading photo'}` })
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const updatePayload = {
        profile_pic_url: publicUrl,
        updated_at: new Date().toISOString(),
      }

      let dbError = null
      if (activeMemberId) {
        const { error } = await supabase.from('members').update(updatePayload).eq('id', activeMemberId)
        dbError = error
      }

      if (!activeMemberId || dbError) {
        const { error } = await supabase.from('members').update(updatePayload).eq('member_id', displayMemberId)
        dbError = error
      }

      if (dbError && user?.id) {
        const { error } = await supabase.from('members').update(updatePayload).eq('auth_user_id', user.id)
        dbError = error
      }

      if (dbError) {
        console.error('❌ Mandatory Database Update Failed for profile_pic_url:', dbError)
        setToastState({ success: false, message: `Database update error: ${dbError.message}` })
        return
      }

      console.log('✅ Successfully updated profile_pic_url in members DB table to:', publicUrl)

      setProfilePicUrl(publicUrl)
      setToastState({ success: true, message: 'Profile picture updated successfully!' })
    } catch (err: any) {
      console.error('Error uploading profile picture:', err)
      setToastState({ success: false, message: 'Error uploading profile picture.' })
    } finally {
      setUploadingPic(false)
    }
  }

  // 2. Seamless Update Logic (No Page Reloads)
  const handleSaveProfile = async (e?: React.SyntheticEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }

    if (!fullName || fullName.trim().length < 2) {
      setToastState({ success: false, message: 'Full name must be at least 2 characters.' })
      return
    }

    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const parsedWeight = weightKg && !isNaN(parseFloat(weightKg)) ? parseFloat(weightKg) : null
      const parsedHeight = heightCm && !isNaN(parseFloat(heightCm)) ? parseFloat(heightCm) : null

      const updatePayload: Record<string, any> = {
        full_name: fullName.trim(),
        name: fullName.trim(),
        phone: phone.trim() || null,
        weight: parsedWeight,
        weight_kg: parsedWeight,
        height: parsedHeight,
        height_cm: parsedHeight,
        emergency_contact_name: emergencyContactName.trim() || null,
        emergency_contact_phone: emergencyContactPhone.trim() || null,
        updated_at: new Date().toISOString(),
      }

      let error = null
      let updated = false

      if (activeMemberId) {
        const res = await supabase
          .from('members')
          .update(updatePayload)
          .eq('id', activeMemberId)
          .select('id')
        if (!res.error && res.data && res.data.length > 0) {
          updated = true
        } else if (res.error) {
          error = res.error
        }
      }

      if (!updated && user?.id) {
        const res = await supabase
          .from('members')
          .update(updatePayload)
          .eq('auth_user_id', user.id)
          .select('id')
        if (!res.error && res.data && res.data.length > 0) {
          updated = true
        } else if (res.error) {
          error = res.error
        }
      }

      if (!updated && displayMemberId && displayMemberId !== '—') {
        const res = await supabase
          .from('members')
          .update(updatePayload)
          .eq('member_id', displayMemberId)
          .select('id')
        if (!res.error && res.data && res.data.length > 0) {
          updated = true
        } else if (res.error) {
          error = res.error
        }
      }

      if (error && !updated) {
        console.error('Supabase Profile Update Error:', error)
        setToastState({ success: false, message: `Could not save changes: ${error.message}` })
      } else {
        // Also insert into weight_tracking if weight was provided to sync progress chart
        if (parsedWeight && parsedWeight > 0) {
          const targetMemId = displayMemberId && displayMemberId !== '—' ? displayMemberId : (activeMemberId || 'MEM001')
          await supabase.from('weight_tracking').insert([
            {
              member_id: targetMemId,
              weight: parsedWeight,
              recorded_date: new Date().toISOString().split('T')[0],
            },
          ])
        }

        setToastState({ success: true, message: 'Profile updated successfully!' })
      }
    } catch (err: any) {
      console.error('Profile Update Exception:', err)
      setToastState({ success: false, message: 'Could not save changes. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    setSignOutPending(true)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    const dt = new Date(iso)
    if (isNaN(dt.getTime())) return iso
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function statusLabel(s: string | null) {
    if (!s) return 'Active'
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  }

  return (
    <div className="pf-root">
      {/* ── Toast Feedback ────────────────────────────────────────────────── */}
      {toastState && (
        <Toast toast={toastState} onDismiss={() => setToastState(null)} />
      )}

      {/* ── Page Heading ──────────────────────────────────────────────────── */}
      <div className="pf-page-header">
        <div className="pf-avatar-container">
          {profilePicUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profilePicUrl} alt={fullName || 'Profile'} className="pf-avatar-img" />
          ) : (
            <div className="pf-avatar" aria-hidden="true">
              {(fullName || displayMemberId || 'M').slice(0, 1).toUpperCase()}
            </div>
          )}
          <label className="pf-avatar-upload-badge" title="Upload / Change Profile Picture">
            {uploadingPic ? '...' : '📷'}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              disabled={uploadingPic || isSaving}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div>
          <h1 className="pf-page-title">{fullName || 'Member Profile'}</h1>
          <p className="pf-page-subtitle">Member ID: <strong>{displayMemberId}</strong></p>
        </div>
      </div>

      {/* ── Top Summary Cards (Read-only) ─────────────────────────────────── */}
      <div className="pf-summary-row">
        <div className="pf-summary-item">
          <p className="pf-summary-label">Plan (Package)</p>
          <p className="pf-summary-value">{planName}</p>
        </div>
        <div className="pf-summary-item">
          <p className="pf-summary-label">Status</p>
          <p className={`pf-summary-value pf-status pf-status--${membershipStatus.toLowerCase()}`}>
            <span className="pf-status-dot" aria-hidden="true" />
            {statusLabel(membershipStatus)}
          </p>
        </div>
        <div className="pf-summary-item">
          <p className="pf-summary-label">Member Since</p>
          <p className="pf-summary-value">{formatDate(joinedAt)}</p>
        </div>
      </div>

      {/* ── Editable Profile Form ──────────────────────────────────────────── */}
      <form onSubmit={(e) => handleSaveProfile(e)} noValidate className="pf-form">

        {/* Personal Information */}
        <SectionCard
          title="Personal Information"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          }
        >
          <div className="pf-field">
            <label htmlFor="pf-full-name" className="pf-label">
              Full Name <span className="pf-required">*</span>
            </label>
            <input
              id="pf-full-name"
              type="text"
              className="pf-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Silva"
              disabled={isSaving || loading}
              required
            />
          </div>

          <div className="pf-field">
            <label htmlFor="pf-phone" className="pf-label">Phone Number</label>
            <input
              id="pf-phone"
              type="tel"
              inputMode="tel"
              className="pf-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +94 77 123 4567"
              disabled={isSaving || loading}
            />
          </div>

          <div className="pf-row-2">
            <div className="pf-field">
              <label htmlFor="pf-weight" className="pf-label">Weight (kg)</label>
              <input
                id="pf-weight"
                type="number"
                step="0.1"
                inputMode="decimal"
                className="pf-input"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 75.0"
                disabled={isSaving || loading}
              />
              <p className="pf-hint">Used by your coach to track fitness progress</p>
            </div>

            <div className="pf-field">
              <label htmlFor="pf-height" className="pf-label">Height (cm)</label>
              <input
                id="pf-height"
                type="number"
                step="0.1"
                inputMode="decimal"
                className="pf-input"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 178"
                disabled={isSaving || loading}
              />
            </div>
          </div>
        </SectionCard>

        {/* Emergency Contact */}
        <SectionCard
          title="Emergency Contact"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          }
        >
          <div className="pf-field">
            <label htmlFor="pf-ec-name" className="pf-label">Contact Name</label>
            <input
              id="pf-ec-name"
              type="text"
              className="pf-input"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              placeholder="e.g. Jane Silva"
              disabled={isSaving || loading}
            />
          </div>

          <div className="pf-field">
            <label htmlFor="pf-ec-phone" className="pf-label">Contact Phone</label>
            <input
              id="pf-ec-phone"
              type="tel"
              inputMode="tel"
              className="pf-input"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
              placeholder="e.g. +94 77 987 6543"
              disabled={isSaving || loading}
            />
          </div>
        </SectionCard>

        {/* Account Info (read-only) */}
        <SectionCard
          title="Account Information"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          }
        >
          <div className="pf-field">
            <label htmlFor="pf-member-id" className="pf-label">Member ID</label>
            <input
              id="pf-member-id"
              type="text"
              className="pf-input pf-input--readonly"
              value={displayMemberId}
              readOnly
            />
            <p className="pf-hint">Your Member ID is read-only and cannot be altered.</p>
          </div>
        </SectionCard>

        {/* Security & Password */}
        <SectionCard
          title="Security & Change Password"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
          }
        >
          <div className="pf-field">
            <label htmlFor="pf-new-password" className="pf-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="pf-new-password"
                type={showNewPw ? 'text' : 'password'}
                className="pf-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={isChangingPassword || loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                aria-label={showNewPw ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8125rem' }}
              >
                {showNewPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="pf-field">
            <label htmlFor="pf-confirm-password" className="pf-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="pf-confirm-password"
                type={showConfirmPw ? 'text' : 'password'}
                className="pf-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isChangingPassword || loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8125rem' }}
              >
                {showConfirmPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            id="pf-change-pw-btn"
            type="button"
            disabled={isChangingPassword || loading}
            onClick={handleChangePassword}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#fff',
              fontWeight: 600,
              border: '1px solid rgba(220, 38, 38, 0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {isChangingPassword ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Updating Password…
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </SectionCard>

        {/* Save button */}
        <button
          id="pf-save-btn"
          type="button"
          disabled={isSaving || loading}
          onClick={(e) => handleSaveProfile(e)}
          className="pf-save-btn"
        >
          {isSaving ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </form>

      {/* ── Sign Out ──────────────────────────────────────────────────────── */}
      <div className="pf-signout-section">
        <button
          id="pf-signout-btn"
          type="button"
          onClick={handleSignOut}
          disabled={signOutPending}
          className="pf-signout-btn"
        >
          {signOutPending ? (
            <>
              <span className="spinner spinner--red" aria-hidden="true" />
              Signing out…
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.05a.75.75 0 10-1.06-1.06l-2.5 2.5a.75.75 0 000 1.06l2.5 2.5a.75.75 0 101.06-1.06l-1.048-1.05H18.25A.75.75 0 0019 10z" clipRule="evenodd" />
              </svg>
              Sign Out
            </>
          )}
        </button>
        <p className="pf-signout-hint">You will be redirected to the login screen.</p>
      </div>

      <div className="dash-bottom-spacer" />
    </div>
  )
}
