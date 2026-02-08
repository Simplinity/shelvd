'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Eye, EyeOff, Megaphone } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  type: string
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string | null
}

const TYPES = [
  { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-700' },
  { value: 'warning', label: 'Warning', color: 'bg-amber-100 text-amber-700' },
  { value: 'success', label: 'Success', color: 'bg-green-100 text-green-700' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-gray-200 text-gray-700' },
]

export function AnnouncementManager({ announcements: initial }: { announcements: Announcement[] }) {
  const [announcements, setAnnouncements] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [endsAt, setEndsAt] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: title.trim(),
        message: message.trim(),
        type,
        is_active: true,
        ends_at: endsAt || null,
      })
      .select()
      .single()

    if (!error && data) {
      setAnnouncements([data, ...announcements])
      setTitle('')
      setMessage('')
      setType('info')
      setEndsAt('')
      setShowForm(false)
      router.refresh()
    }
    setSaving(false)
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !currentActive })
      .eq('id', id)

    if (!error) {
      setAnnouncements(announcements.map(a =>
        a.id === id ? { ...a, is_active: !currentActive } : a
      ))
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement permanently?')) return
    const supabase = createClient()
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (!error) {
      setAnnouncements(announcements.filter(a => a.id !== id))
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Announcements
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border hover:bg-muted transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="border p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Maintenance"
                className="w-full px-3 py-2 text-sm border"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border"
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Expires (optional)</label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={e => setEndsAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm border"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Additional details shown after the title"
              className="w-full px-3 py-2 text-sm border"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!title.trim() || saving}
              className="px-4 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Announcement'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm border hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {announcements.length === 0 && !showForm ? (
        <div className="border p-8 text-center text-muted-foreground text-sm">
          <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No announcements yet
        </div>
      ) : announcements.length > 0 && (
        <div className="border divide-y">
          {announcements.map(a => {
            const typeInfo = TYPES.find(t => t.value === a.type) || TYPES[0]
            return (
              <div key={a.id} className={`p-3 flex items-center gap-3 ${!a.is_active ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="text-sm font-medium truncate">{a.title}</span>
                    {!a.is_active && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5">Inactive</span>
                    )}
                  </div>
                  {a.message && (
                    <p className="text-xs text-muted-foreground truncate">{a.message}</p>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Created {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                    {a.ends_at && ` · Expires ${new Date(a.ends_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(a.id, a.is_active)}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    title={a.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {a.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
