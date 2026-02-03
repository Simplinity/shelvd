import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  // Check if user is admin
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  console.log('Admin check:', { userId: user.id, email: user.email, profile, error })
  
  if (!profile?.is_admin) {
    redirect('/books')
  }
  
  return <>{children}</>
}
