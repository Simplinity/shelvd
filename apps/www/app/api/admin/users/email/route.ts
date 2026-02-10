import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendAdminEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, subject, body } = await request.json()
  if (!email || !subject || !body) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    await sendAdminEmail(email, subject, body)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin Email] Error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
