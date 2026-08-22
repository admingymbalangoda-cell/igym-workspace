import type { Metadata } from 'next'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password — iGYM',
  description: 'Reset your iGYM member account password.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
