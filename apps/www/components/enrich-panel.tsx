'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, Check, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { lookupIsbn, lookupByFields, lookupDetails, getActiveProviders } from '@/lib/actions/isbn-lookup'
import type { BookData, ActiveProvider, SearchResultItem } from '@/lib/isbn-providers/types'
import { isProviderImplemented, supportsFieldSearch } from '@/lib/isbn-providers'

// Fields we can enrich, with labels and how to extract from both book and lookup
const ENRICHABLE_FIELDS: {
  key: string
  label: string
  bookField: string
  lookupField: keyof BookData
}[] = [
  { key: 'title', label: 'Title', bookField: 'title', lookupField: 'title' },
  { key: 'subtitle', label: 'Subtitle', bookField: 'subtitle', lookupField: 'subtitle' },
  { key: 'publisher_name', label: 'Publisher', bookField: 'publisher_name', lookupField: 'publisher' },
  { key: 'publication_year', label: 'Publication Year', bookField: 'publication_year', lookupField: 'publication_year' },
  { key: 'publication_place', label: 'Publication Place', bookField: 'publication_place', lookupField: 'publication_place' },
  { key: 'page_count', label: 'Pages', bookField: 'page_count', lookupField: 'pages' },
  { key: 'pagination_description', label: 'Pagination', bookField: 'pagination_description', lookupField: 'pagination_description' },
  { key: 'isbn_13', label: 'ISBN-13', bookField: 'isbn_13', lookupField: 'isbn_13' },
  { key: 'isbn_10', label: 'ISBN-10', bookField: 'isbn_10', lookupField: 'isbn_10' },
  { key: 'lccn', label: 'LCCN', bookField: 'lccn', lookupField: 'lccn' },
  { key: 'oclc_number', label: 'OCLC', bookField: 'oclc_number', lookupField: 'oclc_number' },
  { key: 'ddc', label: 'DDC', bookField: 'ddc', lookupField: 'ddc' },
  { key: 'lcc', label: 'LCC', bookField: 'lcc', lookupField: 'lcc' },
  { key: 'edition', label: 'Edition', bookField: 'edition', lookupField: 'edition' },
  { key: 'series', label: 'Series', bookField: 'series', lookupField: 'series' },
  { key: 'series_number', label: 'Series Number', bookField: 'series_number', lookupField: 'series_number' },
  { key: 'summary', label: 'Description', bookField: 'summary', lookupField: 'description' },
  { key: 'topic', label: 'Subjects', bookField: 'topic', lookupField: 'subjects' },
  { key: 'bibliography', label: 'Notes', bookField: 'bibliography', lookupField: 'notes' },
]

type ComparisonRow = {
  key: string
  label: string
  bookField: string
  currentValue: string
  newValue: string
  status: 'new' | 'different' | 'same'
  checked: boolean
}

type EnrichPanelProps = {
  book: Record<string, any>
  authorName?: string  // First author for fallback search
  onApply: (updates: Record<string, string>) => void
}

function buildRows(book: Record<string, any>, data: BookData): ComparisonRow[] {
  const rows: ComparisonRow[] = []
  for (const field of ENRICHABLE_FIELDS) {
    let rawLookup = data[field.lookupField]
    const newValue = Array.isArray(rawLookup) ? rawLookup.join(', ') : String(rawLookup ?? '')
    const currentValue = String(book[field.bookField] ?? '')

    if (!newValue) continue

    const currentTrimmed = currentValue.trim()
    const newTrimmed = newValue.trim()

    if (!currentTrimmed && newTrimmed) {
      rows.push({ key: field.key, label: field.label, bookField: field.bookField, currentValue: currentTrimmed, newValue: newTrimmed, status: 'new', checked: true })
    } else if (currentTrimmed !== newTrimmed) {
      rows.push({ key: field.key, label: field.label, bookField: field.bookField, currentValue: currentTrimmed, newValue: newTrimmed, status: 'different', checked: false })
    }
  }

  // Authors (info only)
  if (data.authors && data.authors.length > 0) {
    rows.push({
      key: '_authors', label: 'Authors', bookField: '_authors',
      currentValue: '(see contributors)', newValue: data.authors.join(', '),
      status: 'different', checked: false,
    })
  }

  return rows
}

