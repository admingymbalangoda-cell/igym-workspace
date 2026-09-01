'use server'

import { createClient } from '@supabase/supabase-js'

export interface CreateMemberInput {
  memberId?: string
  name: string
  password: string
  phone?: string
  address?: string
  height?: number
  weight?: number
  tier?: string
  status?: 'Active' | 'Inactive'
  emergencyContact?: string
  isPTMember?: boolean
  fitnessGoals?: string
  durationMonths?: number
  expiryDate?: string
}

export async function calculateExpiryDate(startDate: Date = new Date(), durationMonths: number = 1): Promise<string> {
  const d = new Date(startDate)
  d.setMonth(d.getMonth() + Number(durationMonths))
  return d.toISOString().split('T')[0]
}

export interface CreateMemberResult {
  success: boolean
  memberId?: string
  authUserId?: string
  syntheticEmail?: string
  member?: any
  error?: string
}

export interface CSVImportRecord {
  name: string
  phone?: string
  package?: string
  height?: number
  weight?: number
  memberId?: string
}

export interface CSVImportResult {
  success: boolean
  count: number
  importedMembers: any[]
  errors: string[]
}

/**
 * Secure Server Action to register a single gym member in Supabase Auth & DB
 * Auto-generates and enforces member_id format without hyphens (e.g., MEM022)
 * Creates synthetic Auth email MEM022@gym.com
 */
export async function createMemberAction(
  input: CreateMemberInput
): Promise<CreateMemberResult> {
  try {
    const {
      name,
      password,
      phone,
      address,
      height,
      weight,
      tier,
      status,
      emergencyContact,
      isPTMember,
      fitnessGoals,
      durationMonths,
      expiryDate,
    } = input

    if (!name || !name.trim()) {
      return { success: false, error: 'Member Full Name is required.' }
    }

    if (!password || password.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return { success: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL configuration.' }
    }

    if (!serviceRoleKey) {
      return { success: false, error: 'Auth Account Creation Failed: SUPABASE_SERVICE_ROLE_KEY environment variable is missing.' }
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Format ID without hyphen: MEM022
    let rawId = (input.memberId || '').trim().toUpperCase()
    if (!rawId) {
      const { count } = await adminSupabase.from('members').select('*', { count: 'exact', head: true })
      const nextNum = (count || 0) + 1
      rawId = `MEM${String(nextNum).padStart(3, '0')}`
    } else {
      rawId = rawId.replace(/^MEM-/, 'MEM')
    }

    const formattedMemberId = rawId
    // Synthetic email: e.g. MEM022@gym.com
    const syntheticEmail = `${formattedMemberId}@gym.com`

    // 1. Create Auth Account using Supabase Admin Auth API
    let authUserId: string | null = null

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: syntheticEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        member_id: formattedMemberId,
        phone: phone || '',
      },
    })

    if (authError) {
      console.error('⚠️ Supabase Auth Admin Error:', authError.message)

      if (
        authError.message.toLowerCase().includes('already') ||
        authError.message.toLowerCase().includes('registered') ||
        authError.status === 422
      ) {
        try {
          const { data: existingUsers } = await adminSupabase.auth.admin.listUsers()
          const matched = existingUsers?.users?.find(
            (u) => u.email?.toLowerCase() === syntheticEmail.toLowerCase()
          )
          if (matched) {
            authUserId = matched.id
          } else {
            return { success: false, error: `Auth Error: ${authError.message}` }
          }
        } catch (e: any) {
          return { success: false, error: `Auth Error: ${authError.message}` }
        }
      } else {
        return { success: false, error: `Auth Account Creation Failed: ${authError.message}` }
      }
    } else if (authData?.user) {
      authUserId = authData.user.id
    }

    if (!authUserId) {
      return { success: false, error: 'Could not resolve Auth User ID.' }
    }

    // 2. Insert into Supabase `members` database table with member_id MEM022
    const memberPayload: any = {
      id: authUserId,
      auth_user_id: authUserId,
      member_id: formattedMemberId,
      full_name: name,
      name: name,
      phone: phone || 'N/A',
      address: address || 'Balangoda',
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      starting_weight: weight ? Number(weight) : null,
      tier: tier || null,
      status: status || 'Inactive',
      joined_date: new Date().toISOString().split('T')[0],
      duration_months: durationMonths ? Number(durationMonths) : null,
      expiry_date: expiryDate || null,
      emergency_contact: emergencyContact || 'N/A',
      is_pt_member: !!isPTMember,
      fitness_goals: fitnessGoals || undefined,
    }

    const { data: dbData, error: dbError } = await adminSupabase
      .from('members')
      .insert([memberPayload])
      .select('*')

    if (dbError) {
      console.error('⚠️ Database Insert Error:', dbError.message)

      const fallbackPayload = { ...memberPayload }
      delete fallbackPayload.id

      const { data: fallbackData, error: fallbackError } = await adminSupabase
        .from('members')
        .insert([fallbackPayload])
        .select('*')

      if (fallbackError) {
        return {
          success: false,
          error: `Database Insert Failed: ${dbError.message} | ${fallbackError.message}`,
        }
      }

      return {
        success: true,
        memberId: formattedMemberId,
        authUserId: authUserId,
        syntheticEmail: syntheticEmail,
        member: fallbackData?.[0] || fallbackPayload,
      }
    }

    return {
      success: true,
      memberId: formattedMemberId,
      authUserId: authUserId,
      syntheticEmail: syntheticEmail,
      member: dbData?.[0] || memberPayload,
    }
  } catch (err: any) {
    console.error('Unhandled exception in createMemberAction:', err)
    return {
      success: false,
      error: err.message || 'Server error occurred during member registration.',
    }
  }
}

