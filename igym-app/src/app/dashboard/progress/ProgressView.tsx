'use client'

import { useState, useEffect, useCallback } from 'react'
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

  const [weightData, setWeightData] = useState<WeightPoint[]>([])
  const [activePoint, setActivePoint] = useState<WeightPoint | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)
  const [newWeight, setNewWeight] = useState('75.0')
  const [memberId, setMemberId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const [mounted, setMounted] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [memberDbUuid, setMemberDbUuid] = useState<string | null>(null)

  const [startingWeightVal, setStartingWeightVal] = useState<number>(80.0)
  const [currentWeightVal, setCurrentWeightVal] = useState<number>(75.0)
  const [targetWeightVal, setTargetWeightVal] = useState<number>(70.0)
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false)
  const [editTargetInput, setEditTargetInput] = useState<string>('70.0')
  const [loading, setLoading] = useState(true)

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
        } = supabase.auth.onAuthStateChange((_event, session) => {
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

        // Fetch Target Goal from Supabase members table (fallback to localStorage if empty)
        if (memberData?.target_weight && !isNaN(Number(memberData.target_weight)) && Number(memberData.target_weight) > 0) {
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

        // Query latest record from `weight_tracking`
        const { data: latestData } = await supabase
          .from('weight_tracking')
          .select('*')
          .or(`member_id.eq.${targetMemberId},member_id.eq.${cleanId},member_id.eq.${hyphenId},member_id.eq.${userId}`)
          .order('recorded_date', { ascending: false })
          .limit(1)

        if (latestData && latestData.length > 0) {
          const latestW = Number(latestData[0].weight)
          setCurrentWeightVal(latestW)
          setNewWeight(latestW.toString())
        } else if (memberData?.weight || memberData?.weight_kg) {
          const currW = Number(memberData.weight || memberData.weight_kg)
          setCurrentWeightVal(currW)
          setNewWeight(currW.toString())
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
          setWeightData(formatted)
          setActivePoint(formatted[formatted.length - 1])
        } else {
          const fallbackPoint: WeightPoint = {
            month: 'Today',
            weight: memberData?.weight ? Number(memberData.weight) : 75.0,
          }
          setWeightData([fallbackPoint])
          setActivePoint(fallbackPoint)
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
        (payload) => {
          if (payload.new && (payload.new as any).weight) {
            const updatedWeight = Number((payload.new as any).weight)
            setCurrentWeightVal(updatedWeight)
            setNewWeight(updatedWeight.toString())
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
        (payload) => {
          if (payload.new && (payload.new as any).weight) {
            const updatedWeight = Number((payload.new as any).weight)
            setCurrentWeightVal(updatedWeight)
            setNewWeight(updatedWeight.toString())
            fetchWeightData(undefined, true)
          }
        }
      )
      .subscribe()

    const pollInterval = setInterval(() => {
      fetchWeightData(undefined, true)
    }, 4000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [supabase, memberId, fetchWeightData])

  // 3. Add New Weight (Member -> Admin) - Completely Seamless SPA Submit without created_at payload field
  const handleLogSubmit = async (e?: React.SyntheticEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    if (!newWeight || isNaN(Number(newWeight))) return

    const weightVal = parseFloat(newWeight)
    const recordedDate = new Date().toISOString().split('T')[0]

    setSubmitting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const activeMemberId = memberId || (user?.email ? user.email.split('@')[0] : 'MEM001')

      // Insert payload EXACTLY matching the Admin Dashboard schema (NO explicit created_at field)
      const payload = {
        member_id: activeMemberId,
        weight: weightVal,
        recorded_date: recordedDate,
      }

      console.log('🚀 Submitting weight_tracking payload to Supabase:', payload)

      const { error } = await supabase.from('weight_tracking').insert([payload])

      if (error) {
        console.error('Supabase Insert Error:', error)
        setToastMessage(`Save failed: ${error.message}`)
      } else {
        console.log('✅ Weight logged successfully to weight_tracking table.')
        // Also update member's weight in `members` table for admin sync
        if (user?.id || memberDbUuid) {
          const updatePayload = {
            weight: weightVal,
            weight_kg: weightVal,
            updated_at: new Date().toISOString(),
          }
          if (memberDbUuid) {
            await supabase.from('members').update(updatePayload).eq('id', memberDbUuid)
          } else {
            await supabase
              .from('members')
              .update(updatePayload)
              .or(`member_id.eq.${activeMemberId},auth_user_id.eq.${user?.id || ''}`)
          }
        }

        // Instantly update local state without page reload
        setCurrentWeightVal(weightVal)

        // Append to chart history reactively
        const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const newPoint: WeightPoint = { month: todayLabel, weight: weightVal }

        setWeightData((prev) => [...prev, newPoint])
        setActivePoint(newPoint)
        setToastMessage(`Weight logged successfully: ${weightVal} kg`)
        setShowLogModal(false)
      }
    } catch (err: any) {
      console.error('Weight submit exception:', err)
      setToastMessage(`Could not save weight: ${err?.message || 'Unexpected error'}`)
    } finally {
      setSubmitting(false)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // Save Target Goal to Supabase members table & sync local state
  const handleSaveTargetGoal = async () => {
    const parsed = parseFloat(editTargetInput)
    if (isNaN(parsed) || parsed <= 0) {
      setIsEditingTarget(false)
      return
    }

    // Instantly update local state so progress % and chart reference line reflect immediately
    setTargetWeightVal(parsed)
    setIsEditingTarget(false)

    try {
      const activeMemberId = memberId || (currentUser?.email ? currentUser.email.split('@')[0] : '')
      const cleanId = activeMemberId.trim().toUpperCase().replace(/^MEM-/, 'MEM')
      const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

      const updatePayload = {
        target_weight: parsed,
        updated_at: new Date().toISOString(),
      }

      let updateErr = null

      if (memberDbUuid) {
        const { error } = await supabase.from('members').update(updatePayload).eq('id', memberDbUuid)
        updateErr = error
      }

      if (updateErr || !memberDbUuid) {
        const { error } = await supabase
          .from('members')
          .update(updatePayload)
          .or(`member_id.eq.${activeMemberId},member_id.eq.${cleanId},member_id.eq.${hyphenId},auth_user_id.eq.${currentUser?.id || ''}`)
        updateErr = error
      }

      if (updateErr) {
        console.error('Error saving target_weight to database:', updateErr)
        setToastMessage(`Saved locally (${parsed.toFixed(1)} kg). DB Sync error: ${updateErr.message}`)
      } else {
        console.log('✅ target_weight saved to Supabase members table successfully.')
        setToastMessage(`Target goal updated to ${parsed.toFixed(1)} kg`)
      }

      if (typeof window !== 'undefined' && activeMemberId) {
        localStorage.setItem(`target_weight_${activeMemberId}`, parsed.toString())
      }
    } catch (err: any) {
      console.error('Exception updating target_weight:', err)
      setToastMessage(`Target goal updated: ${parsed.toFixed(1)} kg`)
    } finally {
      setTimeout(() => setToastMessage(null), 3000)
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
    <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-7xl mx-auto">
      {/* ── Toast Notification Banner ──────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-2xl font-medium shadow-2xl flex items-center gap-3 text-sm border border-emerald-400/40 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Heading ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Progress &amp; Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Track your weight trajectory &amp; body metrics over time</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-3 rounded-2xl transition-all shadow-xl hover:shadow-emerald-500/25 text-sm shrink-0"
          onClick={() => setShowLogModal(true)}
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
        <div className="bg-[#1c1c1e] p-6 md:p-7 rounded-2xl flex flex-col items-center justify-center border border-white/10 text-center shadow-2xl hover:border-white/20 transition-all duration-300">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current Weight</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{loading ? '...' : currentW.toFixed(1)}</span>
            <span className="text-xs font-bold text-emerald-400">kg</span>
          </div>
          <span className="text-xs text-gray-500 mt-1">Starting: {startingW.toFixed(1)} kg</span>
        </div>

        {/* Card 2: Target Weight (Editable with Local Storage) */}
        <div className="bg-[#1c1c1e] p-6 md:p-7 rounded-2xl flex flex-col items-center justify-center border border-white/10 text-center shadow-2xl hover:border-white/20 transition-all duration-300 relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Goal</span>
            {!isEditingTarget && (
              <button
                type="button"
                onClick={() => {
                  setEditTargetInput(targetW.toString())
                  setIsEditingTarget(true)
                }}
                className="text-gray-500 hover:text-amber-400 transition-colors p-0.5"
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
                className="w-24 bg-zinc-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-white text-center font-extrabold text-lg focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                value={editTargetInput}
                onChange={(e) => setEditTargetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTargetGoal()
                  if (e.key === 'Escape') setIsEditingTarget(false)
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTargetGoal}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 p-1.5 rounded-lg transition-colors shadow"
                title="Save Target Goal"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{targetW.toFixed(1)}</span>
              <span className="text-xs font-bold text-amber-400">kg</span>
            </div>
          )}

          <span className="text-xs text-gray-500 mt-1 truncate max-w-full">
            {isGoalReached ? '🎉 Goal Achieved!' : `${remainingKg} kg left to goal`}
          </span>
        </div>

        {/* Card 3: Total Weight Change */}
        <div className="bg-[#1c1c1e] p-6 md:p-7 rounded-2xl flex flex-col items-center justify-center border border-white/10 text-center shadow-2xl hover:border-white/20 transition-all duration-300">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Total Change</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${currentChange >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {currentChange >= 0 ? '-' : '+'}
              {Math.abs(currentChange).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-gray-400">kg</span>
          </div>
          <span className="text-xs text-gray-500 mt-1">Net overall change</span>
        </div>

        {/* Card 4: Goal Completion */}
        <div className="bg-[#1c1c1e] p-6 md:p-7 rounded-2xl flex flex-col items-center justify-center border border-white/10 text-center shadow-2xl hover:border-white/20 transition-all duration-300">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Goal Progress</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 tracking-tight">{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-800/80 h-2.5 rounded-full overflow-hidden mt-2 mb-1.5 p-0.5">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs text-gray-500 mt-0.5">{progressPct}% achieved</span>
        </div>
      </div>

      {/* ── Main Weight Tracking Line Chart Container ──────────────────────── */}
      <div className="bg-[#1c1c1e] p-6 md:p-8 rounded-2xl border border-white/10 w-full flex flex-col justify-between gap-6 shadow-2xl pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-wide">Weight Tracking Line Chart</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Visual weight logs over time with goal reference line</p>
          </div>
          {activePoint && (
            <div className="text-xs font-mono bg-zinc-900/90 text-emerald-400 px-3.5 py-2 rounded-xl border border-emerald-500/30 self-start sm:self-auto shadow-inner">
              Selected: <span className="font-bold text-white">{activePoint.month}</span> &bull; <span className="font-bold text-emerald-300">{activePoint.weight.toFixed(1)} kg</span>
            </div>
          )}
        </div>

        {/* Responsive Recharts Container with pb-8 Bottom Padding */}
        <div className="w-full h-[400px] min-h-[25rem] pb-8 relative flex items-center justify-center">
          {loading ? (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" /> Loading weight chart data...
            </div>
          ) : mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {/* Slice chart data to only render the last 15 chronological entries */}
              <LineChart
                data={weightData.slice(-15)}
                margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2e" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickMargin={10}
                  minTickGap={30}
                  interval="preserveEnd"
                />
                <YAxis
                  domain={[minW, maxW]}
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(val) => `${Math.round(val)}kg`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12131c',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value} kg`, 'Weight']}
                />
                <ReferenceLine
                  y={targetW}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: `Goal: ${targetW}kg`, fill: '#f59e0b', fontSize: 12, position: 'top' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#10b981', stroke: '#090b10', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* ── Log Weight Modal ─────────────────────────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowLogModal(false)}>
          <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <h3 className="text-lg font-bold text-white">Log Today's Body Weight</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-white text-xl font-bold transition-colors"
                onClick={() => setShowLogModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={(e) => handleLogSubmit(e)} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono text-base shadow-inner"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleLogSubmit(e)
                    }
                  }}
                  disabled={submitting}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors"
                  onClick={() => setShowLogModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/25"
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
