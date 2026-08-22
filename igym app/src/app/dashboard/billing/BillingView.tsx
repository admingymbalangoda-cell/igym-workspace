'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PaymentRecord {
  id: string
  member_id: string
  invoice_no?: string | null
  category?: string | null
  payment_type?: string | null
  fee_category?: string | null
  item_description?: string | null
  amount?: number | null
  paid_amount?: number | null
  amount_paid?: number | null
  paidAmount?: number | null
  balance_due?: number | null
  balance?: number | null
  due_balance?: number | null
  balanceDue?: number | null
  payment_date?: string | null
  created_at?: string | null
  due_date?: string | null
  next_due_date?: string | null
  status?: string | null
  method?: string | null
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const dateObj = new Date(iso)
  if (isNaN(dateObj.getTime())) return iso
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BillingView() {
  const supabase = createClient()

  const [history, setHistory] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState('')
  const [packageName, setPackageName] = useState('Standard Package')
  const [totalPaidSum, setTotalPaidSum] = useState<number>(0)
  const [latestBalanceDue, setLatestBalanceDue] = useState<number>(0)
  const [membershipStatus, setMembershipStatus] = useState<string>('Active')

  useEffect(() => {
    let isMounted = true

    async function loadBillingData() {
      try {
        setLoading(true)

        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser()

        console.log("BillingView auth user:", { user, authErr })
        if (!user) return

        const userEmail = user.email ?? ''
        const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0].trim() : userEmail.trim()
        const cleanId = emailPrefix.toUpperCase().replace(/^MEM-/, 'MEM')
        const hyphenId = cleanId.replace(/^MEM/, 'MEM-')

        // 1. Fetch member info from `members` table
        let memberData: any = null

        try {
          const { data: mData, error: mErr } = await supabase
            .from('members')
            .select('id, member_id, package_name, tier, package, plan_name, membership_status, expire_date, expiry_date, phone')
            .or(`auth_user_id.eq.${user.id},id.eq.${user.id},member_id.eq.${cleanId},member_id.eq.${hyphenId}`)
            .limit(1)

          console.log("BillingView member fetch:", { data: mData, error: mErr })

          if (mData && mData.length > 0) {
            memberData = mData[0]
          } else {
            const { data: fallbackM } = await supabase
              .from('members')
              .select('id, member_id, package_name, tier, package, plan_name, membership_status, expire_date, expiry_date, phone')
              .in('member_id', [cleanId, hyphenId])
              .limit(1)

            if (fallbackM && fallbackM.length > 0) {
              memberData = fallbackM[0]
            }
          }
        } catch (catchedMErr) {
          console.error("BillingView member fetch exception:", catchedMErr)
        }

        const activeMemberId = memberData?.member_id || memberData?.id || cleanId
        const activeMemberUuid = memberData?.id || user.id
        const resolvedPackage =
          memberData?.package_name ||
          memberData?.tier ||
          memberData?.package ||
          memberData?.plan_name ||
          'Standard Package'

        if (isMounted) {
          setMemberId(activeMemberId)
          setPackageName(resolvedPackage)
          setMembershipStatus(
            memberData?.membership_status
              ? memberData.membership_status.charAt(0).toUpperCase() + memberData.membership_status.slice(1)
              : 'Active'
          )
        }

        // 2. Fetch ALL payment history records for this user from `payments` table
        let payRows: PaymentRecord[] = []

        try {
          // Query by member_id string
          const { data: payData1, error: err1 } = await supabase
            .from('payments')
            .select('*')
            .eq('member_id', activeMemberId)
            .order('created_at', { ascending: false })

          console.log("BillingView payments by member_id string:", { data: payData1, error: err1 })

          if (!err1 && payData1 && payData1.length > 0) {
            payRows = payData1
          } else {
            // Query by member_id UUID
            const { data: payData2, error: err2 } = await supabase
              .from('payments')
              .select('*')
              .eq('member_id', activeMemberUuid)
              .order('created_at', { ascending: false })

            console.log("BillingView payments by member_id UUID:", { data: payData2, error: err2 })

            if (!err2 && payData2 && payData2.length > 0) {
              payRows = payData2
            } else {
              // Fallback local match across all payments
              const { data: allPay, error: err3 } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

              console.log("BillingView payments fallback all:", { data: allPay, error: err3 })

              if (!err3 && allPay && allPay.length > 0) {
                payRows = allPay.filter(
                  (p: any) =>
                    String(p.member_id).toLowerCase() === String(activeMemberId).toLowerCase() ||
                    String(p.member_id).toLowerCase() === String(activeMemberUuid).toLowerCase() ||
                    String(p.member_id).toLowerCase() === String(cleanId).toLowerCase() ||
                    String(p.member_id).toLowerCase() === String(hyphenId).toLowerCase() ||
                    String(p.member_id).toLowerCase() === String(user.id).toLowerCase() ||
                    (memberData?.phone && p.phone === memberData.phone)
                )
              }
            }
          }
        } catch (catchedPayErr) {
          console.error("BillingView payments fetch exception:", catchedPayErr)
        }

        console.log("Fetched payments data in BillingView (Final):", payRows)

        if (isMounted) {
          setHistory(payRows)

          // Flexible Column Extraction for Total Paid Sum
          const sum = payRows.reduce((acc: number, r: PaymentRecord) => {
            const paidVal = Number(
              r.paid_amount ??
              r.amount_paid ??
              r.amount ??
              r.paidAmount ??
              0
            )
            return acc + paidVal
          }, 0)

          setTotalPaidSum(sum)

          if (payRows.length > 0) {
            const latest = payRows[0]
            const due = Number(
              latest.balance_due ??
              latest.balance ??
              latest.due_balance ??
              latest.balanceDue ??
              ((latest.status || '').toLowerCase() === 'paid' ? 0 : 0)
            )
            setLatestBalanceDue(due)
          } else {
            setLatestBalanceDue(0)
          }
        }
      } catch (err) {
        console.error('Exception loading billing history:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadBillingData()

    return () => {
      isMounted = false
    }
  }, [supabase])

  return (
    <div className="bl-root">
      {/* ── Back Navigation & Page Title ──────────────────────────────── */}
      <div className="bl-page-head">
        <a href="/dashboard" className="bl-back-link">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </a>
        <h1 className="bl-title">Billing &amp; Payments</h1>
        <p className="bl-subtitle">Member ID: <strong>{memberId || '—'}</strong></p>
      </div>

      {/* ── Current Plan Summary Card ─────────────────────────────────── */}
      <section className="bl-plan-card" aria-labelledby="plan-summary-heading">
        <div className="bl-plan-header">
          <div>
            <span className="bl-plan-eyebrow">Active Subscription</span>
            <h2 id="plan-summary-heading" className="bl-plan-name">
              {packageName}
            </h2>
          </div>
          <span className="bl-plan-price">
            {latestBalanceDue > 0 ? (
              <span style={{ color: '#f87171' }}>Balance: LKR {latestBalanceDue.toLocaleString()}</span>
            ) : (
              <span style={{ color: '#34d399' }}>Account Active</span>
            )}
          </span>
        </div>

        <div className="bl-plan-grid">
          <div className="bl-plan-stat">
            <span className="bl-plan-label">Payment Status</span>
            <span className={`bl-status-pill ${latestBalanceDue === 0 && totalPaidSum > 0 ? 'bl-status-pill--success' : latestBalanceDue > 0 ? 'bl-status-pill--partial' : 'bl-status-pill--active'}`}>
              <span className="bl-dot" aria-hidden="true" />
              {latestBalanceDue === 0 && totalPaidSum > 0 ? 'Fully Paid' : latestBalanceDue > 0 ? 'Partial Payment' : membershipStatus}
            </span>
          </div>

          <div className="bl-plan-stat">
            <span className="bl-plan-label">Total Amount Paid</span>
            <span className="bl-plan-val bl-val--green">
              LKR {totalPaidSum.toLocaleString()}
            </span>
          </div>

          <div className="bl-plan-stat">
            <span className="bl-plan-label">Recorded Transactions</span>
            <span className="bl-plan-val">{history.length}</span>
          </div>
        </div>

        <div className="bl-plan-footer">
          <span className="bl-footer-note">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Invoices &amp; receipt records are synced live from the gym management desk.
          </span>
        </div>
      </section>

      {/* ── Payment History Section ───────────────────────────────────── */}
      <section className="dash-section" aria-labelledby="history-heading" style={{ marginTop: '2rem' }}>
        <div className="bl-history-head">
          <h2 id="history-heading" className="section-heading" style={{ marginBottom: 0 }}>
            Payment History (Past Transactions)
          </h2>
          <span className="bl-count-badge">{history.length} {history.length === 1 ? 'Transaction' : 'Transactions'}</span>
        </div>

        <div className="bl-history-list" style={{ marginTop: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Loading payment history...
            </div>
          ) : history.length === 0 ? (
            <div className="notif-empty" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: 'hsl(224 18% 10%)', borderRadius: '1rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 42, height: 42, margin: '0 auto 0.75rem', color: 'var(--text-muted)' }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 600 }}>No previous payments found.</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Your recorded receipts from the front desk will appear here.</p>
            </div>
          ) : (
            history.map((record: PaymentRecord, idx: number) => {
              const paidVal = Number(
                record.paid_amount ??
                record.amount_paid ??
                record.amount ??
                record.paidAmount ??
                0
              )

              const categoryStr =
                record.category ||
                record.payment_type ||
                record.fee_category ||
                record.item_description ||
                record.invoice_no ||
                'Gym Fee Payment'

              const dateStr = record.payment_date || record.created_at || record.due_date

              return (
                <div key={record.id || `pay-row-${idx}`} className="bl-history-item">
                  <div className="bl-item-main">
                    <div className="bl-item-left">
                      <span className="bl-inv-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </span>
                      <div>
                        <div className="bl-inv-row">
                          <span className="bl-inv-no">{categoryStr}</span>
                          <span className={`bl-status-badge ${record.status?.toLowerCase() === 'paid' || record.status?.toLowerCase() === 'successful' ? 'bl-status-badge--successful' : 'bl-status-badge--partial'}`}>
                            {record.status || 'Paid'}
                          </span>
                        </div>
                        <p className="bl-inv-meta" style={{ marginTop: '0.25rem' }}>
                          {formatDate(dateStr)} &bull; Receipt Logged
                        </p>
                      </div>
                    </div>

                    <div className="bl-item-right">
                      <span className="bl-amount">LKR {paidVal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      <div className="dash-bottom-spacer" />
    </div>
  )
}