/**
 * Server Action for Bulk CSV Import of Members
 * 1. Template fields required: name, phone, package, height, weight (no password in CSV)
 * 2. Hardcodes default password "123456" for all created Supabase Auth accounts
 * 3. Enforces member_id format without hyphen (MEM022) & synthetic email MEM022@gym.com
 */
export async function importMembersCSVAction(
  records: CSVImportRecord[]
): Promise<CSVImportResult> {
  const DEFAULT_PASSWORD = '123456'
  const importedMembers: any[] = []
  const errors: string[] = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return { success: false, count: 0, importedMembers: [], errors: ['Missing Supabase URL configuration.'] }
    }

    if (!serviceRoleKey) {
      return { success: false, count: 0, importedMembers: [], errors: ['SUPABASE_SERVICE_ROLE_KEY environment variable is missing.'] }
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { count: startCount } = await adminSupabase
      .from('members')
      .select('*', { count: 'exact', head: true })
    let currentNum = (startCount || 0) + 1

    for (let i = 0; i < records.length; i++) {
      const rec = records[i]
      if (!rec.name || !rec.name.trim()) {
        errors.push(`Row ${i + 1}: Member name missing. Skipped.`)
        continue
      }

      const formattedName = rec.name.trim()
      const rawId = rec.memberId
        ? rec.memberId.trim().toUpperCase().replace(/^MEM-/, 'MEM')
        : `MEM${String(currentNum++).padStart(3, '0')}`

      const syntheticEmail = `${rawId}@gym.com`
      let authUserId: string | null = null

      // Create Supabase Auth account with DEFAULT_PASSWORD "123456"
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: syntheticEmail,
        password: DEFAULT_PASSWORD, // Hardcoded default password "123456" for bulk import
        email_confirm: true,
        user_metadata: {
          full_name: formattedName,
          member_id: rawId,
          phone: rec.phone || '',
        },
      })

      if (authError) {
        if (
          authError.message.toLowerCase().includes('already') ||
          authError.message.toLowerCase().includes('registered') ||
          authError.status === 422
        ) {
          const { data: existingUsers } = await adminSupabase.auth.admin.listUsers()
          const matched = existingUsers?.users?.find(
            (u) => u.email?.toLowerCase() === syntheticEmail.toLowerCase()
          )
          if (matched) authUserId = matched.id
        } else {
          errors.push(`Row ${i + 1} (${formattedName}): Auth error: ${authError.message}`)
        }
      } else if (authData?.user) {
        authUserId = authData.user.id
      }

      if (!authUserId) authUserId = rawId

      const memberPayload: any = {
        id: authUserId,
        auth_user_id: authUserId,
        member_id: rawId,
        full_name: formattedName,
        name: formattedName,
        phone: rec.phone || 'N/A',
        address: 'Balangoda',
        height: Number(rec.height) || 170,
        weight: Number(rec.weight) || 70,
        starting_weight: Number(rec.weight) || 70,
        tier: rec.package || null,
        status: 'Active',
        joined_date: new Date().toISOString().split('T')[0],
        emergency_contact: 'N/A',
      }

      const { data: dbData, error: dbError } = await adminSupabase
        .from('members')
        .insert([memberPayload])
        .select('*')

      if (dbError) {
        const fallback = { ...memberPayload }
        delete fallback.id
        const { data: fbData, error: fbErr } = await adminSupabase
          .from('members')
          .insert([fallback])
          .select('*')

        if (fbErr) {
          errors.push(`Row ${i + 1} (${formattedName}): DB Insert error: ${fbErr.message}`)
        } else {
          importedMembers.push(fbData?.[0] || fallback)
        }
      } else {
        importedMembers.push(dbData?.[0] || memberPayload)
      }
    }

    return {
      success: true,
      count: importedMembers.length,
      importedMembers,
      errors,
    }
  } catch (err: any) {
    console.error('Unhandled exception in importMembersCSVAction:', err)
    return {
      success: false,
      count: 0,
      importedMembers: [],
      errors: [err.message || 'Server error during CSV import.'],
    }
  }
}

