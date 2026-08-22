'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  id: string
  badge?: number
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-home',
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-1.33-1.33V19.5a1.5 1.5 0 01-1.5 1.5h-4.5a.75.75 0 01-.75-.75v-4.5h-3v4.5a.75.75 0 01-.75.75H5.25a1.5 1.5 0 01-1.5-1.5V10.14L2.421 11.47a.75.75 0 10-1.06-1.06l8.69-8.69z" />
      </svg>
    ),
  },
  {
    id: 'nav-chat',
    href: '/dashboard/chat',
    label: 'Chat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
        <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223 5.991 5.991 0 003.148-.685z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'nav-progress',
    href: '/dashboard/progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    id: 'nav-profile',
    href: '/dashboard/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
      </svg>
    ),
  },
]

export default function AppNav() {
  const pathname = usePathname()
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  function isActive(href: string) {
    return href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Mobile: bottom tab bar displaying 4 core items ────────── */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {ALL_NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              id={item.id}
              href={item.href}
              className={`bottom-nav-item ${active ? 'bottom-nav-item--active' : ''}`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="bottom-nav-icon" style={{ position: 'relative' }}>
                {active ? item.activeIcon : item.icon}
                {item.badge ? (
                  <span className="nav-badge-bubble">{item.badge}</span>
                ) : null}
              </span>
              <span className="bottom-nav-label">{item.label}</span>
              {active && <span className="bottom-nav-indicator" aria-hidden="true" />}
            </Link>
          )
        })}

        {/* "More" trigger button for quick secondary shortcuts */}
        <button
          type="button"
          className={`bottom-nav-item ${showMoreMenu ? 'bottom-nav-item--active' : ''}`}
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          aria-label="More navigation options"
        >
          <span className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
          </span>
          <span className="bottom-nav-label">More</span>
          {showMoreMenu && <span className="bottom-nav-indicator" aria-hidden="true" />}
        </button>
      </nav>

      {/* ── Mobile: More Bottom Sheet Drawer ────────────────────────────── */}
      {showMoreMenu && (
        <div className="nav-more-backdrop" onClick={() => setShowMoreMenu(false)}>
          <div className="nav-more-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="nav-more-header">
              <span className="nav-more-handle" />
              <h3 className="nav-more-title">More iGYM App Links</h3>
            </div>
            <div className="nav-more-grid">
              <Link
                href="/dashboard/coaches"
                className={`nav-more-card ${pathname.startsWith('/dashboard/coaches') ? 'nav-more-card--active' : ''}`}
                onClick={() => setShowMoreMenu(false)}
              >
                <span className="nav-more-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                </span>
                <span className="nav-more-label">Coaches</span>
              </Link>

              <Link
                href="/dashboard/workouts"
                className={`nav-more-card ${pathname.startsWith('/dashboard/workouts') ? 'nav-more-card--active' : ''}`}
                onClick={() => setShowMoreMenu(false)}
              >
                <span className="nav-more-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="14" width="6" height="8" rx="2" />
                    <rect x="28" y="14" width="6" height="8" rx="2" />
                    <rect x="8" y="10" width="4" height="16" rx="2" />
                    <rect x="24" y="10" width="4" height="16" rx="2" />
                    <rect x="12" y="16" width="12" height="4" rx="2" />
                  </svg>
                </span>
                <span className="nav-more-label">Workouts</span>
              </Link>

              <Link
                href="/dashboard/billing"
                className={`nav-more-card ${pathname.startsWith('/dashboard/billing') ? 'nav-more-card--active' : ''}`}
                onClick={() => setShowMoreMenu(false)}
              >
                <span className="nav-more-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </span>
                <span className="nav-more-label">Billing</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop: fixed left sidebar (lists Home, Chat, Progress, Profile) ──────── */}
      <nav className="side-nav" aria-label="Main navigation">
        {/* Brand */}
        <div className="side-nav-brand">
          <span className="side-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <rect x="2"  y="14" width="6"  height="8" rx="2" fill="currentColor" />
              <rect x="28" y="14" width="6"  height="8" rx="2" fill="currentColor" />
              <rect x="8"  y="10" width="4"  height="16" rx="2" fill="currentColor" />
              <rect x="24" y="10" width="4"  height="16" rx="2" fill="currentColor" />
              <rect x="12" y="16" width="12" height="4"  rx="2" fill="currentColor" />
            </svg>
          </span>
          <div>
            <span className="side-logo-text">iGYM</span>
            <span className="side-logo-sub">Member Portal</span>
          </div>
        </div>

        {/* Nav items */}
        <div className="side-nav-items" role="list">
          {ALL_NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                id={`side-${item.id}`}
                href={item.href}
                role="listitem"
                className={`side-nav-item ${active ? 'side-nav-item--active' : ''}`}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <span className="side-nav-item-icon" style={{ position: 'relative' }}>
                  {active ? item.activeIcon : item.icon}
                  {item.badge ? (
                    <span className="nav-badge-bubble nav-badge-bubble--side">{item.badge}</span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="side-nav-footer">
          iGYM Member App · PWA
        </div>
      </nav>
    </>
  )
}
