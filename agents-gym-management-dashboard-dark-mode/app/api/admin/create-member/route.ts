import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      memberId,
      name,
      password,
      phone,
      address,
      height,
      weight,
      tier,
      status,
      emergencyContact,
    } = body

    // 1. Input Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Member Full Name is required.' },
        { status: 400 }
      )
    }

    if (!memberId || !memberId.trim()) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required.' },
        { status: 400 }
      )
    }

    if (!password || password.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    // 2. Service Role Client Initialization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL configuration.' },
        { status: 500 }
      )
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Auto-format memberId without hyphen (e.g. MEM-022 -> MEM022)
    const cleanMemberId = memberId.trim().toUpperCase().replace(/^MEM-/, 'MEM')

    // Synthetic email trick: e.g. MEM022@gym.com
    const syntheticEmail = `${cleanMemberId}@gym.com`

    // 3. Create Auth Account using Supabase Admin Auth API
    let authUserId: string | null = null

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: syntheticEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        member_id: cleanMemberId,
        phone: phone,
      },
    })

    if (authError) {
      console.error('⚠️ Supabase Auth Admin Error:', authError)

      // Handle user already exists by retrieving existing Auth user ID
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
            console.log('✅ Matched Existing Auth User ID:', authUserId)
          } else {
            return NextResponse.json(
              { success: false, error: `Auth Error: ${authError.message}` },
              { status: 400 }
            )
          }
        } catch (e: any) {
          return NextResponse.json(
            { success: false, error: `Auth Error: ${authError.message}` },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { success: false, error: `Auth Account Creation Failed: ${authError.message}` },
          { status: 400 }
        )
      }
    } else if (authData?.user) {
      authUserId = authData.user.id
      console.log('✅ Created Supabase Auth User ID (authData.user.id):', authData.user.id)
    }

    console.log('🔑 Resolved Auth User ID:', authUserId)

    if (!authUserId) {
      return NextResponse.json(
        { success: false, error: 'Could not resolve Auth User ID.' },
        { status: 500 }
      )
    }

    // 4. Calculate BMI
    const bmiVal = (weight && height)
      ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)
      : '22.0'

    // 5. Insert into Supabase `members` database table with linked auth_user_id (UUID)
    const fullPayload: any = {
      id: authUserId,
      auth_user_id: authUserId,
      member_id: cleanMemberId,
      full_name: name,
      name: name,
      phone: phone || 'N/A',
      address: address || 'Balangoda',
      height: Number(height) || 170,
      weight: Number(weight) || 70,
      starting_weight: Number(weight) || 70,
      tier: tier || 'Standard',
      status: status || 'Active',
      joined_date: new Date().toISOString().split('T')[0],
      emergency_contact: emergencyContact || 'N/A',
    }

    console.log('📦 Exact Payload for members insert (Full Payload):', JSON.stringify(fullPayload, null, 2))

    const { data: dbData, error: dbError } = await adminSupabase
      .from('members')
      .insert([fullPayload])
      .select('*')

    console.log('📥 Response Data from members insert:', dbData)
    console.log('❌ Response Error from members insert:', dbError)

    if (dbError) {
      console.error('Database Insertion Error (Full Payload):', dbError.message)

      // Fallback 1: Try without explicitly setting string 'id' column if schema uses auto UUID or auth_user_id
      const payloadWithoutId: any = { ...fullPayload }
      delete payloadWithoutId.id

      console.log('📦 Fallback 1 Payload (Without ID):', JSON.stringify(payloadWithoutId, null, 2))

      const { data: dbData2, error: dbErr2 } = await adminSupabase
        .from('members')
        .insert([payloadWithoutId])
        .select('*')

      console.log('📥 Fallback 1 Response Data:', dbData2)
      console.log('❌ Fallback 1 Response Error:', dbErr2)

      if (dbErr2) {
        console.error('Database Insertion Error (Payload without ID):', dbErr2.message)

        // Fallback 2: Try core columns guaranteed on members table
        const corePayload: any = {
          id: authUserId,
          auth_user_id: authUserId,
          member_id: cleanMemberId,
          full_name: name,
          name: name,
          phone: phone || 'N/A',
          address: address || 'Balangoda',
          status: status || 'Active',
          joined_date: new Date().toISOString().split('T')[0],
        }

        console.log('📦 Fallback 2 Payload (Core Payload):', JSON.stringify(corePayload, null, 2))

        const { data: dbData3, error: dbErr3 } = await adminSupabase
          .from('members')
          .insert([corePayload])
          .select('*')

        console.log('📥 Fallback 2 Response Data:', dbData3)
        console.log('❌ Fallback 2 Response Error:', dbErr3)

        if (dbErr3) {
          console.error('Database Insertion Error (Core Payload):', dbErr3.message)
          return NextResponse.json(
            {
              success: false,
              error: `Database Insertion Failed: ${dbError.message} | ${dbErr2.message} | ${dbErr3.message}`,
            },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          authUserId: authUserId,
          syntheticEmail: syntheticEmail,
          member: dbData3?.[0] || corePayload,
          message: `Member registered and linked to Auth user ${syntheticEmail}`,
        })
      }

      return NextResponse.json({
        success: true,
        authUserId: authUserId,
        syntheticEmail: syntheticEmail,
        member: dbData2?.[0] || payloadWithoutId,
        message: `Member registered and linked to Auth user ${syntheticEmail}`,
      })
    }

    return NextResponse.json({
      success: true,
      authUserId: authUserId,
      syntheticEmail: syntheticEmail,
      member: dbData?.[0] || fullPayload,
      message: `Member registered and linked to Auth user ${syntheticEmail}`,
    })
  } catch (err: any) {
    console.error('Unhandled exception in create-member route:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Server error occurred during member creation.' },
      { status: 500 }
    )
  }
}
