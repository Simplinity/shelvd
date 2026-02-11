'use client'

import type { ActivityLogEntry } from '@/lib/actions/activity-log'

// ─── Human-readable action labels ───

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
  'admin.note_added': 'added admin note on',
  'admin.announcement_created': 'created announcement',
  'admin.announcement_toggled': 'toggled announcement',
  'admin.announcement_deleted': 'deleted announcement',
  'admin.ticket_status_changed': 'updated ticket',
  'admin.invite_code_created': 'created invite code',
  'admin.invite_code_toggled': 'toggled invite code',
  'import.completed': 'imported books',
}

const CATEGORY_COLORS: Record<string, string> = {
  book: 'bg-blue-500',
  collection: 'bg-purple-500',
  admin: 'bg-red-500',
  account: 'bg-gray-400',
  import: 'bg-green-500',
  contributor: 'bg-orange-500',
  tag: 'bg-yellow-500',
  provenance: 'bg-teal-500',
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

function userLabel(entry: ActivityLogEntry): string {
  if (entry.source === 'system') return 'System'
  if (!entry.user_email) return 'Unknown'
  return entry.user_email.split('@')[0] + '@'
}

export function ActivityFeed({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Actions will appear here as users interact with the platform.</p>
      </div>
    )
  }

  return (
    <div className="border divide-y divide-border">
      {entries.map(entry => (
        <div key={entry.id} className="flex items-start gap-3 px-4 py-2.5 text-sm">
          {/* Timestamp */}
          <span className="text-[11px] text-muted-foreground tabular-nums w-16 shrink-0 pt-0.5">
            {relativeTime(entry.created_at)}
          </span>

          {/* Category dot */}
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${CATEGORY_COLORS[entry.category] || 'bg-gray-400'}`} />

          {/* Content */}
          <span className="min-w-0">
            <span className="font-medium">{userLabel(entry)}</span>
            {' '}
            <span className="text-muted-foreground">{ACTION_LABELS[entry.action] || entry.action}</span>
            {entry.entity_label && (
              <>
                {' '}
                <span className="text-foreground">&ldquo;{entry.entity_label}&rdquo;</span>
              </>
            )}
            {/* Import metadata */}
            {entry.action === 'import.completed' && entry.metadata && (
              <span className="text-muted-foreground">
                {' '}({String((entry.metadata as Record<string, unknown>).books_imported)} books)
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
