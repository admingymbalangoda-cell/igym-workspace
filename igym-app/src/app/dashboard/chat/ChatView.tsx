'use client'

import { useState, useRef, useEffect } from 'react'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

export interface ChatMessageItem {
  id: string
  member_id: string
  sender: string
  message: string
  image_url?: string
  created_at: string
}

function formatChatTime(isoStr: string): string {
  if (!isoStr) return ''
  const dt = new Date(isoStr)
  if (isNaN(dt.getTime())) return isoStr
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatView() {
  const supabase = createClient()

  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [loggedInMemberId, setLoggedInMemberId] = useState<string>('')
  const [currentAuthUserId, setCurrentAuthUserId] = useState<string>('')
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Synchronous refs for real-time validation guard
  const loggedInMemberIdRef = useRef(loggedInMemberId)
  loggedInMemberIdRef.current = loggedInMemberId
  const currentAuthUserIdRef = useRef(currentAuthUserId)
  currentAuthUserIdRef.current = currentAuthUserId

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 1. Fetch real chat_messages on component mount
  useEffect(() => {
    let isMounted = true

    async function initChat() {
      try {
        setLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return
        if (isMounted) setCurrentAuthUserId(user.id)

        const userEmail = user.email ?? ''
        const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()
        const cleanId = emailPrefix.toUpperCase().replace(/^MEM-/, 'MEM')
        const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

        // Resolve active member_id from Supabase members table
        const { data: member } = await supabase
          .from('members')
          .select('id, member_id')
          .or(`member_id.eq.${cleanId},member_id.eq.${hyphenId},auth_user_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle()

        const resolvedMemberId = member?.member_id || member?.id || cleanId
        if (isMounted) setLoggedInMemberId(resolvedMemberId)

        // Fetch messages from chat_messages table
        const { data: chatData, error: chatError } = await supabase
          .from('chat_messages')
          .select('*')
          .or(`member_id.eq.${resolvedMemberId},member_id.eq.${cleanId},member_id.eq.${hyphenId},member_id.eq.${user.id}`)
          .order('created_at', { ascending: true })

        if (chatError) {
          console.error('Error fetching chat_messages:', chatError)
        } else if (chatData && isMounted) {
          const formatted: ChatMessageItem[] = chatData.map((m: any) => ({
            id: String(m.id || `msg-${Date.now()}`),
            member_id: m.member_id || resolvedMemberId,
            sender: m.sender || m.sender_id || 'member',
            message: m.message || m.text || m.content || '',
            image_url: m.image_url || m.imageUrl || undefined,
            created_at: m.created_at || new Date().toISOString(),
          }))
          setMessages(formatted)
        }
      } catch (err) {
        console.error('Exception initializing chat:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initChat()

    return () => {
      isMounted = false
    }
  }, [supabase])

  // 2. Real-time Subscription to `chat_messages` table filtered for current member
  useEffect(() => {
    const cleanId = loggedInMemberId ? loggedInMemberId.toUpperCase().replace(/^MEM-/, 'MEM') : ''
    const hyphenId = cleanId ? cleanId.replace(/^MEM/, 'MEM-') : ''
    const activeMemberId = loggedInMemberId || cleanId || currentAuthUserId || 'MEM001'

    // Channel name uniquely scoped to the logged-in user
    const channelName = `chat-messages-${activeMemberId}`

    const handleIncomingMessage = (payload: any) => {
      const newMsgData = payload?.new
      if (!newMsgData) return

      // =======================================================================
      // 1. STRICT IMMEDIATE GUARD CLAUSE AT THE VERY TOP OF THE CALLBACK
      // =======================================================================
      const activeUser = currentAuthUserIdRef.current || currentAuthUserId
      const activeMember = loggedInMemberIdRef.current || loggedInMemberId
      const memberClean = activeMember ? activeMember.toUpperCase().replace(/^MEM-/, 'MEM') : ''
      const memberHyphen = memberClean ? memberClean.replace(/^MEM/, 'MEM-') : ''

      const validUserIds = new Set<string>(
        [activeUser, activeMember, memberClean, memberHyphen].filter((id) => Boolean(id && id.trim()))
      )

      // Extract all payload fields that could identify user/member/room ownership
      const payloadUserId = String(newMsgData.user_id || '').trim()
      const payloadMemberId = String(newMsgData.member_id || '').trim()
      const payloadSenderId = String(newMsgData.sender_id || newMsgData.sender || '').trim()
      const payloadReceiverId = String(newMsgData.receiver_id || newMsgData.receiver || '').trim()
      const payloadRoomId = String(newMsgData.room_id || '').trim()

      // STRICT USER VALIDATION: Payload MUST explicitly belong to current user
      const matchesUserId = payloadUserId !== '' && validUserIds.has(payloadUserId)
      const matchesMemberId = payloadMemberId !== '' && validUserIds.has(payloadMemberId)
      const matchesSenderId = payloadSenderId !== '' && validUserIds.has(payloadSenderId)
      const matchesReceiverId = payloadReceiverId !== '' && validUserIds.has(payloadReceiverId)
      const matchesRoomId = payloadRoomId !== '' && validUserIds.has(payloadRoomId)

      const isCurrentUsersMessage =
        matchesUserId || matchesMemberId || matchesSenderId || matchesReceiverId || matchesRoomId

      // IMMEDIATELY RETURN - DO NOT TOUCH REACT STATE FOR OTHER USERS!
      if (!isCurrentUsersMessage) {
        return
      }

      // =======================================================================
      // 2. ONLY CALL setMessages AFTER STRICT CHECK HAS PASSED
      // =======================================================================
      const msgId = String(newMsgData.id || `msg-${Date.now()}`)
      const msgText = newMsgData.message || newMsgData.text || newMsgData.content || ''
      const msgSender = newMsgData.sender || newMsgData.sender_id || 'member'
      const msgImageUrl = newMsgData.image_url || newMsgData.imageUrl || undefined

      const incomingItem: ChatMessageItem = {
        id: msgId,
        member_id: payloadMemberId || activeMember,
        sender: msgSender,
        message: msgText,
        image_url: msgImageUrl,
        created_at: newMsgData.created_at || new Date().toISOString(),
      }

      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some(
          (m) =>
            m.id === msgId ||
            (m.message === msgText &&
              m.sender === msgSender &&
              Math.abs(new Date(m.created_at).getTime() - new Date(incomingItem.created_at).getTime()) < 10000)
        )
        if (isDuplicate) return prevMessages
        return [...prevMessages, incomingItem]
      })
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `member_id=eq.${activeMemberId}`,
        },
        handleIncomingMessage
      )

    // Additional listeners if member_id in DB uses cleanId or hyphenId format
    if (cleanId && cleanId !== activeMemberId) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `member_id=eq.${cleanId}`,
        },
        handleIncomingMessage
      )
    }

    if (hyphenId && hyphenId !== activeMemberId && hyphenId !== cleanId) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `member_id=eq.${hyphenId}`,
        },
        handleIncomingMessage
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loggedInMemberId, currentAuthUserId])

  // Polling sync fallback
  useEffect(() => {
    if (!loggedInMemberId) return

    const interval = setInterval(async () => {
      const cleanId = loggedInMemberId.toUpperCase().replace(/^MEM-/, 'MEM')
      const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

      const { data: chatData } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`member_id.eq.${loggedInMemberId},member_id.eq.${cleanId},member_id.eq.${hyphenId}`)
        .order('created_at', { ascending: true })

      if (chatData) {
        const formatted: ChatMessageItem[] = chatData.map((m: any) => ({
          id: String(m.id || `msg-${Date.now()}`),
          member_id: m.member_id || loggedInMemberId,
          sender: m.sender || m.sender_id || 'member',
          message: m.message || m.text || m.content || '',
          image_url: m.image_url || m.imageUrl || undefined,
          created_at: m.created_at || new Date().toISOString(),
        }))
        setMessages((prev) => {
          if (prev.length === formatted.length) return prev
          return formatted
        })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [supabase, loggedInMemberId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 3. Send Text Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const newText = inputText.trim()
    if (!newText || sending) return

    setSending(true)
    const targetMemberId = loggedInMemberId || 'MEM001'

    try {
      const payload = {
        member_id: targetMemberId,
        sender_id: targetMemberId,
        receiver_id: 'admin',
        message: newText,
      }

      const { data: insertResult, error } = await supabase
        .from('chat_messages')
        .insert(payload)
        .select()

      if (error) {
        console.error('Error inserting message into chat_messages:', error)
      }

      const createdItem: ChatMessageItem = {
        id: insertResult && insertResult[0] ? String(insertResult[0].id) : `msg-${Date.now()}`,
        member_id: targetMemberId,
        sender: 'member',
        message: newText,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, createdItem])
      setInputText('')
    } catch (err) {
      console.error('Exception sending chat message:', err)
    } finally {
      setSending(false)
    }
  }

  // 4. Send Image Attachment with Image Compression
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const targetMemberId = loggedInMemberId || 'MEM001'

    try {
      // Compress image before upload using browser-image-compression
      const compressionOptions = {
        maxSizeMB: 0.2, // Compress to approx 200KB
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      }

      console.log('Compressing image file...', file.name, `Original size: ${(file.size / 1024).toFixed(1)} KB`)
      const compressedFile = await imageCompression(file, compressionOptions)
      console.log('Compression complete. New size:', `( ${(compressedFile.size / 1024).toFixed(1)} KB )`)

      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `${targetMemberId}/${Date.now()}.${fileExt}`

      let publicUrl = ''

      // Attempt 1: Upload to 'chat_images' bucket
      const { error: uploadErr1 } = await supabase.storage
        .from('chat_images')
        .upload(filePath, compressedFile, { cacheControl: '3600', upsert: true })

      if (!uploadErr1) {
        const { data: urlRes } = supabase.storage.from('chat_images').getPublicUrl(filePath)
        publicUrl = urlRes.publicUrl
      } else {
        // Attempt 2: Upload to 'chat_attachments' bucket
        const { error: uploadErr2 } = await supabase.storage
          .from('chat_attachments')
          .upload(filePath, compressedFile, { cacheControl: '3600', upsert: true })

        if (!uploadErr2) {
          const { data: urlRes } = supabase.storage.from('chat_attachments').getPublicUrl(filePath)
          publicUrl = urlRes.publicUrl
        } else {
          // Attempt 3: Upload to 'gym_images' bucket under 'chat/'
          const { error: uploadErr3 } = await supabase.storage
            .from('gym_images')
            .upload(`chat/${filePath}`, compressedFile, { cacheControl: '3600', upsert: true })

          if (!uploadErr3) {
            const { data: urlRes } = supabase.storage.from('gym_images').getPublicUrl(`chat/${filePath}`)
            publicUrl = urlRes.publicUrl
          } else {
            console.error('Upload failed across buckets:', uploadErr1, uploadErr2, uploadErr3)
            alert(`Image upload failed: ${uploadErr1.message || uploadErr2.message || uploadErr3.message}`)
            return
          }
        }
      }

      // Format payload with image_url AND fallback string syntax [IMAGE: ...]
      const payload = {
        member_id: targetMemberId,
        sender_id: targetMemberId,
        receiver_id: 'admin',
        message: `[IMAGE: ${publicUrl}]`,
        image_url: publicUrl,
      }

      const { data: insertedRows, error: dbErr } = await supabase
        .from('chat_messages')
        .insert([payload])
        .select()

      if (dbErr) {
        console.error('Error inserting image chat_message:', dbErr)
      }

      const createdItem: ChatMessageItem = {
        id: insertedRows && insertedRows[0] ? String(insertedRows[0].id) : `msg-${Date.now()}`,
        member_id: targetMemberId,
        sender: 'member',
        message: `[IMAGE: ${publicUrl}]`,
        image_url: publicUrl,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, createdItem])
    } catch (err: any) {
      console.error('Exception compressing/uploading image attachment:', err)
      alert(`Could not attach image: ${err?.message || 'Error uploading'}`)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Determine if a message is sent by the logged-in member (for RIGHT alignment)
  const checkIsMemberMessage = (msg: ChatMessageItem) => {
    const sender = (msg.sender || '').toString().toLowerCase()
    const memberIdStr = (loggedInMemberId || '').toString().toLowerCase()
    const authUserIdStr = (currentAuthUserId || '').toString().toLowerCase()

    if (sender === 'admin' || sender === 'support' || sender === 'desk') {
      return false
    }

    return (
      sender === 'member' ||
      sender === 'user' ||
      sender === memberIdStr ||
      sender === authUserIdStr ||
      (msg.member_id && msg.member_id.toLowerCase() === memberIdStr)
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto p-4 md:p-6 w-full">
      {/* ── Hidden File Input for Image Attachments ───────────────────────── */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelect}
      />

      {/* ── Full-Screen Image Preview Modal ──────────────────────────────── */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              className="absolute -top-10 right-0 text-white hover:text-red-500 text-3xl font-bold transition-colors"
              onClick={() => setPreviewImageModal(null)}
            >
              &times;
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageModal}
              alt="Full size attachment"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-zinc-800 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ── Chat Channel Banner Header ───────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-2xl mb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex -space-x-3">
            <span className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs border-2 border-zinc-900 shadow-md">
              GS
            </span>
            <span className="w-10 h-10 rounded-full bg-zinc-800 text-gray-200 font-bold flex items-center justify-center text-xs border-2 border-zinc-900 shadow-md">
              AD
            </span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Member Support &amp; Gym Admin</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Online &bull; Live Desk &amp; Trainer Sync
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages Feed Area ───────────────────────────────────────────── */}
      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 overflow-y-auto shadow-2xl flex flex-col gap-4">
        <div className="text-center my-1">
          <span className="text-[11px] font-mono text-gray-400 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
            Live Conversation History
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center my-auto p-12 text-gray-400">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs">Loading message history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center my-auto p-8">
            <p className="text-sm font-semibold text-gray-300">No messages yet.</p>
            <p className="text-xs text-gray-500 mt-1">Send a message or photo below to start chatting with iGYM Support.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = checkIsMemberMessage(msg)

            // Extract image URL from either property or string pattern [IMAGE: url]
            let imageUrl = msg.image_url
            let displayMsgText = msg.message

            if (!imageUrl && displayMsgText && displayMsgText.includes('[IMAGE:')) {
              const match = displayMsgText.match(/\[IMAGE:\s*([^\]]+)\]/)
              if (match && match[1]) {
                imageUrl = match[1].trim()
                displayMsgText = displayMsgText.replace(/\[IMAGE:\s*([^\]]+)\]/, '').trim()
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar for Incoming Support / Admin Messages (Left Side Only) */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 text-gray-200 text-xs font-bold flex items-center justify-center shrink-0 border border-zinc-700 shadow">
                    AD
                  </div>
                )}

                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name Label */}
                  {!isUser && (
                    <span className="text-[11px] font-semibold text-zinc-400 mb-1 ml-1">
                      iGYM Admin &amp; Support
                    </span>
                  )}

                  {/* Message Bubble (Div wrapper used to avoid invalid HTML nesting hydration errors) */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl shadow-xl transition-all ${
                      isUser
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 rounded-tr-xs'
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Text Message Content rendered inside div */}
                    {displayMsgText && (
                      <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-zinc-200">
                        {displayMsgText}
                      </div>
                    )}

                    {/* Image Attachment Thumbnail */}
                    {imageUrl && (
                      <div
                        className="mt-2 rounded-xl overflow-hidden cursor-pointer border border-zinc-800 bg-zinc-950/50 hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewImageModal(imageUrl!)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="Uploaded attachment"
                          className="max-w-full max-h-60 object-cover rounded-xl block"
                        />
                      </div>
                    )}

                    {/* Time & Read Status Footer */}
                    <div
                      className={`flex items-center gap-1.5 mt-1.5 text-[10px] text-zinc-400 ${
                        isUser ? 'justify-end font-medium' : 'justify-start'
                      }`}
                    >
                      <span>{formatChatTime(msg.created_at)}</span>
                      {isUser && (
                        <svg className="w-3 h-3 fill-zinc-400" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Message Input Bar ─────────────────────────────────────────────── */}
      <form onSubmit={handleSend} className="mt-4 flex gap-2.5 items-center">
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center px-4 py-2.5 shadow-2xl focus-within:border-red-500/80 transition-all">
          <input
            type="text"
            className="w-full bg-transparent text-white text-xs sm:text-sm focus:outline-none placeholder-gray-500"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending || uploadingImage}
          />

          {/* Attachment / Image Upload Button */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-zinc-800 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || sending}
            title="Attach Image"
          >
            {uploadingImage ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 sm:px-5 sm:py-3 rounded-2xl transition-all shadow-xl hover:shadow-red-600/25 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={(!inputText.trim() && !uploadingImage) || sending}
        >
          <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  )
}
