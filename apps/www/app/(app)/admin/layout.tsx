import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'

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
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    redirect('/books')
  }

  // Badge counts for sidebar
  const { count: newTickets } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const badges = {
    support: newTickets ?? 0,
  }

  return (
    <div className="flex">
      <div className="sticky top-[68px] h-[calc(100vh-68px)]">
        <AdminSidebar badges={badges} />
      </div>
      <main className="flex-1 min-w-0 min-h-[calc(100vh-68px)]">
        {children}
      </main>
    </div>
  )
}
