'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, ExternalLink, ChevronDown, ChevronRight, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type Book = {
  id: string
  title: string
  subtitle: string
  isbn_13: string
  isbn_10: string
  oclc_number: string
  publication_year: string
  publisher_name: string
  condition_name: string
  author: string
}

type DuplicateGroup = {
  type: 'isbn_13' | 'isbn_10' | 'oclc' | 'exact_title' | 'fuzzy_title'
  label: string
  key: string
  similarity?: number
  books: Book[]
}

// Normalize title for comparison
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/^(the|a|an|de|het|een|le|la|les|der|die|das|el|los|las)\s+/i, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }
  return matrix[b.length][a.length]
}

function similarity(a: string, b: string): number {
  if (a === b) return 100
  if (!a || !b) return 0
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 100
  return Math.round((1 - levenshtein(a, b) / maxLen) * 100)
}

export default function DuplicatesPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [threshold, setThreshold] = useState(85)
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  // Fetch all books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const allBooks: any[] = []
      let offset = 0
      const batchSize = 1000

      while (true) {
        const { data, error } = await supabase
          .from('books')
          .select('id, title, subtitle, isbn_13, isbn_10, oclc_number, publication_year, publisher_name, condition_id')
          .order('title')
          .range(offset, offset + batchSize - 1)

        if (error || !data || data.length === 0) break
        allBooks.push(...data)
        if (data.length < batchSize) break
        offset += batchSize
      }

      // Fetch authors
      const bookIds = allBooks.map(b => b.id)
      const authorMap = new Map<string, string>()

      for (let i = 0; i < bookIds.length; i += 500) {
        const batch = bookIds.slice(i, i + 500)
        const { data: contributors } = await supabase
          .from('book_contributors')
          .select('book_id, contributor:contributors ( canonical_name )')
          .in('book_id', batch)
          .order('sort_order')

        if (contributors) {
          for (const c of contributors) {
            if (!authorMap.has(c.book_id)) {
              authorMap.set(c.book_id, (c.contributor as any)?.canonical_name || '')
            }
          }
        }
      }

      const enriched = allBooks.map(book => ({
        id: book.id,
        title: book.title || '',
        subtitle: book.subtitle || '',
        isbn_13: book.isbn_13 || '',
        isbn_10: book.isbn_10 || '',
        oclc_number: book.oclc_number || '',
        publication_year: book.publication_year || '',
        publisher_name: book.publisher_name || '',
        condition_name: '',
        author: authorMap.get(book.id) || '',
      }))

      setBooks(enriched)
      setLoading(false)
    }

    fetchBooks()
  }, [])

  // Find duplicates
  const duplicateGroups = useMemo(() => {
    if (!scanned) return []

    const groups: DuplicateGroup[] = []
    const usedInGroup = new Set<string>()

    // 1. ISBN-13 matches
    const isbn13Map = new Map<string, Book[]>()
    for (const book of books) {
      if (book.isbn_13?.trim()) {
        const key = book.isbn_13.trim()
        if (!isbn13Map.has(key)) isbn13Map.set(key, [])
        isbn13Map.get(key)!.push(book)
      }
    }
    for (const [key, groupBooks] of isbn13Map) {
      if (groupBooks.length > 1) {
        groups.push({ type: 'isbn_13', label: `ISBN-13: ${key}`, key: `isbn13-${key}`, books: groupBooks })
        groupBooks.forEach(b => usedInGroup.add(b.id))
      }
    }

    // 2. ISBN-10 matches
    const isbn10Map = new Map<string, Book[]>()
    for (const book of books) {
      if (book.isbn_10?.trim() && !usedInGroup.has(book.id)) {
        const key = book.isbn_10.trim()
        if (!isbn10Map.has(key)) isbn10Map.set(key, [])
        isbn10Map.get(key)!.push(book)
      }
    }
    for (const [key, groupBooks] of isbn10Map) {
      if (groupBooks.length > 1) {
        groups.push({ type: 'isbn_10', label: `ISBN-10: ${key}`, key: `isbn10-${key}`, books: groupBooks })
        groupBooks.forEach(b => usedInGroup.add(b.id))
      }
    }

    // 3. OCLC matches
    const oclcMap = new Map<string, Book[]>()
    for (const book of books) {
      if (book.oclc_number?.trim() && !usedInGroup.has(book.id)) {
        const key = book.oclc_number.trim()
        if (!oclcMap.has(key)) oclcMap.set(key, [])
        oclcMap.get(key)!.push(book)
      }
    }
    for (const [key, groupBooks] of oclcMap) {
      if (groupBooks.length > 1) {
        groups.push({ type: 'oclc', label: `OCLC: ${key}`, key: `oclc-${key}`, books: groupBooks })
        groupBooks.forEach(b => usedInGroup.add(b.id))
      }
    }

    // 4. Exact title matches (normalized)
    const exactTitleMap = new Map<string, Book[]>()
    for (const book of books) {
      if (!usedInGroup.has(book.id)) {
        const norm = normalizeTitle(book.title)
        if (norm) {
          if (!exactTitleMap.has(norm)) exactTitleMap.set(norm, [])
          exactTitleMap.get(norm)!.push(book)
        }
      }
    }
    for (const [, groupBooks] of exactTitleMap) {
      if (groupBooks.length > 1) {
        groups.push({ type: 'exact_title', label: `Exact title: "${groupBooks[0].title}"`, key: `exact-${groupBooks[0].id}`, books: groupBooks })
        groupBooks.forEach(b => usedInGroup.add(b.id))
      }
    }

    // 5. Fuzzy title matches
    const remainingBooks = books.filter(b => !usedInGroup.has(b.id))
    for (let i = 0; i < remainingBooks.length; i++) {
      const bookA = remainingBooks[i]
      if (usedInGroup.has(bookA.id)) continue
      const normA = normalizeTitle(bookA.title)
      if (!normA || normA.length < 3) continue

      const matches: Book[] = [bookA]
      let lowestSim = 100

      for (let j = i + 1; j < remainingBooks.length; j++) {
        const bookB = remainingBooks[j]
        if (usedInGroup.has(bookB.id)) continue
        const normB = normalizeTitle(bookB.title)
        if (!normB || normB.length < 3) continue

        const sim = similarity(normA, normB)
        if (sim >= threshold && sim < 100) {
          matches.push(bookB)
          lowestSim = Math.min(lowestSim, sim)
        }
      }

      if (matches.length > 1) {
        groups.push({ type: 'fuzzy_title', label: `Similar titles (${lowestSim}%)`, key: `fuzzy-${bookA.id}`, similarity: lowestSim, books: matches })
        matches.forEach(b => usedInGroup.add(b.id))
      }
    }

    return groups
  }, [books, threshold, scanned])

  const totalDuplicateBooks = duplicateGroups.reduce((sum, g) => sum + g.books.length, 0)

  const handleScan = () => {
    setScanning(true)
    setSelected(new Set())
    setTimeout(() => {
      setScanned(true)
      setScanning(false)
    }, 100)
  }

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleBook = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100)
      await supabase.from('books').delete().in('id', batch)
    }
    
    // Remove deleted books from state
    setBooks(prev => prev.filter(b => !selected.has(b.id)))
    setSelected(new Set())
    setDeleting(false)
  }

  const typeLabels: Record<string, string> = {
    isbn_13: 'ISBN-13 Match',
    isbn_10: 'ISBN-10 Match',
    oclc: 'OCLC Match',
    exact_title: 'Exact Title',
    fuzzy_title: 'Similar Title',
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading collection...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/books" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Collection
        </Link>
        <h1 className="text-2xl font-bold">Duplicate Detection</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find and manage possible duplicates in your collection of {books.length.toLocaleString()} books
        </p>
      </div>

      {/* Controls */}
      <div className="border border-border p-4 mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Fuzzy threshold:</label>
            <input
              type="range"
              min={70}
              max={99}
              value={threshold}
              onChange={e => { setThreshold(Number(e.target.value)); if (scanned) setScanned(false) }}
              className="w-32"
            />
            <span className="text-sm font-medium w-10">{threshold}%</span>
          </div>

          <Button onClick={handleScan} disabled={scanning}>
            <Search className="w-4 h-4 mr-2" />
            {scanning ? 'Scanning...' : scanned ? 'Re-scan' : 'Scan Collection'}
          </Button>

          {selected.size > 0 && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : `Delete ${selected.size} Selected`}
            </Button>
          )}
        </div>

        {scanned && (
          <p className="text-sm">
            Found <strong>{duplicateGroups.length}</strong> groups with{' '}
            <strong>{totalDuplicateBooks}</strong> possible duplicate books
          </p>
        )}
      </div>

      {/* Results */}
      {scanned && duplicateGroups.length === 0 && (
        <div className="border border-border p-8 text-center text-muted-foreground">
          No duplicates found. Your collection looks clean!
        </div>
      )}

      {scanned && duplicateGroups.length > 0 && (
        <div className="space-y-3">
          {duplicateGroups.map(group => {
            const isCollapsed = collapsed.has(group.key)
            const allSelected = group.books.every(b => selected.has(b.id))

            return (
              <div key={group.key} className="border border-border">
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCollapse(group.key)}
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{typeLabels[group.type]}</span>
                  <span className="font-medium flex-1">{group.label}</span>
                  <span className="text-sm text-muted-foreground">{group.books.length} books</span>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); allSelected ? deselectAllInGroup(group) : selectAllInGroup(group) }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="divide-y divide-border">
                    {group.books.map(book => (
                      <div key={book.id} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/20 transition-colors">
                        <input type="checkbox" checked={selected.has(book.id)} onChange={() => toggleBook(book.id)} className="w-4 h-4" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {book.title}
                            {book.subtitle && <span className="text-muted-foreground font-normal"> — {book.subtitle}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {[book.author, book.publication_year, book.publisher_name].filter(Boolean).join(' — ')}
                          </div>
                        </div>
                        <Link href={`/books/${book.id}`} target="_blank" onClick={e => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors" title="View book">
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
