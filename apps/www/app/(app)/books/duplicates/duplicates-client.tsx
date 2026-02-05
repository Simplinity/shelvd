'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, ExternalLink, ChevronDown, ChevronRight, Search } from 'lucide-react'
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
  created_at: string
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
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[b.length][a.length]
}

// Calculate similarity percentage
function similarity(a: string, b: string): number {
  if (a === b) return 100
  if (!a || !b) return 0
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 100
  const distance = levenshtein(a, b)
  return Math.round((1 - distance / maxLen) * 100)
}

type Props = {
  books: Book[]
}

export default function DuplicatesClient({ books }: Props) {
  const router = useRouter()
  const supabase = createClient()
  
  const [threshold, setThreshold] = useState(85)
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  // Find duplicates
  const duplicateGroups = useMemo(() => {
    if (!scanned) return []

    const groups: DuplicateGroup[] = []
    const usedInGroup = new Set<string>()

    // 1. ISBN-13 matches
    const isbn13Map = new Map<string, Book[]>()
    for (const book of books) {
      if (book.isbn_13 && book.isbn_13.trim()) {
        // Use original ISBN as key (most duplicates have identical strings)
        const key = book.isbn_13.trim()
        if (!isbn13Map.has(key)) isbn13Map.set(key, [])
        isbn13Map.get(key)!.push(book)
      }
    }
    for (const [key, groupBooks] of isbn13Map) {
      if (groupBooks.length > 1) {
        groups.push({
          type: 'isbn_13',
          label: `ISBN-13: ${key}`,
          key: `isbn13-${key}`,
          books: groupBooks,
        })
        groupBooks.forEach(b => usedInGroup.add(b.id))
      }
    }

    // 2. ISBN-10 matches (skip if already in ISBN-13 group)
    const isbn10Map = new Map<string, Book[]>()
    for (const book of books) {
      if (book.isbn_10 && book.isbn_10.trim() && !usedInGroup.has(book.id)) {
        const key = book.isbn_10.trim()
        if (!isbn10Map.has(key)) isbn10Map.set(key, [])
        isbn10Map.get(key)!.push(book)
      }
    }
    for (const [key, groupBooks] of isbn10Map) {
      if (groupBooks.length > 1) {
        groups.push({
          type: 'isbn_10',
          label: `ISBN-10: ${key}`,
          key: `isbn10-${key}`,
          books: groupBooks,
        })
        groupBooks.forEach(b => usedInGroup.add(b.id))
      }
    }

    // 3. OCLC matches
    const oclcMap = new Map<string, Book[]>()
    for (const book of books) {
      if (book.oclc_number && !usedInGroup.has(book.id)) {
        const key = book.oclc_number.trim()
        if (key) {
          if (!oclcMap.has(key)) oclcMap.set(key, [])
          oclcMap.get(key)!.push(book)
        }
      }
    }
    for (const [key, groupBooks] of oclcMap) {
      if (groupBooks.length > 1) {
        groups.push({
          type: 'oclc',
          label: `OCLC: ${key}`,
          key: `oclc-${key}`,
          books: groupBooks,
        })
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
    for (const [key, groupBooks] of exactTitleMap) {
      if (groupBooks.length > 1) {
        groups.push({
          type: 'exact_title',
          label: `Exact title: "${groupBooks[0].title}"`,
          key: `exact-${key}`,
          books: groupBooks,
        })
        groupBooks.forEach(b => usedInGroup.add(b.id))
      }
    }

    // 5. Fuzzy title matches
    const remainingBooks = books.filter(b => !usedInGroup.has(b.id))
    const fuzzyGroups: Map<string, { books: Book[], sim: number }> = new Map()
    
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
        const key = `fuzzy-${bookA.id}`
        fuzzyGroups.set(key, { books: matches, sim: lowestSim })
        matches.forEach(b => usedInGroup.add(b.id))
      }
    }
    
    for (const [key, { books: groupBooks, sim }] of fuzzyGroups) {
      groups.push({
        type: 'fuzzy_title',
        label: `Similar titles (${sim}%)`,
        key,
        similarity: sim,
        books: groupBooks,
      })
    }

    return groups
  }, [books, threshold, scanned])

  const totalDuplicateBooks = duplicateGroups.reduce((sum, g) => sum + g.books.length, 0)

  const handleScan = () => {
    setScanning(true)
    setSelected(new Set())
    // Small delay to show scanning state
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

    setDeleting(false)
    router.refresh()
  }

  const typeLabels: Record<string, string> = {
    isbn_13: 'ISBN-13 Match',
    isbn_10: 'ISBN-10 Match',
    oclc: 'OCLC Match',
    exact_title: 'Exact Title',
    fuzzy_title: 'Similar Title',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/books" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
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
          {/* Fuzzy threshold slider */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              Fuzzy threshold:
            </label>
            <input
              type="range"
              min={70}
              max={99}
              value={threshold}
              onChange={e => {
                setThreshold(Number(e.target.value))
                if (scanned) setScanned(false)
              }}
              className="w-32"
            />
            <span className="text-sm font-medium w-10">{threshold}%</span>
          </div>

          {/* Scan button */}
          <Button onClick={handleScan} disabled={scanning}>
            <Search className="w-4 h-4 mr-2" />
            {scanning ? 'Scanning...' : scanned ? 'Re-scan' : 'Scan Collection'}
          </Button>

          {/* Delete button */}
          {selected.size > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
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
        
        {/* Debug info */}
        <p className="text-xs text-muted-foreground">
          Total: {books.length} | 
          ISBN-13: {books.filter(b => b.isbn_13).length} | 
          ISBN-10: {books.filter(b => b.isbn_10).length} | 
          OCLC: {books.filter(b => b.oclc_number).length} | 
          Scanned: {scanned ? 'yes' : 'no'} | 
          Groups: {duplicateGroups.length}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          Sample ISBN: {books.find(b => b.isbn_13)?.isbn_13 || 'none'}
        </p>
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
            const someSelected = group.books.some(b => selected.has(b.id))

            return (
              <div key={group.key} className="border border-border">
                {/* Group header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCollapse(group.key)}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {typeLabels[group.type]}
                  </span>
                  <span className="font-medium flex-1">{group.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {group.books.length} books
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      allSelected ? deselectAllInGroup(group) : selectAllInGroup(group)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>

                {/* Group books */}
                {!isCollapsed && (
                  <div className="divide-y divide-border">
                    {group.books.map(book => (
                      <div
                        key={book.id}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted/20 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(book.id)}
                          onChange={() => toggleBook(book.id)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {book.title}
                            {book.subtitle && (
                              <span className="text-muted-foreground font-normal">
                                {' '}— {book.subtitle}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {[
                              book.author,
                              book.publication_year,
                              book.publisher_name,
                              book.condition_name,
                            ].filter(Boolean).join(' — ')}
                          </div>
                        </div>
                        <Link
                          href={`/books/${book.id}`}
                          target="_blank"
                          onClick={e => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="View book"
                        >
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
