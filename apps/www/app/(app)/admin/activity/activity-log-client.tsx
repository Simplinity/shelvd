'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import type { ActivityLogEntry } from '@/lib/actions/activity-log'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'

// ─── Action labels + category config ───

const ACTION_LABELS: Record<string, string> = {
  'book.created': 'added',
  'book.updated': 'edited',
  'book.deleted': 'deleted',
  'book.enriched': 'enriched',
  'book.status_changed': 'changed status of',
  'collection.created': 'created collection',
  'collection.renamed': 'renamed collection',
  'collection.deleted': 'deleted collection',
  'collection.book_added': 'added books to',
  'collection.book_removed': 'removed books from',
  'account.signup': 'signed up',
  'account.profile_updated': 'updated profile',
  'account.settings_changed': 'changed settings',
  'admin.user_status_changed': 'changed user status',
  'admin.membership_changed': 'changed membership',
  'admin.note_added': 'added note on',
  'admin.announcement_created': 'created announcement',
  'admin.announcement_toggled': 'toggled announcement',
  'admin.announcement_deleted': 'deleted announcement',
  'admin.ticket_status_changed': 'updated ticket',
  'import.completed': 'imported books',
}

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'book', label: 'Books' },
  { value: 'collection', label: 'Collections' },
  { value: 'account', label: 'Account' },
  { value: 'admin', label: 'Admin' },
  { value: 'import', label: 'Import' },
]

const CATEGORY_COLORS: Record<string, string> = {
  book: 'bg-blue-500',
  collection: 'bg-purple-500',
  admin: 'bg-red-500',
  account: 'bg-gray-400',
  import: 'bg-green-500',
}

const SOURCE_LABELS: Record<string, string> = {
  app: 'App',
  import: 'Import',
  admin: 'Admin',
  system: 'System',
  api: 'API',
}

// ─── Helpers ───

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function userLabel(entry: ActivityLogEntry): string {
  if (entry.source === 'system') return 'System'
  if (!entry.user_email) return '—'
  return entry.user_email.split('@')[0] + '@'
}

// ─── Component ───

interface Props {
  entries: ActivityLogEntry[]
  total: number
  page: number
  perPage: number
  currentCategory: string
  currentSearch: string
}

export function ActivityLogClient({ entries, total, page, perPage, currentCategory, currentSearch }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(currentSearch)

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    // Reset to page 1 when filters change
    if (!('page' in updates)) params.set('page', '1')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }, [searchParams, pathname, router])

  const handleSearch = () => {
    updateParams({ search: searchInput.trim() })
  }

  const clearSearch = () => {
    setSearchInput('')
    updateParams({ search: '' })
  }

  return (
    <div className={isPending ? 'opacity-60 transition-opacity' : ''}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        {/* Category tabs */}
        <div className="flex gap-px bg-border">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => updateParams({ category: cat.value })}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                currentCategory === cat.value
                  ? 'bg-foreground text-background'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search entity..."
              className="w-48 pl-3 pr-8 py-1.5 text-xs border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            {searchInput && (
              <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="p-1.5 border border-border hover:bg-muted transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mb-2 tabular-nums">
        {total === 0 ? 'No entries found' : `${total} entries`}
        {currentCategory && ` in ${CATEGORIES.find(c => c.value === currentCategory)?.label?.toLowerCase()}`}
        {currentSearch && ` matching "${currentSearch}"`}
      </p>

      {/* Table */}
      {entries.length > 0 ? (
        <div className="border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-3 py-2 font-medium w-40">Time</th>
                <th className="text-left px-3 py-2 font-medium w-28">User</th>
                <th className="text-left px-3 py-2 font-medium">Action</th>
                <th className="text-left px-3 py-2 font-medium">Entity</th>
                <th className="text-left px-3 py-2 font-medium w-16">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {formatTimestamp(entry.created_at)}
                  </td>
                  <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">
                    {userLabel(entry)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[entry.category] || 'bg-gray-400'}`} />
                      <span className="text-xs">{ACTION_LABELS[entry.action] || entry.action}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs max-w-[300px] truncate">
                    {entry.entity_label || '—'}
                    {entry.action === 'import.completed' && entry.metadata && (
                      <span className="text-muted-foreground">
                        {' '}({String((entry.metadata as Record<string, unknown>).books_imported)} books)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                    {SOURCE_LABELS[entry.source] || entry.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-border px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">No activity found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => updateParams({ page: String(page - 1) })}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> Previous
          </button>

          <span className="text-xs text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => updateParams({ page: String(page + 1) })}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
