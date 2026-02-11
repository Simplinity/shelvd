'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateFeedbackStatus,
  updateFeedbackPriority,
  updateAdminNotes,
  sendAdminResponse,
  deleteFeedback,
  bulkUpdateFeedbackStatus,
  bulkDeleteFeedback,
} from '@/lib/actions/feedback'
import {
  Bug, Mail, ChevronDown, ChevronUp,
  Trash2, Monitor, Globe, ExternalLink,
} from 'lucide-react'

// ─── Constants ───

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', style: 'bg-gray-100 text-gray-700' },
  { value: 'acknowledged', label: 'Acknowledged', style: 'bg-blue-50 text-blue-700 border border-blue-200' },
  { value: 'in_progress', label: 'In Progress', style: 'bg-amber-50 text-amber-700 border border-amber-200' },
  { value: 'resolved', label: 'Resolved', style: 'bg-green-50 text-green-700 border border-green-200' },
  { value: 'closed', label: 'Closed', style: 'bg-gray-50 text-gray-400' },
  { value: 'spam', label: 'Spam', style: 'bg-gray-50 text-gray-400' },
]

const PRIORITY_OPTIONS = [
  { value: 'none', label: 'None', dot: 'bg-gray-300' },
  { value: 'low', label: 'Low', dot: 'bg-blue-400' },
  { value: 'medium', label: 'Medium', dot: 'bg-amber-400' },
  { value: 'high', label: 'High', dot: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', dot: 'bg-red-600' },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bug: <Bug className="w-4 h-4" />,
  contact: <Mail className="w-4 h-4" />,
  callback: <Mail className="w-4 h-4" />,
}

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  contact: 'Message',
  callback: 'Message',
}

type FeedbackItem = {
  id: string
  user_id: string
  type: string
  subject: string | null
  message: string | null
  severity: string | null
  steps_to_reproduce: string | null
  category: string | null
  preferred_response: string | null
  phone: string | null
  preferred_time: string | null
  timezone: string | null
  urgency: string | null
  browser_info: any
  status: string
  priority: string
  admin_notes: string | null
  admin_response: string | null
  created_at: string
}

// ─── Main component ───

