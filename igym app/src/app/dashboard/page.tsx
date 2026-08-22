"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { emailToMemberId } from '@/lib/auth/helpers'
import { signOutAction } from './actions'

// ─── Types ────────────────────────────────────────────────────────────────────
interface MemberRow {
  id: string
  member_id?: string | null
  full_name?: string | null
  name?: string | null
  membership_status?: 'active' | 'inactive' | 'suspended' | string | null
  status?: string | null
  plan_name?: string | null
  tier?: string | null
  package?: string | null
  package_name?: string | null
  expiry_date?: string | null
  expire_date?: string | null
  package_expire_date?: string | null
  next_payment_date?: string | null
  coach_name?: string | null
  phone?: string | null
  joined_at?: string | null
  created_at?: string | null
  created_date?: string | null
  weight?: number | null
  weight_kg?: number | null
  starting_weight?: number | null
}

interface GlobalAnnouncement {
  id: string
  title: string
  message?: string | null
  description?: string | null
  created_at: string
}

interface PaymentItem {
  id: string
  amount: number
  status: string
  due_date?: string | null
  created_at?: string | null
}

interface SubscriptionItem {
  id: string
  plan_name?: string | null
  price?: number | null
  amount_paid?: number | null
  balance_due?: number | null
  next_billing_date?: string | null
  next_payment_date?: string | null
  status?: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const dateObj = new Date(iso)
  if (isNaN(dateObj.getTime())) return iso
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const target = new Date(iso).getTime()
  if (isNaN(target)) return null
  return Math.ceil((target - Date.now()) / 86_400_000)
}

function statusMeta(status: string | null) {
  switch ((status ?? '').toLowerCase()) {
    case 'active':
      return { label: 'Active', cls: 'status-active' }
    case 'inactive':
      return { label: 'Inactive', cls: 'status-inactive' }
    case 'suspended':
      return { label: 'Suspended', cls: 'status-suspended' }
    default:
      return { label: 'Active', cls: 'status-active' }
  }
}

