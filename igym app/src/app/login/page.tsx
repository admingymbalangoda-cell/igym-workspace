import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Member Login — iGYM',
  description: 'Sign in to your iGYM member account to track your workouts, attendance, and membership status.',
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const errorMessage = params.error ? decodeURIComponent(params.error) : null

  return <LoginForm errorMessage={errorMessage} />
}
