import { createClient } from '@/lib/supabase/server'
import { Shield, Users, BookOpen, TrendingUp, Search, Check, X, Clock, MessageSquare } from 'lucide-react'
import { formatInteger, formatDate } from '@/lib/format'
import { UserActions } from './users/user-actions'
import { AnnouncementManager } from './announcements/announcement-manager'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // --- STATS ---
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Total books via RPC (bypasses RLS)
  let totalBooks = 0
  try {
    const { data } = await supabase.rpc('get_total_books_for_admin')
    totalBooks = Number(data) || 0
  } catch {}

  // Recent signups (7d)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { count: recentSignups } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  // --- USERS ---
  let query = supabase
    .from('user_profiles')
    .select(`
      id, display_name, membership_tier, is_lifetime_free,
      status, status_reason, is_admin, admin_role, created_at
    `)
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data: profiles } = await query

  // Auth data (emails) via RPC
  let authUsers: any[] | null = null
  try {
    const { data } = await supabase.rpc('get_users_for_admin')
    authUsers = data
  } catch {}
  const authMap = new Map(authUsers?.map((u: any) => [u.id, u]) || [])

  // Book counts via RPC (bypasses RLS)
  let bookCountMap = new Map<string, number>()
  try {
    const { data } = await supabase.rpc('get_book_counts_for_admin')
    data?.forEach((row: any) => {
      bookCountMap.set(row.user_id, Number(row.book_count))
    })
  } catch {}

  // Announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, message, type, is_active, starts_at, ends_at, created_at')
    .order('created_at', { ascending: false })

  // Search filter
  let filteredProfiles = profiles || []
  if (params.q) {
    const q = params.q.toLowerCase()
    filteredProfiles = filteredProfiles.filter(p => {
      const auth = authMap.get(p.id)
      const email = auth?.email?.toLowerCase() || ''
      const name = p.display_name?.toLowerCase() || ''
      return email.includes(q) || name.includes(q)
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Admin</h1>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Users" value={totalUsers ?? 0} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Active" value={activeUsers ?? 0} icon={<Check className="w-4 h-4" />} />
        <StatCard label="Books" value={totalBooks} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="Signups (7d)" value={recentSignups ?? 0} icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-8">
        <a
          href="/admin/support"
          className="flex items-center gap-2 px-4 py-2.5 border hover:border-foreground/50 transition-colors text-sm"
        >
          <MessageSquare className="w-4 h-4 text-red-600" />
          Support Queue
        </a>
      </div>

      {/* Announcements */}
      <div className="mb-8">
        <AnnouncementManager announcements={announcements || []} />
      </div>

      {/* User Management Section */}
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          User Management
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-2 border text-sm"
              />
            </div>
          </form>
          <div className="flex gap-1">
            <FilterLink href="/admin" active={!params.status || params.status === 'all'}>All</FilterLink>
            <FilterLink href="/admin?status=active" active={params.status === 'active'}>Active</FilterLink>
            <FilterLink href="/admin?status=suspended" active={params.status === 'suspended'}>Suspended</FilterLink>
            <FilterLink href="/admin?status=banned" active={params.status === 'banned'}>Banned</FilterLink>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Tier</th>
              <th className="text-right p-3 font-medium">Books</th>
              <th className="text-left p-3 font-medium">Joined</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfiles.map((profile) => {
              const auth = authMap.get(profile.id)
              const bookCount = bookCountMap.get(profile.id) || 0
              return (
                <tr key={profile.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {auth?.email || profile.display_name || 'Unknown'}
                        {profile.is_admin && (
                          <span title="Admin"><Shield className="w-3.5 h-3.5 text-primary" /></span>
                        )}
                      </div>
                      {profile.display_name && auth?.email && (
                        <div className="text-xs text-muted-foreground">{profile.display_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={profile.status || 'unknown'} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="capitalize text-xs">{profile.membership_tier}</span>
                      {profile.is_lifetime_free && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.5">Lifetime</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatInteger(bookCount)}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatDate(profile.created_at)}
                  </td>
                  <td className="p-3 text-right">
                    <UserActions
                      userId={profile.id}
                      currentStatus={profile.status || 'unknown'}
                      isAdmin={profile.is_admin || false}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredProfiles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No users found.</div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="p-4 border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold">{formatInteger(value)}</p>
    </div>
  )
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={`px-3 py-2 text-xs border ${
        active ? 'bg-foreground text-background border-foreground' : 'hover:border-foreground/50'
      }`}
    >
      {children}
    </a>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5">
          <Check className="w-3 h-3" /> Active
        </span>
      )
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5">
          <Clock className="w-3 h-3" /> Suspended
        </span>
      )
    case 'banned':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5">
          <X className="w-3 h-3" /> Banned
        </span>
      )
    default:
      return <span className="text-xs text-muted-foreground">{status}</span>
  }
}
