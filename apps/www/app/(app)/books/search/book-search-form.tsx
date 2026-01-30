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
  storage_location: '',
  shelf: '',
}

type Props = {
  languages: { id: string; name_en: string }[]
  conditions: { id: string; name: string }[]
}

export default function BookSearchForm({ languages, conditions }: Props) {
  const router = useRouter()
  const [fields, setFields] = useState<SearchFields>(emptyFields)
  const [searchMode, setSearchMode] = useState<SearchMode>('and')
  const [matchMode, setMatchMode] = useState<MatchMode>('fuzzy')

  const handleChange = (field: keyof SearchFields, value: string) => {
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

  // Search input component with red border when filled
  const SearchInput = ({ 
    label, 
    field, 
    placeholder = 'Search...' 
  }: { 
    label: string
    field: keyof SearchFields
    placeholder?: string 
  }) => {
    const hasValue = fields[field].trim().length > 0
    
    return (
      <div>
        <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
          {label}
        </label>
        <div className="relative">
          <input
            type="text"
            value={fields[field]}
            onChange={e => handleChange(field, e.target.value)}
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
              onClick={() => handleChange(field, '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Search select component
  const SearchSelect = ({ 
    label, 
    field, 
    options 
  }: { 
    label: string
    field: keyof SearchFields
    options: { value: string; label: string }[]
  }) => {
    const hasValue = fields[field].trim().length > 0
    
    return (
      <div>
        <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
          {label}
        </label>
        <select
          value={fields[field]}
          onChange={e => handleChange(field, e.target.value)}
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

  // Status options
  const statusOptions = [
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/30 to-background dark:from-red-950/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="mb-8 p-4 bg-muted/50 border border-dashed border-red-200 dark:border-red-900/50 flex flex-wrap items-center justify-between gap-4">
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

        {/* Search Fields */}
        <div className="space-y-8">
          {/* Title & Series */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Title & Series
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <SearchInput label="Title" field="title" placeholder="Search in title..." />
              </div>
              <SearchInput label="Subtitle" field="subtitle" placeholder="Search in subtitle..." />
              <SearchInput label="Original Title" field="original_title" placeholder="Search in original title..." />
              <div className="md:col-span-2">
                <SearchInput label="Series" field="series" placeholder="Search in series..." />
              </div>
            </div>
          </section>

          {/* Contributors */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Contributors
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <SearchInput label="Author / Contributor" field="author" placeholder="Search by author name..." />
            </div>
          </section>

          {/* Publication */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Publication
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchInput label="Publisher" field="publisher_name" placeholder="Search publisher..." />
              <SearchInput label="Place" field="publication_place" placeholder="Search place..." />
              <SearchInput label="Year" field="publication_year" placeholder="e.g. 1984 or 1980-1990" />
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
                options={languages.map(l => ({ value: l.id, label: l.name_en }))}
              />
              <SearchSelect 
                label="Condition" 
                field="condition" 
                options={conditions.map(c => ({ value: c.id, label: c.name }))}
              />
              <SearchSelect 
                label="Status" 
                field="status" 
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
              <SearchInput label="ISBN" field="isbn" placeholder="Search ISBN-10 or ISBN-13..." />
            </div>
          </section>

          {/* Storage */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-dashed border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-100">
              Storage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchInput label="Location" field="storage_location" placeholder="Search location..." />
              <SearchInput label="Shelf" field="shelf" placeholder="Search shelf..." />
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-dashed border-red-200 dark:border-red-900/50 flex justify-between items-center">
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
      </div>
    </div>
  )
}
