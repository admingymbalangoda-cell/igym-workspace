import { Toaster } from 'react-hot-toast'
import BottomNav from '@/components/BottomNav'
import GlobalNotificationListener from '@/components/GlobalNotificationListener'

/**
 * Dashboard layout — wraps all /dashboard/* routes.
 * Renders the sticky bottom navigation bar and ensures the main
 * content area has enough bottom padding so nothing is hidden behind the nav.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dash-shell">
      <GlobalNotificationListener />
      <Toaster position="top-right" />
      {children}
      <BottomNav />
    </div>
  )
}

