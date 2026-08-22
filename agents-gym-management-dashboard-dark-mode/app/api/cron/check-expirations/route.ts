import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0
export const dynamic = 'force-dynamic'

/**
 * Daily Automated Cron Route: Check Membership Expirations
 * 1. Executes daily at 08:00 AM via Vercel Cron or external scheduler
 * 2. Queries `members` table for active members expiring in exactly 3 days
 * 3. Automatically inserts reminder notification messages into `chat_messages` table for Member App Chat
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized cron request.' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase environment variables.' },
        { status: 500 }
      )
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + 3)
    const targetDateStr = targetDate.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    console.log(`[CRON RUN] Checking member expirations for date: ${targetDateStr} (Today: ${todayStr})`)

    const { data: expiringMembers, error: queryError } = await adminSupabase
      .from('members')
      .select('id, member_id, full_name, name, expiry_date, status')
      .eq('status', 'Active')
      .eq('expiry_date', targetDateStr)

    if (queryError) {
      console.error('⚠️ Cron Query Error:', queryError.message)
      return NextResponse.json(
        { success: false, error: queryError.message },
        { status: 500 }
      )
    }

    if (!expiringMembers || expiringMembers.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No active members found expiring on ${targetDateStr}.`,
        checkedDate: todayStr,
        targetExpiryDate: targetDateStr,
        notifiedCount: 0,
        notifiedMembers: [],
      })
    }

    const notifiedMembers: Array<{ memberId: string; name: string; expiryDate: string }> = []
    const errors: string[] = []

    for (const member of expiringMembers) {
      const resolvedMemberId = member.member_id || member.id
      const memberName = member.full_name || member.name || 'Valued Member'
      const expiryFormatted = member.expiry_date || targetDateStr

      const reminderText = `⚠️ Friendly Reminder: Your iGYM membership expires in 3 days on ${expiryFormatted}. Please renew to avoid any interruption to your access.`

      const { error: insertError } = await adminSupabase.from('chat_messages').insert([
        {
          member_id: resolvedMemberId,
          sender_id: 'admin',
          receiver_id: resolvedMemberId,
          message: reminderText,
        },
      ])

      if (insertError) {
        console.error(`⚠️ Failed to send reminder to ${resolvedMemberId}:`, insertError.message)
        errors.push(`${resolvedMemberId}: ${insertError.message}`)
      } else {
        notifiedMembers.push({
          memberId: resolvedMemberId,
          name: memberName,
          expiryDate: expiryFormatted,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${notifiedMembers.length} expiry reminders.`,
      checkedDate: todayStr,
      targetExpiryDate: targetDateStr,
      notifiedCount: notifiedMembers.length,
      notifiedMembers,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('⚠️ Cron Exception:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Server Exception' },
      { status: 500 }
    )
  }
}
