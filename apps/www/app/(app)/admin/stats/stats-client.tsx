'use client'

import type { AdminStats } from '@/lib/actions/admin-stats'
import { BookOpen, Users, DollarSign, Tag, Link2, FileText, Library, Hash } from 'lucide-react'

interface Props {
  stats: AdminStats
}

export function StatsClient({ stats }: Props) {
  return (
    <div className="space-y-10">
      {/* ─── KEY METRICS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Books"
          value={fmt(stats.totalBooks)}
          icon={<BookOpen className="w-4 h-4" />}
        />
        <MetricCard
          label="Estimated Value"
          value={`€${fmtMoney(stats.totalEstimatedValue)}`}
          sub={`${fmt(stats.booksWithValue)} books valued`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricCard
          label="Total Sales"
          value={`€${fmtMoney(stats.totalSalesValue)}`}
          icon={<DollarSign className="w-4 h-4" />}
          accent
        />
        <MetricCard
          label="Avg Value / Book"
          value={`€${stats.avgBookValue.toFixed(2)}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      {/* ─── SECONDARY METRICS ─── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <MiniCard label="Users" value={stats.totalUsers} icon={<Users className="w-3.5 h-3.5" />} />
        <MiniCard label="Collections" value={stats.totalCollections} icon={<Library className="w-3.5 h-3.5" />} />
        <MiniCard label="Tags" value={stats.totalTags} icon={<Tag className="w-3.5 h-3.5" />} />
        <MiniCard label="Provenance" value={stats.totalProvenance} icon={<FileText className="w-3.5 h-3.5" />} />
        <MiniCard label="Ext. Links" value={stats.totalExternalLinks} icon={<Link2 className="w-3.5 h-3.5" />} />
        <MiniCard label="No ISBN" value={stats.booksWithoutIsbn} icon={<Hash className="w-3.5 h-3.5" />} />
      </div>

      {/* ─── DISTRIBUTIONS ─── */}
      <div className="grid md:grid-cols-2 gap-8">
        <BarChart title="Books by Status" data={stats.booksByStatus} total={stats.totalBooks} />
        <BarChart title="Books by Language" data={stats.booksByLanguage} total={stats.totalBooks} />
        <BarChart title="Books by Condition" data={stats.booksByCondition} total={stats.totalBooks} />
        <BarChart title="Top Publishers" data={stats.topPublishers} total={stats.totalBooks} />
      </div>

      {/* ─── GROWTH ─── */}
      <div className="grid md:grid-cols-2 gap-8">
        <TimelineChart title="Books Added" data={stats.booksByMonth} />
        <TimelineChart title="User Signups" data={stats.signupsByMonth} />
      </div>

      {/* ─── PER USER ─── */}
      {stats.booksPerUser.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Books per User
          </h2>
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

/* ─── COMPONENTS ─── */

function MetricCard({ label, value, sub, icon, accent }: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className={`p-5 border ${accent ? 'border-l-4 border-l-red-600' : ''}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-[11px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold font-mono ${accent ? 'text-red-600' : ''}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function MiniCard({ label, value, icon }: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="p-3 border text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold font-mono">{fmt(value)}</p>
    </div>
  )
}

function BarChart({ title, data, total }: {
  title: string
  data: { label: string; count: number }[]
  total: number
}) {
  if (data.length === 0) return null
  const max = Math.max(...data.map(d => d.count))

  // Color palette — Swiss: primarily black bars, top item gets red
  const getBarColor = (i: number) => i === 0 ? 'bg-red-600' : 'bg-foreground'

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </h2>
      <div className="space-y-2">
        {data.map((d, i) => {
          const pct = max > 0 ? (d.count / max) * 100 : 0
          const totalPct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0'
          return (
            <div key={d.label} className="group">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-foreground truncate max-w-[60%]">
                  {formatLabel(d.label)}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {fmt(d.count)}
                  <span className="ml-1 text-[10px]">({totalPct}%)</span>
                </span>
              </div>
              <div className="h-5 bg-muted/40 relative">
                <div
                  className={`h-full ${getBarColor(i)} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TimelineChart({ title, data }: {
  title: string
  data: { month: string; count: number }[]
}) {
  if (data.length === 0) return null
  const max = Math.max(...data.map(d => d.count))

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </h2>
      <div className="border p-4">
        {/* Vertical bar chart */}
        <div className="flex items-end gap-1 h-32">
          {data.map((d, i) => {
            const pct = max > 0 ? (d.count / max) * 100 : 0
            const isLatest = i === data.length - 1
            return (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-6 hidden group-hover:flex items-center bg-foreground text-background text-[10px] font-mono px-2 py-0.5 whitespace-nowrap z-10">
                  {d.month}: {fmt(d.count)}
                </div>
                <div
                  className={`w-full ${isLatest ? 'bg-red-600' : 'bg-foreground'} transition-all cursor-default`}
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
              </div>
            )
          })}
        </div>
        {/* X axis labels */}
        <div className="flex gap-1 mt-2">
          {data.map((d, i) => (
            <div key={d.month} className="flex-1 text-center">
              <span className="text-[9px] font-mono text-muted-foreground">
                {data.length <= 6 ? d.month : (i === 0 || i === data.length - 1 ? d.month.slice(2) : '')}
              </span>
            </div>
          ))}
        </div>
        {/* Summary */}
        <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
          <span>Total: <span className="font-mono font-bold text-foreground">{fmt(data.reduce((s, d) => s + d.count, 0))}</span></span>
          <span>Latest: <span className="font-mono font-bold text-red-600">{fmt(data[data.length - 1]?.count || 0)}</span></span>
        </div>
      </div>
    </div>
  )
}

/* ─── HELPERS ─── */

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

function fmtMoney(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatLabel(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
