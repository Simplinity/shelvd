'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { lookupIsbn } from '@/lib/actions/isbn-lookup'
import type { BookData } from '@/lib/isbn-providers/types'

// Fields we can enrich, with labels and how to extract from both book and lookup
const ENRICHABLE_FIELDS: {
  key: string
  label: string
  bookField: string       // key in the book record
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
  onApply: (updates: Record<string, string>) => void
}

export default function EnrichPanel({ book, onApply }: EnrichPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lookupData, setLookupData] = useState<BookData | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [rows, setRows] = useState<ComparisonRow[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [applied, setApplied] = useState(false)

  const isbn = book.isbn_13 || book.isbn_10

  const handleEnrich = async () => {
    if (!isbn) {
      setError('No ISBN available for lookup')
      setShowPanel(true)
      return
    }

    setLoading(true)
    setError(null)
    setApplied(false)

    try {
      const response = await lookupIsbn(isbn)

      if (!response.result?.success || !response.result.data) {
        setError(`No results found (tried: ${response.attempted.join(', ')})`)
        setShowPanel(true)
        setLoading(false)
        return
      }

      const data = response.result.data
      setLookupData(data)
      setProvider(response.result.provider)

      // Build comparison rows
      const newRows: ComparisonRow[] = []
      for (const field of ENRICHABLE_FIELDS) {
        let rawLookup = data[field.lookupField]
        const newValue = Array.isArray(rawLookup) ? rawLookup.join(', ') : String(rawLookup ?? '')
        const currentValue = String(book[field.bookField] ?? '')

        if (!newValue) continue // Provider has no data for this field

        const currentTrimmed = currentValue.trim()
        const newTrimmed = newValue.trim()

        if (!currentTrimmed && newTrimmed) {
          newRows.push({ key: field.key, label: field.label, bookField: field.bookField, currentValue: currentTrimmed, newValue: newTrimmed, status: 'new', checked: true })
        } else if (currentTrimmed !== newTrimmed) {
          newRows.push({ key: field.key, label: field.label, bookField: field.bookField, currentValue: currentTrimmed, newValue: newTrimmed, status: 'different', checked: false })
        }
        // same → skip
      }

      // Also check authors (special case — not a simple string field)
      if (data.authors && data.authors.length > 0) {
        const lookupAuthors = data.authors.join(', ')
        newRows.push({
          key: '_authors',
          label: 'Authors',
          bookField: '_authors',
          currentValue: '(see contributors below)',
          newValue: lookupAuthors,
          status: 'different',
          checked: false,
        })
      }

      setRows(newRows)
      setShowPanel(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed')
      setShowPanel(true)
    } finally {
      setLoading(false)
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

  const checkedCount = rows.filter(r => r.checked).length
  const newCount = rows.filter(r => r.status === 'new').length
  const diffCount = rows.filter(r => r.status === 'different').length

  return (
    <div className="mb-6">
      {/* Enrich button */}
      {!showPanel && (
        <Button
          type="button"
          variant="outline"
          onClick={handleEnrich}
          disabled={loading || !isbn}
          title={!isbn ? 'No ISBN available' : 'Search providers to fill missing fields'}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Enrich
        </Button>
      )}

      {/* Panel */}
      {showPanel && (
        <div className="border border-border bg-muted/30">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium text-sm">Enrich from {provider || 'providers'}</span>
              {rows.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {newCount > 0 && <span className="text-green-600">{newCount} new</span>}
                  {newCount > 0 && diffCount > 0 && ', '}
                  {diffCount > 0 && <span className="text-amber-600">{diffCount} different</span>}
                </span>
              )}
            </div>
            <button type="button" onClick={() => setShowPanel(false)} className="p-1 hover:bg-muted rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 text-sm text-red-600 border-b border-border">
              {error}
            </div>
          )}

          {/* Applied success */}
          {applied && (
            <div className="px-4 py-3 text-sm text-green-600 border-b border-border flex items-center gap-2">
              <Check className="w-4 h-4" /> Applied to form. Review and save when ready.
            </div>
          )}

          {/* Comparison rows */}
          {rows.length > 0 && !applied && (
            <div>
              {/* Actions bar */}
              <div className="px-4 py-2 border-b border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {newCount > 0 && (
                    <button type="button" onClick={selectAllNew} className="text-green-600 hover:underline">
                      Select all new ({newCount})
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  disabled={checkedCount === 0}
                >
                  Apply {checkedCount} {checkedCount === 1 ? 'field' : 'fields'}
                </Button>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {rows.map(row => (
                  <label
                    key={row.key}
                    className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 ${row.key === '_authors' ? 'opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={row.checked}
                      onChange={() => toggleRow(row.key)}
                      disabled={row.key === '_authors'}
                      className="mt-1 w-4 h-4"
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
                        <div className="text-xs text-muted-foreground truncate">
                          Current: {row.currentValue}
                        </div>
                      )}
                      <div className="text-sm truncate">
                        {row.newValue}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* No differences */}
          {rows.length === 0 && !error && !loading && (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              All fields already match the provider data. Nothing to enrich.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