export function AdminSupportClient({
  feedback,
  emailMap,
  counts,
  filters,
  initialTicketId,
}: {
  feedback: FeedbackItem[]
  emailMap: Record<string, string>
  counts: Record<string, number>
  filters: { type?: string; status?: string; priority?: string }
  initialTicketId?: string
}) {
  const [expandedId, setExpandedId] = useState<string | null>(initialTicketId || null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Scroll to ticket if linked from user detail
  useEffect(() => {
    if (initialTicketId) {
      const el = document.getElementById(`ticket-${initialTicketId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [initialTicketId])

  function toggleSelect(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function toggleSelectAll() {
    if (selectedIds.size === feedback.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(feedback.map(f => f.id)))
    }
  }

  function handleBulkStatus(status: string) {
    if (selectedIds.size === 0) return
    startTransition(async () => {
      await bulkUpdateFeedbackStatus(Array.from(selectedIds), status)
      setSelectedIds(new Set())
      router.refresh()
    })
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} item(s)? This cannot be undone.`)) return
    startTransition(async () => {
      await bulkDeleteFeedback(Array.from(selectedIds))
      setSelectedIds(new Set())
      router.refresh()
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Support Queue</h1>
        {counts.new > 0 && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5">
            {counts.new}
          </span>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-muted-foreground self-center mr-1">Type:</span>
        <FilterChip href="/admin/support" active={!filters.type || filters.type === 'all'}>
          All ({counts.total})
        </FilterChip>
        <FilterChip href="/admin/support?type=bug" active={filters.type === 'bug'}>
          <Bug className="w-3 h-3" /> Bug ({counts.bug})
        </FilterChip>
        <FilterChip href="/admin/support?type=contact" active={filters.type === 'contact'}>
          <Mail className="w-3 h-3" /> Message ({(counts.contact || 0) + (counts.callback || 0)})
        </FilterChip>

        <span className="text-xs text-muted-foreground self-center ml-3 mr-1">Status:</span>
        <FilterChip href="/admin/support" active={!filters.status || filters.status === 'all'}>
          All
        </FilterChip>
        <FilterChip href="/admin/support?status=new" active={filters.status === 'new'}>
          New ({counts.new})
        </FilterChip>
        <FilterChip href="/admin/support?status=acknowledged" active={filters.status === 'acknowledged'}>
          Acknowledged ({counts.acknowledged})
        </FilterChip>
        <FilterChip href="/admin/support?status=in_progress" active={filters.status === 'in_progress'}>
          In Progress ({counts.in_progress})
        </FilterChip>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 border rounded-lg text-sm">
          <span className="font-medium">{selectedIds.size} selected</span>
          <span className="text-muted-foreground">|</span>
          <button onClick={() => handleBulkStatus('acknowledged')} className="hover:underline" disabled={isPending}>
            Acknowledge
          </button>
          <button onClick={() => handleBulkStatus('closed')} className="hover:underline" disabled={isPending}>
            Close
          </button>
          <button onClick={() => handleBulkStatus('spam')} className="hover:underline text-muted-foreground" disabled={isPending}>
            Spam
          </button>
          <button onClick={handleBulkDelete} className="hover:underline text-red-600 ml-auto" disabled={isPending}>
            Delete
          </button>
        </div>
      )}

      {/* Queue table */}
      <div className="border rounded-lg">
        {/* Table header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
          <input
            type="checkbox"
            checked={selectedIds.size === feedback.length && feedback.length > 0}
            onChange={toggleSelectAll}
            className="rounded"
          />
          <div className="w-16">Type</div>
          <div className="flex-1">Subject</div>
          <div className="w-32">User</div>
          <div className="w-20">Priority</div>
          <div className="w-24">Status</div>
          <div className="w-16 text-right">Time</div>
          <div className="w-6" />
        </div>

        {/* Rows */}
        {feedback.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No feedback items found.
          </div>
        ) : (
          <div className="divide-y">
            {feedback.map((item) => (
              <FeedbackRow
                key={item.id}
                item={item}
                email={emailMap[item.user_id] || 'Unknown'}
                expanded={expandedId === item.id}
                selected={selectedIds.has(item.id)}
                onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onToggleSelect={() => toggleSelect(item.id)}
                onRefresh={() => router.refresh()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Filter chip ───

function FilterChip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-colors ${
        active
          ? 'bg-foreground text-background border-foreground'
          : 'hover:border-foreground/40'
      }`}
    >
      {children}
    </a>
  )
}

// ─── Single feedback row ───

function FeedbackRow({
  item,
  email,
  expanded,
  selected,
  onToggleExpand,
  onToggleSelect,
  onRefresh,
}: {
  item: FeedbackItem
  email: string
  expanded: boolean
  selected: boolean
  onToggleExpand: () => void
  onToggleSelect: () => void
  onRefresh: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [notesValue, setNotesValue] = useState(item.admin_notes || '')
  const [responseValue, setResponseValue] = useState(item.admin_response || '')
  const [showResponse, setShowResponse] = useState(false)

  const priorityDot = PRIORITY_OPTIONS.find(p => p.value === item.priority)?.dot || 'bg-gray-300'
  const statusOption = STATUS_OPTIONS.find(s => s.value === item.status)

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateFeedbackStatus(item.id, status)
      onRefresh()
    })
  }

  function handlePriorityChange(priority: string) {
    startTransition(async () => {
      await updateFeedbackPriority(item.id, priority)
      onRefresh()
    })
  }

  function handleSaveNotes() {
    startTransition(async () => {
      await updateAdminNotes(item.id, notesValue)
      onRefresh()
    })
  }

  function handleSendResponse() {
    if (!responseValue.trim()) return
    startTransition(async () => {
      await sendAdminResponse(item.id, responseValue)
      setShowResponse(false)
      onRefresh()
    })
  }

  function handleDelete() {
    if (!confirm('Delete this feedback item? This cannot be undone.')) return
    startTransition(async () => {
      await deleteFeedback(item.id)
      onRefresh()
    })
  }

  return (
    <div id={`ticket-${item.id}`} className={isPending ? 'opacity-50' : ''}>
      {/* Row summary */}
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="rounded"
        />
        <div className="w-16 text-muted-foreground shrink-0">
          <span className="inline-flex items-center gap-1 text-xs">
            {TYPE_ICONS[item.type]}
            {TYPE_LABELS[item.type]}
          </span>
        </div>
        <button
          onClick={onToggleExpand}
          className="flex-1 text-left text-sm font-medium truncate hover:text-red-600 transition-colors"
        >
          {item.subject || `${TYPE_LABELS[item.type] || item.type} request`}
        </button>
        <div className="w-32 text-xs text-muted-foreground truncate">{email}</div>
        <div className="w-20">
          <span className={`inline-block w-2 h-2 rounded-full ${priorityDot}`} />
        </div>
        <div className="w-24">
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusOption?.style || 'bg-gray-100'}`}>
            {statusOption?.label || item.status}
          </span>
        </div>
        <div className="w-16 text-right text-xs text-muted-foreground">
          {formatTimeAgo(item.created_at)}
        </div>
        <button onClick={onToggleExpand} className="w-6 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-4 pb-5 pt-1 border-t bg-gray-50/30">
          <div className="grid grid-cols-[1fr_280px] gap-6 mt-3">
            {/* Left: content */}
            <div className="space-y-4">
              {/* Message */}
              {item.message && (
                <div>
                  <Label>Message</Label>
                  <p className="text-sm whitespace-pre-wrap mt-1">{item.message}</p>
                </div>
              )}

              {/* Bug-specific */}
              {item.severity && (
                <div>
                  <Label>Severity</Label>
                  <p className="text-sm mt-1 capitalize">{item.severity}</p>
                </div>
              )}
              {item.steps_to_reproduce && (
                <div>
                  <Label>Steps to Reproduce</Label>
                  <p className="text-sm whitespace-pre-wrap mt-1">{item.steps_to_reproduce}</p>
                </div>
              )}

              {/* Contact-specific */}
              {item.category && (
                <div>
                  <Label>Category</Label>
                  <p className="text-sm mt-1 capitalize">{item.category.replace('_', ' ')}</p>
                </div>
              )}

              {/* Callback-specific */}
              {item.phone && (
                <div className="flex gap-6">
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm mt-1">{item.phone}</p>
                  </div>
                  {item.preferred_time && (
                    <div>
                      <Label>Preferred Time</Label>
                      <p className="text-sm mt-1 capitalize">{item.preferred_time}</p>
                    </div>
                  )}
                  {item.urgency && (
                    <div>
                      <Label>Urgency</Label>
                      <p className="text-sm mt-1 capitalize">{item.urgency}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Browser info */}
              {item.browser_info && Object.keys(item.browser_info).length > 0 && (
                <div>
                  <Label>Browser Info</Label>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {item.browser_info.viewportWidth && (
                      <span className="inline-flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        {item.browser_info.viewportWidth}×{item.browser_info.viewportHeight}
                      </span>
                    )}
                    {item.browser_info.url && (
                      <span className="inline-flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {item.browser_info.url}
                      </span>
                    )}
                    {item.browser_info.appVersion && (
                      <span>v{item.browser_info.appVersion}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Existing admin response */}
              {item.admin_response && (
                <div className="border-l-2 border-red-600 pl-3">
                  <Label>Your Response</Label>
                  <p className="text-sm whitespace-pre-wrap mt-1">{item.admin_response}</p>
                </div>
              )}

              {/* Reply form */}
              {!showResponse ? (
                <button
                  onClick={() => setShowResponse(true)}
                  className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  {item.admin_response ? 'Edit response' : 'Write response to user'}
                </button>
              ) : (
                <div className="space-y-2">
                  <Label>Response (visible to user)</Label>
                  <textarea
                    value={responseValue}
                    onChange={(e) => setResponseValue(e.target.value)}
                    rows={3}
                    placeholder="Your response…"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendResponse}
                      disabled={isPending || !responseValue.trim()}
                      className="bg-foreground text-background px-3 py-1.5 text-xs font-medium rounded-md hover:bg-foreground/90 disabled:opacity-50"
                    >
                      {isPending ? 'Sending…' : 'Send & Resolve'}
                    </button>
                    <button
                      onClick={() => setShowResponse(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Ref */}
              <div className="text-xs text-muted-foreground font-mono pt-2">
                ID: {item.id.slice(0, 8).toUpperCase()} · {new Date(item.created_at).toLocaleString()}
              </div>
            </div>

            {/* Right sidebar: controls */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <Label>Status</Label>
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isPending}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <Label>Priority</Label>
                <select
                  value={item.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={isPending}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Admin notes */}
              <div>
                <Label>Admin Notes (internal)</Label>
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={3}
                  placeholder="Internal notes…"
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
                {notesValue !== (item.admin_notes || '') && (
                  <button
                    onClick={handleSaveNotes}
                    disabled={isPending}
                    className="mt-1 text-xs font-medium text-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    Save notes
                  </button>
                )}
              </div>

              {/* User info */}
              <div>
                <Label>Submitted by</Label>
                <p className="text-sm mt-1">{email}</p>
              </div>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 mt-4"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ───

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{children}</div>
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHrs < 24) return `${diffHrs}h`
  if (diffDays < 30) return `${diffDays}d`
  return date.toLocaleDateString()
}
