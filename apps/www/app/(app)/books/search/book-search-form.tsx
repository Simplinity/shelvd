'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SearchMode = 'and' | 'or'
type MatchMode = 'fuzzy' | 'exact'

type SearchFields = {
  title: string
  subtitle: string
  original_title: string
  series: string
  author: string
  publisher_name: string
  publication_place: string
  publication_year: string
  language: string
  condition: string
  status: string
  isbn: string
  user_catalog_id: string
  storage_location: string
  shelf: string
}

const emptyFields: SearchFields = {
  title: '',
  subtitle: '',
  original_title: '',
  series: '',
  author: '',
  publisher_name: '',
  publication_place: '',
  publication_year: '',
  language: '',
  condition: '',
  status: '',
  isbn: '',
  user_catalog_id: '',
  storage_location: '',
  shelf: '',
}

// Search input component - defined outside to prevent re-creation
function SearchInput({ 
  label, 
  field,
  value,
  onChange,
  placeholder = 'Search...' 
}: { 
  label: string
  field: string
  value: string
  onChange: (field: string, value: string) => void
  placeholder?: string 
}) {
  const hasValue = value.trim().length > 0
  
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          className={`
            w-full h-10 px-3 py-2 text-sm bg-background
            border-2 border-dashed transition-all duration-200
            focus:outline-none focus:border-solid
            ${hasValue 
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
              : 'border-border/50 focus:border-foreground'
            }
          `}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => onChange(field, '')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Search select component - defined outside to prevent re-creation
function SearchSelect({ 
  label, 
  field,
  value,
  onChange,
  options 
}: { 
  label: string
  field: string
  value: string
  onChange: (field: string, value: string) => void
  options: { value: string; label: string }[]
}) {
  const hasValue = value.trim().length > 0
  
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(field, e.target.value)}
        className={`
          w-full h-10 px-3 py-2 text-sm bg-background
          border-2 border-dashed transition-all duration-200
          focus:outline-none focus:border-solid
          ${hasValue 
            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 focus:border-red-500' 
            : 'border-border/50 focus:border-foreground'
          }
        `}
      >
        <option value="">Any...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

type Props = {
  languages: { id: string; name_en: string }[]
  conditions: { id: string; name: string }[]
  initialValues?: SearchFields
  initialMode?: SearchMode
  initialMatch?: MatchMode
}

export default function BookSearchForm({ 
  languages, 
  conditions,
  initialValues,
  initialMode = 'and',
  initialMatch = 'fuzzy'
}: Props) {
  const router = useRouter()
  const [fields, setFields] = useState<SearchFields>(initialValues || emptyFields)
  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode)
  const [matchMode, setMatchMode] = useState<MatchMode>(initialMatch)

  const handleChange = (field: string, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }))
  }

  const handleClear = () => {
    setFields(emptyFields)
  }

  const activeFieldCount = Object.values(fields).filter(v => v.trim()).length

  const handleSearch = () => {
    // Build query params
    const params = new URLSearchParams()
    
    Object.entries(fields).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim())
      }
    })
    
    if (activeFieldCount > 0) {
      params.set('mode', searchMode)
      params.set('match', matchMode)
    }
    
    router.push(`/books?${params.toString()}`)
  }

  // Status options
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'in_collection', label: 'In Collection' },
    { value: 'lent', label: 'Lent' },
    { value: 'borrowed', label: 'Borrowed' },
    { value: 'double', label: 'Double' },
    { value: 'to_sell', label: 'To Sell' },
    { value: 'on_sale', label: 'On Sale' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'sold', label: 'Sold' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'lost', label: 'Lost' },
    { value: 'donated', label: 'Donated' },
    { value: 'destroyed', label: 'Destroyed' },
  ]

  // Search buttons component (used both top and bottom)
  const SearchButtons = () => (
    <div className="flex justify-between items-center">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleClear}
        disabled={activeFieldCount === 0}
      >
        <X className="w-4 h-4 mr-2" />
        Clear All
      </Button>
      <Button 
        type="button"
        onClick={handleSearch}
        disabled={activeFieldCount === 0}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <Search className="w-4 h-4 mr-2" />
        Search {activeFieldCount > 0 && `(${activeFieldCount} field${activeFieldCount !== 1 ? 's' : ''})`}
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/30 to-background dark:from-red-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/books"
            className="p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Search className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Search Books</h1>
              <p className="text-sm text-muted-foreground">
                Fill in any fields to find matching books
              </p>
            </div>
          </div>
        </div>

        {/* Search Mode Toggle Bar */}
        <div className="mb-6 p-4 bg-muted/50 border border-dashed border-red-200 dark:border-red-900/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {/* AND/OR Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Combine:</span>
              <button
                type="button"
                onClick={() => setSearchMode('and')}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                  ${searchMode === 'and' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30'
                  }
                `}
              >
                AND
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('or')}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                  ${searchMode === 'or' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30'
                  }
                `}
              >
                OR
              </button>
            </div>

            {/* Fuzzy/Exact Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Match:</span>
              <button
                type="button"
                onClick={() => setMatchMode('fuzzy')}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                  ${matchMode === 'fuzzy' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30'
                  }
                `}
              >
                Contains
              </button>
              <button
                type="button"
                onClick={() => setMatchMode('exact')}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                  ${matchMode === 'exact' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30'
                  }
                `}
              >
                Exact
              </button>
            </div>
          </div>

          {/* Active filters count */}
          {activeFieldCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                {activeFieldCount} field{activeFieldCount !== 1 ? 's' : ''} active
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Search buttons at TOP */}
        <div className="mb-8 pt-4 border-t border-dashed border-red-200 dark:border-red-900/50">
          <SearchButtons />
          {/* Tip for empty/not-empty search */}
          <p className="mt-3 text-xs text-muted-foreground text-center">
            💡 Tip: Type <code className="px-1 py-0.5 bg-muted rounded font-mono">=</code> to find empty fields, <code className="px-1 py-0.5 bg-muted rounded font-mono">!=</code> to find non-empty fields
          </p>
        </div>

        {/* Search Fields */}
        <div className="space-y-8">
          {/* Title & Series */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Title & Series
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <SearchInput label="Title" field="title" value={fields.title} onChange={handleChange} placeholder="Search in title..." />
              </div>
              <SearchInput label="Subtitle" field="subtitle" value={fields.subtitle} onChange={handleChange} placeholder="Search in subtitle..." />
              <SearchInput label="Original Title" field="original_title" value={fields.original_title} onChange={handleChange} placeholder="Search in original title..." />
              <div className="md:col-span-2">
                <SearchInput label="Series" field="series" value={fields.series} onChange={handleChange} placeholder="Search in series..." />
              </div>
            </div>
          </section>

          {/* Contributors */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Contributors
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <SearchInput label="Author / Contributor" field="author" value={fields.author} onChange={handleChange} placeholder="Search by author name..." />
            </div>
          </section>

          {/* Publication */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Publication
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchInput label="Publisher" field="publisher_name" value={fields.publisher_name} onChange={handleChange} placeholder="Search publisher..." />
              <SearchInput label="Place" field="publication_place" value={fields.publication_place} onChange={handleChange} placeholder="Search place..." />
              <SearchInput label="Year" field="publication_year" value={fields.publication_year} onChange={handleChange} placeholder="e.g. 1984 or 1980-1990" />
            </div>
          </section>

          {/* Classification */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Classification & Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchSelect 
                label="Language" 
                field="language"
                value={fields.language}
                onChange={handleChange}
                options={languages.map(l => ({ value: l.id, label: l.name_en }))}
              />
              <SearchSelect 
                label="Condition" 
                field="condition"
                value={fields.condition}
                onChange={handleChange}
                options={conditions.map(c => ({ value: c.id, label: c.name }))}
              />
              <SearchSelect 
                label="Status" 
                field="status"
                value={fields.status}
                onChange={handleChange}
                options={statusOptions}
              />
            </div>
          </section>

          {/* Identifiers */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Identifiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchInput label="ISBN" field="isbn" value={fields.isbn} onChange={handleChange} placeholder="Search ISBN-10 or ISBN-13..." />
              <SearchInput label="Catalog Number" field="user_catalog_id" value={fields.user_catalog_id} onChange={handleChange} placeholder="Search catalog number..." />
            </div>
          </section>

          {/* Storage */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Storage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchInput label="Location" field="storage_location" value={fields.storage_location} onChange={handleChange} placeholder="Search location..." />
              <SearchInput label="Shelf" field="shelf" value={fields.shelf} onChange={handleChange} placeholder="Search shelf..." />
            </div>
          </section>
        </div>

        {/* Search buttons at BOTTOM */}
        <div className="mt-8 pt-6 border-t border-dashed border-red-200 dark:border-red-900/50">
          <SearchButtons />
        </div>
      </div>
    </div>
  )
}
