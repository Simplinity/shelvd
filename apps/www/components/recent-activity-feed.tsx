'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { ActivityLogEntry } from '@/lib/actions/activity-log'

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

const CATEGORY_COLORS: Record<string, string> = {
  book: 'bg-blue-500',
  collection: 'bg-purple-500',
  account: 'bg-gray-400',
  import: 'bg-green-500',
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'yesterday'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function RecentActivityFeed() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setEntries(data.map(row => ({
          ...row,
          user_email: null,
          metadata: (row.metadata as Record<string, unknown>) ?? {},
          source: row.source ?? 'app',
        })) as ActivityLogEntry[])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="mt-10">
        <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Recent Activity</h3>
        <div className="border border-dashed px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
        <Link href="/activity" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
          View all &rarr;
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="border border-dashed px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        </div>
      ) : (
        <div className="border divide-y divide-border">
          {entries.map(entry => {
            const bookLink = entry.entity_type === 'book' && entry.entity_id && entry.action !== 'book.deleted'
              ? `/books/${entry.entity_id}`
              : null

            return (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                <span className="text-[11px] text-muted-foreground tabular-nums w-16 shrink-0 pt-0.5">
                  {relativeTime(entry.created_at)}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${CATEGORY_COLORS[entry.category] || 'bg-gray-400'}`} />
                <span className="min-w-0">
                  <span className="text-muted-foreground">{ACTION_LABELS[entry.action] || entry.action}</span>
                  {entry.entity_label && (
                    <>
                      {' '}
                      {bookLink ? (
                        <Link href={bookLink} className="text-foreground hover:underline">
                          &ldquo;{entry.entity_label}&rdquo;
                        </Link>
                      ) : (
                        <span className="text-foreground">&ldquo;{entry.entity_label}&rdquo;</span>
                      )}
                    </>
                  )}
                  {entry.action === 'import.completed' && entry.metadata && (
                    <span className="text-muted-foreground">
                      {' '}({String((entry.metadata as Record<string, unknown>).books_imported)} books)
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
