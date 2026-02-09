'use client'

import { useState, useTransition } from 'react'
import { submitFeedback } from '@/lib/actions/feedback'
import { Bug, Mail, Phone, CheckCircle2, Clock, MessageSquare, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Types ───

type FeedbackType = 'bug' | 'contact' | 'callback'

type Submission = {
  id: string
  type: string
  subject: string | null
  message: string | null
  severity: string | null
  category: string | null
  phone: string | null
  status: string
  priority: string
  admin_response: string | null
  created_at: string
}

// ─── Status chip colors (Swiss monochrome + accents) ───

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  acknowledged: 'bg-blue-50 text-blue-700 border border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border border-amber-200',
  resolved: 'bg-green-50 text-green-700 border border-green-200',
  closed: 'bg-gray-50 text-gray-400',
  spam: 'bg-gray-50 text-gray-400 line-through',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  spam: 'Spam',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bug: <Bug className="w-4 h-4" />,
  contact: <Mail className="w-4 h-4" />,
  callback: <Phone className="w-4 h-4" />,
}

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug Report',
  contact: 'Contact',
  callback: 'Callback',
}

// ─── Browser info capture ───

function captureBrowserInfo(appVersion: string) {
  if (typeof window === 'undefined') return {}
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    url: window.location.href,
    appVersion,
    timestamp: new Date().toISOString(),
  }
}

// ─── Main component ───

export function SupportPageClient({
  submissions,
  appVersion,
}: {
  submissions: Submission[]
  appVersion: string
}) {
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; message?: string; id?: string } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    // Inject browser info
    formData.set('browser_info', JSON.stringify(captureBrowserInfo(appVersion)))

    startTransition(async () => {
      const res = await submitFeedback(formData)
      if (res.success) {
        setResult({ success: true, message: res.message, id: res.data?.id })
        setSelectedType(null)
      } else {
        setResult({ success: false, message: res.error })
      }
    })
  }

  function resetForm() {
    setResult(null)
    setSelectedType(null)
  }

  // ─── Success state ───
  if (result?.success) {
    return (
      <div className="space-y-12">
        <div className="border rounded-lg p-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Submitted</h2>
          <p className="text-sm text-muted-foreground mb-1">{result.message}</p>
          {result.id && (
            <p className="text-xs text-muted-foreground font-mono mt-3">
              Ref: {result.id.slice(0, 8).toUpperCase()}
            </p>
          )}
          <button
            onClick={resetForm}
            className="mt-6 text-sm font-medium text-foreground underline underline-offset-4 hover:text-red-600 transition-colors"
          >
            Submit another
          </button>
        </div>

        <SubmissionsList 
          submissions={submissions} 
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Error banner */}
      {result?.success === false && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          {result.message}
        </div>
      )}

      {/* ─── Type selector cards ─── */}
      <div className="grid grid-cols-3 gap-4">
        <TypeCard
          type="bug"
          icon={<Bug className="w-5 h-5" />}
          title="Bug Report"
          description="Something isn't working as expected"
          selected={selectedType === 'bug'}
          onClick={() => { setSelectedType('bug'); setResult(null) }}
        />
        <TypeCard
          type="contact"
          icon={<Mail className="w-5 h-5" />}
          title="Contact"
          description="General inquiry or feature request"
          selected={selectedType === 'contact'}
          onClick={() => { setSelectedType('contact'); setResult(null) }}
        />
        <TypeCard
          type="callback"
          icon={<Phone className="w-5 h-5" />}
          title="Callback"
          description="Request a phone call from our team"
          selected={selectedType === 'callback'}
          onClick={() => { setSelectedType('callback'); setResult(null) }}
        />
      </div>

      {/* ─── Form ─── */}
      {selectedType && (
        <form action={handleSubmit} className="border rounded-lg p-6 space-y-5">
          <input type="hidden" name="type" value={selectedType} />

          {selectedType === 'bug' && <BugForm />}
          {selectedType === 'contact' && <ContactForm />}
          {selectedType === 'callback' && <CallbackForm />}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-foreground text-background px-5 py-2 text-sm font-medium rounded-md hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {/* ─── Submissions ─── */}
      <SubmissionsList 
        submissions={submissions}
        expandedId={expandedId}
        onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
      />
    </div>
  )
}

// ─── Type card ───

