'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Loader2, Check, X, ExternalLink, Plus, ArrowLeft, Settings } from 'lucide-react'
import { lookupIsbn } from '@/lib/actions/isbn-lookup'
import { isProviderImplemented } from '@/lib/isbn-providers'
import type { BookData, ActiveProvider } from '@/lib/isbn-providers'

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

export function LookupForm({ activeProviders }: Props) {
  const router = useRouter()
  const [isbn, setIsbn] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<BookData | null>(null)
  const [foundProvider, setFoundProvider] = useState<string | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [attempted, setAttempted] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [noResult, setNoResult] = useState(false)
  
  // Filter to only show implemented and active providers
  const implementedProviders = activeProviders.filter(p => isProviderImplemented(p.code))
  const notImplementedCount = activeProviders.filter(p => p.is_active && !isProviderImplemented(p.code)).length
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanIsbn = isbn.trim().replace(/[-\s]/g, '')
    if (!cleanIsbn) return
    
    // Validate ISBN format
    if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
      setErrors({ validation: 'ISBN must be 10 or 13 digits' })
      return
    }
    
    setSearching(true)
    setResult(null)
    setFoundProvider(null)
    setSourceUrl(null)
    setAttempted([])
    setErrors({})
    setNoResult(false)
    
    try {
      const response = await lookupIsbn(cleanIsbn)
      
      setAttempted(response.attempted)
      setErrors(response.errors)
      
      if (response.result?.success && response.result.data) {
        setResult(response.result.data)
        setFoundProvider(response.result.provider)
        setSourceUrl(response.result.source_url || null)
      } else {
        setNoResult(true)
      }
    } catch (err) {
      setErrors({ search: err instanceof Error ? err.message : 'Search failed' })
      setNoResult(true)
    } finally {
      setSearching(false)
    }
  }
  
  const handleAddToCollection = () => {
    if (!result) return
    
    // Store the result in sessionStorage for the add page to pick up
    sessionStorage.setItem('isbn_lookup_result', JSON.stringify({
      ...result,
      lookup_provider: foundProvider,
      lookup_source_url: sourceUrl,
    }))
    
    router.push('/books/add?from=lookup')
  }
  
  const getProviderName = (code: string): string => {
    const provider = activeProviders.find(p => p.code === code)
    return provider?.name || code
  }
  
  return (
    <div className="space-y-8">
      {/* Search form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={isbn}
              onChange={e => setIsbn(e.target.value)}
              placeholder="Enter ISBN (10 or 13 digits)"
              className="w-full h-12 px-4 text-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
              disabled={searching}
            />
          </div>
          <button
            type="submit"
            disabled={searching || !isbn.trim()}
            className="h-12 px-6 bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</>
            ) : (
              <><Search className="w-5 h-5" /> Search</>
            )}
          </button>
        </div>
        
        {/* Active providers indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Searching:</span>
          <div className="flex gap-1">
            {implementedProviders.slice(0, 5).map(p => (
              <span key={p.code} title={p.name} className="inline-block">
                {p.country ? COUNTRY_FLAGS[p.country] || '🌐' : '🌐'}
              </span>
            ))}
            {implementedProviders.length > 5 && (
              <span>+{implementedProviders.length - 5}</span>
            )}
          </div>
          {notImplementedCount > 0 && (
            <span className="text-xs">({notImplementedCount} providers not yet available)</span>
          )}
          <Link href="/settings?tab=isbn-lookup" className="ml-auto text-xs hover:underline flex items-center gap-1">
            <Settings className="w-3 h-3" /> Configure
          </Link>
        </div>
      </form>
      
      {/* Search progress */}
      {searching && (
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching providers...
          </div>
        </div>
      )}
      
      {/* Attempted providers */}
      {!searching && attempted.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <span>Searched: </span>
          {attempted.map((code, i) => (
            <span key={code}>
              {i > 0 && ' → '}
              <span className={errors[code] ? 'text-red-500' : foundProvider === code ? 'text-green-600 font-medium' : ''}>
                {getProviderName(code)}
                {errors[code] && !result && ` (${errors[code]})`}
                {foundProvider === code && ' ✓'}
              </span>
            </span>
          ))}
        </div>
      )}
      
      {/* Validation error */}
      {errors.validation && (
        <div className="border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {errors.validation}
        </div>
      )}
      
      {/* No result */}
      {noResult && !errors.validation && (
        <div className="border border-border p-6 text-center">
          <X className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-medium">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">
            This ISBN was not found in any of the active providers.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              href="/books/add"
              className="h-9 px-4 text-sm border border-border hover:bg-muted transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Manually
            </Link>
            <Link
              href="/settings?tab=isbn-lookup"
              className="h-9 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Enable more providers
            </Link>
          </div>
        </div>
      )}
      
      {/* Result preview */}
      {result && (
        <div className="border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium">Found via {getProviderName(foundProvider || '')}</span>
            </div>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                View source <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          
          {/* Book data preview */}
          <div className="p-4 space-y-4">
            <div className="flex gap-4">
              {/* Cover */}
              {result.cover_url && (
                <div className="flex-shrink-0">
                  <img
                    src={result.cover_url}
                    alt={result.title}
                    className="w-24 h-auto border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{result.title}</h2>
                {result.subtitle && (
                  <p className="text-muted-foreground">{result.subtitle}</p>
                )}
                {result.authors && result.authors.length > 0 && (
                  <p className="mt-1">by {result.authors.join(', ')}</p>
                )}
                
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {result.publisher && (
                    <div>
                      <span className="text-muted-foreground">Publisher:</span> {result.publisher}
                    </div>
                  )}
                  {result.publication_year && (
                    <div>
                      <span className="text-muted-foreground">Year:</span> {result.publication_year}
                    </div>
                  )}
                  {result.pages && (
                    <div>
                      <span className="text-muted-foreground">Pages:</span> {result.pages}
                    </div>
                  )}
                  {result.language && (
                    <div>
                      <span className="text-muted-foreground">Language:</span> {result.language}
                    </div>
                  )}
                  {result.isbn_13 && (
                    <div>
                      <span className="text-muted-foreground">ISBN-13:</span> {result.isbn_13}
                    </div>
                  )}
                  {result.isbn_10 && (
                    <div>
                      <span className="text-muted-foreground">ISBN-10:</span> {result.isbn_10}
                    </div>
                  )}
                  {result.publication_place && (
                    <div>
                      <span className="text-muted-foreground">Place:</span> {result.publication_place}
                    </div>
                  )}
                  {result.format && (
                    <div>
                      <span className="text-muted-foreground">Format:</span> {result.format}
                    </div>
                  )}
                  {result.pagination_description && (
                    <div>
                      <span className="text-muted-foreground">Pagination:</span> {result.pagination_description}
                    </div>
                  )}
                  {result.lccn && (
                    <div>
                      <span className="text-muted-foreground">LCCN:</span> {result.lccn}
                    </div>
                  )}
                  {result.oclc_number && (
                    <div>
                      <span className="text-muted-foreground">OCLC:</span> {result.oclc_number}
                    </div>
                  )}
                  {result.ddc && (
                    <div>
                      <span className="text-muted-foreground">DDC:</span> {result.ddc}
                    </div>
                  )}
                  {result.lcc && (
                    <div>
                      <span className="text-muted-foreground">LCC:</span> {result.lcc}
                    </div>
                  )}
                  {result.series && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Series:</span> {result.series}
                      {result.series_number && ` #${result.series_number}`}
                    </div>
                  )}
                  {result.subjects && result.subjects.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Subjects:</span> {result.subjects.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            {result.description && (
              <div className="text-sm text-muted-foreground border-t border-border pt-3">
                <p className="line-clamp-3">{result.description}</p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Book will be added with status <span className="font-medium text-foreground">Draft</span>
            </p>
            <button
              onClick={handleAddToCollection}
              className="h-10 px-6 bg-foreground text-background font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add to Collection
            </button>
          </div>
        </div>
      )}
      
      {/* Manual add link */}
      {!result && !searching && !noResult && (
        <div className="text-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Don't have an ISBN or prefer to enter details manually?
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