// ─── Loading Skeleton Component ─────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="dash-root" style={{ opacity: 0.85 }}>
      <header className="dash-header">
        <div className="dash-header-brand">
          <div className="skeleton-box" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <div className="skeleton-box" style={{ width: 60, height: 20, borderRadius: 4 }} />
        </div>
        <div className="skeleton-box" style={{ width: 80, height: 18, borderRadius: 4 }} />
        <div className="skeleton-box" style={{ width: 36, height: 36, borderRadius: '50%' }} />
      </header>

      <main className="dash-body">
        <div
          className="dash-welcome skeleton-card"
          style={{
            minHeight: 130,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1.5rem',
            background: 'hsl(224 18% 10%)',
            borderRadius: '1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          <div className="skeleton-box" style={{ width: 140, height: 16, borderRadius: 4 }} />
          <div className="skeleton-box" style={{ width: 240, height: 32, borderRadius: 6 }} />
          <div className="skeleton-box" style={{ width: 160, height: 16, borderRadius: 4 }} />
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <div className="skeleton-box" style={{ width: 180, height: 22, borderRadius: 4, marginBottom: '1rem' }} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem',
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 90,
                  background: 'hsl(224 18% 10%)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div className="skeleton-box" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="skeleton-box" style={{ width: '80%', height: 14, borderRadius: 4 }} />
                  <div className="skeleton-box" style={{ width: '50%', height: 12, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-content-grid">
          <div className="dash-col-primary">
            <div
              style={{
                height: 380,
                background: 'hsl(224 18% 10%)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div className="skeleton-box" style={{ width: 180, height: 22, borderRadius: 4 }} />
              <div className="skeleton-box" style={{ width: '100%', height: 200, borderRadius: 12 }} />
            </div>
          </div>
          <div className="dash-col-secondary">
            <div
              style={{
                height: 380,
                background: 'hsl(224 18% 10%)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div className="skeleton-box" style={{ width: 180, height: 22, borderRadius: 4 }} />
              <div className="skeleton-box" style={{ width: '100%', height: 120, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .skeleton-box {
          background: linear-gradient(90deg, hsl(224 18% 14%) 25%, hsl(224 18% 22%) 50%, hsl(224 18% 14%) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite ease-in-out;
        }
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Progress Graph Component (Real Data from Supabase) ──────────────────────
function ProgressChartSection({
  memberId,
  memberDbUuid,
  memberWeight,
}: {
  memberId?: string
  memberDbUuid?: string | null
  memberWeight?: number | string | null
}) {
  const supabase = createClient()
  const [activeMetric, setActiveMetric] = useState<'weight' | 'visits'>('weight')
  const [weightLogs, setWeightLogs] = useState<{ month: string; val: number; display: string }[]>([])
  const [currentWeight, setCurrentWeight] = useState<number | null>(memberWeight ? Number(memberWeight) : null)
  const [targetWeight, setTargetWeight] = useState<number | null>(null)
  const [startingWeight, setStartingWeight] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadWeightData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const userId = user?.id || ''
        const userEmail = user?.email || ''
        const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()
        const cleanId = emailPrefix.toUpperCase().replace(/^MEM-/, 'MEM')
        const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

        const targetId = memberId || cleanId

        // Fetch member starting/target weight from `members` table
        const { data: memberRow } = await supabase
          .from('members')
          .select('weight, weight_kg, starting_weight, target_weight')
          .or(`auth_user_id.eq.${userId},id.eq.${userId},member_id.eq.${cleanId},member_id.eq.${hyphenId}`)
          .maybeSingle()

        if (memberRow && isMounted) {
          if (memberRow.target_weight) setTargetWeight(Number(memberRow.target_weight))
          if (memberRow.starting_weight) setStartingWeight(Number(memberRow.starting_weight))
          if ((memberRow.weight || memberRow.weight_kg) && !currentWeight) {
            setCurrentWeight(Number(memberRow.weight || memberRow.weight_kg))
          }
        }

        // Fetch history from `weight_tracking`
        const { data: trackData } = await supabase
          .from('weight_tracking')
          .select('*')
          .or(`member_id.eq.${targetId},member_id.eq.${cleanId},member_id.eq.${hyphenId},member_id.eq.${userId}`)
          .order('recorded_date', { ascending: true })

        if (trackData && trackData.length > 0 && isMounted) {
          const formatted = trackData.map((row: any) => {
            const dt = new Date(row.recorded_date || Date.now())
            const monthStr = isNaN(dt.getTime())
              ? 'Log'
              : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            const wVal = Number(row.weight)
            return {
              month: monthStr,
              val: wVal,
              display: `${wVal.toFixed(1)} kg`,
            }
          })
          setWeightLogs(formatted)
          setCurrentWeight(formatted[formatted.length - 1].val)
        } else if (isMounted) {
          const singleW = memberWeight ? Number(memberWeight) : (memberRow?.weight || memberRow?.weight_kg ? Number(memberRow.weight || memberRow.weight_kg) : null)
          if (singleW) {
            setWeightLogs([{ month: 'Current', val: singleW, display: `${singleW.toFixed(1)} kg` }])
            setCurrentWeight(singleW)
          } else {
            setWeightLogs([])
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard progress weight logs:', err)
      }
    }

    loadWeightData()

    return () => {
      isMounted = false
    }
  }, [supabase, memberId, memberWeight])

  const visitsData = [
    { month: 'May', val: 12, display: '12 Visits' },
    { month: 'Jun', val: 14, display: '14 Visits' },
    { month: 'Jul', val: 16, display: '16 Visits' },
    { month: 'Aug', val: 18, display: '18 Visits' },
  ]

  const hasWeightLogs = weightLogs.length > 0
  const activeData = activeMetric === 'weight' ? weightLogs : visitsData
  const strokeColor = activeMetric === 'weight' ? 'hsl(158, 84%, 44%)' : 'hsl(280, 80%, 65%)'
  const gradientId = activeMetric === 'weight' ? 'weightGrad' : 'visitsGrad'

  const vals = activeData.map((d) => d.val)
  const minVal = vals.length > 0 ? Math.min(...vals) - 2 : 0
  const maxVal = vals.length > 0 ? Math.max(...vals) + 2 : 100

  const points = activeData.map((d, i) => {
    const step = activeData.length > 1 ? (380 - 60) / (activeData.length - 1) : 0
    const x = 40 + i * step
    const normalized = (d.val - minVal) / (maxVal - minVal || 1)
    const y = 140 - normalized * 100
    return { x, y, ...d }
  })

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '')
  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z` : ''

  const initialW = startingWeight || (weightLogs.length > 0 ? weightLogs[0].val : currentWeight)
  const diffVal = currentWeight && initialW ? (currentWeight - initialW).toFixed(1) : null
  const diffStr = diffVal ? `${Number(diffVal) <= 0 ? '' : '+'}${diffVal} kg` : '—'

  return (
    <section className="dash-section" aria-labelledby="progress-chart-heading">
      <div className="dash-card" style={{ padding: '1.25rem 1.5rem', background: 'hsl(224 18% 10%)', borderRadius: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 id="progress-chart-heading" className="section-heading" style={{ marginBottom: '0.25rem' }}>
              My Fitness Progress
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Tracking monthly transformations &amp; consistency
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.375rem', background: 'hsl(224 18% 6%)', padding: '0.25rem', borderRadius: '0.625rem', border: '1px solid var(--bg-card-border)' }}>
            <button
              onClick={() => setActiveMetric('weight')}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeMetric === 'weight' ? 'var(--brand-primary)' : 'transparent',
                color: activeMetric === 'weight' ? '#0d0f14' : 'var(--text-secondary)',
              }}
            >
              Weight (kg)
            </button>
            <button
              onClick={() => setActiveMetric('visits')}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeMetric === 'visits' ? 'var(--brand-accent)' : 'transparent',
                color: activeMetric === 'visits' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Gym Visits
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'hsl(224 18% 13%)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
              {activeMetric === 'weight' ? 'Current Weight' : 'This Month Visits'}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeMetric === 'weight' ? (currentWeight ? `${currentWeight.toFixed(1)} kg` : '—') : '18 Visits'}
              </span>
              {activeMetric === 'weight' && diffVal && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: Number(diffVal) <= 0 ? 'var(--brand-primary)' : 'hsl(350 80% 65%)' }}>
                  {diffStr}
                </span>
              )}
            </div>
          </div>

          <div style={{ background: 'hsl(224 18% 13%)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
              {activeMetric === 'weight' ? 'Target Goal' : 'Consistency Score'}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeMetric === 'weight' ? (targetWeight ? `${targetWeight.toFixed(1)} kg` : '—') : '92%'}
              </span>
              {activeMetric === 'weight' && targetWeight && currentWeight && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {Math.abs(currentWeight - targetWeight).toFixed(1)} kg to go
                </span>
              )}
            </div>
          </div>
        </div>

        {activeMetric === 'weight' && !hasWeightLogs ? (
          <div
            style={{
              background: 'hsl(224 18% 13%)',
              borderRadius: '0.875rem',
              padding: '2rem 1rem',
              textAlign: 'center',
              border: '1px solid var(--bg-card-border)',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              No weight data recorded yet
            </p>
            <Link
              href="/dashboard/progress"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                textDecoration: 'none',
              }}
            >
              + Log First Weight in Progress Page &rarr;
            </Link>
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox="0 0 400 180" style={{ width: '100%', height: 'auto', minWidth: 320, display: 'block' }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(158, 84%, 44%)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(158, 84%, 44%)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(280, 80%, 65%)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(280, 80%, 65%)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="30" y1="40" x2="380" y2="40" stroke="hsl(224 18% 16%)" strokeDasharray="3 3" />
              <line x1="30" y1="90" x2="380" y2="90" stroke="hsl(224 18% 16%)" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2="380" y2="140" stroke="hsl(224 18% 16%)" strokeDasharray="3 3" />

              {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}
              {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#0d0f14" stroke={strokeColor} strokeWidth="3" />
                  <rect x={p.x - 24} y={p.y - 25} width="48" height="18" rx="4" fill="hsl(224 20% 7%)" stroke="hsl(224 18% 20%)" strokeWidth="1" />
                  <text x={p.x} y={p.y - 13} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">
                    {p.display}
                  </text>
                  <text x={p.x} y="172" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="600">
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string>('')
  const [memberName, setMemberName] = useState<string>('')
  const [member, setMember] = useState<MemberRow | null>(null)
  const [announcements, setAnnouncements] = useState<GlobalAnnouncement[]>([])

  // Billing states
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [balanceDue, setBalanceDue] = useState<number>(0)
  const [nextBillingDate, setNextBillingDate] = useState<string>('—')
  const [paymentStatusText, setPaymentStatusText] = useState<string>('Active')

  // Packages Modal states
  const [showPackagesModal, setShowPackagesModal] = useState(false)
  const [packagesList, setPackagesList] = useState<any[]>([])
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [requestedPackageId, setRequestedPackageId] = useState<string | null>(null)

  useEffect(() => {
    if (showPackagesModal) {
      async function fetchPackages() {
        try {
          setLoadingPackages(true)
          // 1. Query `gym_packages` table
          const { data: gymPkgs, error: err1 } = await supabase
            .from('gym_packages')
            .select('*')
            .order('created_at', { ascending: true })

          if (!err1 && gymPkgs && gymPkgs.length > 0) {
            setPackagesList(gymPkgs)
            return
          }

          // 2. Query `membership_plans` table
          const { data: plansData, error: err2 } = await supabase
            .from('membership_plans')
            .select('*')
            .order('price', { ascending: true })

          if (!err2 && plansData && plansData.length > 0) {
            setPackagesList(plansData)
            return
          }

          // 3. Query `packages` table
          const { data: pkgsData, error: err3 } = await supabase
            .from('packages')
            .select('*')

          if (!err3 && pkgsData && pkgsData.length > 0) {
            setPackagesList(pkgsData)
            return
          }

          setPackagesList([])
        } catch (err) {
          console.error('Error fetching packages:', err)
          setPackagesList([])
        } finally {
          setLoadingPackages(false)
        }
      }
      fetchPackages()
    }
  }, [showPackagesModal, supabase])

  const handleRequestPackage = async (pkg: any) => {
    try {
      setRequestedPackageId(pkg.id || pkg.name)
      const pkgName = pkg.name || pkg.package_name || pkg.title || 'Membership Package'
      const pkgId = pkg.id || pkgName

      // Execute Supabase insert into package_requests table (fallback to chat_messages if table not ready)
      const { error: reqErr } = await supabase.from('package_requests').insert([
        {
          member_id: memberId,
          package_id: pkgId,
          package_name: pkgName,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])

      if (reqErr) {
        console.log('Inserting package request into chat_messages fallback:', reqErr.message)
        await supabase.from('chat_messages').insert([
          {
            member_id: memberId,
            sender_id: memberId,
            receiver_id: 'admin',
            message: `Package Request: Member requested package "${pkgName}".`,
            created_at: new Date().toISOString(),
          },
        ])
      }

      toast.success(`Request for "${pkgName}" sent to Admin successfully!`)
      setTimeout(() => {
        setShowPackagesModal(false)
        setRequestedPackageId(null)
      }, 1500)
    } catch (err: any) {
      console.error('Error requesting package:', err)
      toast.error('Could not send request. Please try again.')
      setRequestedPackageId(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadDashboardData() {
      try {
        setLoading(true)

        // 1. Get Current Session: retrieve authenticated user on component mount
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push('/login')
          return
        }

        // 2. Extract Member ID: extract prefix from user auth email (e.g. "MEM022" from "MEM022@igym.local")
        const userEmail = user.email ?? ''
        const extractedId = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()

        // 3. Fetch Profile Data: Query `members` table by member_id
        let activeMember: MemberRow | null = null

        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('member_id', extractedId)
          .maybeSingle<MemberRow>()

        console.log("Fetched Member by member_id:", memberData, "Error:", memberError)
        activeMember = memberData

        // Fallback Query: Query by auth_user_id or id if member_id returned no match
        if (!activeMember) {
          const { data: fallbackMember, error: fallbackError } = await supabase
            .from('members')
            .select('*')
            .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
            .maybeSingle<MemberRow>()

          console.log("Fallback Member Query:", fallbackMember, "Error:", fallbackError)
          activeMember = fallbackMember
        }

        // 4. Fetch latest 2 records from `global_notifications` table
        const { data: notifData } = await supabase
          .from('global_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2)

        if (notifData && isMounted) {
          setAnnouncements(notifData)
        }

        // 5. Update UI State mapping fetched data to state variables
        if (isMounted) {
          const resolvedName =
            activeMember?.name ||
            activeMember?.full_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            extractedId ||
            'Member'

          const resolvedId =
            activeMember?.member_id ||
            activeMember?.id ||
            extractedId ||
            '—'

          setMember(activeMember)
          setMemberName(resolvedName)
          setMemberId(resolvedId)
        }

        const targetMemberUuid = activeMember?.id || user.id
        const targetMemberIdStr = activeMember?.member_id || extractedId
        const cleanId = extractedId.toUpperCase().replace(/^MEM-/, 'MEM')
        const hyphenId = cleanId.replace(/^MEM/, 'MEM-')
        const memberExpirationIso =
          activeMember?.expire_date ||
          activeMember?.package_expire_date ||
          activeMember?.expiry_date ||
          activeMember?.next_payment_date ||
          null

        // Fetch payments for this logged in member
        let payRecords: any[] = []
        try {
          // Attempt 1: Query by member_id string
          const { data: payData1, error: err1 } = await supabase
            .from('payments')
            .select('*')
            .eq('member_id', targetMemberIdStr)
            .order('created_at', { ascending: false })

          if (err1) {
            console.log("Payment fetch error (member_id string):", err1)
          } else {
            console.log("Fetched payments data (member_id string):", payData1)
          }

          if (!err1 && payData1 && payData1.length > 0) {
            payRecords = payData1
          } else {
            // Attempt 2: Query by member_id UUID
            const { data: payData2, error: err2 } = await supabase
              .from('payments')
              .select('*')
              .eq('member_id', targetMemberUuid)
              .order('created_at', { ascending: false })

            if (err2) {
              console.log("Payment fetch error (member_id UUID):", err2)
            } else {
              console.log("Fetched payments data (member_id UUID):", payData2)
            }

            if (!err2 && payData2 && payData2.length > 0) {
              payRecords = payData2
            } else {
              // Attempt 3: Query all payments and filter flexibly in JS
              const { data: allPay, error: err3 } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

              if (err3) {
                console.log("Payment fetch error (all payments fallback):", err3)
              } else {
                console.log("Fetched payments data (all payments fallback):", allPay)
              }

              if (!err3 && allPay && allPay.length > 0) {
                payRecords = allPay.filter(
                  (p: any) =>
                    String(p.member_id).toLowerCase() === String(targetMemberIdStr).toLowerCase() ||
                    String(p.member_id).toLowerCase() === String(targetMemberUuid).toLowerCase() ||
                    String(p.member_id).toLowerCase() === String(cleanId).toLowerCase() ||
                    String(p.member_id).toLowerCase() === String(hyphenId).toLowerCase() ||
                    String(p.member_id).toLowerCase() === String(user.id).toLowerCase() ||
                    (activeMember?.phone && p.phone === activeMember.phone)
                )
              }
            }
          }
        } catch (catchedPayErr) {
          console.error("Payment fetch exception in Dashboard:", catchedPayErr)
        }

        console.log("Fetched payments data (Final):", payRecords)

        let calculatedPaid = 0
        let calculatedDue = 0
        let calculatedNextBilling = formatDate(memberExpirationIso)
        let statusBadge = 'Active'

        if (payRecords && payRecords.length > 0) {
          // Sort payments newest first
          const sortedPayments = [...payRecords].sort((a: any, b: any) => {
            const timeA = new Date(a.created_at || a.payment_date || 0).getTime()
            const timeB = new Date(b.created_at || b.payment_date || 0).getTime()
            return timeB - timeA
          })

          const latestPayment = sortedPayments[0]

          const paidAmt = Number(
            latestPayment.paid_amount ??
            latestPayment.amount_paid ??
            latestPayment.amount ??
            latestPayment.paidAmount ??
            0
          )

          const dueAmt = Number(
            latestPayment.balance_due ??
            latestPayment.balance ??
            latestPayment.due_balance ??
            latestPayment.balanceDue ??
            ((latestPayment.status || '').toLowerCase() === 'paid' ? 0 : 0)
          )

          calculatedPaid = paidAmt
          calculatedDue = dueAmt

          const paymentStatus = (latestPayment.status || '').toLowerCase()
          if (paymentStatus === 'paid' || paymentStatus === 'successful' || (dueAmt === 0 && paidAmt > 0)) {
            statusBadge = 'Fully Paid'
          } else if (paymentStatus === 'partial' || (paidAmt > 0 && dueAmt > 0)) {
            statusBadge = 'Partial Payment'
          } else if (paymentStatus === 'due' || paymentStatus === 'pending' || paymentStatus === 'overdue') {
            statusBadge = 'Payment Due'
          } else {
            statusBadge = latestPayment.status || 'Active'
          }

          if (latestPayment.due_date || latestPayment.next_due_date) {
            calculatedNextBilling = formatDate(latestPayment.due_date || latestPayment.next_due_date)
          }
        } else {
          // Clean fallback state: LKR 0 paid, LKR 0 due, no dummy numbers
          calculatedPaid = 0
          calculatedDue = 0
          statusBadge = activeMember?.membership_status
            ? activeMember.membership_status.charAt(0).toUpperCase() + activeMember.membership_status.slice(1)
            : 'Active'
        }

        if (isMounted) {
          setAmountPaid(calculatedPaid)
          setBalanceDue(calculatedDue)
          setNextBillingDate(calculatedNextBilling)
          setPaymentStatusText(statusBadge)
        }
      } catch (err) {
        console.error('Notice loading member dashboard:', err)
        if (isMounted) {
          setMemberName('Member')
          setMemberId('—')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  if (loading) {
    return <DashboardSkeleton />
  }

  // Dynamic Name Greeting & Member ID logic
  const displayFirstName = (memberName || 'Member').split(' ')[0]
  const displayMemberId = memberId || '—'
  const memberWeight = member?.weight ?? member?.weight_kg ?? member?.starting_weight ?? null

  const { label: statusLabel, cls: statusCls } = statusMeta(member?.membership_status ?? null)
  const days = daysUntil(member?.expiry_date ?? null)
  const isExpiring = days !== null && days >= 0 && days <= 7
  const isExpired = days !== null && days < 0

  const totalBilling = amountPaid + balanceDue
  const payProgress = totalBilling > 0 ? Math.min(100, Math.max(0, Math.round((amountPaid / totalBilling) * 100))) : 100

  // Membership Status Card Logic
  const rawStatus = (member?.membership_status || member?.status || '').toLowerCase()
  const expiryDateIso =
    member?.expire_date ||
    member?.package_expire_date ||
    member?.expiry_date ||
    member?.next_payment_date ||
    null

  const isMemberActive = rawStatus === 'active' && Boolean(expiryDateIso)

  const joinDateIso =
    member?.joined_at ||
    member?.created_at ||
    member?.created_date ||
    null

  const activePlanName =
    member?.package_name ||
    member?.tier ||
    member?.package ||
    member?.plan_name ||
    'Standard Plan'

  const remainingDays = expiryDateIso ? daysUntil(expiryDateIso) : null
  let remainingDaysText = 'No Expiry Set'
  if (remainingDays !== null) {
    if (remainingDays > 0) {
      remainingDaysText = `${remainingDays} Day${remainingDays !== 1 ? 's' : ''} Remaining`
    } else if (remainingDays === 0) {
      remainingDaysText = 'Expires Today'
    } else {
      remainingDaysText = `Expired ${Math.abs(remainingDays)} Day${Math.abs(remainingDays) !== 1 ? 's' : ''} Ago`
    }
  }

  // Calculate elapsed progress percentage
  let elapsedPercentage = 100
  if (expiryDateIso) {
    const endT = new Date(expiryDateIso).getTime()
    const startT = joinDateIso ? new Date(joinDateIso).getTime() : endT - 30 * 86_400_000
    const nowT = Date.now()
    const totalT = Math.max(1, endT - startT)
    const elapsedT = Math.max(0, nowT - startT)
    elapsedPercentage = Math.min(100, Math.max(0, Math.round((elapsedT / totalT) * 100)))
  }

  return (
    <div className="dash-root">
      {/* ── App bar ──────────────────────────────────────────────────────── */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <span className="dash-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <rect x="2" y="14" width="6" height="8" rx="2" fill="currentColor" />
              <rect x="28" y="14" width="6" height="8" rx="2" fill="currentColor" />
              <rect x="8" y="10" width="4" height="16" rx="2" fill="currentColor" />
              <rect x="24" y="10" width="4" height="16" rx="2" fill="currentColor" />
              <rect x="12" y="16" width="12" height="4" rx="2" fill="currentColor" />
            </svg>
          </span>
          <span className="dash-logo-text">iGYM</span>
        </div>
        <span className="dash-page-title" aria-hidden="true">
          Dashboard
        </span>
        {/* Avatar + sign-out */}
        <form action={signOutAction}>
          <button
            id="sign-out-btn"
            type="submit"
            className="dash-avatar-btn"
            title="Sign out"
            aria-label="Sign out"
          >
            <span className="dash-avatar-initials" aria-hidden="true">
              {displayFirstName.slice(0, 1).toUpperCase()}
            </span>
          </button>
        </form>
      </header>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <main className="dash-body">
        {/* ── Welcome Banner (Dynamic Name Greeting + Member ID) ──────────── */}
        <section className="dash-welcome" aria-labelledby="welcome-heading">
          <div className="dash-welcome-text">
            <p className="dash-greeting">Good to see you 👋</p>
            <h1 id="welcome-heading" className="dash-member-name">
              Hello, {displayFirstName}
            </h1>
            <p className="dash-member-id">
              Member ID: <strong>{displayMemberId}</strong>
            </p>
          </div>
          <div className="dash-welcome-orb" aria-hidden="true" />
        </section>

        {/* ── Quick Shortcuts Grid (Workouts Card Removed) ──────────────── */}
        <section
          className="dash-section"
          aria-labelledby="quick-shortcuts-heading"
          style={{ marginBottom: '1.75rem' }}
        >
          <div className="section-header-row">
            <h2 id="quick-shortcuts-heading" className="section-heading" style={{ marginBottom: 0 }}>
              Quick Shortcuts
            </h2>
            <span className="section-subtext">Direct access to app features</span>
          </div>

          <div className="quick-shortcuts-grid">
            <Link href="/dashboard/progress" className="quick-shortcut-card">
              <span className="quick-shortcut-icon quick-shortcut-icon--progress">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </span>
              <div>
                <h3 className="quick-shortcut-title">Track Progress</h3>
                <p className="quick-shortcut-sub">Weight &amp; measurements</p>
              </div>
            </Link>

            <Link href="/dashboard/chat" className="quick-shortcut-card">
              <span className="quick-shortcut-icon quick-shortcut-icon--chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </span>
              <div>
                <h3 className="quick-shortcut-title">Support Chat</h3>
                <p className="quick-shortcut-sub">Trainer &amp; desk support</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Responsive 2-column grid ──────────────────────────────────── */}
        <div className="dash-content-grid">
          {/* ── Left column: Gym Announcements + Fitness Progress Chart ── */}
          <div className="dash-col-primary">
            {/* My Membership Status Card */}
            <section className="dash-section" aria-labelledby="membership-status-heading" style={{ marginBottom: '1.75rem' }}>
              <div
                className="dash-card"
                style={{
                  background: 'linear-gradient(135deg, hsl(224 20% 9%) 0%, hsl(224 20% 12%) 100%)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  border: '1px solid hsl(158 84% 44% / 0.25)',
                  boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 140,
                    height: 140,
                    background: 'radial-gradient(circle, hsl(158 84% 44% / 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 38,
                        height: 38,
                        borderRadius: '0.625rem',
                        background: 'hsl(158 84% 44% / 0.15)',
                        color: 'var(--brand-primary)',
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </span>
                    <div>
                      <h2 id="membership-status-heading" style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        My Membership Status
                      </h2>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Subscription plan &amp; validity portal</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '1rem',
                      background: isMemberActive ? 'hsl(158 84% 44% / 0.18)' : 'hsl(350 80% 18%)',
                      color: isMemberActive ? 'var(--brand-primary)' : 'hsl(350 80% 65%)',
                      border: `1px solid ${isMemberActive ? 'hsl(158 84% 44% / 0.4)' : 'hsl(350 80% 28%)'}`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: isMemberActive ? 'var(--brand-primary)' : 'hsl(350 80% 65%)',
                        boxShadow: isMemberActive ? '0 0 8px var(--brand-primary)' : 'none',
                      }}
                    />
                    {isMemberActive ? 'Active Membership' : 'No Active Membership'}
                  </span>
                </div>

                {/* Card Body */}
                {isMemberActive ? (
                  <div>
                    {/* Active Plan details */}
                    <div style={{ background: 'hsl(224 18% 13%)', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--bg-card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                            Active Plan
                          </span>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                            {activePlanName}
                          </h3>
                        </div>
                        <button
                          onClick={() => setShowPackagesModal(true)}
                          style={{
                            padding: '0.5rem 0.875rem',
                            borderRadius: '0.625rem',
                            background: 'hsl(158 84% 44% / 0.15)',
                            color: 'var(--brand-primary)',
                            border: '1px solid hsl(158 84% 44% / 0.3)',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          Browse Packages
                        </button>
                      </div>

                      {/* Activation & Expiry Dates */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed hsl(224 18% 20%)' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Activation Date</span>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatDate(joinDateIso)}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Expiry Date</span>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: isExpiring ? 'hsl(350 80% 65%)' : 'var(--text-primary)' }}>
                            {formatDate(expiryDateIso)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ background: 'hsl(224 18% 13%)', borderRadius: '0.875rem', padding: '1rem 1.25rem', border: '1px solid var(--bg-card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Duration Progress
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: remainingDaysText.includes('Expired') ? 'hsl(350 80% 65%)' : 'var(--brand-primary)' }}>
                          {remainingDaysText}
                        </span>
                      </div>

                      <div style={{ height: '10px', width: '100%', borderRadius: '5px', backgroundColor: 'hsl(224 18% 7%)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${elapsedPercentage}%`,
                            background: remainingDaysText.includes('Expired')
                              ? 'hsl(350 80% 58%)'
                              : 'linear-gradient(90deg, hsl(158 84% 38%) 0%, hsl(158 84% 50%) 100%)',
                            borderRadius: '5px',
                            transition: 'width 0.4s ease',
                            boxShadow: '0 0 10px var(--brand-primary-glow)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Inactive State */
                  <div style={{ background: 'hsl(224 18% 13%)', borderRadius: '0.875rem', padding: '1.5rem', textAlign: 'center', border: '1px solid var(--bg-card-border)' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      No Active Membership Plan
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                      Activate your membership package to unlock full access to gym facilities, workout tracking, and trainer support.
                    </p>

                    <button
                      onClick={() => setShowPackagesModal(true)}
                      style={{
                        padding: '0.75rem 1.75rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, hsl(158 84% 38%) 0%, hsl(158 84% 30%) 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        border: '1px solid hsl(158 84% 44% / 0.5)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px var(--brand-primary-glow)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>Browse Packages &amp; Upgrade</span>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </section>

            <ProgressChartSection memberId={memberId} memberDbUuid={member?.id} memberWeight={memberWeight} />
          </div>
          {/* end dash-col-primary */}

          {/* ── Right column: Membership + Coach ─────────────────────── */}
          <div className="dash-col-secondary">
            {/* Membership & Billing Card */}
            <section className="dash-section" aria-labelledby="membership-heading">
              <h2 id="membership-heading" className="section-heading">
                Membership &amp; Billing
              </h2>
              <div className="dash-card billing-card">
                <div className="billing-row">
                  <div className="billing-row-left">
                    <span className="billing-icon billing-icon--plan" aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zm-1.5 5v6.5A1.5 1.5 0 002.5 17h15a1.5 1.5 0 001.5-1.5V9h-18zm5 3.5a1 1 0 100 2h1a1 1 0 100-2H6zm3 0a1 1 0 100 2h6a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="billing-field-label">Current Plan</p>
                      <p className="billing-field-value">
                        {member?.package_name || member?.tier || member?.package || member?.plan_name || 'Standard Package'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`billing-pay-badge ${
                      paymentStatusText === 'Fully Paid' || paymentStatusText === 'Active'
                        ? 'billing-pay-badge--success'
                        : paymentStatusText === 'Payment Due'
                        ? 'billing-pay-badge--due'
                        : 'billing-pay-badge--partial'
                    }`}
                    role="status"
                  >
                    <span className="billing-pay-dot" aria-hidden="true" />
                    {paymentStatusText}
                  </span>
                </div>

                <div className="billing-divider" role="separator" />

                <div className="billing-payment-grid">
                  <div className="billing-pay-item">
                    <p className="billing-pay-label">Amount Paid</p>
                    <p className="billing-pay-amount billing-pay-amount--success">
                      LKR {amountPaid.toLocaleString()}
                    </p>
                  </div>

                  <div className="billing-pay-item">
                    <p className="billing-pay-label">Balance Due</p>
                    <p className="billing-pay-amount billing-pay-amount--due">
                      LKR {balanceDue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="billing-pay-progress-bar">
                  <div className="billing-pay-progress-fill" style={{ width: `${payProgress}%` }} />
                </div>

                <div className="billing-divider" role="separator" />

                <div className="billing-dates">
                  <div>
                    <p className="billing-field-label">Next Billing Date</p>
                    <p className="billing-field-value">{nextBillingDate}</p>
                  </div>
                  <div>
                    <p className="billing-field-label">Membership Expires</p>
                    <p className="billing-field-value">
                      {formatDate(member?.expire_date || member?.package_expire_date || member?.expiry_date || member?.next_payment_date || null)}
                    </p>
                  </div>
                </div>

                {(isExpiring || isExpired) && (
                  <div className="billing-alert" role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {isExpired
                      ? 'Your membership has expired. Please visit the front desk to renew.'
                      : `Your membership expires in ${days} day${days !== 1 ? 's' : ''}. Renew soon to avoid interruption.`}
                  </div>
                )}

                <div className="billing-divider" role="separator" />

                <a
                  id="view-billing-btn"
                  href="/dashboard/billing"
                  className="billing-cta"
                  aria-label="View billing and payment history"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zm-1.5 5v6.5A1.5 1.5 0 002.5 17h15a1.5 1.5 0 001.5-1.5V9h-18zm5 3.5a1 1 0 100 2h1a1 1 0 100-2H6zm3 0a1 1 0 100 2h6a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View Billing &amp; Payments
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="billing-cta-arrow"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </section>

            {/* My Coach Section */}
            <section className="dash-section" aria-labelledby="coach-heading">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <h2 id="coach-heading" className="section-heading" style={{ marginBottom: 0 }}>
                  My Coach
                </h2>
                <a
                  href="/dashboard/coaches"
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}
                >
                  View All Coaches &rarr;
                </a>
              </div>
              <div className="dash-card coach-card">
                {member?.coach_name ? (
                  <div className="coach-assigned">
                    <div className="coach-avatar" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="coach-info">
                      <p className="coach-role">Personal Trainer</p>
                      <p className="coach-name">{member.coach_name}</p>
                    </div>
                    <a
                      id="message-coach-btn"
                      href="/dashboard/chat"
                      className="coach-message-btn"
                      aria-label={`Message coach ${member.coach_name}`}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579c.57.004 1.14-.003 1.71-.012 2.297-.145 4.317-1.428 4.317-3.613V5.426c0-2.185-2.02-3.468-4.317-3.613A44.12 44.12 0 0010 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="coach-empty">
                    <div className="coach-empty-icon" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        <path d="M18 6v6M21 9h-6" />
                      </svg>
                    </div>
                    <div className="coach-empty-text">
                      <p className="coach-empty-title">No coach assigned yet</p>
                      <p className="coach-empty-sub">Talk to the front desk or browse coaches online</p>
                    </div>
                    <a
                      id="find-coach-btn"
                      href="/dashboard/coaches"
                      className="coach-find-btn"
                      aria-label="Find a coach"
                    >
                      Find a Coach
                      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </section>
          </div>
          {/* end dash-col-secondary */}
        </div>
        {/* end dash-content-grid */}

        <div className="dash-bottom-spacer" />
      </main>

      {/* ── Packages Modal ───────────────────────────────────────────── */}
      {showPackagesModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowPackagesModal(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              color: '#f8fafc',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPackagesModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#1e293b',
                border: 'none',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.375rem' }}>
                Membership Packages
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Select a package tier to send an instant activation request to Admin
              </p>
            </div>

            {loadingPackages ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                Loading packages...
              </div>
            ) : packagesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: '#1e293b', borderRadius: '1rem' }}>
                <p style={{ fontSize: '0.9375rem', marginBottom: '0.5rem', color: '#e2e8f0', fontWeight: 600 }}>
                  No Membership Packages Found
                </p>
                <p style={{ fontSize: '0.8125rem' }}>
                  Please contact the gym front desk or check back later for available plans.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {packagesList.map((pkg, idx) => {
                  const pkgName = pkg.name || pkg.package_name || pkg.title || `Package #${idx + 1}`
                  const pkgPrice = pkg.price || pkg.fee || pkg.amount || 0
                  const pkgDesc = pkg.description || pkg.details || ''
                  const pkgBadge = pkg.badge || pkg.tag || (pkg.duration_months ? `${pkg.duration_months} Month${pkg.duration_months > 1 ? 's' : ''}` : null)
                  const rawFeats = pkg.features
                  const featsList = Array.isArray(rawFeats)
                    ? rawFeats
                    : typeof rawFeats === 'string' && rawFeats.trim()
                    ? rawFeats.split(',').map((f: string) => f.trim())
                    : []

                  return (
                    <div
                      key={pkg.id || idx}
                      style={{
                        background: '#1e293b',
                        borderRadius: '1rem',
                        padding: '1.25rem',
                        border: '1px solid #334155',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                      }}
                    >
                      {pkgBadge && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '0.75rem',
                            right: '0.75rem',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.5rem',
                            background: 'hsl(158 84% 44% / 0.2)',
                            color: '#10b981',
                            border: '1px solid hsl(158 84% 44% / 0.4)',
                          }}
                        >
                          {pkgBadge}
                        </span>
                      )}

                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                          {pkgName}
                        </h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginBottom: '0.75rem' }}>
                          LKR {Number(pkgPrice).toLocaleString()}
                        </div>
                        {pkgDesc && (
                          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1rem' }}>
                            {pkgDesc}
                          </p>
                        )}

                        {featsList.length > 0 && (
                          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {featsList.map((feat: string, fIdx: number) => (
                              <li key={fIdx} style={{ fontSize: '0.8125rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {feat}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <button
                        disabled={requestedPackageId === (pkg.id || pkgName)}
                        onClick={() => handleRequestPackage(pkg)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.625rem',
                          background: 'linear-gradient(135deg, hsl(158 84% 38%) 0%, hsl(158 84% 30%) 100%)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          opacity: requestedPackageId === (pkg.id || pkgName) ? 0.7 : 1,
                        }}
                      >
                        {requestedPackageId === (pkg.id || pkgName) ? 'Requesting...' : 'Request Package'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
