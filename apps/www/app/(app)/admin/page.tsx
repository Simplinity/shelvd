import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, BookOpen, Shield, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Get user stats
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  const { count: adminUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_admin', true)
  
  // Get total books across all users (admin can see all)
  const { count: totalBooks } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
  
  // Get recent signups (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { count: recentSignups } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage users and monitor platform activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={totalUsers ?? 0}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Active Users"
          value={activeUsers ?? 0}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Total Books"
          value={totalBooks ?? 0}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          label="Signups (7d)"
          value={recentSignups ?? 0}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link 
          href="/admin/users"
          className="p-6 border hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-bold">User Management</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            View all users, manage accounts, change membership status.
          </p>
        </Link>
        
        <div className="p-6 border bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-bold text-muted-foreground">Analytics</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Coming soon — detailed usage statistics.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="p-4 border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  )
}
