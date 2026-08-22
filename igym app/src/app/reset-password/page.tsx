import type { Metadata } from 'next'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password — iGYM',
  description: 'Enter your new password to restore account access.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
