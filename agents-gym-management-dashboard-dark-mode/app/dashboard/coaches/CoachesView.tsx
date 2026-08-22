'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Clock,
  RefreshCw,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react'

export interface PendingCoachRequest {
  id: string
  memberId: string
  senderId: string
  memberName: string
  requestedCoachName: string
  coachId?: string
  messageText: string
  createdAt: string
  timestamp: string
  rawMessage: any
}

export interface CoachesViewProps {
  members?: any[]
  coaches?: any[]
  onAssignSuccess?: () => void
}

export default function CoachesView({ members = [], coaches = [], onAssignSuccess }: CoachesViewProps) {
  const [pendingCoachRequests, setPendingCoachRequests] = useState<PendingCoachRequest[]>([])
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Fetch records from chat_messages table starting with or containing "System Automated Request:"
  const loadPendingCoachRequests = useCallback(async () => {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .ilike('message', '%System Automated Request:%')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending coach requests:', error)
        return
      }

      if (!messages || messages.length === 0) {
        setPendingCoachRequests([])
        return
      }

      // Fetch admin replies to check if request is already responded to
      const { data: allAdminMsgs } = await supabase
        .from('chat_messages')
        .select('*')
        .or('sender_id.eq.admin,sender.eq.admin')

      const handledIdsRaw = typeof window !== 'undefined' ? localStorage.getItem('igym_handled_coach_requests') : null
      const handledIds: string[] = handledIdsRaw ? JSON.parse(handledIdsRaw) : []

      const pendingList: PendingCoachRequest[] = []

      for (const msg of messages) {
        const msgId = String(msg.id)
        if (handledIds.includes(msgId)) continue

        const memberIdStr = String(msg.member_id || msg.sender_id || '').trim()
        const senderIdStr = String(msg.sender_id || msg.member_id || '').trim()

        const requestTime = new Date(msg.created_at || Date.now()).getTime()
        const hasAdminReply = allAdminMsgs?.some((admMsg: any) => {
          const admMemberId = String(admMsg.member_id || admMsg.receiver_id || '').trim()
          const admTime = new Date(admMsg.created_at || Date.now()).getTime()
          const admText = String(admMsg.message || '')
          const matchesMember = admMemberId === memberIdStr || admMemberId === senderIdStr
          const matchesResponseText =
            admText.includes('approved') ||
            admText.includes('fully booked') ||
            admText.includes('Your request for Personal Training has been approved') ||
            admText.includes('Sorry, this coach is currently fully booked')
          return matchesMember && admTime >= requestTime - 1000 && matchesResponseText
        })

        if (hasAdminReply) continue

        const targetMember = members.find(
          (m) =>
            m.id === memberIdStr ||
            m.memberId === memberIdStr ||
            m.dbUuid === memberIdStr ||
            m.authUserId === senderIdStr ||
            m.id === senderIdStr
        )

        const resolvedMemberName =
          targetMember?.name ||
          (memberIdStr && memberIdStr.length < 15 ? `Member (${memberIdStr})` : `Member (${memberIdStr.slice(0, 8)})`)

        const msgText = String(msg.message || '')
        let coachNameStr = ''
        if (msgText.includes('with Coach ')) {
          coachNameStr = msgText.split('with Coach ')[1]?.replace(/\.$/, '').trim() || ''
        } else if (msgText.includes('Coach ')) {
          coachNameStr = msgText.split('Coach ')[1]?.replace(/\.$/, '').trim() || ''
        } else {
          coachNameStr = 'Unspecified Coach'
        }

        const matchedCoach = coaches.find(
          (c) =>
            c.name.toLowerCase().includes(coachNameStr.toLowerCase()) ||
            coachNameStr.toLowerCase().includes(c.name.toLowerCase())
        )

        pendingList.push({
          id: msgId,
          memberId: memberIdStr,
          senderId: senderIdStr,
          memberName: resolvedMemberName,
          requestedCoachName: coachNameStr || 'Coach',
          coachId: matchedCoach?.id,
          messageText: msgText,
          createdAt: msg.created_at || new Date().toISOString(),
          timestamp: new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawMessage: msg,
        })
      }

      setPendingCoachRequests(pendingList)
    } catch (err) {
      console.error('Exception loading pending coach requests:', err)
    }
  }, [members, coaches])

  useEffect(() => {
    loadPendingCoachRequests()
  }, [loadPendingCoachRequests])

  // Real-time listener for incoming coach request chat_messages
  useEffect(() => {
    const channel = supabase
      .channel('coaches_view_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const msgText = String(payload.new?.message || '')
          if (msgText.includes('System Automated Request:')) {
            loadPendingCoachRequests()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadPendingCoachRequests])

  // Accept Action Handler
  const handleAccept = async (req: PendingCoachRequest) => {
    setActionLoading((prev) => ({ ...prev, [req.id]: true }))
    try {
      const targetMember = members.find(
        (m) =>
          m.id === req.memberId ||
          m.memberId === req.memberId ||
          m.dbUuid === req.memberId ||
          m.authUserId === req.senderId ||
          m.id === req.senderId
      )

      const targetCoach = coaches.find(
        (c) =>
          c.name.toLowerCase().includes(req.requestedCoachName.toLowerCase()) ||
          req.requestedCoachName.toLowerCase().includes(c.name.toLowerCase())
      )

      const assignedCoachId = targetCoach?.id || req.coachId || 'COACH-001'
      const assignedCoachName = targetCoach?.name || req.requestedCoachName

      if (targetMember) {
        const memUuid = targetMember.dbUuid || targetMember.id
        await supabase
          .from('members')
          .update({
            coach_id: assignedCoachId,
            coach_name: assignedCoachName,
          })
          .or(`id.eq.${memUuid},member_id.eq.${req.memberId},auth_user_id.eq.${req.senderId}`)
      } else {
        await supabase
          .from('members')
          .update({
            coach_id: assignedCoachId,
            coach_name: assignedCoachName,
          })
          .or(`member_id.eq.${req.memberId},auth_user_id.eq.${req.senderId}`)
      }

      // Automated approval response message into chat_messages
      const replyPayload = {
        member_id: req.memberId,
        sender_id: 'admin',
        receiver_id: req.senderId || req.memberId,
        message: 'Your request for Personal Training has been approved!',
        timestamp: new Date().toISOString(),
      }

      await supabase.from('chat_messages').insert([replyPayload])

      // Persist handled request ID
      const handledIdsRaw = typeof window !== 'undefined' ? localStorage.getItem('igym_handled_coach_requests') : null
      const handledIds: string[] = handledIdsRaw ? JSON.parse(handledIdsRaw) : []
      if (!handledIds.includes(req.id)) {
        handledIds.push(req.id)
        if (typeof window !== 'undefined') {
          localStorage.setItem('igym_handled_coach_requests', JSON.stringify(handledIds))
        }
      }

      setPendingCoachRequests((prev) => prev.filter((r) => r.id !== req.id))
      setToastMessage(`✅ Approved request: Assigned ${assignedCoachName} to ${req.memberName}`)
      if (onAssignSuccess) onAssignSuccess()
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err: any) {
      console.error('Exception accepting coach request:', err)
      setToastMessage(`Failed to accept request: ${err?.message || 'Error occurred'}`)
      setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setActionLoading((prev) => ({ ...prev, [req.id]: false }))
    }
  }

  // Decline Action Handler
  const handleDecline = async (req: PendingCoachRequest) => {
    setActionLoading((prev) => ({ ...prev, [req.id]: true }))
    try {
      // Automated decline response message into chat_messages
      const replyPayload = {
        member_id: req.memberId,
        sender_id: 'admin',
        receiver_id: req.senderId || req.memberId,
        message: 'Sorry, this coach is currently fully booked.',
        timestamp: new Date().toISOString(),
      }

      await supabase.from('chat_messages').insert([replyPayload])

      // Persist handled request ID
      const handledIdsRaw = typeof window !== 'undefined' ? localStorage.getItem('igym_handled_coach_requests') : null
      const handledIds: string[] = handledIdsRaw ? JSON.parse(handledIdsRaw) : []
      if (!handledIds.includes(req.id)) {
        handledIds.push(req.id)
        if (typeof window !== 'undefined') {
          localStorage.setItem('igym_handled_coach_requests', JSON.stringify(handledIds))
        }
      }

      setPendingCoachRequests((prev) => prev.filter((r) => r.id !== req.id))
      setToastMessage(`Declined request for ${req.memberName}. Sent fully booked message.`)
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err: any) {
      console.error('Exception declining coach request:', err)
      setToastMessage(`Failed to decline request: ${err?.message || 'Error occurred'}`)
      setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setActionLoading((prev) => ({ ...prev, [req.id]: false }))
    }
  }

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-amber-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pending Coach Requests Section */}
      <div className="bg-[#181510] border border-amber-500/40 rounded-2xl p-5 shadow-xl shadow-amber-950/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Pending Coach Requests
                {pendingCoachRequests.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-xs font-black animate-pulse">
                    {pendingCoachRequests.length} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review automated member requests for personal trainers and accept or decline.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadPendingCoachRequests()}
            className="px-3 py-1.5 rounded-xl bg-[#0d0c09] border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 cursor-pointer"
            title="Refresh requests list"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {pendingCoachRequests.length === 0 ? (
          <div className="py-8 text-center bg-[#0d0c09] border border-zinc-800/80 rounded-xl px-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-zinc-200">No Pending Coach Requests</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              All incoming automated coach requests sent by members via chat have been processed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingCoachRequests.map((req) => {
              const isLoading = actionLoading[req.id]
              return (
                <div
                  key={req.id}
                  className="bg-[#0d0c09] border border-amber-500/40 hover:border-amber-500/70 rounded-xl p-4 flex flex-col justify-between gap-3.5 shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-white tracking-wide">{req.memberName}</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-mono">
                          {req.memberId}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 font-medium flex items-center gap-1.5 flex-wrap">
                        <span className="text-zinc-400">Requested Coach:</span>
                        <span className="font-extrabold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/40 shadow-sm">
                          {req.requestedCoachName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-500 shrink-0 font-mono bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                      {req.timestamp}
                    </span>
                  </div>

                  <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2.5 text-xs text-zinc-400 italic font-sans leading-relaxed">
                    &ldquo;{req.messageText}&rdquo;
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleAccept(req)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" /> Accept Request
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDecline(req)}
                      className="flex-1 py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4" /> Decline Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
