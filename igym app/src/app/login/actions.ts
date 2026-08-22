'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { memberIdToEmail } from '@/lib/auth/helpers'

/**
 * Server Action: Sign in with Member ID + Password.
 *
 * The form sends `memberId` and `password`. We convert the Member ID to
 * a synthetic email (e.g. M1001 → M1001@gym.com) before calling Supabase,
 * keeping the email requirement completely hidden from the member.
 */
export async function loginAction(formData: FormData) {
  const memberId = formData.get('memberId') as string
  const password = formData.get('password') as string

  if (!memberId || !password) {
    return redirect('/login?error=Please+fill+in+all+fields')
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore.
          }
        },
      },
    }
  )

  const email = memberIdToEmail(memberId)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Return a user-friendly message — never expose raw Supabase errors.
    const message =
      error.message === 'Invalid login credentials'
        ? 'Invalid+Member+ID+or+password'
        : encodeURIComponent(error.message)
    return redirect(`/login?error=${message}`)
  }

  redirect('/dashboard')
}
