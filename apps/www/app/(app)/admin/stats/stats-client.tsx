'use client'

import type { AdminStats } from '@/lib/actions/admin-stats'
import { BookOpen, Users, Ratio, ShieldCheck, TrendingUp, Activity, Crown } from 'lucide-react'

interface Props {
  stats: AdminStats
}

export function StatsClient({ stats }: Props) {
  return (
    <div className="space-y-10">
      {/* ─── KEY METRICS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value={fmt(stats.totalUsers)}
          icon={<Users className="w-4 h-4" />}
        />
        <MetricCard
          label="Total Books"
          value={fmt(stats.totalBooks)}
          icon={<BookOpen className="w-4 h-4" />}
        />
        <MetricCard
          label="Avg Books / User"
          value={fmt(stats.avgBooksPerUser)}
          icon={<Ratio className="w-4 h-4" />}
        />
        <MetricCard
          label="Data Completeness"
          value={`${stats.dataCompleteness}%`}
          icon={<ShieldCheck className="w-4 h-4" />}
          bar={stats.dataCompleteness}
        />
      </div>

      {/* ─── RECENT ACTIVITY METRICS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Books (7d)"
          value={fmt(stats.booksLast7d)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          label="Books (30d)"
          value={fmt(stats.booksLast30d)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          label="Active Users (7d)"
          value={fmt(stats.activeUsersLast7d)}
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricCard
          label="Active Users (30d)"
          value={fmt(stats.activeUsersLast30d)}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* ─── GROWTH CHART (full width) ─── */}
      <GrowthChart
        booksByMonth={stats.booksByMonth}
        signupsByMonth={stats.signupsByMonth}
      />

      {/* ─── FEATURE ADOPTION + USER ENGAGEMENT ─── */}
      <div className="grid md:grid-cols-2 gap-8">
        <FeatureAdoption data={stats.featureAdoption} />
        <UserEngagement funnel={stats.userFunnel} booksByStatus={stats.booksByStatus} totalBooks={stats.totalBooks} />
      </div>

      {/* ─── DATA HEALTH ─── */}
      <DataHealth data={stats.dataHealth} />

      {/* ─── TIER DISTRIBUTION ─── */}
      {stats.tierDistribution.length > 0 && (
        <TierDistribution data={stats.tierDistribution} totalUsers={stats.totalUsers} />
      )}

      {/* ─── BOOKS PER USER ─── */}
      {stats.booksPerUser.length > 0 && (
        <div>
          <SectionTitle>Books per User</SectionTitle>
          <div className="border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-right p-3 font-medium">Books</th>
                  <th className="text-right p-3 font-medium">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.booksPerUser.map(u => (
                  <tr key={u.email} className="border-b last:border-b-0">
                    <td className="p-3 font-mono text-xs">{u.email}</td>
                    <td className="p-3 text-right font-mono font-bold">{fmt(u.count)}</td>
                    <td className="p-3 text-right font-mono text-muted-foreground">
                      {stats.totalBooks > 0 ? ((u.count / stats.totalBooks) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
      {children}
    </h2>
  )
}

function MetricCard({ label, value, icon, bar }: {
  label: string
  value: string
  icon: React.ReactNode
  bar?: number
}) {
  return (
    <div className="p-5 border">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-[11px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono">{value}</p>
      {bar !== undefined && (
        <div className="mt-2 h-1.5 bg-muted/40">
          <div
            className={`h-full transition-all ${bar >= 80 ? 'bg-green-600' : bar >= 50 ? 'bg-amber-500' : 'bg-red-600'}`}
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
  )
}

/* ─── GROWTH CHART ─── */

function GrowthChart({ booksByMonth, signupsByMonth }: {
  booksByMonth: { month: string; count: number }[]
  signupsByMonth: { month: string; count: number }[]
}) {
  // Merge all months into a single timeline
  const allMonths = new Set([
    ...booksByMonth.map(d => d.month),
    ...signupsByMonth.map(d => d.month),
  ])
  const months = Array.from(allMonths).sort()

  const bookMap = new Map(booksByMonth.map(d => [d.month, d.count]))
  const signupMap = new Map(signupsByMonth.map(d => [d.month, d.count]))

  const maxBooks = Math.max(...booksByMonth.map(d => d.count), 1)
  const maxSignups = Math.max(...signupsByMonth.map(d => d.count), 1)

  const totalBooks = booksByMonth.reduce((s, d) => s + d.count, 0)
  const totalSignups = signupsByMonth.reduce((s, d) => s + d.count, 0)

  return (
    <div>
      <SectionTitle>Growth</SectionTitle>
      <div className="border p-6">
        {/* Legend */}
        <div className="flex gap-6 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-foreground" />
            <span>Books added</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600" />
            <span>User signups</span>
          </div>
        </div>

        {/* Chart area */}
        <div className="space-y-3">
          {months.map((month, i) => {
            const books = bookMap.get(month) || 0
            const signups = signupMap.get(month) || 0
            const bookPct = (books / maxBooks) * 100
            const signupPct = (signups / maxSignups) * 100

            return (
              <div key={month} className="group">
                <div className="flex items-center gap-4 mb-1">
                  <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">{month}</span>
                  <div className="flex-1 space-y-1">
                    {/* Books bar */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-muted/30 flex-1 relative">
                        <div
                          className="h-full bg-foreground transition-all"
                          style={{ width: `${Math.max(bookPct, 0.5)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-12 text-right">{fmt(books)}</span>
                    </div>
                    {/* Signups bar */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-muted/30 flex-1 relative">
                        <div
                          className="h-full bg-red-600 transition-all"
                          style={{ width: `${Math.max(signupPct, 0.5)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-12 text-right">{fmt(signups)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex gap-8 text-xs text-muted-foreground">
          <span>Total books: <span className="font-mono font-bold text-foreground">{fmt(totalBooks)}</span></span>
          <span>Total signups: <span className="font-mono font-bold text-red-600">{fmt(totalSignups)}</span></span>
        </div>
      </div>
    </div>
  )
}

/* ─── FEATURE ADOPTION ─── */

function FeatureAdoption({ data }: { data: AdminStats['featureAdoption'] }) {
  return (
    <div>
      <SectionTitle>Feature Adoption</SectionTitle>
      <div className="space-y-3">
        {data.map(f => {
          const pct = f.total > 0 ? (f.used / f.total) * 100 : 0
          const isLow = pct < 10
          const isHigh = pct > 70

          return (
            <div key={f.label} className="border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{f.label}</span>
                <span className="text-xs font-mono">
                  <span className={`font-bold ${isLow ? 'text-red-600' : isHigh ? 'text-green-700' : ''}`}>
                    {fmt(f.used)}
                  </span>
                  <span className="text-muted-foreground"> / {fmt(f.total)} {f.unit}</span>
                </span>
              </div>
              <div className="h-2 bg-muted/40">
                <div
                  className={`h-full transition-all ${isLow ? 'bg-red-600' : isHigh ? 'bg-green-600' : 'bg-foreground'}`}
                  style={{ width: `${Math.max(pct, 0.5)}%` }}
                />
              </div>
              <div className="mt-1 text-right">
                <span className={`text-[11px] font-mono ${isLow ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── USER ENGAGEMENT ─── */

function UserEngagement({ funnel, booksByStatus, totalBooks }: {
  funnel: AdminStats['userFunnel']
  booksByStatus: { label: string; count: number }[]
  totalBooks: number
}) {
  const funnelSteps = [
    { label: 'Signed up', value: funnel.total, color: 'bg-foreground' },
    { label: 'Added 1+ book', value: funnel.withBooks, color: 'bg-foreground' },
    { label: 'Added 10+ books', value: funnel.with10Plus, color: 'bg-foreground' },
    { label: 'Added 100+ books', value: funnel.with100Plus, color: 'bg-foreground' },
    { label: 'Added 1,000+ books', value: funnel.with1000Plus, color: 'bg-red-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Activation funnel */}
      <div>
        <SectionTitle>User Activation Funnel</SectionTitle>
        <div className="space-y-2">
          {funnelSteps.map((step, i) => {
            const pct = funnel.total > 0 ? (step.value / funnel.total) * 100 : 0
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs">{step.label}</span>
                  <span className="text-xs font-mono">
                    <span className="font-bold">{step.value}</span>
                    <span className="text-muted-foreground ml-1">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="h-5 bg-muted/30">
                  <div
                    className={`h-full ${step.color} transition-all`}
                    style={{ width: `${Math.max(pct, 1)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        {funnel.withZero > 0 && (
          <p className="mt-3 text-xs text-red-600 font-medium">
            ⚠ {funnel.withZero} user{funnel.withZero > 1 ? 's' : ''} signed up but never added a book
          </p>
        )}
      </div>

      {/* Book status usage */}
      <div>
        <SectionTitle>Platform Usage by Status</SectionTitle>
        <div className="space-y-2">
          {booksByStatus.map((d, i) => {
            const pct = totalBooks > 0 ? (d.count / totalBooks) * 100 : 0
            return (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs">{formatLabel(d.label)}</span>
                  <span className="text-xs font-mono">
                    <span className="font-bold">{fmt(d.count)}</span>
                    <span className="text-muted-foreground ml-1">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-4 bg-muted/30">
                  <div
                    className={`h-full ${i === 0 ? 'bg-red-600' : 'bg-foreground'} transition-all`}
                    style={{ width: `${Math.max(pct, 0.3)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── DATA HEALTH ─── */

function DataHealth({ data }: { data: AdminStats['dataHealth'] }) {
  return (
    <div>
      <SectionTitle>Data Health</SectionTitle>
      <div className="grid md:grid-cols-3 gap-4">
        {data.map(d => {
          const pct = d.total > 0 ? (d.complete / d.total) * 100 : 0
          const missing = d.total - d.complete
          const isGood = pct >= 80
          const isBad = pct < 50

          return (
            <div key={d.label} className="border p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{d.label}</span>
                <span className={`text-lg font-mono font-bold ${isBad ? 'text-red-600' : isGood ? 'text-green-700' : 'text-amber-600'}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-muted/40 mb-2">
                <div
                  className={`h-full ${isBad ? 'bg-red-600' : isGood ? 'bg-green-600' : 'bg-amber-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{fmt(d.complete)} complete</span>
                {missing > 0 && <span className="text-red-600">{fmt(missing)} missing</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── TIER DISTRIBUTION ─── */

const TIER_LABELS: Record<string, string> = {
  collector: 'Collector (Free)',
  collector_pro: 'Collector Pro',
  dealer: 'Dealer',
}

function TierDistribution({ data, totalUsers }: {
  data: { tier: string; count: number }[]
  totalUsers: number
}) {
  return (
    <div>
      <SectionTitle>Tier Distribution</SectionTitle>
      <div className="grid md:grid-cols-3 gap-4">
        {data.map(d => {
          const pct = totalUsers > 0 ? (d.count / totalUsers) * 100 : 0
          return (
            <div key={d.tier} className="border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{TIER_LABELS[d.tier] || d.tier}</span>
                </div>
                <span className="text-lg font-mono font-bold">{fmt(d.count)}</span>
              </div>
              <div className="h-2 bg-muted/40 mb-2">
                <div
                  className="h-full bg-foreground transition-all"
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
              <div className="text-right text-[11px] font-mono text-muted-foreground">
                {pct.toFixed(1)}% of users
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── HELPERS ─── */

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

function formatLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
