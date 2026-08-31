'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'

interface WeightPoint {
  month: string
  weight: number
}

export default function ProgressView() {
  const supabase = createClient()
  const router = useRouter()

  const [weightData, setWeightData] = useState<WeightPoint[]>([])
  const [activePoint, setActivePoint] = useState<WeightPoint | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)
  const [draftWeight, setDraftWeight] = useState('75.0')
  const [memberId, setMemberId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [mounted, setMounted] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [memberDbUuid, setMemberDbUuid] = useState<string | null>(null)

  const [startingWeightVal, setStartingWeightVal] = useState<number>(80.0)
  const [currentWeightVal, setCurrentWeightVal] = useState<number>(75.0)
  const [targetWeightVal, setTargetWeightVal] = useState<number>(70.0)
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false)
  const [editTargetInput, setEditTargetInput] = useState<string>('70.0')
  const [loading, setLoading] = useState(true)

  // Guard against stale background polling or realtime events overwriting fresh local updates
  const lastLocalUpdateRef = useRef<number>(0)
  const pendingWeightRef = useRef<number | null>(null)
  const pendingTargetWeightRef = useRef<number | null>(null)
  const showLogModalRef = useRef(showLogModal)
  showLogModalRef.current = showLogModal
  const isUpdatingRef = useRef(isUpdating)
  isUpdatingRef.current = isUpdating
  const isEditingTargetRef = useRef(isEditingTarget)
  isEditingTargetRef.current = isEditingTarget

  // Client mount & Auth User resolution
  useEffect(() => {
    setMounted(true)
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCurrentUser(user)
      } else {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
          if (session?.user) {
            setCurrentUser(session.user)
          }
        })
        return () => subscription.unsubscribe()
      }
    }
    loadUser()
  }, [supabase])

  // 1. Fetch real weight progress data from `weight_tracking` table
  const fetchWeightData = useCallback(
    async (userObj?: any, isSilent = false) => {
      try {
        if (showLogModalRef.current || isUpdatingRef.current) {
          if (isSilent) return
        }

        const activeUser = userObj || currentUser
        if (!isSilent) setLoading(true)

        let userEmail = activeUser?.email ?? ''
        let userId = activeUser?.id ?? ''

        if (!userId) {
          const {
            data: { user: freshUser },
          } = await supabase.auth.getUser()
          if (freshUser) {
            userId = freshUser.id
            userEmail = freshUser.email ?? ''
          }
        }

        const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()
        const cleanId = emailPrefix.toUpperCase().replace(/^MEM-/, 'MEM')
        const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

        let memberData: any = null

        const { data: memberRows, error: fetchErr } = await supabase
          .from('members')
          .select('id, member_id, weight, weight_kg, starting_weight, target_weight, updated_at')
          .or(`auth_user_id.eq.${userId || ''},member_id.eq.${cleanId},member_id.eq.${hyphenId}`)
          .order('updated_at', { ascending: false })
          .limit(1)

        if (fetchErr) {
          console.error('Error fetching member profile:', fetchErr)
        }

        if (memberRows && memberRows.length > 0) {
          memberData = memberRows[0]
        } else {
          const { data: fallbackRows } = await supabase
            .from('members')
            .select('id, member_id, weight, weight_kg, starting_weight, target_weight')
            .in('member_id', [cleanId, hyphenId])
            .limit(1)

          if (fallbackRows && fallbackRows.length > 0) {
            memberData = fallbackRows[0]
          }
        }

        const targetMemberId = memberData?.member_id || memberData?.id || cleanId
        setMemberId(targetMemberId)

        if (memberData) {
          if (memberData.id) setMemberDbUuid(memberData.id)
          if (memberData.starting_weight) setStartingWeightVal(Number(memberData.starting_weight))
        }

        const isRecentlyUpdated = isUpdatingRef.current || Date.now() - lastLocalUpdateRef.current < 30000

        // Fetch Target Goal from Supabase members table (fallback to localStorage if empty)
        // Guard: Do NOT overwrite editTargetInput if user is currently editing target goal
        if (!isEditingTargetRef.current) {
          if (isRecentlyUpdated && pendingTargetWeightRef.current !== null) {
            const targetVal = pendingTargetWeightRef.current
            setTargetWeightVal(targetVal)
            setEditTargetInput(targetVal.toFixed(1))
          } else if (memberData?.target_weight && !isNaN(Number(memberData.target_weight)) && Number(memberData.target_weight) > 0) {
            const fetchedTarget = Number(memberData.target_weight)
            setTargetWeightVal(fetchedTarget)
            setEditTargetInput(fetchedTarget.toFixed(1))
          } else {
            const localKey = `target_weight_${targetMemberId}`
            const savedTarget = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null
            if (savedTarget && !isNaN(Number(savedTarget)) && Number(savedTarget) > 0) {
              const localTarget = Number(savedTarget)
              setTargetWeightVal(localTarget)
              setEditTargetInput(localTarget.toFixed(1))
            }
          }
        }

        // Query complete history from `weight_tracking` for the chart
        const { data: trackData, error: trackError } = await supabase
          .from('weight_tracking')
          .select('*')
          .or(`member_id.eq.${targetMemberId},member_id.eq.${cleanId},member_id.eq.${hyphenId},member_id.eq.${userId}`)
          .order('recorded_date', { ascending: true })

        if (trackError) {
          console.error('Error fetching weight_tracking history:', trackError)
        } else if (trackData && trackData.length > 0) {
          const formatted: WeightPoint[] = trackData.map((row: any) => {
            const dt = new Date(row.recorded_date || Date.now())
            const monthLabel = isNaN(dt.getTime())
              ? 'Log'
              : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return {
              month: monthLabel,
              weight: Number(row.weight),
            }
          })

          if (isRecentlyUpdated && pendingWeightRef.current !== null) {
            const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (formatted.length === 0 || formatted[formatted.length - 1].weight !== pendingWeightRef.current) {
              formatted.push({ month: todayLabel, weight: pendingWeightRef.current })
            }
            setWeightData(formatted)
            setActivePoint(formatted[formatted.length - 1])
            setCurrentWeightVal(pendingWeightRef.current)
          } else {
            setWeightData(formatted)
            const latestPoint = formatted[formatted.length - 1]
            setActivePoint(latestPoint)
            if (!isRecentlyUpdated) {
              setCurrentWeightVal(latestPoint.weight)
            }
          }
        } else {
          const fallbackW = memberData?.weight ? Number(memberData.weight) : 75.0
          const pointW = isRecentlyUpdated && pendingWeightRef.current !== null ? pendingWeightRef.current : fallbackW
          const fallbackPoint: WeightPoint = {
            month: 'Today',
            weight: pointW,
          }
          setWeightData([fallbackPoint])
          setActivePoint(fallbackPoint)
          if (!isRecentlyUpdated) {
            setCurrentWeightVal(fallbackW)
          } else if (pendingWeightRef.current !== null) {
            setCurrentWeightVal(pendingWeightRef.current)
          }
        }
      } catch (err) {
        console.error('Exception loading weight progress data:', err)
      } finally {
        if (!isSilent) setLoading(false)
      }
    },
    [currentUser, supabase]
  )

  useEffect(() => {
    if (!currentUser?.id) {
      fetchWeightData(undefined, false)
      return
    }
    fetchWeightData(currentUser, false)
  }, [currentUser?.id, fetchWeightData])

  // 2. Real-time Subscription (silent update)
  useEffect(() => {
    if (!memberId) return

    const channel = supabase
      .channel(`weight_tracking_channel_${memberId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weight_tracking',
        },
        (payload: any) => {
          if (showLogModalRef.current || isUpdatingRef.current || Date.now() - lastLocalUpdateRef.current < 30000) return
          if (payload.new && (payload.new as any).weight) {
            const updatedWeight = Number((payload.new as any).weight)
            setCurrentWeightVal(updatedWeight)
            fetchWeightData(undefined, true)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'weight_tracking',
        },
        (payload: any) => {
          if (showLogModalRef.current || isUpdatingRef.current || Date.now() - lastLocalUpdateRef.current < 30000) return
          if (payload.new && (payload.new as any).weight) {
            const updatedWeight = Number((payload.new as any).weight)
            setCurrentWeightVal(updatedWeight)
            fetchWeightData(undefined, true)
          }
        }
      )
      .subscribe()

    const pollInterval = setInterval(() => {
      if (showLogModalRef.current || isUpdatingRef.current || isEditingTargetRef.current || Date.now() - lastLocalUpdateRef.current < 30000) return
      fetchWeightData(undefined, true)
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [supabase, memberId, fetchWeightData])

  // Modernized Weight Submit Handler with Explicit alert() Error Catching & Cache Invalidation
  const handleLogSubmit = async (e?: React.SyntheticEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    if (!draftWeight || isNaN(Number(draftWeight))) return

    const weightVal = parseFloat(draftWeight)
    if (weightVal <= 0 || weightVal > 400) {
      alert('Please enter a valid weight in kg (1 - 400)')
      return
    }

    // Step 1: Set State Locking Mechanism
    setIsUpdating(true)
    setSubmitting(true)
    lastLocalUpdateRef.current = Date.now()
    pendingWeightRef.current = weightVal

    const recordedDate = new Date().toISOString().split('T')[0]
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const activeMemberId = memberId || (user?.email ? user.email.split('@')[0] : 'MEM001')
      const targetDbUuid = memberDbUuid || user?.id

      // Step 2: Synchronous insert into `weight_tracking`
      const payload = {
        member_id: activeMemberId,
        weight: weightVal,
        recorded_date: recordedDate,
      }

      console.log('🚀 Submitting weight_tracking payload to Supabase:', payload)
      const { error: insertErr } = await supabase.from('weight_tracking').insert([payload])

      if (insertErr) {
        console.error('Supabase weight_tracking insert error:', insertErr)
        alert('Error: ' + insertErr.message)
        setSubmitting(false)
        setIsUpdating(false)
        return
      }

      // Step 3: Synchronous update on `members` table
      let memberUpdated = false
      let dbError: any = null

      const updatePayload = {
        weight: weightVal,
        updated_at: new Date().toISOString(),
      }

      // Attempt 1: Target by primary UUID
      if (targetDbUuid) {
        const { data, error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('id', targetDbUuid)
          .select('id')
        if (!error && data && data.length > 0) {
          memberUpdated = true
        } else if (error) {
          dbError = error
        }
      }

      // Attempt 2: Target by auth_user_id
      if (!memberUpdated && user?.id) {
        const { data, error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('auth_user_id', user.id)
          .select('id')
        if (!error && data && data.length > 0) {
          memberUpdated = true
          dbError = null
        } else if (error) {
          dbError = error
        }
      }

      // Attempt 3: Target by string member_id
      if (!memberUpdated && activeMemberId) {
        const { data, error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('member_id', activeMemberId)
          .select('id')
        if (!error && data && data.length > 0) {
          memberUpdated = true
          dbError = null
        } else if (error) {
          dbError = error
        }
      }

      if (!memberUpdated && dbError) {
        console.error('Supabase members update error:', dbError)
        alert('Error: ' + dbError.message)
        setSubmitting(false)
        setIsUpdating(false)
        return
      }

      // Step 4: SUCCESS! Manually set local weight state & invalidate Next.js router cache
      setCurrentWeightVal(weightVal)
      setDraftWeight(weightVal.toFixed(1))

      const newPoint: WeightPoint = { month: todayLabel, weight: weightVal }
      setWeightData((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].month === todayLabel) {
          return [...prev.slice(0, -1), newPoint]
        }
        return [...prev, newPoint]
      })
      setActivePoint(newPoint)

      // Purge Next.js Router Cache immediately
      if (router && typeof router.refresh === 'function') {
        router.refresh()
      }

      // Close modal ONLY on confirmed success
      setShowLogModal(false)
      setToastMessage(`Weight logged successfully: ${weightVal.toFixed(1)} kg`)
    } catch (err: any) {
      console.error('Weight submit exception:', err)
      alert('Error: ' + (err?.message || 'Database connection error'))
    } finally {
      setSubmitting(false)
      setIsUpdating(false)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Save Target Goal to Supabase members table & sync local state
  const handleSaveTargetGoal = async (e?: React.SyntheticEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }

    const newTarget = parseFloat(editTargetInput)
    console.log("Attempting to save:", newTarget)

    if (isNaN(newTarget) || newTarget <= 0) {
      setToastMessage('Please enter a valid target weight in kg')
      return
    }

    setSubmitting(true)

    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser()

      if (authErr || !user) {
        const err = authErr || new Error('User authentication session not found.')
        console.error("DB Error:", err)
        setToastMessage(`Error: ${err.message}`)
        setSubmitting(false)
        return
      }

      const activeUser = user || currentUser
      const userEmail = activeUser?.email ?? ''
      const userId = activeUser?.id ?? ''
      const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()
      const cleanId = emailPrefix ? emailPrefix.toUpperCase().replace(/^MEM-/, 'MEM') : ''
      const hyphenId = cleanId ? cleanId.replace(/^MEM/, 'MEM-') : ''
      const activeMemberId = memberId || cleanId || 'MEM001'
      const targetDbUuid = memberDbUuid

      const updatePayload = {
        target_weight: newTarget,
        updated_at: new Date().toISOString(),
      }

      let updatedData: any[] | null = null
      let lastError: any = null

      // Attempt 1: Target by auth_user_id (standard foreign key)
      if (userId) {
        const { data, error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('auth_user_id', userId)
          .select('id, member_id, target_weight')

        console.log("DB Response:", data)
        console.error("DB Error:", error)

        if (error) {
          lastError = error
        } else if (data && data.length > 0) {
          updatedData = data
        }
      }

      // Attempt 2: Target by primary key UUID (id)
      if (!updatedData && targetDbUuid && targetDbUuid !== userId) {
        const { data, error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('id', targetDbUuid)
          .select('id, member_id, target_weight')

        console.log("DB Response:", data)
        console.error("DB Error:", error)

        if (error) {
          if (!lastError) lastError = error
        } else if (data && data.length > 0) {
          updatedData = data
        }
      }

      // Attempt 3: Target by string member_id (cleanId)
      if (!updatedData && cleanId) {
        const { data, error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('member_id', cleanId)
          .select('id, member_id, target_weight')

        console.log("DB Response:", data)
        console.error("DB Error:", error)

        if (error) {
          if (!lastError) lastError = error
        } else if (data && data.length > 0) {
          updatedData = data
        }
      }

      // Attempt 4: Target by string member_id (hyphenId)
      if (!updatedData && hyphenId && hyphenId !== cleanId) {
        const { data, error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('member_id', hyphenId)
          .select('id, member_id, target_weight')

        console.log("DB Response:", data)
        console.error("DB Error:", error)

        if (error) {
          if (!lastError) lastError = error
        } else if (data && data.length > 0) {
          updatedData = data
        }
      }

      // Check DB error
      if (lastError && !updatedData) {
        console.error("DB Error:", lastError)
        setToastMessage(`Error: ${lastError.message}`)
        return
      }

      if (!updatedData || updatedData.length === 0) {
        console.error("DB Error: No matching member record found.")
        setToastMessage('Error updating target weight in DB')
        return
      }

      // Update React state after verified DB success
      lastLocalUpdateRef.current = Date.now()
      pendingTargetWeightRef.current = newTarget

      setTargetWeightVal(newTarget)
      setEditTargetInput(newTarget.toFixed(1))
      setIsEditingTarget(false)

      if (typeof window !== 'undefined') {
        if (activeMemberId) localStorage.setItem(`target_weight_${activeMemberId}`, newTarget.toString())
        if (cleanId) localStorage.setItem(`target_weight_${cleanId}`, newTarget.toString())
        if (hyphenId) localStorage.setItem(`target_weight_${hyphenId}`, newTarget.toString())
      }

      setToastMessage(`Target goal updated to ${newTarget.toFixed(1)} kg`)

      if (router && typeof router.refresh === 'function') {
        router.refresh()
      }
    } catch (err: any) {
      console.error("DB Error:", err)
      setToastMessage(`Error: ${err?.message || 'Database update exception'}`)
    } finally {
      setSubmitting(false)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Calculated Progress Metrics
  const startingW = startingWeightVal
  const currentW = currentWeightVal
  const targetW = targetWeightVal

  const totalGoalChange = startingW - targetW
  const currentChange = startingW - currentW
  const progressPct =
    totalGoalChange > 0 ? Math.min(100, Math.max(0, Math.round((currentChange / totalGoalChange) * 100))) : 0

  const remainingKg = (currentW - targetW).toFixed(1)
  const isGoalReached = currentW <= targetW

  // Dynamic Chart Min/Max Domain
  const weights = weightData.map((d) => d.weight)
  const minW = Math.max(0, Math.floor(Math.min(...weights, targetW, startingW) - 2))
  const maxW = Math.ceil(Math.max(...weights, startingW) + 2)

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-7xl mx-auto" suppressHydrationWarning>
      {/* ── Toast Notification Banner ──────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-800 text-white px-5 py-3 rounded-2xl font-medium shadow-2xl flex items-center gap-3 text-sm border border-zinc-700 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Heading ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Progress &amp; Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Track your weight trajectory &amp; body metrics over time</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-xl hover:shadow-red-600/25 text-sm shrink-0 cursor-pointer"
          onClick={() => {
            setDraftWeight(currentWeightVal.toFixed(1))
            setShowLogModal(true)
          }}
          disabled={submitting}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          {submitting ? 'Saving...' : 'Log Body Weight'}
        </button>
      </div>

      {/* ── Progress Overview Stats Cards Grid ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* Card 1: Current Weight */}
        <div className="bg-zinc-900 p-6 md:p-7 rounded-2xl flex flex-col items-center justify-center border border-zinc-800 text-center shadow-2xl hover:border-zinc-700 transition-all duration-300">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current Weight</span>
          <div className="flex items-baseline gap-1 my-1" suppressHydrationWarning>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{loading ? '...' : currentW.toFixed(1)}</span>
            <span className="text-xs font-bold text-zinc-400">kg</span>
          </div>
          <span className="text-xs text-gray-500 mt-1" suppressHydrationWarning>Starting: {startingW.toFixed(1)} kg</span>
        </div>

        {/* Card 2: Target Weight (Editable with Local Storage) */}
        <div className="bg-zinc-900 p-6 md:p-7 rounded-2xl flex flex-col items-center justify-center border border-zinc-800 text-center shadow-2xl hover:border-zinc-700 transition-all duration-300 relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Goal</span>
            {!isEditingTarget && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setEditTargetInput(targetW.toFixed(1))
                  setIsEditingTarget(true)
                }}
                className="text-gray-500 hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                title="Edit Target Goal"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>

          {isEditingTarget ? (
            <div className="flex items-center gap-2 my-1">
              <input
                type="number"
                step="0.5"
                className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-white text-center font-extrabold text-lg focus:outline-none focus:border-red-500 font-mono shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield]"
                value={editTargetInput}
                onChange={(e) => setEditTargetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSaveTargetGoal(e)
                  }
                  if (e.key === 'Escape') {
                    setIsEditingTarget(false)
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSaveTargetGoal(e)
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white p-1.5 rounded-lg border border-zinc-700 transition-colors shadow cursor-pointer active:scale-95"
                title="Save Target Goal"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-1 my-1" suppressHydrationWarning>
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{targetW.toFixed(1)}</span>
              <span className="text-xs font-bold text-zinc-400">kg</span>
            </div>
          )}

          <span className="text-xs text-gray-500 mt-1 truncate max-w-full" suppressHydrationWarning>
            {isGoalReached ? '🎉 Goal Achieved!' : `${remainingKg} kg left to goal`}
          </span>
        </div>

        {/* Card 3: Total Weight Change */}
        <div className="bg-zinc-900 p-6 md:p-7 rounded-2xl flex flex-col items-center justify-center border border-zinc-800 text-center shadow-2xl hover:border-zinc-700 transition-all duration-300">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Total Change</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
              {currentChange >= 0 ? '-' : '+'}
              {Math.abs(currentChange).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-gray-400">kg</span>
          </div>
          <span className="text-xs text-gray-500 mt-1">Net overall change</span>
        </div>

        {/* Card 4: Goal Completion */}
        <div className="bg-zinc-900 p-6 md:p-7 rounded-2xl flex flex-col items-center justify-center border border-zinc-800 text-center shadow-2xl hover:border-zinc-700 transition-all duration-300">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Goal Progress</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">{progressPct}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden mt-2 mb-1.5 p-0.5">
            <div className="bg-gradient-to-r from-zinc-500 to-zinc-300 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs text-gray-500 mt-0.5">{progressPct}% achieved</span>
        </div>
      </div>

      {/* ── Main Weight Tracking Line Chart Container ──────────────────────── */}
      <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-800 w-full flex flex-col justify-between gap-6 shadow-2xl pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-wide">Weight Tracking Line Chart</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Visual weight logs over time with goal reference line</p>
          </div>
          {activePoint && (
            <div className="text-xs font-mono bg-zinc-950 text-zinc-300 px-3.5 py-2 rounded-xl border border-zinc-800 self-start sm:self-auto shadow-inner">
              Selected: <span className="font-bold text-white">{activePoint.month}</span> &bull; <span className="font-bold text-zinc-200">{activePoint.weight.toFixed(1)} kg</span>
            </div>
          )}
        </div>

        {/* Responsive Recharts Container with pb-8 Bottom Padding */}
        <div className="w-full h-[400px] min-h-[25rem] pb-8 relative flex items-center justify-center">
          {loading ? (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> Loading weight chart data...
            </div>
          ) : mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {/* Slice chart data to only render the last 15 chronological entries */}
              <LineChart
                data={weightData.slice(-15)}
                margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  tickMargin={10}
                  minTickGap={30}
                  interval="preserveEnd"
                />
                <YAxis
                  domain={[minW, maxW]}
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  tickFormatter={(val) => `${Math.round(val)}kg`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#f4f4f5',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
                  }}
                  itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold', borderBottom: '1px solid #27272a', paddingBottom: '4px', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value} kg`, 'Weight']}
                />
                <ReferenceLine
                  y={targetW}
                  stroke="#71717a"
                  strokeDasharray="4 4"
                  label={{ value: `Goal: ${targetW}kg`, fill: '#a1a1aa', fontSize: 12, position: 'top' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#ef4444"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#ef4444', stroke: '#09090b', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* ── Log Weight Modal ─────────────────────────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowLogModal(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <h3 className="text-lg font-bold text-white">Log Today&apos;s Body Weight</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-white text-xl font-bold transition-colors"
                onClick={() => setShowLogModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={(e) => handleLogSubmit(e)} className="space-y-4 pt-1">
              <div className="flex flex-col items-center justify-center py-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Current Weight (kg)
                </label>
                
                <div className="flex items-center justify-center gap-3 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const val = parseFloat(draftWeight) || 0
                      const updated = Math.max(0, val - 0.5)
                      setDraftWeight(updated.toFixed(1))
                    }}
                    className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold text-2xl flex items-center justify-center transition-all border border-zinc-700 shadow-lg shrink-0 select-none"
                    disabled={submitting}
                    title="Decrement Weight (-0.5 kg)"
                  >
                    &minus;
                  </button>

                  <div className="relative flex-1 max-w-[150px]">
                    <input
                      type="number"
                      step="0.1"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-3 text-white text-2xl text-center font-extrabold focus:outline-none focus:border-red-500 font-mono shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield]"
                      value={draftWeight}
                      onChange={(e) => setDraftWeight(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleLogSubmit(e)
                        }
                      }}
                      disabled={submitting}
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                      kg
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const val = parseFloat(draftWeight) || 0
                      const updated = val + 0.5
                      setDraftWeight(updated.toFixed(1))
                    }}
                    className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold text-2xl flex items-center justify-center transition-all border border-zinc-700 shadow-lg shrink-0 select-none"
                    disabled={submitting}
                    title="Increment Weight (+0.5 kg)"
                  >
                    &#43;
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-medium text-sm transition-colors"
                  onClick={() => setShowLogModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg hover:shadow-red-600/25"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Weight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
