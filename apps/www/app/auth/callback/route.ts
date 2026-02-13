import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'recovery' | 'signup' | 'email' | null
  const next = searchParams.get('next') ?? '/books'

  const supabase = await createClient()
  const errors: string[] = []

  // Method 1: PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    errors.push(`code_exchange: ${error.message}`)
  }

  // Method 2: Token hash verification
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    errors.push(`verify_otp: ${error.message}`)
  }

  // Show the actual error instead of generic message
  const errorParam = encodeURIComponent(errors.join(' | ') || 'no_code_or_token')
  return NextResponse.redirect(`${origin}/login?error=${errorParam}`)
}