function TypeCard({
  type,
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  type: string
  icon: React.ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-5 border rounded-lg transition-all ${
        selected
          ? 'border-l-2 border-l-red-600 border-t border-r border-b bg-white'
          : 'hover:border-foreground/30'
      }`}
    >
      <div className={`mb-2 ${selected ? 'text-red-600' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </button>
  )
}

// ─── Bug report form ───

function BugForm() {
  return (
    <>
      <FormField label="Subject" required>
        <input
          name="subject"
          required
          placeholder="Brief summary of the issue"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </FormField>

      <FormField label="Severity">
        <select
          name="severity"
          defaultValue="minor"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
        >
          <option value="cosmetic">Cosmetic — visual glitch, doesn't affect functionality</option>
          <option value="minor">Minor — works, but not as expected</option>
          <option value="major">Major — feature is broken or unusable</option>
          <option value="critical">Critical — data loss or security issue</option>
        </select>
      </FormField>

      <FormField label="Description" required>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="What happened? What did you expect to happen?"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </FormField>

      <FormField label="Steps to reproduce">
        <textarea
          name="steps_to_reproduce"
          rows={3}
          placeholder="1. Go to…&#10;2. Click on…&#10;3. See error"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </FormField>
    </>
  )
}

// ─── Contact form ───

function ContactForm() {
  return (
    <>
      <FormField label="Category">
        <select
          name="category"
          defaultValue="general"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
        >
          <option value="general">General inquiry</option>
          <option value="account">Account & billing</option>
          <option value="feature_request">Feature request</option>
          <option value="data_question">Data & privacy</option>
          <option value="partnership">Partnership</option>
        </select>
      </FormField>

      <FormField label="Subject" required>
        <input
          name="subject"
          required
          placeholder="What's this about?"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </FormField>

      <FormField label="Message" required>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us more…"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </FormField>

      <FormField label="Preferred response">
        <select
          name="preferred_response"
          defaultValue="email"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
        >
          <option value="email">Email</option>
          <option value="in_app">In-app reply</option>
        </select>
      </FormField>
    </>
  )
}

// ─── Callback form ───

function CallbackForm() {
  const detectedTimezone = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : ''

  return (
    <>
      <FormField label="Subject">
        <input
          name="subject"
          placeholder="Brief reason for the call (optional)"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </FormField>

      <FormField label="Phone number" required>
        <input
          name="phone"
          type="tel"
          required
          placeholder="+32 …"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Preferred time">
          <select
            name="preferred_time"
            defaultValue="morning"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="morning">Morning (9:00–12:00)</option>
            <option value="afternoon">Afternoon (12:00–17:00)</option>
            <option value="evening">Evening (17:00–20:00)</option>
          </select>
        </FormField>

        <FormField label="Urgency">
          <select
            name="urgency"
            defaultValue="normal"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </FormField>
      </div>

      <FormField label="Timezone">
        <input
          name="timezone"
          defaultValue={detectedTimezone}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </FormField>

      <FormField label="Additional details">
        <textarea
          name="reason"
          rows={3}
          placeholder="Anything we should know before calling?"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </FormField>
    </>
  )
}

// ─── Form field wrapper ───

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Submissions list ───

function SubmissionsList({
  submissions,
  expandedId,
  onToggle,
}: {
  submissions: Submission[]
  expandedId: string | null
  onToggle: (id: string) => void
}) {
  if (submissions.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
        My Submissions
      </h2>
      <div className="border rounded-lg divide-y">
        {submissions.map((item) => (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
            >
              <span className="text-muted-foreground shrink-0">
                {TYPE_ICONS[item.type] || <MessageSquare className="w-4 h-4" />}
              </span>
              <span className="text-sm font-medium truncate flex-1">
                {item.subject || TYPE_LABELS[item.type] || item.type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[item.status] || STATUS_STYLES.new}`}>
                {STATUS_LABELS[item.status] || item.status}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatTimeAgo(item.created_at)}
              </span>
              {expandedId === item.id 
                ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              }
            </button>

            {expandedId === item.id && (
              <div className="px-4 pb-4 pt-1 space-y-3 text-sm">
                {item.message && (
                  <div>
                    <span className="text-muted-foreground text-xs font-medium">Message</span>
                    <p className="mt-0.5 whitespace-pre-wrap">{item.message}</p>
                  </div>
                )}
                {item.severity && (
                  <div className="flex gap-4">
                    <div>
                      <span className="text-muted-foreground text-xs font-medium">Severity</span>
                      <p className="mt-0.5 capitalize">{item.severity}</p>
                    </div>
                  </div>
                )}
                {item.category && (
                  <div>
                    <span className="text-muted-foreground text-xs font-medium">Category</span>
                    <p className="mt-0.5 capitalize">{item.category.replace('_', ' ')}</p>
                  </div>
                )}
                {item.phone && (
                  <div>
                    <span className="text-muted-foreground text-xs font-medium">Phone</span>
                    <p className="mt-0.5">{item.phone}</p>
                  </div>
                )}
                {item.admin_response && (
                  <div className="border-l-2 border-red-600 pl-3 mt-2">
                    <span className="text-xs font-medium text-red-600">Response from Shelvd</span>
                    <p className="mt-0.5 whitespace-pre-wrap">{item.admin_response}</p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground font-mono pt-1">
                  Ref: {item.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Time ago helper ───

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
