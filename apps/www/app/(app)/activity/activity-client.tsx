'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import type { ActivityLogEntry } from '@/lib/actions/activity-log'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'

// ─── Action labels + category config ───

const ACTION_LABELS: Record<string, string> = {
  'book.created': 'Added',
  'book.updated': 'Edited',
  'book.deleted': 'Deleted',
  'book.enriched': 'Enriched',
  'book.status_changed': 'Changed status of',
  'collection.created': 'Created collection',
  'collection.renamed': 'Renamed collection',
  'collection.deleted': 'Deleted collection',
  'collection.book_added': 'Added books to',
  'collection.book_removed': 'Removed books from',
  'account.profile_updated': 'Updated profile',
  'account.settings_changed': 'Changed settings',
  'import.completed': 'Imported books',
}

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'book', label: 'Books' },
  { value: 'collection', label: 'Collections' },
  { value: 'account', label: 'Account' },
  { value: 'import', label: 'Import' },
]

const CATEGORY_COLORS: Record<string, string> = {
  book: 'bg-blue-500',
  collection: 'bg-purple-500',
  account: 'bg-gray-400',
  import: 'bg-green-500',
}

const SOURCE_LABELS: Record<string, string> = {
  app: 'App',
  import: 'Import',
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

function metadataSummary(entry: ActivityLogEntry): string | null {
  const meta = entry.metadata as Record<string, unknown>
  if (entry.action === 'import.completed' && meta.books_imported != null) {
    return `${meta.books_imported} books`
  }
  if (entry.action === 'book.updated' && meta.changed_fields) {
    const fields = meta.changed_fields as string[]
    return fields.length <= 3 ? fields.join(', ') : `${fields.slice(0, 3).join(', ')} +${fields.length - 3}`
  }
  if (entry.action === 'account.settings_changed' && meta.fields) {
    return (meta.fields as string[]).join(', ')
  }
  return null
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

export function MyActivityClient({ entries, total, page, perPage, currentCategory, currentSearch }: Props) {
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
    if (!('page' in updates)) params.set('page', '1')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }, [searchParams, pathname, router])

  const handleSearch = () => updateParams({ search: searchInput.trim() })
  const clearSearch = () => { setSearchInput(''); updateParams({ search: '' }) }

  return (
    <div className={isPending ? 'opacity-60 transition-opacity' : ''}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
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
          <button onClick={handleSearch} className="p-1.5 border border-border hover:bg-muted transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mb-2 tabular-nums">
        {total === 0 ? 'No activity yet' : `${total} entries`}
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
                <th className="text-left px-3 py-2 font-medium">Action</th>
                <th className="text-left px-3 py-2 font-medium">Entity</th>
                <th className="text-left px-3 py-2 font-medium w-40">Details</th>
                <th className="text-left px-3 py-2 font-medium w-16">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {formatTimestamp(entry.created_at)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[entry.category] || 'bg-gray-400'}`} />
                      <span className="text-xs">{ACTION_LABELS[entry.action] || entry.action}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs max-w-[300px] truncate">
                    {entry.entity_label || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                    {metadataSummary(entry) || '—'}
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
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Your actions will appear here as you add and edit books.</p>
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
