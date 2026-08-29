'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function GlobalNotificationListener() {
  const router = useRouter()
  const supabase = createClient()
  const userIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let isMounted = true

    async function initUserAndSubscription() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user || !isMounted) return

        const validIds = new Set<string>()
        validIds.add(user.id)

        const userEmail = user.email ?? ''
        const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()
        const cleanId = emailPrefix.toUpperCase().replace(/^MEM-/, 'MEM')
        const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

        if (cleanId) validIds.add(cleanId)
        if (hyphenId) validIds.add(hyphenId)

        // Query member record to get member UUID & member_id
        const { data: member } = await supabase
          .from('members')
          .select('id, member_id')
          .or(`member_id.eq.${cleanId},member_id.eq.${hyphenId},auth_user_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle()

        if (member) {
          if (member.id) validIds.add(String(member.id))
          if (member.member_id) validIds.add(String(member.member_id))
        }

        userIdsRef.current = validIds

        // Real-time subscription to INSERT events on chat_messages table
        const channel = supabase
          .channel('global-member-chat-notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
            },
            (payload: any) => {
              const newMsg = payload.new
              if (!newMsg) return

              const receiverId = String(newMsg.receiver_id || newMsg.receiver || '').trim()
              const memberId = String(newMsg.member_id || '').trim()
              const sender = String(newMsg.sender || newMsg.sender_id || '').trim().toLowerCase()
              const messageText = String(newMsg.message || newMsg.text || newMsg.content || '').trim()

              // Check if receiver_id matches logged-in user's IDs
              // (or if sender is admin and target memberId matches member)
              const isTargetedToUser =
                (receiverId !== '' && userIdsRef.current.has(receiverId)) ||
                (sender === 'admin' && userIdsRef.current.has(memberId)) ||
                (sender === 'admin' && receiverId !== '' && userIdsRef.current.has(receiverId))

              // Don't trigger for messages sent by the member themselves
              const isFromMember = sender === 'member' || sender === user.id || userIdsRef.current.has(sender)

              if (isTargetedToUser && !isFromMember) {
                // Play notification sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
                audio.play().catch((e) => console.log('Audio play failed', e))

                // Prepare message snippet
                const snippet =
                  messageText.length > 65 ? messageText.substring(0, 62) + '...' : messageText || 'Sent an attachment'

                // Trigger UI toast notification
                toast(
                  (t) => (
                    <div
                      onClick={() => {
                        toast.dismiss(t.id)
                        router.push('/dashboard/chat')
                      }}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          color: '#ef4444',
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>New Message from Admin</span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: '#e4e4e7',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                        }}
                      >
                        {snippet}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#a1a1aa',
                          marginTop: '2px',
                          fontWeight: 500,
                        }}
                      >
                        Click to view in Chat &rarr;
                      </div>
                    </div>
                  ),
                  {
                    duration: 6000,
                    style: {
                      background: '#18181b',
                      color: '#f4f4f5',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                      maxWidth: '380px',
                    },
                  }
                )
              }
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        console.error('Error in GlobalNotificationListener:', err)
      }
    }

    let channelCleanup: (() => void) | undefined

    initUserAndSubscription().then((cleanup) => {
      if (cleanup && isMounted) {
        channelCleanup = cleanup
      } else if (cleanup) {
        cleanup()
      }
    })

    return () => {
      isMounted = false
      if (channelCleanup) channelCleanup()
    }
  }, [supabase, router])

  return null
}
