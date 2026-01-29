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
    return { error: 'Email en wachtwoord zijn verplicht' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Generieke foutmelding voor security (geen hint of email bestaat)
    return { error: 'Ongeldige inloggegevens' }
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
    return { error: 'Email en wachtwoord zijn verplicht' }
  }

  if (password.length < 8) {
    return { error: 'Wachtwoord moet minimaal 8 tekens zijn' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Dit emailadres is al geregistreerd' }
    }
    return { error: 'Er ging iets mis. Probeer het opnieuw.' }
  }

  return { success: true }
}

export async function forgotPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is verplicht' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    return { error: 'Er ging iets mis. Probeer het opnieuw.' }
  }

  // Altijd success tonen (security: geen hint of email bestaat)
  return { success: true }
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const password = formData.get('password') as string

  if (!password) {
    return { error: 'Wachtwoord is verplicht' }
  }

  if (password.length < 8) {
    return { error: 'Wachtwoord moet minimaal 8 tekens zijn' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: 'Er ging iets mis. Probeer het opnieuw.' }
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
