'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, BookOpen, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LimitGate } from '@/components/feature-gate'
import { createClient } from '@/lib/supabase/client'

const TAG_COLORS = [
  '#6b7280', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
]

type Tag = {
  id: string
  name: string
  color: string
  book_count: number
}

export function TagsManager() {
  const supabase = createClient()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  // Create
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6b7280')
  const [creating, setCreating] = useState(false)

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTags = async () => {
    const { data: tagRows } = await supabase
      .from('tags')
      .select('id, name, color')
      .order('name', { ascending: true })

    if (!tagRows) { setLoading(false); return }

    // Get book counts per tag
    const { data: countRows } = await supabase
      .from('book_tags')
      .select('tag_id')

    const counts: Record<string, number> = {}
    for (const row of countRows || []) {
      counts[row.tag_id] = (counts[row.tag_id] || 0) + 1
    }

    setTags(tagRows.map(t => ({
      ...t,
      color: t.color || '#6b7280',
      book_count: counts[t.id] || 0,
    })))
    setLoading(false)
  }

  useEffect(() => { fetchTags() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCreating(false); return }

    await supabase.from('tags').insert({
      user_id: user.id,
      name: newName.trim(),
      color: newColor,
    })

    setNewName('')
    setNewColor('#6b7280')
    setShowCreate(false)
    setCreating(false)
    await fetchTags()
  }

  const handleSave = async (id: string) => {
    if (!editName.trim()) return
    setSaving(true)
    await supabase.from('tags').update({ name: editName.trim(), color: editColor }).eq('id', id)
    setEditingId(null)
    setSaving(false)
    await fetchTags()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    // book_tags rows cascade-deleted via FK
    await supabase.from('tags').delete().eq('id', id)
    setDeletingId(null)
    await fetchTags()
  }

  const startEditing = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Tab navigation */}
      <div className="flex gap-0 border-b mb-10">
        <a href="/settings?tab=account" className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-muted-foreground hover:text-foreground">Account</a>
        <a href="/settings?tab=configuration" className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-muted-foreground hover:text-foreground">Configuration</a>
        <a href="/settings?tab=external-links" className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-muted-foreground hover:text-foreground">External Links</a>
        <a href="/settings?tab=book-lookup" className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-muted-foreground hover:text-foreground">Book Lookup</a>
        <a href="/settings/collections" className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-muted-foreground hover:text-foreground">Collections</a>
        <a href="/settings/tags" className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors border-foreground text-foreground">Tags</a>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Manage Tags</h2>
          <p className="text-muted-foreground">Create, rename, recolor, or delete tags. Deleting a tag removes it from all books.</p>
        </div>
        <LimitGate limitKey="max_tags" currentCount={tags.length}>
          <Button onClick={() => setShowCreate(true)} disabled={showCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Tag
          </Button>
        </LimitGate>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="border border-border p-4 mb-6 flex items-center gap-3">
          <div className="flex gap-1.5">
            {TAG_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full border-2 ${newColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Tag name"
            className="flex-1 px-3 py-2 text-sm border border-border bg-background"
            autoFocus
          />
          <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? <BookOpen className="w-4 h-4 animate-book-pulse" /> : <Check className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowCreate(false); setNewName('') }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <BookOpen className="w-6 h-6 animate-book-pulse text-muted-foreground" />
        </div>
      )}

      {/* Tags list */}
      {!loading && tags.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tags yet. Create one to get started.</p>
        </div>
      )}

      {!loading && tags.length > 0 && (
        <div className="border border-border divide-y divide-border">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-3 px-4 py-3">
              {editingId === tag.id ? (
                <>
                  <div className="flex gap-1.5">
                    {TAG_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`w-5 h-5 rounded-full border-2 ${editColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave(tag.id)}
                    className="flex-1 px-3 py-1.5 text-sm border border-border bg-background"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleSave(tag.id)} disabled={saving || !editName.trim()}>
                    {saving ? <BookOpen className="w-4 h-4 animate-book-pulse" /> : <Check className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="font-medium text-sm flex-1">{tag.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tag.book_count} {tag.book_count === 1 ? 'book' : 'books'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => startEditing(tag)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (tag.book_count > 0) {
                        if (!confirm(`Delete "${tag.name}"? It will be removed from ${tag.book_count} book${tag.book_count === 1 ? '' : 's'}.`)) return
                      }
                      handleDelete(tag.id)
                    }}
                    disabled={deletingId === tag.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {deletingId === tag.id ? <BookOpen className="w-3.5 h-3.5 animate-book-pulse" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