export default function EnrichPanel({ book, authorName, onApply }: EnrichPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [rows, setRows] = useState<ComparisonRow[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [applied, setApplied] = useState(false)

  // Fallback search state
  const [mode, setMode] = useState<'idle' | 'search' | 'results' | 'compare'>('idle')
  const [providers, setProviders] = useState<ActiveProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [searchTitle, setSearchTitle] = useState('')
  const [searchAuthor, setSearchAuthor] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [searching, setSearching] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const isbn = book.isbn_13 || book.isbn_10

  // Load providers for fallback search
  const loadProviders = async () => {
    const active = await getActiveProviders()
    const fieldSearch = active
      .filter(p => p.is_active && isProviderImplemented(p.code) && supportsFieldSearch(p.code))
      .sort((a, b) => a.priority - b.priority)
    setProviders(fieldSearch)
    if (fieldSearch.length > 0) setSelectedProvider(fieldSearch[0].code)
  }

  const handleEnrichByIsbn = async () => {
    setLoading(true)
    setError(null)
    setApplied(false)
    setShowPanel(true)

    try {
      const response = await lookupIsbn(isbn)

      if (!response.result?.success || !response.result.data) {
        setError(`No results found (tried: ${response.attempted.join(', ')})`)
        setLoading(false)
        return
      }

      setProvider(response.result.provider)
      setRows(buildRows(book, response.result.data))
      setMode('compare')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenSearch = async () => {
    setShowPanel(true)
    setApplied(false)
    setError(null)
    setSearchTitle(book.title || '')
    setSearchAuthor(authorName || '')
    setSearchResults([])
    if (providers.length === 0) await loadProviders()
    setMode('search')
  }

  const handleFieldSearch = async () => {
    if (!searchTitle.trim() && !searchAuthor.trim()) return
    setSearching(true)
    setError(null)

    try {
      const response = await lookupByFields(
        { title: searchTitle.trim() || undefined, author: searchAuthor.trim() || undefined },
        selectedProvider
      )
      if (response.error) setError(response.error)
      setSearchResults(response.items || [])
      setMode('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handlePickResult = async (item: SearchResultItem) => {
    if (!item.editionKey) return
    setLoadingDetail(true)
    setError(null)

    try {
      const response = await lookupDetails(item.editionKey, item.provider || selectedProvider)
      if (response.success && response.data) {
        setProvider(response.provider)
        setRows(buildRows(book, response.data))
        setMode('compare')
      } else {
        setError(response.error || 'Could not load details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details')
    } finally {
      setLoadingDetail(false)
    }
  }

  const toggleRow = (key: string) => {
    setRows(prev => prev.map(r => r.key === key ? { ...r, checked: !r.checked } : r))
  }

  const selectAllNew = () => {
    setRows(prev => prev.map(r => r.status === 'new' ? { ...r, checked: true } : r))
  }

  const handleApply = () => {
    const updates: Record<string, string> = {}
    for (const row of rows) {
      if (row.checked && row.key !== '_authors') {
        updates[row.bookField] = row.newValue
      }
    }
    onApply(updates)
    setApplied(true)
  }

  const handleClose = () => {
    setShowPanel(false)
    setMode('idle')
    setRows([])
    setSearchResults([])
    setError(null)
    setApplied(false)
  }

  const checkedCount = rows.filter(r => r.checked).length
  const newCount = rows.filter(r => r.status === 'new').length
  const diffCount = rows.filter(r => r.status === 'different').length

  // Not open yet — show button(s)
  if (!showPanel) {
    return (
      <div className="mb-6 flex items-center gap-2">
        {isbn ? (
          <Button type="button" variant="outline" onClick={handleEnrichByIsbn} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Enrich
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={handleOpenSearch}>
            <Search className="w-4 h-4 mr-2" /> Enrich (search)
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="mb-6 border border-border bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium text-sm">
            {mode === 'compare' ? `Enrich from ${provider || 'provider'}` : 'Enrich — Search'}
          </span>
          {mode === 'compare' && rows.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {newCount > 0 && <span className="text-green-600">{newCount} new</span>}
              {newCount > 0 && diffCount > 0 && ', '}
              {diffCount > 0 && <span className="text-amber-600">{diffCount} different</span>}
            </span>
          )}
        </div>
        <button type="button" onClick={handleClose} className="p-1 hover:bg-muted rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 text-sm text-red-600 border-b border-border">{error}</div>
      )}

      {/* Loading (ISBN lookup) */}
      {loading && (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          Searching providers...
        </div>
      )}

      {/* Search form (no-ISBN fallback) */}
      {(mode === 'search' || mode === 'results') && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
              <input
                type="text" value={searchTitle} onChange={e => setSearchTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleFieldSearch())}
                className="w-full px-3 py-1.5 text-sm border border-border bg-background"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Author</label>
              <input
                type="text" value={searchAuthor} onChange={e => setSearchAuthor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleFieldSearch())}
                className="w-full px-3 py-1.5 text-sm border border-border bg-background"
              />
            </div>
            <div className="w-40">
              <label className="text-xs text-muted-foreground mb-1 block">Provider</label>
              <select
                value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-border bg-background"
              >
                {providers.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <Button type="button" size="sm" onClick={handleFieldSearch} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Search results */}
      {mode === 'results' && searchResults.length > 0 && (
        <div className="max-h-64 overflow-y-auto divide-y divide-border">
          {searchResults.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePickResult(item)}
              disabled={loadingDetail}
              className="w-full text-left px-4 py-2.5 hover:bg-muted/50 flex items-start gap-3"
            >
              {item.thumbnail && (
                <img src={item.thumbnail} alt="" className="w-8 h-12 object-cover flex-shrink-0 bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.title}</div>
                {item.author && <div className="text-xs text-muted-foreground truncate">{item.author}</div>}
                <div className="text-xs text-muted-foreground">
                  {[item.publisher, item.year].filter(Boolean).join(' · ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {mode === 'results' && searchResults.length === 0 && !searching && !error && (
        <div className="px-4 py-6 text-sm text-muted-foreground text-center">No results found.</div>
      )}

      {/* Loading detail */}
      {loadingDetail && (
        <div className="px-4 py-4 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
          Loading details...
        </div>
      )}

      {/* Applied success */}
      {applied && (
        <div className="px-4 py-3 text-sm text-green-600 border-b border-border flex items-center gap-2">
          <Check className="w-4 h-4" /> Applied to form. Review and save when ready.
        </div>
      )}

      {/* Comparison rows */}
      {mode === 'compare' && rows.length > 0 && !applied && (
        <div>
          <div className="px-4 py-2 border-b border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {newCount > 0 && (
                <button type="button" onClick={selectAllNew} className="text-green-600 hover:underline">
                  Select all new ({newCount})
                </button>
              )}
            </div>
            <Button type="button" size="sm" onClick={handleApply} disabled={checkedCount === 0}>
              Apply {checkedCount} {checkedCount === 1 ? 'field' : 'fields'}
            </Button>
          </div>

          <div className="divide-y divide-border">
            {rows.map(row => (
              <label
                key={row.key}
                className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 ${row.key === '_authors' ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox" checked={row.checked} onChange={() => toggleRow(row.key)}
                  disabled={row.key === '_authors'} className="mt-1 w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium">{row.label}</span>
                    {row.status === 'new' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 font-medium">NEW</span>
                    )}
                    {row.status === 'different' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 font-medium">DIFFERENT</span>
                    )}
                  </div>
                  {row.status === 'different' && row.currentValue && (
                    <div className="text-xs text-muted-foreground truncate">Current: {row.currentValue}</div>
                  )}
                  <div className="text-sm truncate">{row.newValue}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* No differences */}
      {mode === 'compare' && rows.length === 0 && !error && !loading && (
        <div className="px-4 py-6 text-sm text-muted-foreground text-center">
          All fields already match. Nothing to enrich.
        </div>
      )}

      {/* Try another provider */}
      {(mode === 'compare' || (mode === 'results' && searchResults.length === 0 && !searching)) && (
        <div className="px-4 py-2.5 border-t border-border text-center">
          <button
            type="button"
            onClick={async () => {
              setApplied(false)
              setError(null)
              setSearchTitle(book.title || '')
              setSearchAuthor(authorName || '')
              setSearchResults([])
              if (providers.length === 0) await loadProviders()
              setMode('search')
            }}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Search other providers
          </button>
        </div>
      )}
    </div>
  )
}
