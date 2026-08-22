/**
 * Auth helpers — Member ID ↔ email bridging
 *
 * Supabase Auth requires an email address. We transparently convert a
 * gym Member ID (e.g. "M1001") into a synthetic email ("M1001@gym.com")
 * so the rest of the Auth flow is unchanged.
 */

const DUMMY_DOMAIN = 'gym.com'

/**
 * Convert a raw Member ID to the synthetic Supabase email.
 * Input is trimmed and upper-cased to be consistent regardless of how
 * the member types their ID.
 */
export function memberIdToEmail(memberId: string): string {
  return `${memberId.trim().toUpperCase()}@${DUMMY_DOMAIN}`
}

/**
 * Extract the display Member ID from the synthetic email.
 * Useful when showing the logged-in user's identifier in the UI.
 */
export function emailToMemberId(email: string): string {
  return email.split('@')[0]
}