export interface ResetPasswordInput {
  memberId?: string
  authUserId?: string
  newPassword?: string
}

export interface ResetPasswordResult {
  success: boolean
  message?: string
  error?: string
}

/**
 * Secure Server Action to forcefully reset a member's password using Supabase Admin Auth API.
 * Uses SUPABASE_SERVICE_ROLE_KEY to update password in auth.users table via updateUserById.
 */
export async function resetMemberPasswordAction(
  input: ResetPasswordInput
): Promise<ResetPasswordResult> {
  try {
    const newPassword = input.newPassword || '111111'
    let targetAuthUserId = input.authUserId ? input.authUserId.trim() : ''
    let memberIdStr = input.memberId ? input.memberId.trim() : ''

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return { success: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL configuration.' }
    }

    if (!serviceRoleKey) {
      return { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is missing.' }
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // If targetAuthUserId is provided and looks like a UUID, verify or use directly
    if (!targetAuthUserId && memberIdStr) {
      const cleanMemberId = memberIdStr.toUpperCase().replace(/^MEM-/, 'MEM')
      const memberIdWithHyphen = memberIdStr.toUpperCase().includes('MEM-')
        ? memberIdStr.toUpperCase()
        : memberIdStr.toUpperCase().replace(/^MEM/, 'MEM-')

      const { data: dbMembers } = await adminSupabase
        .from('members')
        .select('id, auth_user_id, member_id')
        .or(`id.eq.${memberIdStr},member_id.eq.${memberIdStr},member_id.eq.${cleanMemberId},member_id.eq.${memberIdWithHyphen}`)

      if (dbMembers && dbMembers.length > 0) {
        const found = dbMembers[0]
        targetAuthUserId = found.auth_user_id || found.id || ''
      }
    }

    // Attempt listUsers search if targetAuthUserId is still empty
    if (!targetAuthUserId && memberIdStr) {
      const cleanMemberId = memberIdStr.toUpperCase().replace(/^MEM-/, 'MEM')
      const memberIdWithHyphen = memberIdStr.toUpperCase().includes('MEM-')
        ? memberIdStr.toUpperCase()
        : memberIdStr.toUpperCase().replace(/^MEM/, 'MEM-')

      const syntheticEmail1 = `${cleanMemberId}@gym.com`.toLowerCase()
      const syntheticEmail2 = `${memberIdWithHyphen}@gym.com`.toLowerCase()

      const { data: userList } = await adminSupabase.auth.admin.listUsers()
      if (userList?.users) {
        const matched = userList.users.find(
          (u) =>
            u.email?.toLowerCase() === syntheticEmail1 ||
            u.email?.toLowerCase() === syntheticEmail2 ||
            u.id === memberIdStr
        )
        if (matched) {
          targetAuthUserId = matched.id
        }
      }
    }

    // Execute updateUserById via Supabase Auth Admin API
    if (targetAuthUserId) {
      const { error: updateErr } = await adminSupabase.auth.admin.updateUserById(targetAuthUserId, {
        password: newPassword,
      })

      if (updateErr) {
        console.error('⚠️ Supabase Admin updateUserById Error:', updateErr.message)
        return { success: false, error: `Failed to reset password: ${updateErr.message}` }
      }

      return {
        success: true,
        message: `Password successfully reset to ${newPassword}`,
      }
    }

    // Fallback: If auth account does not exist in auth.users, create it
    if (memberIdStr) {
      const cleanMemberId = memberIdStr.toUpperCase().replace(/^MEM-/, 'MEM')
      const syntheticEmail = `${cleanMemberId}@gym.com`

      const { data: newAuthData, error: createErr } = await adminSupabase.auth.admin.createUser({
        email: syntheticEmail,
        password: newPassword,
        email_confirm: true,
        user_metadata: { member_id: cleanMemberId },
      })

      if (createErr) {
        return {
          success: false,
          error: `Could not reset password or create Auth account: ${createErr.message}`,
        }
      }

      if (newAuthData?.user) {
        await adminSupabase
          .from('members')
          .update({ auth_user_id: newAuthData.user.id })
          .or(`member_id.eq.${memberIdStr},member_id.eq.${cleanMemberId}`)

        return {
          success: true,
          message: `Created Auth account and set password to ${newPassword}`,
        }
      }
    }

    return {
      success: false,
      error: 'Could not resolve member Auth account. Please check member ID or UUID.',
    }
  } catch (err: any) {
    console.error('Exception in resetMemberPasswordAction:', err)
    return { success: false, error: err?.message || 'Server error occurred resetting password.' }
  }
}
