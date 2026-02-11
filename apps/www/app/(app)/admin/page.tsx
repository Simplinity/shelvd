import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
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

  // Attention items
  const { count: newTickets } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const { count: suspendedUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .in('status', ['suspended', 'banned'])

  // Books without ISBN
  let booksNoIsbn = 0
  try {
    const { data } = await supabase.rpc('get_platform_stats_for_admin')
    booksNoIsbn = Number(data?.[0]?.books_no_isbn) || 0
  } catch {}

  // Announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, message, type, is_active, starts_at, ends_at, created_at')
    .order('created_at', { ascending: false })

  // Build attention items
  const attentionItems: { label: string; value: number; href: string; color: 'red' | 'amber' | 'muted' }[] = []
  if ((newTickets ?? 0) > 0) {
    attentionItems.push({ label: 'Open support tickets', value: newTickets!, href: '/admin/support', color: 'red' })
  }
  if ((suspendedUsers ?? 0) > 0) {
    attentionItems.push({ label: 'Suspended / banned users', value: suspendedUsers!, href: '/admin/users?status=suspended', color: 'amber' })
  }
  if (booksNoIsbn > 0) {
    attentionItems.push({ label: 'Books without ISBN', value: booksNoIsbn, href: '/admin/stats', color: 'muted' })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-8">
        <Metric label="Users" value={totalUsers ?? 0} />
        <Metric label="Active" value={activeUsers ?? 0} />
        <Metric label="Books" value={totalBooks} />
        <Metric label="Signups 7d" value={recentSignups ?? 0} />
      </div>

      {/* Needs Attention */}
      {attentionItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Needs Attention</h2>
          <div className="divide-y divide-border border">
            {attentionItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    item.color === 'red' ? 'bg-red-500' :
                    item.color === 'amber' ? 'bg-amber-500' :
                    'bg-muted-foreground/30'
                  }`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">{formatInteger(item.value)}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
