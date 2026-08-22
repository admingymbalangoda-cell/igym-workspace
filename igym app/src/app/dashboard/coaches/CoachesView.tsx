'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Coach {
  id: string
  name: string
  title: string
  avatarUrl: string
  rating: number
  reviewCount: number
  experience: string
  specialties: string[]
  bio: string
  isAssigned?: boolean
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
]

export default function CoachesView() {
  const supabase = createClient()

  const [coachesList, setCoachesList] = useState<Coach[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All')
  const [expandedCoachId, setExpandedCoachId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [requestingCoachId, setRequestingCoachId] = useState<string | null>(null)
  const [requestedCoachIds, setRequestedCoachIds] = useState<Record<string, boolean>>({})

  // 1. Fetch real coach records from `coaches` table (with silent update mode)
  const loadCoachesData = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true)

        // Fetch active member info to check assigned coach
        let assignedCoachId: string | null = null
        let assignedCoachName: string | null = null

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const userEmail = user.email ?? ''
          const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()

          const { data: member } = await supabase
            .from('members')
            .select('coach_id, coach_name')
            .or(`auth_user_id.eq.${user.id},member_id.eq.${emailPrefix}`)
            .maybeSingle()

          if (member) {
            assignedCoachId = member.coach_id || null
            assignedCoachName = member.coach_name || null
          }
        }

        // Direct fetch from `coaches` table
        const { data: rawCoaches, error } = await supabase
          .from('coaches')
          .select('*')

        console.log('Fetched coaches data from Supabase:', rawCoaches, 'Error:', error)

        if (error) {
          console.error('Error fetching coaches from Supabase:', error)
        } else if (rawCoaches) {
          const mappedCoaches: Coach[] = rawCoaches.map((row: any, idx: number) => {
            let specs: string[] = []
            if (Array.isArray(row.specialties)) {
              specs = row.specialties.filter(Boolean)
            } else if (typeof row.specialties === 'string' && row.specialties.trim()) {
              try {
                const parsed = JSON.parse(row.specialties)
                specs = Array.isArray(parsed) ? parsed : [row.specialties]
              } catch {
                specs = row.specialties.split(',').map((s: string) => s.trim())
              }
            } else if (row.specialization) {
              specs = [row.specialization]
            } else if (row.specialty) {
              specs = [row.specialty]
            } else if (row.category) {
              specs = [row.category]
            }

            if (specs.length === 0) {
              specs = ['General Fitness', 'Personal Training']
            }

            const cName = row.name || row.full_name || 'Coach'
            const cTitle = row.title || row.specialization || row.specialty || row.category || 'Personal Trainer'

            const avatar =
              row.profile_pic_url ||
              row.image_url ||
              row.avatar_url ||
              row.image ||
              DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]

            const ratingVal = Number(row.rating) || 4.9
            const reviewsVal = Number(row.review_count || row.reviews) || 24 + idx * 5
            const expVal =
              row.experience ||
              (row.experience_years ? `${row.experience_years} Years` : '3+ Years')
            const bioVal =
              row.bio ||
              row.description ||
              `${cName} is a certified fitness professional specializing in ${specs.join(', ')}.`

            const isAssigned =
              (assignedCoachId && (row.id === assignedCoachId || row.coach_id === assignedCoachId)) ||
              (assignedCoachName && cName.toLowerCase() === assignedCoachName.toLowerCase())

            return {
              id: String(row.id || row.coach_id || `coach-${idx}`),
              name: cName,
              title: cTitle,
              avatarUrl: avatar,
              rating: ratingVal,
              reviewCount: reviewsVal,
              experience: expVal,
              specialties: specs,
              bio: bioVal,
              isAssigned: Boolean(isAssigned),
            }
          })

          setCoachesList(mappedCoaches)
        }
      } catch (err) {
        console.error('Exception loading coaches data:', err)
      } finally {
        if (!isSilent) setLoading(false)
      }
    },
    [supabase]
  )

  // Load data on mount
  useEffect(() => {
    loadCoachesData(false)
  }, [loadCoachesData])

  // Realtime subscription for instant updates on `coaches` table
  useEffect(() => {
    const channel = supabase
      .channel('coaches_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coaches' },
        () => {
          console.log('⚡ Realtime notification: coaches table updated!')
          loadCoachesData(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadCoachesData])

  // Extract unique category options for filter chips
  const categorySet = new Set<string>()
  coachesList.forEach((c) => {
    c.specialties.forEach((spec) => {
      if (spec && spec.trim()) {
        categorySet.add(spec.trim())
      }
    })
  })
  const allCategories = ['All', ...Array.from(categorySet)]

  // Filter coaches list dynamically by selected category
  const filteredCoaches =
    selectedSpecialty === 'All'
      ? coachesList
      : coachesList.filter((c) =>
          c.specialties.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))
        )

  // 2. Functional "Request Coach" Button (Inserts automated chat message)
  const handleRequestCoach = async (coach: Coach) => {
    if (requestingCoachId || requestedCoachIds[coach.id]) return

    setRequestingCoachId(coach.id)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let memberIdStr = 'MEM001'
      let authUserIdStr = user?.id || ''

      if (user) {
        const userEmail = user.email ?? ''
        const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()
        const cleanId = emailPrefix.toUpperCase().replace(/^MEM-/, 'MEM')
        const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

        const { data: member } = await supabase
          .from('members')
          .select('member_id, id')
          .or(`auth_user_id.eq.${user.id},member_id.eq.${cleanId},member_id.eq.${hyphenId}`)
          .maybeSingle()

        memberIdStr = member?.member_id || member?.id || cleanId
      }

      const automatedMessage = `System Automated Request: I would like to request Personal Training sessions with Coach ${coach.name}.`

      const payload = {
        member_id: memberIdStr,
        sender_id: authUserIdStr || memberIdStr,
        receiver_id: 'admin',
        message: automatedMessage,
      }

      console.log('🚀 Sending coach request to chat_messages:', payload)

      const { error } = await supabase.from('chat_messages').insert([payload])

      if (error) {
        console.error('Error inserting coach request:', error)
        setToastMessage(`Failed to send request: ${error.message}`)
      } else {
        setToastMessage(`Request sent! Admin will contact you shortly regarding Coach ${coach.name}.`)
        setRequestedCoachIds((prev) => ({ ...prev, [coach.id]: true }))
      }
    } catch (err: any) {
      console.error('Exception requesting coach:', err)
      setToastMessage(`Could not send request: ${err?.message || 'Error occurred'}`)
    } finally {
      setTimeout(() => {
        setRequestingCoachId(null)
      }, 2000)
      setTimeout(() => {
        setToastMessage(null)
      }, 5000)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedCoachId(expandedCoachId === id ? null : id)
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-7xl mx-auto">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-2xl font-medium shadow-2xl flex items-center gap-3 text-sm border border-emerald-400/40 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Header & Title ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Certified Personal Coaches</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Book 1-on-1 personal training sessions or view your dedicated coach.
          </p>
        </div>
      </div>

      {/* ── Category Filter Buttons ───────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" role="tablist">
        {allCategories.map((category) => {
          const isActive = selectedSpecialty === category
          return (
            <button
              key={category}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 border ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#1c1c1e] text-gray-300 border-white/10 hover:border-white/20 hover:text-white'
              }`}
              onClick={() => setSelectedSpecialty(category)}
              role="tab"
              aria-selected={isActive}
            >
              {category}
            </button>
          )
        })}
      </div>

      {/* ── Content Body (Loading, Empty State, or Responsive Grid) ──────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#1c1c1e] border border-white/10 rounded-2xl text-center shadow-xl my-4">
          <div className="w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-300">Loading coaches from database...</p>
        </div>
      ) : filteredCoaches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#1c1c1e] border border-white/10 rounded-2xl text-center shadow-xl my-4">
          <div className="w-12 h-12 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-400 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white mb-1">No coaches found</h3>
          <p className="text-xs text-gray-400">
            {coachesList.length === 0
              ? 'No registered coaches are available in the database yet.'
              : `No coaches match the "${selectedSpecialty}" category.`}
          </p>
        </div>
      ) : (
        /* Responsive Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => {
            const isExpanded = expandedCoachId === coach.id
            const isRequestingThis = requestingCoachId === coach.id
            const isAlreadyRequested = requestedCoachIds[coach.id]

            return (
              <article
                key={coach.id}
                className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-2xl relative overflow-hidden group"
              >
                {/* Top Badge & Rating Row */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {coach.isAssigned ? (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Your Assigned Coach
                    </span>
                  ) : (
                    <span className="bg-gray-800/80 text-gray-300 border border-white/10 text-[11px] font-medium px-2.5 py-1 rounded-full">
                      Certified Coach
                    </span>
                  )}
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{coach.rating}</span>
                    <span className="text-gray-400 text-[10px] font-normal">({coach.reviewCount})</span>
                  </div>
                </div>

                {/* Profile Picture, Name, Title, and Experience Badge */}
                <div className="flex items-start gap-4 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coach.avatarUrl}
                    alt={`Coach ${coach.name}`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500/50 shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-lg font-extrabold text-white tracking-tight leading-snug">{coach.name}</h2>
                    <p className="text-xs font-medium text-emerald-400 mt-0.5">{coach.title}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-gray-300 font-mono self-start">
                      <span>⚡</span>
                      <span className="font-semibold">{coach.experience} Exp</span>
                    </div>
                  </div>
                </div>

                {/* Specialties / Category Chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {coach.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="bg-zinc-900 text-gray-300 border border-white/10 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Short Bio / Description */}
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 mb-5">
                  <p className={`text-xs text-gray-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {coach.bio}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleExpand(coach.id)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 mt-1.5 focus:outline-none"
                  >
                    {isExpanded ? 'Show Less' : 'Read Bio'}
                  </button>
                </div>

                {/* Card Action Button (Functional Request Coach) */}
                <button
                  type="button"
                  onClick={() => handleRequestCoach(coach)}
                  disabled={isRequestingThis || isAlreadyRequested}
                  className={`w-full font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 ${
                    isAlreadyRequested
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : isRequestingThis
                      ? 'bg-emerald-600 text-zinc-950 opacity-80 cursor-wait'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 hover:shadow-emerald-500/20'
                  }`}
                >
                  {isAlreadyRequested ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Requested ✓
                    </>
                  ) : isRequestingThis ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {coach.isAssigned ? 'Book Session with Coach' : 'Request Coach'}
                    </>
                  )}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
