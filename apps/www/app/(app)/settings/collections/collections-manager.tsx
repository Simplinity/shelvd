'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Library, FolderOpen, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type Collection = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_default: boolean
  created_at: string
  book_count: number
}

export function CollectionsManager() {
  const router = useRouter()
  const supabase = createClient()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Create new collection
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Edit collection
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCollections = async () => {
    setLoading(true)
    const { data: cols } = await supabase
      .from('collections')
      .select('id, name, description, icon, color, sort_order, is_default, created_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (!cols) {
      setLoading(false)
      return
    }

    // Get counts
    const withCounts: Collection[] = []
    for (const col of cols) {
      const { count } = await supabase
        .from('book_collections')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', col.id)
      withCounts.push({ ...col, book_count: count || 0 } as Collection)
    }

    setCollections(withCounts)
    setLoading(false)
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const maxOrder = collections.reduce((max, c) => Math.max(max, c.sort_order), 0)

    const { error } = await supabase.from('collections').insert({
      user_id: user.id,
      name: newName.trim(),
      description: newDescription.trim() || null,
      sort_order: maxOrder + 1,
      is_default: false,
    })

    if (!error) {
      setNewName('')
      setNewDescription('')
      setShowCreate(false)
      await fetchCollections()
    }

    setSaving(false)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setSaving(true)

    const { error } = await supabase
      .from('collections')
      .update({
        name: editName.trim(),
        description: editDescription.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (!error) {
      setEditingId(null)
      await fetchCollections()
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setSaving(true)

    // Delete book_collections entries first
    await supabase.from('book_collections').delete().eq('collection_id', id)
    // Delete the collection
    const { error } = await supabase.from('collections').delete().eq('id', id)

    if (!error) {
      setDeletingId(null)
      await fetchCollections()
    }

    setSaving(false)
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    setSaving(true)

    const current = collections[index]
    const above = collections[index - 1]

    await supabase.from('collections').update({ sort_order: above.sort_order }).eq('id', current.id)
    await supabase.from('collections').update({ sort_order: current.sort_order }).eq('id', above.id)

    await fetchCollections()
    setSaving(false)
  }

  const handleMoveDown = async (index: number) => {
    if (index >= collections.length - 1) return
    setSaving(true)

    const current = collections[index]
    const below = collections[index + 1]

    await supabase.from('collections').update({ sort_order: below.sort_order }).eq('id', current.id)
    await supabase.from('collections').update({ sort_order: current.sort_order }).eq('id', below.id)

    await fetchCollections()
    setSaving(false)
  }

  const startEditing = (col: Collection) => {
    setEditingId(col.id)
    setEditName(col.name)
    setEditDescription(col.description || '')
  }

  const inputClass = "w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Collections</h1>
          <p className="text-muted-foreground">
            Create, rename, reorder, and delete your book collections.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} disabled={showCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 p-4 border border-border bg-muted/30">
          <h3 className="font-medium mb-3">New Collection</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Wishlist, First Editions, To Read..."
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Description (optional)</label>
              <input
                type="text"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Short description..."
                className={inputClass}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowCreate(false); setNewName(''); setNewDescription('') }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Collections list */}
      {!loading && (
        <div className="border border-border divide-y divide-border">
          {collections.map((col, index) => (
            <div key={col.id} className="p-4">
              {editingId === col.id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className={inputClass}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Description</label>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleUpdate(col.id)} disabled={!editName.trim() || saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-1" />}
                      Save
                    </Button>
                  </div>
                </div>
              ) : deletingId === col.id ? (
                /* Delete confirmation */
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Delete "{col.name}"? ({col.book_count} books will be unlinked)
                    </p>
                    <p className="text-xs text-muted-foreground">This cannot be undone.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(col.id)} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-1" />}
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                /* Display mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {col.is_default ? (
                      <Library className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <FolderOpen className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{col.name}</span>
                        {col.is_default && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground uppercase tracking-wide">
                            Default
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {col.book_count} {col.book_count === 1 ? 'book' : 'books'}
                        </span>
                      </div>
                      {col.description && (
                        <p className="text-sm text-muted-foreground">{col.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Reorder arrows */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || saving}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === collections.length - 1 || saving}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>

                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(col)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    {/* Delete (not for default) */}
                    {!col.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(col.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && collections.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-border">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">Create your first collection to organize your books.</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Collection
          </Button>
        </div>
      )}
    </div>
  )
}
