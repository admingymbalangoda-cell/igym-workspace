'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface ProfileFormState {
  success: boolean
  message: string
  /** Timestamp prevents stale state when saving twice in a row */
  timestamp: number
}

/**
 * Update the current member's profile in the `members` table.
 * Signature matches useActionState: (prevState, formData) => State
 */
export async function updateProfileAction(
  _prevState: ProfileFormState | null,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // ── Read form values ───────────────────────────────────────────────────────
  const full_name             = (formData.get('full_name') as string)?.trim()
  const phone                 = (formData.get('phone') as string)?.trim() || null
  const weight_kg             = formData.get('weight_kg') as string
  const height_cm             = formData.get('height_cm') as string
  const emergency_contact_name  = (formData.get('emergency_contact_name') as string)?.trim() || null
  const emergency_contact_phone = (formData.get('emergency_contact_phone') as string)?.trim() || null

  // ── Basic validation ────────────────────────────────────────────────────────
  if (!full_name || full_name.length < 2) {
    return {
      success: false,
      message: 'Full name must be at least 2 characters.',
      timestamp: Date.now(),
    }
  }

  // ── Persist to Supabase ────────────────────────────────────────────────────
  const { error } = await supabase
    .from('members')
    .update({
      full_name,
      phone,
      weight_kg: weight_kg ? parseFloat(weight_kg) : null,
      height_cm: height_cm ? parseFloat(height_cm) : null,
      emergency_contact_name,
      emergency_contact_phone,
      updated_at: new Date().toISOString(),
    })
    .eq('auth_user_id', user.id)

  if (error) {
    console.error('[updateProfileAction]', error.message)
    return {
      success: false,
      message: 'Could not save changes. Please try again.',
      timestamp: Date.now(),
    }
  }

  return {
    success: true,
    message: 'Profile updated successfully!',
    timestamp: Date.now(),
  }
}

/**
 * Sign the member out and redirect to the login screen.
 */
export async function signOutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
