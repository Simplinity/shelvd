import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Shield, Check, X, Clock, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react'
import { formatInteger, formatDate } from '@/lib/format'
import { UserActions } from './user-actions'

export const metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; dir?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // Build query
  let query = supabase
    .from('user_profiles')
    .select(`
      id,
      display_name,
      membership_tier,
      is_lifetime_free,
      status,
      status_reason,
      is_admin,
      admin_role,
      notes,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })
  
  // Filter by status
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  
  const { data: profiles } = await query
  
  // Get auth.users data separately (email, email_confirmed_at, last_sign_in_at)
  // We need to join this in the app since we can't directly join auth.users
  const userIds = profiles?.map(p => p.id) || []
  
  // Get emails and auth data via RPC
  let authUsers: any[] | null = null
  try {
    const { data } = await supabase.rpc('get_users_for_admin')
    authUsers = data
  } catch {
    // RPC might not exist yet
  }
  
  // If RPC doesn't exist, we'll show limited data
  // Build a map of auth data
  const authMap = new Map(
    authUsers?.map((u: any) => [u.id, u]) || []
  )
  
  // Get book counts per user
  const { data: bookCounts } = await supabase
    .from('books')
    .select('user_id')
  
  const bookCountMap = new Map<string, number>()
  bookCounts?.forEach(b => {
    const count = bookCountMap.get(b.user_id) || 0
    bookCountMap.set(b.user_id, count + 1)
  })
  
  // Filter by search query (email or display_name)
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

  // Sort
  const sortKey = params.sort || 'joined'
  const sortDir = params.dir === 'asc' ? 1 : -1
  filteredProfiles.sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'name': {
        const nameA = (authMap.get(a.id)?.email || a.display_name || '').toLowerCase()
        const nameB = (authMap.get(b.id)?.email || b.display_name || '').toLowerCase()
        cmp = nameA.localeCompare(nameB)
        break
      }
      case 'books': {
        cmp = (bookCountMap.get(a.id) || 0) - (bookCountMap.get(b.id) || 0)
        break
      }
      case 'last_active': {
        const la = authMap.get(a.id)?.last_sign_in_at || ''
        const lb = authMap.get(b.id)?.last_sign_in_at || ''
        cmp = la.localeCompare(lb)
        break
      }
      default: // joined
        cmp = (a.created_at || '').localeCompare(b.created_at || '')
    }
    return cmp * sortDir
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          {filteredProfiles.length} users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
        <div className="flex gap-2">
          <FilterLink href="/admin/users" active={!params.status || params.status === 'all'}>
            All
          </FilterLink>
          <FilterLink href="/admin/users?status=active" active={params.status === 'active'}>
            Active
          </FilterLink>
          <FilterLink href="/admin/users?status=suspended" active={params.status === 'suspended'}>
            Suspended
          </FilterLink>
          <FilterLink href="/admin/users?status=banned" active={params.status === 'banned'}>
            Banned
          </FilterLink>
        </div>
      </div>

      {/* Users Table */}
      <div className="border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <SortHeader label="User" field="name" current={sortKey} dir={sortDir} params={params} />
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Membership</th>
              <SortHeader label="Books" field="books" current={sortKey} dir={sortDir} params={params} />
              <SortHeader label="Joined" field="joined" current={sortKey} dir={sortDir} params={params} />
              <SortHeader label="Last Active" field="last_active" current={sortKey} dir={sortDir} params={params} />
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
                      <Link href={`/admin/users/${profile.id}`} className="font-medium flex items-center gap-2 underline decoration-muted-foreground/30 underline-offset-2 hover:decoration-foreground">
                        {auth?.email || profile.display_name || 'Unknown'}
                        {profile.is_admin && (
                          <span title="Admin"><Shield className="w-4 h-4 text-primary" /></span>
                        )}
                      </Link>
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
                      <span>{{ collector: 'Collector', collector_pro: 'Collector Pro', dealer: 'Dealer' }[profile.membership_tier as string] || profile.membership_tier}</span>
                      {profile.is_lifetime_free && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5">
                          Lifetime Pro
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {formatInteger(bookCount)}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatDate(profile.created_at) || '—'}
                  </td>
                  <td className="p-3">
                    {(() => {
                      const lastLogin = auth?.last_sign_in_at ? new Date(auth.last_sign_in_at) : null
                      const days = lastLogin ? Math.floor((Date.now() - lastLogin.getTime()) / 86400000) : null
                      const color = days === null ? 'bg-gray-400' : days <= 7 ? 'bg-green-500' : days <= 30 ? 'bg-amber-500' : 'bg-red-500'
                      return (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${color}`} />
                          <span className="text-sm text-muted-foreground">
                            {lastLogin ? formatDate(auth.last_sign_in_at) : 'Never'}
                          </span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <UserActions 
                        userId={profile.id}
                        currentStatus={profile.status || "unknown"}
                        isAdmin={profile.is_admin ?? false}
                      />
                      <Link
                        href={`/admin/users/${profile.id}`}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        title="View details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {filteredProfiles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No users found.
          </div>
        )}
      </div>
    </div>
  )
}

function FilterLink({ href, active, children }: { href: string, active: boolean, children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm border ${
        active 
          ? 'bg-foreground text-background border-foreground' 
          : 'hover:border-foreground/50'
      }`}
    >
      {children}
    </Link>
  )
}

function SortHeader({ label, field, current, dir, params }: {
  label: string; field: string; current: string; dir: number
  params: { q?: string; status?: string }
}) {
  const isActive = current === field
  const nextDir = isActive && dir === -1 ? 'asc' : 'desc'
  const urlParams = new URLSearchParams()
  if (params.q) urlParams.set('q', params.q)
  if (params.status) urlParams.set('status', params.status)
  urlParams.set('sort', field)
  urlParams.set('dir', nextDir)
  
  return (
    <th className="text-left p-3 font-medium">
      <Link
        href={`/admin/users?${urlParams.toString()}`}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        {isActive && (
          dir === -1 ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
        )}
      </Link>
    </th>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1">
          <Check className="w-3 h-3" /> Active
        </span>
      )
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1">
          <Clock className="w-3 h-3" /> Suspended
        </span>
      )
    case 'banned':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1">
          <X className="w-3 h-3" /> Banned
        </span>
      )
    default:
      return <span className="text-xs text-muted-foreground">{status}</span>
  }
}
