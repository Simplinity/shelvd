'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthResult = {
  error?: string
  success?: boolean
}

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Generic error message for security (no hint if email exists)
    return { error: 'Invalid credentials' }
  }

  revalidatePath('/', 'layout')
  redirect('/books')
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shelvd.org'}/auth/callback`,
    },
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already exists')) {
      return { error: 'This email is already registered. Try signing in instead.' }
    }
    if (msg.includes('password') && (msg.includes('short') || msg.includes('least') || msg.includes('characters') || msg.includes('length'))) {
      return { error: 'Password must be at least 8 characters.' }
    }
    if (msg.includes('valid email') || msg.includes('invalid email')) {
      return { error: 'Please enter a valid email address.' }
    }
    if (msg.includes('rate limit') || msg.includes('too many')) {
      return { error: 'Too many attempts. Please wait a moment and try again.' }
    }
    // Log unexpected errors for debugging, show user-friendly message
    console.error('Signup error:', error.message)
    return { error: `Signup failed: ${error.message}` }
  }

  // Redeem invite code if provided (non-blocking — signup succeeds regardless)
  const inviteCode = (formData.get('inviteCode') as string)?.trim()
  if (inviteCode && data?.user?.id) {
    try {
      await supabase.rpc('redeem_invite_code', {
        p_code: inviteCode,
        p_user_id: data.user.id,
      })
    } catch {
      // Silent — code redemption should never block signup
    }
  }

  return { success: true }
}

export async function forgotPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shelvd.org'}/reset-password`,
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('rate limit') || msg.includes('too many')) {
      return { error: 'Too many attempts. Please wait a moment and try again.' }
    }
    console.error('Password reset error:', error.message)
    return { error: `Password reset failed: ${error.message}` }
  }

  // Always show success (security: no hint if email exists)
  return { success: true }
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const password = formData.get('password') as string

  if (!password) {
    return { error: 'Password is required' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('password') && (msg.includes('short') || msg.includes('least') || msg.includes('characters'))) {
      return { error: 'Password must be at least 8 characters.' }
    }
    if (msg.includes('same password') || msg.includes('different')) {
      return { error: 'New password must be different from your current password.' }
    }
    console.error('Reset password error:', error.message)
    return { error: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/books')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
