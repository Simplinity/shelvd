'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Loader2, Check, X, ExternalLink, Plus, Settings, ChevronLeft, BookOpen, ChevronDown, FolderOpen } from 'lucide-react'
import { lookupByFields, lookupDetails, lookupIsbn } from '@/lib/actions/isbn-lookup'
import { createClient } from '@/lib/supabase/client'
import { isProviderImplemented, supportsFieldSearch } from '@/lib/isbn-providers'
import type { BookData, ActiveProvider, SearchResultItem, SearchParams } from '@/lib/isbn-providers'

interface Props {
  activeProviders: ActiveProvider[]
}

const COUNTRY_FLAGS: Record<string, string> = {
  'US': '🇺🇸',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'GB': '🇬🇧',
  'NL': '🇳🇱',
  'BE': '🇧🇪',
  'ES': '🇪🇸',
  'IT': '🇮🇹',
}

type ViewState = 'search' | 'results' | 'detail'

export function LookupForm({ activeProviders }: Props) {
  const router = useRouter()
  
  // View state
  const [view, setView] = useState<ViewState>('search')
  
  // Search form
  const [selectedProvider, setSelectedProvider] = useState<string>(
    activeProviders.find(p => isProviderImplemented(p.code))?.code || ''
  )
  const [searchFields, setSearchFields] = useState<SearchParams>({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    yearFrom: '',
    yearTo: '',
  })
  
  // State
  const [searching, setSearching] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  
  // Detail view
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detail, setDetail] = useState<BookData | null>(null)
  const [detailProvider, setDetailProvider] = useState<string | null>(null)
  const [detailSourceUrl, setDetailSourceUrl] = useState<string | null>(null)
  
  // Available providers (implemented only)
  const implementedProviders = activeProviders.filter(p => isProviderImplemented(p.code))
  
  // Collections for picker
  const [collections, setCollections] = useState<{ id: string; name: string; is_default: boolean }[]>([])
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set())
  const [showCollectionPicker, setShowCollectionPicker] = useState(false)
  
  const pickerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch collections on mount
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('collections')
        .select('id, name, is_default, sort_order')
        .order('sort_order', { ascending: true })
      if (data) {
        setCollections(data as any)
        // Pre-select the default "Library" collection
        const defaultCol = data.find((c: any) => c.is_default)
        if (defaultCol) setSelectedCollections(new Set([(defaultCol as any).id]))
      }
    }
    load()
  }, [])

  // Click outside to close picker
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCollectionPicker(false)
      }
    }
    if (showCollectionPicker) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showCollectionPicker])

  const hasSearchInput = Object.values(searchFields).some(v => v && v.trim())
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSearchInput || !selectedProvider) return
    
    setSearching(true)
    setSearchError(null)
    setResults([])
    setHasMore(false)
    setDetail(null)
    
    try {
      // If only ISBN is filled, use the fast ISBN lookup
      const isIsbnOnly = searchFields.isbn?.trim() && 
        !searchFields.title?.trim() && 
        !searchFields.author?.trim() && 
        !searchFields.publisher?.trim() &&
        !searchFields.yearFrom?.trim() && 
        !searchFields.yearTo?.trim()
      
      if (isIsbnOnly) {
        // Direct ISBN lookup — returns single full result
        const response = await lookupIsbn(searchFields.isbn!.trim())
        if (response.result?.success && response.result.data) {
          // Go straight to detail view
          setDetail(response.result.data)
          setDetailProvider(response.result.provider)
          setDetailSourceUrl(response.result.source_url || null)
          setView('detail')
        } else {
          setSearchError('No results found for this ISBN')
          setView('results')
        }
      } else {
        // Multi-field search
        const response = await lookupByFields(
          {
            title: searchFields.title?.trim() || undefined,
            author: searchFields.author?.trim() || undefined,
            publisher: searchFields.publisher?.trim() || undefined,
            isbn: searchFields.isbn?.trim() || undefined,
            yearFrom: searchFields.yearFrom?.trim() || undefined,
            yearTo: searchFields.yearTo?.trim() || undefined,
          },
          selectedProvider
        )
        
        if (response.error) {
          setSearchError(response.error)
        }
        
        setResults(response.items)
        setTotalResults(response.total)
        setHasMore(!!response.hasMore)
        setView('results')
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
      setView('results')
    } finally {
      setSearching(false)
    }
  }
  
  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return
    
    setLoadingMore(true)
    try {
      const response = await lookupByFields(
        {
          title: searchFields.title?.trim() || undefined,
          author: searchFields.author?.trim() || undefined,
          publisher: searchFields.publisher?.trim() || undefined,
          isbn: searchFields.isbn?.trim() || undefined,
          yearFrom: searchFields.yearFrom?.trim() || undefined,
          yearTo: searchFields.yearTo?.trim() || undefined,
          offset: results.length,
        },
        selectedProvider
      )
      
      setResults(prev => [...prev, ...response.items])
      setTotalResults(response.total)
      setHasMore(!!response.hasMore)
    } catch (err) {
      // silently fail, user can try again
    } finally {
      setLoadingMore(false)
    }
  }
  
  const handleSelectResult = async (item: SearchResultItem) => {
    setLoadingDetail(true)
    
    try {
      // Try to get full details
      if (item.edition_key) {
        const result = await lookupDetails(item.edition_key, selectedProvider)
        if (result.success && result.data) {
          // Carry forward cover_url from search result if detail doesn't have one
          if (!result.data.cover_url && item.cover_url) result.data.cover_url = item.cover_url
          setDetail(result.data)
          setDetailProvider(result.provider)
          setDetailSourceUrl(result.source_url || null)
          setView('detail')
          return
        }
      }
      
      // Fallback: if we have an ISBN, use ISBN lookup
      const isbn = item.isbn_13 || item.isbn_10
      if (isbn) {
        const response = await lookupIsbn(isbn)
        if (response.result?.success && response.result.data) {
          // Carry forward cover_url from search result if lookup doesn't have one
          if (!response.result.data.cover_url && item.cover_url) response.result.data.cover_url = item.cover_url
          setDetail(response.result.data)
          setDetailProvider(response.result.provider)
          setDetailSourceUrl(response.result.source_url || null)
          setView('detail')
          return
        }
      }
      
      // Last resort: use the list item data as-is
      setDetail({
        title: item.title,
        subtitle: item.subtitle,
        authors: item.authors,
        publisher: item.publisher,
        publication_year: item.publication_year,
        isbn_13: item.isbn_13,
        isbn_10: item.isbn_10,
        cover_url: item.cover_url,
        format: item.format,
      })
      setDetailProvider(selectedProvider)
      setDetailSourceUrl(null)
      setView('detail')
    } catch (err) {
      setSearchError('Failed to load details')
    } finally {
      setLoadingDetail(false)
    }
  }
  
  const handleAddToCollection = () => {
    if (!detail) return
    
    sessionStorage.setItem('isbn_lookup_result', JSON.stringify({
      ...detail,
      lookup_provider: detailProvider,
      lookup_source_url: detailSourceUrl,
      selected_collection_ids: Array.from(selectedCollections),
    }))
    
    router.push('/books/add?from=lookup')
  }

  const toggleCollection = (id: string) => {
    setSelectedCollections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedCollectionNames = collections
    .filter(c => selectedCollections.has(c.id))
    .map(c => c.name)
  
  const handleBackToResults = () => {
    setDetail(null)
    setView('results')
  }
  
  const handleBackToSearch = () => {
    setResults([])
    setDetail(null)
    setSearchError(null)
    setHasMore(false)
    setView('search')
  }
  
  const handleFieldChange = (field: keyof SearchParams, value: string) => {
    setSearchFields(prev => ({ ...prev, [field]: value }))
  }
  
  const getProviderName = (code: string): string => {
    const provider = activeProviders.find(p => p.code === code)
    return provider?.name || code
  }
  
  return (
    <div className="space-y-6">
      {/* Search Form — always visible */}
      <form onSubmit={handleSearch} className="border border-border">
        {/* Provider selector */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
          <label className="text-sm font-medium whitespace-nowrap">Search in:</label>
          <select
            value={selectedProvider}
            onChange={e => setSelectedProvider(e.target.value)}
            className="flex-1 h-9 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
          >
            {implementedProviders.map(p => (
              <option key={p.code} value={p.code}>
                {p.country ? `${COUNTRY_FLAGS[p.country] || '🌐'} ` : '🌐 '}{p.name}
              </option>
            ))}
          </select>
          <Link href="/settings?tab=book-lookup" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Settings className="w-3 h-3" />
          </Link>
        </div>
        
        {/* Search fields */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
            <input
              type="text"
              value={searchFields.title}
              onChange={e => handleFieldChange('title', e.target.value)}
              placeholder="Book title"
              className="w-full h-9 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
              disabled={searching}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Author</label>
            <input
              type="text"
              value={searchFields.author}
              onChange={e => handleFieldChange('author', e.target.value)}
              placeholder="Author name"
              className="w-full h-9 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
              disabled={searching}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Publisher</label>
            <input
              type="text"
              value={searchFields.publisher}
              onChange={e => handleFieldChange('publisher', e.target.value)}
              placeholder="Publisher name"
              className="w-full h-9 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
              disabled={searching}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">ISBN</label>
            <input
              type="text"
              value={searchFields.isbn}
              onChange={e => handleFieldChange('isbn', e.target.value)}
              placeholder="ISBN-10 or ISBN-13"
              className="w-full h-9 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
              disabled={searching}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Publication Year</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchFields.yearFrom}
                onChange={e => handleFieldChange('yearFrom', e.target.value)}
                placeholder="From"
                className="w-24 h-9 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                disabled={searching}
                maxLength={4}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input
                type="text"
                value={searchFields.yearTo}
                onChange={e => handleFieldChange('yearTo', e.target.value)}
                placeholder="To"
                className="w-24 h-9 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                disabled={searching}
                maxLength={4}
              />
            </div>
          </div>
        </div>
        
        {/* Search button */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Fill in at least one field
          </p>
          <button
            type="submit"
            disabled={searching || !hasSearchInput || !selectedProvider}
            className="h-9 px-5 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
            ) : (
              <><Search className="w-4 h-4" /> Search</>
            )}
          </button>
        </div>
      </form>
      
      {/* Results List */}
      {view === 'results' && (
        <div>
          {searchError && results.length === 0 && (
            <div className="border border-border p-6 text-center">
              <X className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium">No results found</p>
              <p className="text-sm text-muted-foreground mt-1">{searchError}</p>
              <div className="mt-4">
                <Link
                  href="/books/add"
                  className="h-9 px-4 text-sm border border-border hover:bg-muted transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Manually
                </Link>
              </div>
            </div>
          )}
          
          {results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  {totalResults > results.length 
                    ? `Showing ${results.length} of ${totalResults} results`
                    : `${results.length} result${results.length !== 1 ? 's' : ''}`
                  } via {getProviderName(selectedProvider)}
                </p>
              </div>
              
              <div className="border border-border divide-y divide-border">
                {results.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectResult(item)}
                    disabled={loadingDetail}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 disabled:opacity-50"
                  >
                    {/* Cover thumbnail */}
                    <div className="flex-shrink-0 w-10 h-14 bg-muted border border-border flex items-center justify-center overflow-hidden">
                      {item.cover_url ? (
                        <img
                          src={item.cover_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      {item.authors && item.authors.length > 0 && (
                        <p className="text-sm text-muted-foreground truncate">
                          {item.authors.join(', ')}
                        </p>
                      )}
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                        {item.publisher && <span>{item.publisher}</span>}
                        {item.publication_year && <span>{item.publication_year}</span>}
                        {(item.isbn_13 || item.isbn_10) && (
                          <span>ISBN: {item.isbn_13 || item.isbn_10}</span>
                        )}
                      </div>
                    </div>
                    
                    {loadingDetail ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 rotate-180" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Load More */}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full mt-3 h-10 border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Loading more...</>
                  ) : (
                    <>Load more ({totalResults - results.length} remaining)</>  
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Detail View */}
      {view === 'detail' && detail && (
        <div className="border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              {results.length > 0 && (
                <button
                  onClick={handleBackToResults}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium">
                  {detailProvider ? `Found via ${getProviderName(detailProvider)}` : 'Book details'}
                </span>
              </div>
            </div>
            {detailSourceUrl && (
              <a
                href={detailSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                View source <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          
          {/* Book data */}
          <div className="p-4 space-y-4">
            <div className="flex gap-4">
              {detail.cover_url && (
                <div className="flex-shrink-0 text-center">
                  <img
                    src={detail.cover_url}
                    alt={detail.title}
                    className="w-24 h-auto border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <p className="text-[10px] text-green-600 font-medium mt-1">✓ Cover found</p>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{detail.title}</h2>
                {detail.subtitle && (
                  <p className="text-muted-foreground">{detail.subtitle}</p>
                )}
                {detail.authors && detail.authors.length > 0 && (
                  <p className="mt-1">by {detail.authors.join(', ')}</p>
                )}
                
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {detail.publisher && (
                    <div>
                      <span className="text-muted-foreground">Publisher:</span> {detail.publisher}
                    </div>
                  )}
                  {detail.publication_year && (
                    <div>
                      <span className="text-muted-foreground">Year:</span> {detail.publication_year}
                    </div>
                  )}
                  {detail.publication_place && (
                    <div>
                      <span className="text-muted-foreground">Place:</span> {detail.publication_place}
                    </div>
                  )}
                  {detail.pages && (
                    <div>
                      <span className="text-muted-foreground">Pages:</span> {detail.pages}
                    </div>
                  )}
                  {detail.language && (
                    <div>
                      <span className="text-muted-foreground">Language:</span> {detail.language}
                    </div>
                  )}
                  {detail.isbn_13 && (
                    <div>
                      <span className="text-muted-foreground">ISBN-13:</span> {detail.isbn_13}
                    </div>
                  )}
                  {detail.isbn_10 && (
                    <div>
                      <span className="text-muted-foreground">ISBN-10:</span> {detail.isbn_10}
                    </div>
                  )}
                  {detail.format && (
                    <div>
                      <span className="text-muted-foreground">Format:</span> {detail.format}
                    </div>
                  )}
                  {detail.pagination_description && (
                    <div>
                      <span className="text-muted-foreground">Pagination:</span> {detail.pagination_description}
                    </div>
                  )}
                  {detail.lccn && (
                    <div>
                      <span className="text-muted-foreground">LCCN:</span> {detail.lccn}
                    </div>
                  )}
                  {detail.oclc_number && (
                    <div>
                      <span className="text-muted-foreground">OCLC:</span> {detail.oclc_number}
                    </div>
                  )}
                  {detail.ddc && (
                    <div>
                      <span className="text-muted-foreground">DDC:</span> {detail.ddc}
                    </div>
                  )}
                  {detail.lcc && (
                    <div>
                      <span className="text-muted-foreground">LCC:</span> {detail.lcc}
                    </div>
                  )}
                  {detail.edition && (
                    <div>
                      <span className="text-muted-foreground">Edition:</span> {detail.edition}
                    </div>
                  )}
                  {detail.series && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Series:</span> {detail.series}
                      {detail.series_number && ` #${detail.series_number}`}
                    </div>
                  )}
                  {detail.subjects && detail.subjects.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Subjects:</span> {detail.subjects.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {detail.description && (
              <div className="text-sm text-muted-foreground border-t border-border pt-3">
                <p className="line-clamp-3">{detail.description}</p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-muted/30">
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setShowCollectionPicker(!showCollectionPicker)}
                className="h-9 px-3 text-sm border border-border bg-background hover:bg-muted transition-colors flex items-center gap-2"
              >
                <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                {selectedCollectionNames.length === 0
                  ? 'No collection'
                  : selectedCollectionNames.join(', ')}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {showCollectionPicker && (
                <div className="absolute bottom-full mb-1 left-0 w-56 border border-border bg-background shadow-lg z-10">
                  {collections.map(c => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.has(c.id)}
                        onChange={() => toggleCollection(c.id)}
                        className="rounded"
                      />
                      {c.name}
                      {c.is_default && <span className="text-xs text-muted-foreground">(default)</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleAddToCollection}
              disabled={selectedCollections.size === 0}
              className="h-10 px-6 bg-foreground text-background font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add to {selectedCollectionNames.length === 1 ? selectedCollectionNames[0] : 'Collections'}
            </button>
          </div>
        </div>
      )}
      
      {/* Manual add — show when on search view and not searching */}
      {view === 'search' && !searching && (
        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Can't find it? Enter details manually.
          </p>
          <Link
            href="/books/add"
            className="h-9 px-4 text-sm border border-border hover:bg-muted transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Book Manually
          </Link>
        </div>
      )}
    </div>
  )
}
