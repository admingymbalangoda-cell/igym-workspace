import { redirect } from 'next/navigation'

/**
 * Root route — redirect to login by default.
 * After auth is set up properly, middleware will handle this redirect
 * based on session state.
 */
export default function RootPage() {
  redirect('/login')
}
