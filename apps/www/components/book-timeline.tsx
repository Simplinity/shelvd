'use client'

import { useState } from 'react'
import type { ActivityLogEntry } from '@/lib/actions/activity-log'
import { ChevronDown, ChevronUp } from 'lucide-react'

const ACTION_LABELS: Record<string, string> = {
  'book.created': 'Added to library',
  'book.updated': 'Edited',
  'book.deleted': 'Deleted',
  'book.enriched': 'Enriched',
  'book.status_changed': 'Status changed',
  'collection.book_added': 'Added to collection',
  'collection.book_removed': 'Removed from collection',
  'import.completed': 'Imported',
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'yesterday'
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function changeDetail(entry: ActivityLogEntry): string | null {
  const meta = entry.metadata as Record<string, unknown>

  if (entry.action === 'book.updated' && meta.changes) {
    const fields = Object.keys(meta.changes as Record<string, unknown>)
    if (fields.length === 0) return null
    if (fields.length <= 4) return fields.join(', ')
    return `${fields.slice(0, 3).join(', ')} +${fields.length - 3} more`
  }

  if (entry.action === 'book.enriched' && meta.source) {
    return `via ${String(meta.source)}`
  }

  if (entry.action === 'import.completed' && meta.filename) {
    return String(meta.filename)
  }

  return null
}

export function BookTimeline({ entries }: { entries: ActivityLogEntry[] }) {
  const [expanded, setExpanded] = useState(false)

  if (entries.length === 0) return null

  const lastModified = entries[0]

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Last modified {relativeTime(lastModified.created_at)}
        </p>
        {entries.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? 'Hide' : 'Show'} history ({entries.length})
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 border-l-2 border-border ml-1 pl-4 space-y-3">
          {entries.map(entry => {
            const detail = changeDetail(entry)
            return (
              <div key={entry.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-border" />
                <p className="text-xs">
                  <span className="font-medium">{ACTION_LABELS[entry.action] || entry.action}</span>
                  {detail && (
                    <span className="text-muted-foreground"> — {detail}</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {relativeTime(entry.created_at)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
