import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, Users, BookOpen, TrendingUp, Check, MessageSquare, BarChart3, ChevronRight } from 'lucide-react'
import { formatInteger } from '@/lib/format'
import { AnnouncementManager } from './announcements/announcement-manager'

export default async function AdminPage() {
  const supabase = await createClient()

  // Stats
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  let totalBooks = 0
  try {
    const { data } = await supabase.rpc('get_total_books_for_admin')
    totalBooks = Number(data) || 0
  } catch {}

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { count: recentSignups } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  // Feedback stats
  const { count: newFeedbackCount } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const { count: totalFeedbackCount } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })

  // Suspended/banned count
  const { count: suspendedCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .in('status', ['suspended', 'banned'])

  // Announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, message, type, is_active, starts_at, ends_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-10">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Admin</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-px bg-border mb-12">
        <Metric label="Users" value={totalUsers ?? 0} />
        <Metric label="Active" value={activeUsers ?? 0} />
        <Metric label="Books" value={totalBooks} />
        <Metric label="Signups 7d" value={recentSignups ?? 0} />
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <NavCard
          href="/admin/stats"
          title="System Stats"
          description="Growth, adoption, data health"
          icon={<BarChart3 className="w-5 h-5" />}
          stat={`${formatInteger(totalBooks)} books cataloged`}
        />
        <NavCard
          href="/admin/support"
          title="Support Queue"
          description="Bug reports, contacts, callbacks"
          icon={<MessageSquare className="w-5 h-5" />}
          stat={`${totalFeedbackCount ?? 0} total`}
          badge={newFeedbackCount && newFeedbackCount > 0 ? newFeedbackCount : undefined}
        />
        <NavCard
          href="/admin/users"
          title="User Management"
          description="Profiles, status, membership"
          icon={<Users className="w-5 h-5" />}
          stat={`${totalUsers ?? 0} registered`}
          badge={suspendedCount && suspendedCount > 0 ? suspendedCount : undefined}
          badgeColor="amber"
        />
      </div>

      {/* Announcements */}
      <AnnouncementManager announcements={announcements || []} />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background p-5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-light tabular-nums">{formatInteger(value)}</p>
    </div>
  )
}

function NavCard({ href, title, description, icon, stat, badge, badgeColor = 'red' }: {
  href: string
  title: string
  description: string
  icon: React.ReactNode
  stat: string
  badge?: number
  badgeColor?: 'red' | 'amber'
}) {
  const badgeBg = badgeColor === 'amber' 
    ? 'bg-amber-600 text-white' 
    : 'bg-red-600 text-white'
  
  return (
    <Link
      href={href}
      className="group border border-border hover:border-foreground/40 transition-all duration-200 flex flex-col"
    >
      {/* Top section */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="text-muted-foreground group-hover:text-foreground transition-colors">
            {icon}
          </div>
          <div className="flex items-center gap-2">
            {badge !== undefined && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 min-w-[20px] text-center ${badgeBg}`}>
                {badge}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </div>
        </div>
        <h2 className="text-sm font-semibold mb-1">{title}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {/* Bottom stat */}
      <div className="px-5 py-3 border-t border-border bg-muted/30">
        <p className="text-[11px] text-muted-foreground tabular-nums">{stat}</p>
      </div>
    </Link>
  )
}
