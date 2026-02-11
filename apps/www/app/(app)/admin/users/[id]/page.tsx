import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, BookOpen, FolderOpen, Tag, Users, MessageSquare, Mail, Clock, Calendar } from 'lucide-react'
import { formatDate, formatInteger } from '@/lib/format'
import { UserDetailClient } from './user-detail-client'

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. User profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, display_name, membership_tier, is_lifetime_free, status, status_reason, is_admin, admin_role, signup_source, notes, created_at, updated_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // 2. Auth data (email, last_sign_in)
  let authData: { email?: string; last_sign_in_at?: string; email_confirmed_at?: string } = {}
  try {
    const { data: allUsers } = await supabase.rpc('get_users_for_admin')
    const match = allUsers?.find((u: any) => u.id === id)
    if (match) authData = match
  } catch { /* RPC may not exist */ }

  // 3. Quick stats (SECURITY DEFINER RPC — bypasses RLS)
  const { data: statsRow } = await supabase.rpc('get_user_detail_for_admin', { target_user_id: id })
  const stats = statsRow?.[0] || { book_count: 0, collection_count: 0, unique_tags: 0, unique_contributors: 0, ticket_count: 0, recent_book_count: 0 }
  const bookCount = Number(stats.book_count)
  const collectionCount = Number(stats.collection_count)
  const uniqueTags = Number(stats.unique_tags)
  const uniqueContributors = Number(stats.unique_contributors)
  const ticketCount = Number(stats.ticket_count)
  const recentBookCount = Number(stats.recent_book_count)

  // 4. Recent books (SECURITY DEFINER RPC)
  const { data: recentBooks } = await supabase.rpc('get_user_recent_books_for_admin', { target_user_id: id, lim: 10 })

  // 5. Support tickets (feedback table already has admin RLS policies)
  const { data: tickets } = await supabase
    .from('feedback')
    .select('id, type, subject, status, priority, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // 6. Collections (SECURITY DEFINER RPC)
  const { data: collections } = await supabase.rpc('get_user_collections_for_admin', { target_user_id: id })

  // Heat indicator
  const lastSignIn = authData.last_sign_in_at ? new Date(authData.last_sign_in_at) : null
  const now = new Date()
  const daysSinceLogin = lastSignIn ? Math.floor((now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24)) : null
  
  let heat: 'active' | 'recent' | 'dormant' | 'never'
  if (daysSinceLogin === null) heat = 'never'
  else if (daysSinceLogin <= 7) heat = 'active'
  else if (daysSinceLogin <= 30) heat = 'recent'
  else heat = 'dormant'

  const heatConfig = {
    active: { color: 'bg-green-500', label: 'Active', desc: 'Logged in within 7 days' },
    recent: { color: 'bg-amber-500', label: 'Recent', desc: 'Logged in within 30 days' },
    dormant: { color: 'bg-red-500', label: 'Dormant', desc: `Last login ${daysSinceLogin} days ago` },
    never: { color: 'bg-gray-400', label: 'Never', desc: 'Never logged in' },
  }

  const statusConfig: Record<string, { bg: string; text: string }> = {
    active: { bg: 'bg-green-100 text-green-700', text: 'Active' },
    suspended: { bg: 'bg-amber-100 text-amber-700', text: 'Suspended' },
    banned: { bg: 'bg-red-100 text-red-700', text: 'Banned' },
  }

  const initials = (profile.display_name || authData.email || '?')
    .replace(/[^a-zA-Z\s@]/g, '')
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() || '')
    .join('') || '?'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      {/* ── Header ── */}
      <div className="flex items-start gap-5 mb-8">
        {/* Avatar */}
        <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{authData.email || profile.display_name || 'Unknown'}</h1>
            {profile.is_admin && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 font-medium">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
            <span className={`text-xs px-2 py-1 font-medium ${statusConfig[profile.status || 'active']?.bg || 'bg-gray-100 text-gray-600'}`}>
              {statusConfig[profile.status || 'active']?.text || profile.status}
            </span>
            <div className="flex items-center gap-1.5" title={heatConfig[heat].desc}>
              <div className={`w-2.5 h-2.5 rounded-full ${heatConfig[heat].color}`} />
              <span className="text-xs text-muted-foreground">{heatConfig[heat].label}</span>
            </div>
          </div>

          {profile.display_name && authData.email && (
            <p className="text-muted-foreground mt-0.5">{profile.display_name}</p>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {formatDate(profile.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last login {authData.last_sign_in_at ? formatDate(authData.last_sign_in_at) : 'never'}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {authData.email_confirmed_at ? 'Email verified' : 'Not verified'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        <StatCard icon={BookOpen} label="Books" value={bookCount || 0} />
        <StatCard icon={FolderOpen} label="Collections" value={collectionCount || 0} />
        <StatCard icon={Tag} label="Tags" value={uniqueTags} />
        <StatCard icon={Users} label="Contributors" value={uniqueContributors} />
        <StatCard icon={MessageSquare} label="Tickets" value={ticketCount || 0} />
        <StatCard icon={BookOpen} label="Last 30d" value={recentBookCount || 0} sub="books added" />
      </div>

      {/* ── Two-column layout: Details + Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Membership & Status reason */}
          <Section title="Account">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Membership</span>
                <p className="font-medium capitalize mt-0.5">
                  {profile.membership_tier}
                  {profile.is_lifetime_free && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5">Lifetime Free</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Signup source</span>
                <p className="font-medium mt-0.5">{profile.signup_source || '—'}</p>
              </div>
              {profile.status_reason && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Status reason</span>
                  <p className="font-medium mt-0.5">{profile.status_reason}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Collections */}
          {collections && collections.length > 0 && (
            <Section title={`Collections (${collections.length})`}>
              <div className="flex flex-wrap gap-2">
                {collections.map(c => (
                  <span key={c.id} className={`text-xs px-2 py-1 border ${c.is_default ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                    {c.name}{c.is_default ? ' ✦' : ''}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Recent Books */}
          <Section title="Recent Books">
            {recentBooks && recentBooks.length > 0 ? (
              <div className="divide-y divide-border">
                {recentBooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        book.status === 'cataloged' ? 'bg-green-500' :
                        book.status === 'draft' ? 'bg-amber-500' : 'bg-gray-400'
                      }`} />
                      <span className="truncate">{book.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-3">
                      {formatDate(book.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No books yet.</p>
            )}
          </Section>

          {/* Support History */}
          <Section title="Support History">
            {tickets && tickets.length > 0 ? (
              <div className="divide-y divide-border">
                {tickets.map(ticket => (
                  <Link
                    key={ticket.id}
                    href={`/admin/support?ticket=${ticket.id}`}
                    className="flex items-center justify-between py-2 text-sm hover:bg-muted/30 -mx-1 px-1 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TicketStatusDot status={ticket.status} />
                      <span className="text-xs text-muted-foreground uppercase w-12">{ticket.type}</span>
                      <span className="truncate">{ticket.subject || '(no subject)'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-3">
                      {formatDate(ticket.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No support tickets.</p>
            )}
          </Section>
        </div>

        {/* Right column: 1/3 — Actions & Notes */}
        <div className="space-y-6">
          <UserDetailClient
            userId={id}
            email={authData.email || ''}
            currentStatus={profile.status || 'active'}
            currentNotes={profile.notes || ''}
            membershipTier={profile.membership_tier || 'free'}
            isLifetimeFree={profile.is_lifetime_free || false}
            isAdmin={profile.is_admin || false}
          />
        </div>
      </div>
    </div>
  )
}

// ── Helper components ──

function StatCard({ icon: Icon, label, value, sub }: {
  icon: typeof BookOpen; label: string; value: number; sub?: string
}) {
  return (
    <div className="border border-border p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{formatInteger(value)}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border">
      <div className="px-4 py-2 bg-muted/50 border-b border-border">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function TicketStatusDot({ status }: { status: string }) {
  const color = {
    new: 'bg-blue-500',
    acknowledged: 'bg-amber-500',
    in_progress: 'bg-purple-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-400',
    spam: 'bg-red-300',
  }[status] || 'bg-gray-400'
  return <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color}`} />
}
