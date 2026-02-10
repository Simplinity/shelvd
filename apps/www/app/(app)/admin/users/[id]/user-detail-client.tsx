'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, CheckCircle, Clock, Ban, Shield, ShieldOff, Gift, CreditCard, Send, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  userId: string
  email: string
  currentStatus: string
  currentNotes: string
  membershipTier: string
  isLifetimeFree: boolean
  isAdmin: boolean
}

export function UserDetailClient({
  userId, email, currentStatus, currentNotes, membershipTier, isLifetimeFree, isAdmin,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  // ── Notes ──
  const [notes, setNotes] = useState(currentNotes)
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  const saveNotes = async () => {
    setSavingNotes(true)
    await supabase.from('user_profiles').update({ notes, updated_at: new Date().toISOString() }).eq('id', userId)
    setSavingNotes(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  // ── Status changes ──
  const [actionLoading, setActionLoading] = useState(false)

  const updateProfile = async (updates: Record<string, any>) => {
    setActionLoading(true)
    const { error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
    if (error) alert('Error: ' + error.message)
    else router.refresh()
    setActionLoading(false)
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'banned' && !confirm('Ban this user? They will lose access to the platform.')) return
    const reason = (newStatus === 'suspended' || newStatus === 'banned')
      ? prompt('Reason (optional):') || undefined
      : undefined
    updateProfile({
      status: newStatus,
      ...(reason ? { status_reason: reason } : newStatus === 'active' ? { status_reason: null } : {}),
    })
  }

  // ── Email ──
  const [showEmail, setShowEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return
    setSendingEmail(true)
    try {
      const res = await fetch('/api/admin/users/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, subject: emailSubject, body: emailBody }),
      })
      if (res.ok) {
        setEmailSent(true)
        setEmailSubject('')
        setEmailBody('')
        setTimeout(() => { setEmailSent(false); setShowEmail(false) }, 2000)
      } else {
        const data = await res.json()
        alert('Failed: ' + (data.error || 'Unknown error'))
      }
    } catch {
      alert('Failed to send email')
    }
    setSendingEmail(false)
  }

  return (
    <>
      {/* ── Admin Notes ── */}
      <div className="border border-border">
        <div className="px-4 py-2 bg-muted/50 border-b border-border">
          <h3 className="text-sm font-semibold">Admin Notes</h3>
        </div>
        <div className="p-4">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Internal notes about this user (not visible to them)..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-muted/30 focus:outline-none focus:ring-1 focus:ring-foreground resize-y"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">Only visible to admins</span>
            <Button
              size="sm"
              variant="outline"
              onClick={saveNotes}
              disabled={savingNotes || notes === currentNotes}
            >
              {savingNotes ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> :
               notesSaved ? <CheckCircle className="w-3 h-3 text-green-600 mr-1" /> :
               <Save className="w-3 h-3 mr-1" />}
              {notesSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="border border-border">
        <div className="px-4 py-2 bg-muted/50 border-b border-border">
          <h3 className="text-sm font-semibold">Actions</h3>
        </div>
        <div className="p-4 space-y-3">
          {/* Status */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {currentStatus !== 'active' && (
                <ActionBtn
                  icon={CheckCircle} label="Activate" color="text-green-600"
                  loading={actionLoading}
                  onClick={() => handleStatusChange('active')}
                />
              )}
              {currentStatus !== 'suspended' && (
                <ActionBtn
                  icon={Clock} label="Suspend" color="text-amber-600"
                  loading={actionLoading}
                  onClick={() => handleStatusChange('suspended')}
                />
              )}
              {currentStatus !== 'banned' && (
                <ActionBtn
                  icon={Ban} label="Ban" color="text-red-600"
                  loading={actionLoading}
                  onClick={() => handleStatusChange('banned')}
                />
              )}
            </div>
          </div>

          {/* Membership */}
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-2">Membership</p>
            <div className="flex flex-wrap gap-2">
              {!isLifetimeFree ? (
                <ActionBtn
                  icon={Gift} label="Grant Lifetime Free" color="text-green-600"
                  loading={actionLoading}
                  onClick={() => {
                    if (confirm('Grant lifetime free access?')) updateProfile({ is_lifetime_free: true })
                  }}
                />
              ) : (
                <ActionBtn
                  icon={CreditCard} label="Remove Lifetime Free" color="text-muted-foreground"
                  loading={actionLoading}
                  onClick={() => {
                    if (confirm('Remove lifetime free access?')) updateProfile({ is_lifetime_free: false })
                  }}
                />
              )}
            </div>
          </div>

          {/* Admin toggle */}
          {!isAdmin && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Admin</p>
              <ActionBtn
                icon={Shield} label="Make Admin" color="text-primary"
                loading={actionLoading}
                onClick={() => {
                  if (confirm('Grant admin access? This gives full platform control.'))
                    updateProfile({ is_admin: true, admin_role: 'admin' })
                }}
              />
            </div>
          )}
          {isAdmin && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Admin</p>
              <ActionBtn
                icon={ShieldOff} label="Remove Admin" color="text-red-600"
                loading={actionLoading}
                onClick={() => {
                  if (confirm('Remove admin access?'))
                    updateProfile({ is_admin: false, admin_role: null })
                }}
              />
            </div>
          )}

          {/* Send Email */}
          {email && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Communication</p>
              {!showEmail ? (
                <ActionBtn
                  icon={Mail} label="Send Email" color="text-foreground"
                  loading={false}
                  onClick={() => setShowEmail(true)}
                />
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-muted/30 focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                  <textarea
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    placeholder="Message..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-muted/30 focus:outline-none focus:ring-1 focus:ring-foreground resize-y"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={sendEmail}
                      disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                    >
                      {sendingEmail ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> :
                       emailSent ? <CheckCircle className="w-3 h-3 mr-1" /> :
                       <Send className="w-3 h-3 mr-1" />}
                      {emailSent ? 'Sent!' : 'Send'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowEmail(false)}>
                      Cancel
                    </Button>
                    <span className="text-[10px] text-muted-foreground ml-auto">to {email}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ActionBtn({ icon: Icon, label, color, loading, onClick }: {
  icon: typeof CheckCircle; label: string; color: string; loading: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 ${color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}
