'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, ExternalLink, ChevronDown, ChevronRight, Search, Loader2 } from 'lucide-react'
import { formatInteger } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type Book = {
  id: string
  title: string
  author: string
  publication_year: string
  publisher_name: string
  isbn_13: string
  isbn_10: string
}

type DuplicateGroup = {
  type: string
  label: string
  key: string
  books: Book[]
}

export default function DuplicatesPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [bookCount, setBookCount] = useState<number | null>(null)
  const [groups, setGroups] = useState<DuplicateGroup[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [threshold, setThreshold] = useState(85)

  // Get book count on mount
  useEffect(() => {
    const getCount = async () => {
      const { count } = await supabase.from('books').select('*', { count: 'exact', head: true })
      setBookCount(count || 0)
    }
    getCount()
  }, [])

  // Dynamic browser tab title
  useEffect(() => {
    document.title = 'Duplicate Detection — Shelvd'
  }, [])

  const handleScan = async () => {
    setLoading(true)
    setSelected(new Set())
    setGroups([])

    const allGroups: DuplicateGroup[] = []

    // 1. ISBN-13 duplicates (fast SQL query)
    const { data: isbn13Dupes } = await (supabase as any).rpc('find_isbn13_duplicates')
    if (isbn13Dupes) {
      for (const row of isbn13Dupes) {
        allGroups.push({
          type: 'ISBN-13 Match',
          label: `ISBN-13: ${row.isbn_13}`,
          key: `isbn13-${row.isbn_13}`,
          books: row.books,
        })
      }
    }

    // 2. ISBN-10 duplicates
    const { data: isbn10Dupes } = await (supabase as any).rpc('find_isbn10_duplicates')
    if (isbn10Dupes) {
      // Filter out books already in ISBN-13 groups
      const usedIds = new Set(allGroups.flatMap(g => g.books.map(b => b.id)))
      for (const row of isbn10Dupes) {
        const filteredBooks = row.books.filter((b: Book) => !usedIds.has(b.id))
        if (filteredBooks.length > 1) {
          allGroups.push({
            type: 'ISBN-10 Match',
            label: `ISBN-10: ${row.isbn_10}`,
            key: `isbn10-${row.isbn_10}`,
            books: filteredBooks,
          })
        }
      }
    }

    // 3. Exact title duplicates
    const { data: titleDupes } = await (supabase as any).rpc('find_title_duplicates')
    if (titleDupes) {
      const usedIds = new Set(allGroups.flatMap(g => g.books.map(b => b.id)))
      for (const row of titleDupes) {
        const filteredBooks = row.books.filter((b: Book) => !usedIds.has(b.id))
        if (filteredBooks.length > 1) {
          allGroups.push({
            type: 'Exact Title',
            label: `Title: "${row.title}"`,
            key: `title-${row.title}`,
            books: filteredBooks,
          })
        }
      }
    }

    // 4. Fuzzy title duplicates (using pg_trgm if available, else skip)
    const { data: fuzzyDupes } = await (supabase as any).rpc('find_fuzzy_title_duplicates', { 
      similarity_threshold: threshold / 100 
    })
    if (fuzzyDupes) {
      const usedIds = new Set(allGroups.flatMap(g => g.books.map(b => b.id)))
      for (const row of fuzzyDupes) {
        const filteredBooks = row.books.filter((b: Book) => !usedIds.has(b.id))
        if (filteredBooks.length > 1) {
          allGroups.push({
            type: 'Similar Title',
            label: `Similar: "${row.title}" (${Math.round(row.similarity * 100)}%)`,
            key: `fuzzy-${row.books[0]?.id}`,
            books: filteredBooks,
          })
        }
      }
    }

    setGroups(allGroups)
    setLoading(false)
  }

  const totalBooks = groups.reduce((sum, g) => sum + g.books.length, 0)

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleBook = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAllInGroup = (group: DuplicateGroup) => {
    setSelected(prev => {
      const next = new Set(prev)
      group.books.forEach(b => next.add(b.id))
      return next
    })
  }

  const deselectAllInGroup = (group: DuplicateGroup) => {
    setSelected(prev => {
      const next = new Set(prev)
      group.books.forEach(b => next.delete(b.id))
      return next
    })
  }

  const handleDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} book(s)? This cannot be undone.`)) return

    setDeleting(true)
    const ids = Array.from(selected)
    await supabase.from('books').delete().in('id', ids)
    
    // Update UI
    setGroups(prev => prev.map(g => ({
      ...g,
      books: g.books.filter(b => !selected.has(b.id))
    })).filter(g => g.books.length > 1))
    setSelected(new Set())
    setDeleting(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/books" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Collection
        </Link>
        <h1 className="text-2xl font-bold">Duplicate Detection</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find possible duplicates in your collection{bookCount !== null ? ` of ${formatInteger(bookCount)} books` : ''}
        </p>
      </div>

      {/* Controls */}
      <div className="border border-border p-4 mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Fuzzy threshold:</label>
            <input type="range" min={70} max={99} value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-32" />
            <span className="text-sm font-medium w-10">{threshold}%</span>
          </div>

          <Button onClick={handleScan} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {loading ? 'Scanning...' : groups.length > 0 ? 'Re-scan' : 'Scan Collection'}
          </Button>

          {selected.size > 0 && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : `Delete ${selected.size} Selected`}
            </Button>
          )}
        </div>

        {groups.length > 0 && (
          <p className="text-sm">
            Found <strong>{groups.length}</strong> groups with <strong>{totalBooks}</strong> possible duplicate books
          </p>
        )}
      </div>

      {/* Results */}
      {!loading && groups.length === 0 && bookCount !== null && (
        <div className="border border-border p-8 text-center text-muted-foreground">
          {bookCount === 0 ? 'No books in your collection yet.' : 'Click "Scan Collection" to find duplicates.'}
        </div>
      )}

      {groups.length > 0 && (
        <div className="space-y-3">
          {groups.map(group => {
            const isCollapsed = collapsed.has(group.key)
            const allSelected = group.books.every(b => selected.has(b.id))

            return (
              <div key={group.key} className="border border-border">
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCollapse(group.key)}
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{group.type}</span>
                  <span className="font-medium flex-1 truncate">{group.label}</span>
                  <span className="text-sm text-muted-foreground">{group.books.length} books</span>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); allSelected ? deselectAllInGroup(group) : selectAllInGroup(group) }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="divide-y divide-border">
                    {group.books.map(book => (
                      <div key={book.id} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/20">
                        <input type="checkbox" checked={selected.has(book.id)} onChange={() => toggleBook(book.id)} className="w-4 h-4" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{book.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {[book.author, book.publication_year, book.publisher_name].filter(Boolean).join(' — ')}
                          </div>
                        </div>
                        <Link href={`/books/${book.id}`} target="_blank" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
