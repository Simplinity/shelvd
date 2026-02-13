'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatInteger, formatCurrency as fmtCurr } from '@/lib/format'
import { BookOpen, Plus, LayoutGrid, List, Loader2, Trash2, X, CheckSquare, Search, SlidersHorizontal, Clock, History, ChevronUp, ChevronDown, ArrowUpDown, Upload, Download, Copy, FolderPlus, FolderMinus } from 'lucide-react'
import { LimitGate } from '@/components/feature-gate'
import { OnboardingChecklistLoader } from '@/components/onboarding/onboarding-checklist-loader'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Recent Searches types and helpers
type RecentSearch = {
  id: string
  type: 'global' | 'advanced'
  label: string
  url: string
  timestamp: number
  resultCount?: number
}

const RECENT_SEARCHES_KEY = 'shelvd_recent_searches'
const MAX_RECENT_SEARCHES = 10

const getRecentSearches = (): RecentSearch[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveRecentSearch = (search: Omit<RecentSearch, 'id' | 'timestamp'>) => {
  if (typeof window === 'undefined') return
  try {
    const searches = getRecentSearches()
    // Remove duplicates by URL
    const filtered = searches.filter(s => s.url !== search.url)
    const newSearch: RecentSearch = {
      ...search,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }
    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

const removeRecentSearch = (id: string) => {
  if (typeof window === 'undefined') return
  try {
    const searches = getRecentSearches()
    const filtered = searches.filter(s => s.id !== id)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered))
  } catch {
    // Ignore storage errors
  }
}

const clearAllRecentSearches = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Ignore storage errors
  }
}

type BookListItem = {
  id: string
  title: string
  subtitle: string | null
  original_title: string | null
  publication_year: string | null
  publication_place: string | null
  publisher: string | null
  status: string
  cover_type: string | null
  condition_id: string | null
  language_id: string | null
  storage_location: string | null
  shelf: string | null
  isbn_13: string | null
  isbn_10: string | null
  series: string | null
  user_catalog_id: string | null
  cover_image_url: string | null
  contributors: { name: string; role: string }[]
}

const ITEMS_PER_PAGE = 250

// Sortable fields
type SortField = 'title' | 'author' | 'publisher' | 'place' | 'year' | 'status'
type SortDirection = 'asc' | 'desc'

// Helper: Check if filter value is empty/not-empty syntax
const isEmptySearch = (value: string) => value === '='
const isNotEmptySearch = (value: string) => value === '!='
const isSpecialSearch = (value: string) => isEmptySearch(value) || isNotEmptySearch(value)

// Helper: Apply text field filter with support for =, !=, and normal search
const applyTextFilter = (
  query: any,
  field: string,
  value: string,
  isExact: boolean
) => {
  if (isEmptySearch(value)) {
    // Empty: NULL or empty string
    return query.or(`${field}.is.null,${field}.eq.`)
  } else if (isNotEmptySearch(value)) {
    // Not empty: NOT NULL and NOT empty string
    return query.not(field, 'is', null).neq(field, '')
  } else {
    // Normal search
    return isExact 
      ? query.ilike(field, value)
      : query.ilike(field, `%${value}%`)
  }
}

// Helper: Get OR condition string for text field
const getOrCondition = (field: string, value: string, isExact: boolean): string | null => {
  if (isEmptySearch(value)) {
    return `${field}.is.null,${field}.eq.`
  } else if (isNotEmptySearch(value)) {
    // Can't easily do NOT conditions in OR mode, skip for now
    return null
  } else {
    return isExact 
      ? `${field}.ilike.${value}`
      : `${field}.ilike.%${value}%`
  }
}

const SEARCH_FIELDS = [
  'title', 'subtitle', 'original_title', 'series', 'author',
  'publisher_name', 'publication_place', 'publication_year',
  'language', 'condition', 'status', 'isbn', 'storage_location', 'shelf'
]

export default function BooksPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [books, setBooks] = useState<BookListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [page, setPage] = useState(0)
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // Global search input state
  const [globalSearchInput, setGlobalSearchInput] = useState('')
  
  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [showRecentSearches, setShowRecentSearches] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exporting, setExporting] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Bulk collection actions
  type CollectionOption = { id: string; name: string; is_default: boolean }
  const [bulkCollections, setBulkCollections] = useState<CollectionOption[]>([])
  const [showAddToCollectionMenu, setShowAddToCollectionMenu] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const addToCollectionMenuRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  // Get collection filter from URL
  const collectionId = searchParams.get('collection') || ''
  const [collectionName, setCollectionName] = useState<string | null>(null)
  const [userLocale, setUserLocale] = useState('en-GB')
  const tagId = searchParams.get('tag') || ''
  const [tagName, setTagName] = useState<string | null>(null)

  // Value summary
  type ValueSummary = { totalAcquired: number; totalEstimated: number; bookCount: number; currency: string }
  const [valueSummary, setValueSummary] = useState<ValueSummary | null>(null)

  // Get global search query from URL
  const globalSearchQuery = searchParams.get('q') || ''

  // Get advanced filters from URL
  const getActiveFilters = () => {
    const filters: Record<string, string> = {}
    SEARCH_FIELDS.forEach(field => {
      const value = searchParams.get(field)
      if (value) filters[field] = value
    })
    return filters
  }

  const activeFilters = getActiveFilters()
  const hasAdvancedFilters = Object.keys(activeFilters).length > 0
  const hasGlobalSearch = globalSearchQuery.trim().length > 0
  const hasAnySearch = hasAdvancedFilters || hasGlobalSearch
  const searchMode = searchParams.get('mode') || 'and'
  const matchMode = searchParams.get('match') || 'fuzzy'

  // Initialize global search input from URL
  useEffect(() => {
    setGlobalSearchInput(globalSearchQuery)
  }, [globalSearchQuery])

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  // Save search to recent searches AFTER results are loaded
  useEffect(() => {
    if (loading) return // Wait for results
    
    if (hasGlobalSearch && !hasAdvancedFilters) {
      // Save global search with result count
      saveRecentSearch({
        type: 'global',
        label: globalSearchQuery,
        url: `/books?q=${encodeURIComponent(globalSearchQuery)}`,
        resultCount: books.length
      })
      setRecentSearches(getRecentSearches())
    } else if (hasAdvancedFilters) {
      // Save advanced search with result count
      const filterLabels = Object.entries(activeFilters)
        .map(([key, value]) => {
          const shortKey = key.replace('_name', '').replace('publication_', '')
          if (value === '=') return `${shortKey}: empty`
          if (value === '!=') return `${shortKey}: not empty`
          return `${shortKey}: ${value}`
        })
        .join(', ')
      const label = filterLabels.length > 50 ? filterLabels.slice(0, 47) + '...' : filterLabels
      saveRecentSearch({
        type: 'advanced',
        label,
        url: `/books?${searchParams.toString()}`,
        resultCount: totalCount || books.length
      })
      setRecentSearches(getRecentSearches())
    }
  }, [loading, books.length, totalCount])

  // Fetch collections for bulk actions when selection mode activates
  useEffect(() => {
    if (selectionMode && bulkCollections.length === 0) {
      const fetchCols = async () => {
        const { data } = await supabase
          .from('collections')
          .select('id, name, is_default')
          .order('sort_order', { ascending: true })
        if (data) setBulkCollections(data as CollectionOption[])
      }
      fetchCols()
    }
  }, [selectionMode])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowRecentSearches(false)
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
      if (addToCollectionMenuRef.current && !addToCollectionMenuRef.current.contains(event.target as Node)) {
        setShowAddToCollectionMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const clearFilters = () => {
    router.push('/books')
  }

  // Handle removing a recent search
  const handleRemoveRecentSearch = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeRecentSearch(id)
    setRecentSearches(getRecentSearches())
  }

  // Handle clearing all recent searches
  const handleClearAllRecentSearches = () => {
    clearAllRecentSearches()
    setRecentSearches([])
  }

  // Handle selecting a recent search
  const handleSelectRecentSearch = (search: RecentSearch) => {
    setShowRecentSearches(false)
    router.push(search.url)
  }

  // Handle global search submit
  const handleGlobalSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = globalSearchInput.trim()
    if (trimmed) {
      router.push(`/books?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/books')
    }
  }

  // Handle column sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get first author name for sorting
  const getFirstAuthorName = (contributors: { name: string; role: string }[]): string => {
    const author = contributors.find(c => c.role === 'Author')
    return author?.name || ''
  }

  // Sort books client-side
  const sortBooks = (booksToSort: BookListItem[]): BookListItem[] => {
    return [...booksToSort].sort((a, b) => {
      let aVal: string | null = ''
      let bVal: string | null = ''
      
      switch (sortField) {
        case 'title':
          aVal = a.title || ''
          bVal = b.title || ''
          break
        case 'author':
          aVal = getFirstAuthorName(a.contributors)
          bVal = getFirstAuthorName(b.contributors)
          break
        case 'publisher':
          aVal = a.publisher || ''
          bVal = b.publisher || ''
          break
        case 'place':
          aVal = a.publication_place || ''
          bVal = b.publication_place || ''
          break
        case 'year':
          aVal = a.publication_year || ''
          bVal = b.publication_year || ''
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
      }
      
      const comparison = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }

  // Memoized sorted books
  const sortedBooks = useMemo(() => sortBooks(books), [books, sortField, sortDirection])

  // Helper: Get book IDs that match author search (server-side)
  const getBookIdsByAuthor = async (authorSearch: string, isExact: boolean): Promise<string[]> => {
    const contributorQuery = supabase
      .from('contributors')
      .select('id')
    
    if (isExact) {
      contributorQuery.ilike('canonical_name', authorSearch)
    } else {
      contributorQuery.ilike('canonical_name', `%${authorSearch}%`)
    }
    
    const { data: matchingContributors, error: contribError } = await contributorQuery
    
    if (contribError || !matchingContributors || matchingContributors.length === 0) {
      return []
    }
    
    const contributorIds = matchingContributors.map(c => c.id)
    
    const { data: bookContributors, error: bcError } = await supabase
      .from('book_contributors')
      .select('book_id')
      .in('contributor_id', contributorIds)
    
    if (bcError || !bookContributors) {
      return []
    }
    
    return [...new Set(bookContributors.map(bc => bc.book_id))]
  }

  // Helper: Get book IDs for a collection (batched to stay within .in() URL limits)
  const getBookIdsForCollection = async (colId: string): Promise<string[]> => {
    let allIds: string[] = []
    let offset = 0
    while (true) {
      const { data, error } = await supabase
        .from('book_collections')
        .select('book_id')
        .eq('collection_id', colId)
        .range(offset, offset + 999)
      if (error || !data || data.length === 0) break
      allIds = [...allIds, ...data.map(r => r.book_id)]
      if (data.length < 1000) break
      offset += 1000
    }
    return allIds
  }

  // Helper: Get all book IDs for a tag
  const getBookIdsForTag = async (tagId: string): Promise<string[]> => {
    let allIds: string[] = []
    let offset = 0
    while (true) {
      const { data, error } = await supabase
        .from('book_tags')
        .select('book_id')
        .eq('tag_id', tagId)
        .range(offset, offset + 999)
      if (error || !data || data.length === 0) break
      allIds = [...allIds, ...data.map(r => r.book_id)]
      if (data.length < 1000) break
      offset += 1000
    }
    return allIds
  }

  // Helper: Get paginated book IDs for a collection (for default mode)
  const getCollectionBookIdsPaginated = async (colId: string, from: number, to: number): Promise<string[]> => {
    // Get book_ids sorted by added_at, then fetch those specific books
    // We need to get IDs in a stable order for pagination
    const { data, error } = await supabase
      .from('book_collections')
      .select('book_id')
      .eq('collection_id', colId)
      .range(from, to)
    if (error || !data) return []
    return data.map(r => r.book_id)
  }

  // Helper: Get count of books in a collection (fast, no .in() needed)
  const getCollectionBookCount = async (colId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('book_collections')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', colId)
    if (error) return 0
    return count || 0
  }

  // Fetch collection name when filter is active
  useEffect(() => {
    if (!collectionId) {
      setCollectionName(null)
      return
    }
    const fetchName = async () => {
      const { data } = await supabase
        .from('collections')
        .select('name')
        .eq('id', collectionId)
        .single()
      setCollectionName(data?.name || 'Collection')
    }
    fetchName()
  }, [collectionId])

  // Fetch tag name when filter is active
  useEffect(() => {
    if (!tagId) {
      setTagName(null)
      return
    }
    const fetchName = async () => {
      const { data } = await supabase
        .from('tags')
        .select('name')
        .eq('id', tagId)
        .single()
      setTagName(data?.name || 'Tag')
    }
    fetchName()
  }, [tagId])

  // Helper: Get book IDs for global search (searches author names)
  const getBookIdsForGlobalAuthorSearch = async (searchTerms: string[]): Promise<string[]> => {
    // Build OR conditions for all search terms
    const orConditions = searchTerms.map(term => `canonical_name.ilike.%${term}%`).join(',')
    
    const { data: matchingContributors, error: contribError } = await supabase
      .from('contributors')
      .select('id')
      .or(orConditions)
    
    if (contribError || !matchingContributors || matchingContributors.length === 0) {
      return []
    }
    
    const contributorIds = matchingContributors.map(c => c.id)
    
    const { data: bookContributors, error: bcError } = await supabase
      .from('book_contributors')
      .select('book_id')
      .in('contributor_id', contributorIds)
    
    if (bcError || !bookContributors) {
      return []
    }
    
    return [...new Set(bookContributors.map(bc => bc.book_id))]
  }

  // Fetch books with filters
  const fetchBooks = async (pageNum: number, append = false) => {
    if (pageNum === 0) setLoading(true)
    else setLoadingMore(true)

    const from = pageNum * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    
    // Read directly from searchParams to avoid closure issues
    const qParam = searchParams.get('q') || ''
    const isGlobalSearch = qParam.trim().length > 0
    
    const filters: Record<string, string> = {}
    SEARCH_FIELDS.forEach(field => {
      const value = searchParams.get(field)
      if (value) filters[field] = value
    })
    const hasFilters = Object.keys(filters).length > 0
    
    const isAnd = (searchParams.get('mode') || 'and') === 'and'
    const isExact = (searchParams.get('match') || 'fuzzy') === 'exact'

    // ========================================================================
    // CRITICAL: DO NOT MODIFY THESE THREE MODES WITHOUT TESTING ALL OF THEM!
    // 1. DEFAULT MODE - No search, no filters
    // 2. GLOBAL SEARCH MODE - Search box with ?q= parameter  
    // 3. ADVANCED FILTERS MODE - Individual field filters
    // ========================================================================

    // Get collection and tag filters
    const colId = searchParams.get('collection') || ''
    const tId = searchParams.get('tag') || ''

    // Resolve tag filter to book IDs (if active)
    let tagBookIdSet: Set<string> | null = null
    if (tId) {
      const tagBookIds = await getBookIdsForTag(tId)
      tagBookIdSet = new Set(tagBookIds)
    }

    // DEFAULT MODE - No search, no filters - show all books
    // IMPORTANT: This must come FIRST and return early!
    if (!isGlobalSearch && !hasFilters) {
      let data: any[] | null = null
      let error: any = null

      const bookSelect = `
        id, title, subtitle, original_title, publication_year, publication_place, publisher_name,
        status, cover_type, condition_id, language_id, user_catalog_id, series, cover_image_url,
        storage_location, shelf, isbn_13, isbn_10,
        book_contributors (
          contributor:contributors ( canonical_name ),
          role:contributor_roles ( name )
        )
      `

      if (colId || tagBookIdSet) {
        // Filtered mode: resolve allowed book IDs, then paginate from that set
        let allowedIds: string[]
        if (colId && tagBookIdSet) {
          // Intersect collection + tag
          const colIds = await getBookIdsForCollection(colId)
          allowedIds = colIds.filter(id => tagBookIdSet!.has(id))
        } else if (colId) {
          allowedIds = await getBookIdsForCollection(colId)
        } else {
          allowedIds = [...tagBookIdSet!]
        }

        if (allowedIds.length === 0) {
          if (!append) setBooks([])
          setLoading(false)
          setLoadingMore(false)
          return
        }

        // Client-side pagination over the allowed IDs
        const pageIds = allowedIds.slice(from, to + 1)
        if (pageIds.length === 0) {
          setLoading(false)
          setLoadingMore(false)
          return
        }

        // Fetch in batches of 200 to stay within URL limits
        let allData: any[] = []
        for (let i = 0; i < pageIds.length; i += 200) {
          const batch = pageIds.slice(i, i + 200)
          const { data: batchData, error: batchErr } = await supabase
            .from('books')
            .select(bookSelect)
            .in('id', batch)
          if (batchErr) { error = batchErr; break }
          if (batchData) allData = [...allData, ...batchData]
        }
        data = allData
      } else {
        // No filter: standard paginated fetch
        const result = await supabase
          .from('books')
          .select(bookSelect)
          .order('title', { ascending: true })
          .range(from, to)
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('Error fetching books:', error)
        setLoading(false)
        setLoadingMore(false)
        return
      }

      const formattedBooks: BookListItem[] = (data || []).map((book: any) => ({
        id: book.id,
        title: book.title,
        subtitle: book.subtitle,
        original_title: book.original_title,
        publication_year: book.publication_year,
        publication_place: book.publication_place,
        publisher: book.publisher_name,
        status: book.status,
        cover_type: book.cover_type,
        condition_id: book.condition_id,
        language_id: book.language_id,
        storage_location: book.storage_location,
        shelf: book.shelf,
        isbn_13: book.isbn_13,
        isbn_10: book.isbn_10,
        series: book.series,
        user_catalog_id: book.user_catalog_id,
        cover_image_url: book.cover_image_url,
        contributors: (book.book_contributors || []).map((bc: any) => ({
          name: bc.contributor?.canonical_name || 'Unknown',
          role: bc.role?.name || 'Contributor'
        }))
      }))

      if (append) {
        setBooks(prev => [...prev, ...formattedBooks])
      } else {
        setBooks(formattedBooks)
      }

      setLoading(false)
      setLoadingMore(false)
      return
    }

    // GLOBAL SEARCH MODE - User typed in the search box (?q=something)
    // IMPORTANT: This must come SECOND and return early!
    // Fetches ALL books and filters client-side for maximum flexibility
    if (isGlobalSearch && !hasFilters) {
      const searchTerms = qParam.toLowerCase().split(/\s+/).filter(t => t.length > 0)
      
      let allBooks: any[] = []
      const BATCH_SIZE = 1000
      const bookSelect = `
        id, title, subtitle, original_title, publication_year, publication_place, publisher_name,
        status, cover_type, condition_id, language_id, user_catalog_id, series, cover_image_url,
        storage_location, shelf, isbn_13, isbn_10,
        book_contributors (
          contributor:contributors ( canonical_name ),
          role:contributor_roles ( name )
        )
      `

      if (colId || tagBookIdSet) {
        // Filtered search: resolve allowed book IDs, then search within them
        let allowedIds: string[]
        if (colId && tagBookIdSet) {
          const colIds = await getBookIdsForCollection(colId)
          allowedIds = colIds.filter(id => tagBookIdSet!.has(id))
        } else if (colId) {
          allowedIds = await getBookIdsForCollection(colId)
        } else {
          allowedIds = [...tagBookIdSet!]
        }
        if (allowedIds.length === 0) {
          if (!append) setBooks([])
          setLoading(false)
          setLoadingMore(false)
          return
        }
        // Fetch in batches of 200 IDs to stay within URL limits
        for (let i = 0; i < allowedIds.length; i += 200) {
          const batch = allowedIds.slice(i, i + 200)
          const { data, error } = await supabase
            .from('books')
            .select(bookSelect)
            .in('id', batch)
          if (error) {
            console.error('Error fetching books:', error)
            continue
          }
          if (data) allBooks = [...allBooks, ...data]
        }
      } else {
        // No collection filter: fetch all books in batches
        let fetchFrom = 0
        while (true) {
          const { data: batch, error: batchError } = await supabase
            .from('books')
            .select(bookSelect)
            .order('title', { ascending: true })
            .range(fetchFrom, fetchFrom + BATCH_SIZE - 1)

          if (batchError) {
            console.error('Error fetching books:', batchError)
            setLoading(false)
            setLoadingMore(false)
            return
          }

          if (!batch || batch.length === 0) break
          allBooks = [...allBooks, ...batch]
          if (batch.length < BATCH_SIZE) break
          fetchFrom += BATCH_SIZE
        }
      }

      const data = allBooks

      // Client-side filter: each term must match somewhere in the book
      const filteredData = (data || []).filter((book: any) => {
        const searchableText = [
          book.title,
          book.subtitle,
          book.original_title,
          book.series,
          book.publisher_name,
          book.publication_place,
          book.isbn_13,
          book.isbn_10,
          ...(book.book_contributors || []).map((bc: any) => bc.contributor?.canonical_name || '')
        ].filter(Boolean).join(' ').toLowerCase()
        
        return searchTerms.every(term => searchableText.includes(term))
      })

      const formattedBooks: BookListItem[] = filteredData.map((book: any) => ({
        id: book.id,
        title: book.title,
        subtitle: book.subtitle,
        original_title: book.original_title,
        publication_year: book.publication_year,
        publication_place: book.publication_place,
        publisher: book.publisher_name,
        status: book.status,
        cover_type: book.cover_type,
        condition_id: book.condition_id,
        language_id: book.language_id,
        storage_location: book.storage_location,
        shelf: book.shelf,
        isbn_13: book.isbn_13,
        isbn_10: book.isbn_10,
        series: book.series,
        user_catalog_id: book.user_catalog_id,
        cover_image_url: book.cover_image_url,
        contributors: (book.book_contributors || []).map((bc: any) => ({
          name: bc.contributor?.canonical_name || 'Unknown',
          role: bc.role?.name || 'Contributor'
        }))
      }))

      if (append) {
        setBooks(prev => [...prev, ...formattedBooks])
      } else {
        setBooks(formattedBooks)
      }

      setLoading(false)
      setLoadingMore(false)
      return
    }

    // ADVANCED FILTERS MODE - Individual field filters from /books/search
    // This runs when hasFilters is true (uses server-side filtering)
    let authorBookIds: string[] | null = null
    if (filters.author) {
      authorBookIds = await getBookIdsByAuthor(filters.author, isExact)
      
      if (authorBookIds.length === 0 && isAnd) {
        setBooks(append ? books : [])
        setLoading(false)
        setLoadingMore(false)
        return
      }
    }

    let query = supabase
      .from('books')
      .select(`
        id, title, subtitle, original_title, publication_year, publication_place, publisher_name,
        status, cover_type, condition_id, language_id, user_catalog_id, series, cover_image_url,
        storage_location, shelf, isbn_13, isbn_10,
        book_contributors (
          contributor:contributors ( canonical_name ),
          role:contributor_roles ( name )
        )
      `)

    if (hasFilters) {
      if (isAnd) {
        // Text fields with =, != support
        if (filters.title) {
          query = applyTextFilter(query, 'title', filters.title, isExact)
        }
        if (filters.subtitle) {
          query = applyTextFilter(query, 'subtitle', filters.subtitle, isExact)
        }
        if (filters.original_title) {
          query = applyTextFilter(query, 'original_title', filters.original_title, isExact)
        }
        if (filters.series) {
          query = applyTextFilter(query, 'series', filters.series, isExact)
        }
        if (filters.publisher_name) {
          query = applyTextFilter(query, 'publisher_name', filters.publisher_name, isExact)
        }
        if (filters.publication_place) {
          query = applyTextFilter(query, 'publication_place', filters.publication_place, isExact)
        }
        if (filters.publication_year) {
          query = applyTextFilter(query, 'publication_year', filters.publication_year, isExact)
        }
        if (filters.storage_location) {
          query = applyTextFilter(query, 'storage_location', filters.storage_location, isExact)
        }
        if (filters.shelf) {
          query = applyTextFilter(query, 'shelf', filters.shelf, isExact)
        }
        if (filters.isbn) {
          if (isEmptySearch(filters.isbn)) {
            // Both ISBN fields must be empty
            query = query.or('isbn_13.is.null,isbn_13.eq.').or('isbn_10.is.null,isbn_10.eq.')
          } else if (isNotEmptySearch(filters.isbn)) {
            // At least one ISBN must have a value - use OR
            query = query.or('isbn_13.neq.,isbn_10.neq.')
          } else {
            query = query.or(`isbn_13.ilike.%${filters.isbn}%,isbn_10.ilike.%${filters.isbn}%`)
          }
        }
        if (filters.language) {
          query = query.eq('language_id', filters.language)
        }
        if (filters.condition) {
          query = query.eq('condition_id', filters.condition)
        }
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (authorBookIds && authorBookIds.length > 0) {
          query = query.in('id', authorBookIds)
        }
        if (colId || tagBookIdSet) {
          let allowedIds: string[]
          if (colId && tagBookIdSet) {
            const colIds = await getBookIdsForCollection(colId)
            allowedIds = colIds.filter(id => tagBookIdSet!.has(id))
          } else if (colId) {
            allowedIds = await getBookIdsForCollection(colId)
          } else {
            allowedIds = [...tagBookIdSet!]
          }
          if (allowedIds.length > 0) {
            query = query.in('id', allowedIds)
          }
        }
      } else {
        const orConditions: string[] = []
        
        if (filters.title) {
          orConditions.push(isExact 
            ? `title.ilike.${filters.title}`
            : `title.ilike.%${filters.title}%`)
        }
        if (filters.subtitle) {
          orConditions.push(isExact 
            ? `subtitle.ilike.${filters.subtitle}`
            : `subtitle.ilike.%${filters.subtitle}%`)
        }
        if (filters.original_title) {
          orConditions.push(isExact 
            ? `original_title.ilike.${filters.original_title}`
            : `original_title.ilike.%${filters.original_title}%`)
        }
        if (filters.series) {
          orConditions.push(isExact 
            ? `series.ilike.${filters.series}`
            : `series.ilike.%${filters.series}%`)
        }
        if (filters.publisher_name) {
          orConditions.push(isExact 
            ? `publisher_name.ilike.${filters.publisher_name}`
            : `publisher_name.ilike.%${filters.publisher_name}%`)
        }
        if (filters.publication_place) {
          orConditions.push(isExact 
            ? `publication_place.ilike.${filters.publication_place}`
            : `publication_place.ilike.%${filters.publication_place}%`)
        }
        if (filters.publication_year) {
          orConditions.push(isExact 
            ? `publication_year.ilike.${filters.publication_year}`
            : `publication_year.ilike.%${filters.publication_year}%`)
        }
        if (filters.storage_location) {
          orConditions.push(isExact 
            ? `storage_location.ilike.${filters.storage_location}`
            : `storage_location.ilike.%${filters.storage_location}%`)
        }
        if (filters.shelf) {
          orConditions.push(isExact 
            ? `shelf.ilike.${filters.shelf}`
            : `shelf.ilike.%${filters.shelf}%`)
        }
        if (filters.isbn) {
          orConditions.push(`isbn_13.ilike.%${filters.isbn}%`)
          orConditions.push(`isbn_10.ilike.%${filters.isbn}%`)
        }
        if (filters.language) {
          orConditions.push(`language_id.eq.${filters.language}`)
        }
        if (filters.condition) {
          orConditions.push(`condition_id.eq.${filters.condition}`)
        }
        if (filters.status) {
          orConditions.push(`status.eq.${filters.status}`)
        }
        
        if (orConditions.length > 0) {
          query = query.or(orConditions.join(','))
        }
      }
    }

    query = query.order('title', { ascending: true }).range(from, to)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching books:', error)
      setLoading(false)
      setLoadingMore(false)
      return
    }

    let allData = data || []
    if (!isAnd && filters.author && authorBookIds && authorBookIds.length > 0) {
      const existingIds = new Set(allData.map((b: any) => b.id))
      const missingAuthorBookIds = authorBookIds.filter(id => !existingIds.has(id))
      
      if (missingAuthorBookIds.length > 0) {
        const { data: authorBooks } = await supabase
          .from('books')
          .select(`
            id, title, subtitle, original_title, publication_year, publication_place, publisher_name,
            status, cover_type, condition_id, language_id, user_catalog_id, series, cover_image_url,
            storage_location, shelf, isbn_13, isbn_10,
            book_contributors (
              contributor:contributors ( canonical_name ),
              role:contributor_roles ( name )
            )
          `)
          .in('id', missingAuthorBookIds.slice(0, 100))
          .order('title', { ascending: true })
        
        if (authorBooks) {
          allData = [...allData, ...authorBooks]
          allData.sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''))
        }
      }
    }

    const formattedBooks: BookListItem[] = allData.map((book: any) => ({
      id: book.id,
      title: book.title,
      subtitle: book.subtitle,
      original_title: book.original_title,
      publication_year: book.publication_year,
      publication_place: book.publication_place,
      publisher: book.publisher_name,
      status: book.status,
      cover_type: book.cover_type,
      condition_id: book.condition_id,
      language_id: book.language_id,
      storage_location: book.storage_location,
      shelf: book.shelf,
      isbn_13: book.isbn_13,
      isbn_10: book.isbn_10,
      series: book.series,
      user_catalog_id: book.user_catalog_id,
      cover_image_url: book.cover_image_url,
      contributors: (book.book_contributors || []).map((bc: any) => ({
        name: bc.contributor?.canonical_name || 'Unknown',
        role: bc.role?.name || 'Contributor'
      }))
    }))

    if (append) {
      setBooks(prev => [...prev, ...formattedBooks])
    } else {
      setBooks(formattedBooks)
    }

    setLoading(false)
    setLoadingMore(false)
  }

  // Get total count
  const fetchCount = async () => {
    // For global search, we can't easily get exact count, so estimate from results
    if (hasGlobalSearch && !hasAdvancedFilters) {
      // Just use books.length for now (will be updated after fetch)
      return
    }

    const filters = activeFilters
    const isAnd = searchMode === 'and'
    const isExact = matchMode === 'exact'

    let authorBookIds: string[] | null = null
    if (filters.author) {
      authorBookIds = await getBookIdsByAuthor(filters.author, isExact)
      if (authorBookIds.length === 0 && isAnd) {
        setTotalCount(0)
        return
      }
    }

    // Collection and/or tag filter for count
    const activeTagId = searchParams.get('tag') || ''
    if ((collectionId || activeTagId) && !hasAdvancedFilters) {
      let count: number
      if (collectionId && activeTagId) {
        const colIds = await getBookIdsForCollection(collectionId)
        const tagIds = await getBookIdsForTag(activeTagId)
        const tagSet = new Set(tagIds)
        count = colIds.filter(id => tagSet.has(id)).length
      } else if (collectionId) {
        count = await getCollectionBookCount(collectionId)
      } else {
        const tagIds = await getBookIdsForTag(activeTagId)
        count = tagIds.length
      }
      setTotalCount(count)
      return
    }

    let query = supabase.from('books').select('*', { count: 'exact', head: true })
    
    if (hasAdvancedFilters && isAnd) {
      if (filters.title) query = query.ilike('title', isExact ? filters.title : `%${filters.title}%`)
      if (filters.subtitle) query = query.ilike('subtitle', isExact ? filters.subtitle : `%${filters.subtitle}%`)
      if (filters.original_title) query = query.ilike('original_title', isExact ? filters.original_title : `%${filters.original_title}%`)
      if (filters.series) query = query.ilike('series', isExact ? filters.series : `%${filters.series}%`)
      if (filters.publisher_name) query = query.ilike('publisher_name', isExact ? filters.publisher_name : `%${filters.publisher_name}%`)
      if (filters.publication_place) query = query.ilike('publication_place', isExact ? filters.publication_place : `%${filters.publication_place}%`)
      if (filters.publication_year) query = query.ilike('publication_year', isExact ? filters.publication_year : `%${filters.publication_year}%`)
      if (filters.storage_location) query = query.ilike('storage_location', isExact ? filters.storage_location : `%${filters.storage_location}%`)
      if (filters.shelf) query = query.ilike('shelf', isExact ? filters.shelf : `%${filters.shelf}%`)
      if (filters.isbn) query = query.or(`isbn_13.ilike.%${filters.isbn}%,isbn_10.ilike.%${filters.isbn}%`)
      if (filters.language) query = query.eq('language_id', filters.language)
      if (filters.condition) query = query.eq('condition_id', filters.condition)
      if (filters.status) query = query.eq('status', filters.status)
      if (authorBookIds && authorBookIds.length > 0) {
        query = query.in('id', authorBookIds)
      }
    }
    
    const { count } = await query
    setTotalCount(count || 0)
  }

  // Update count after books are loaded (for global search)
  useEffect(() => {
    if (hasGlobalSearch && !hasAdvancedFilters && !loading) {
      setTotalCount(books.length)
    }
  }, [books, loading, hasGlobalSearch, hasAdvancedFilters])

  // Fetch value summary for current view (collection/tag/all)
  const fetchValueSummary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user display currency
      const { data: profile } = await supabase.from('user_profiles').select('default_currency, locale').eq('id', user.id).single()
      const displayCur = profile?.default_currency || 'EUR'
      if ((profile as any)?.locale) setUserLocale((profile as any).locale)

      const colId = searchParams.get('collection') || null
      const tId = searchParams.get('tag') || null

      const { data, error } = await supabase.rpc('get_value_summary', {
        p_user_id: user.id,
        p_collection_id: colId || undefined,
        p_tag_id: tId || undefined,
      })

      if (error) {
        console.error('Value summary RPC error:', error.message)
        return
      }

      const result = data as any
      setValueSummary({
        totalAcquired: Number(result?.total_acquired ?? 0),
        totalEstimated: Number(result?.total_estimated ?? 0),
        bookCount: Number(result?.book_count ?? 0),
        currency: displayCur,
      })
    } catch {
      // Silently fail — summary is non-critical
    }
  }

  useEffect(() => {
    setPage(0)
    if (!hasGlobalSearch || hasAdvancedFilters) {
      fetchCount()
    }
    fetchBooks(0)
    fetchValueSummary()
  }, [searchParams.toString()])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBooks(nextPage, true)
  }

  const hasMore = books.length < totalCount && !hasGlobalSearch

  const getAuthors = (contributors: { name: string; role: string }[]) => {
    const authors = contributors.filter(c => c.role === 'Author')
    if (authors.length === 0) return null
    if (authors.length === 1) return authors[0].name
    if (authors.length === 2) return `${authors[0].name} & ${authors[1].name}`
    return `${authors[0].name} et al.`
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === books.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(books.map(b => b.id)))
    }
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const isAllSelected = books.length > 0 && selectedIds.size === books.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < books.length

  const handleBulkDelete = async () => {
    const expectedText = selectedIds.size === 1 ? 'delete' : `delete ${selectedIds.size} books`
    if (confirmText.toLowerCase() !== expectedText.toLowerCase()) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const idsToDelete = Array.from(selectedIds)

      const { error: contributorsError } = await supabase
        .from('book_contributors')
        .delete()
        .in('book_id', idsToDelete)

      if (contributorsError) {
        throw new Error(`Failed to delete contributors: ${contributorsError.message}`)
      }

      const { error: booksError } = await supabase
        .from('books')
        .delete()
        .in('id', idsToDelete)

      if (booksError) {
        throw new Error(`Failed to delete books: ${booksError.message}`)
      }

      setBooks(prev => prev.filter(b => !selectedIds.has(b.id)))
      setTotalCount(prev => prev - selectedIds.size)
      setSelectedIds(new Set())
      setSelectionMode(false)
      setShowDeleteModal(false)
      setConfirmText('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete books'
      setDeleteError(message)
    } finally {
      setDeleting(false)
    }
  }

  // Bulk add to collection
  const handleBulkAddToCollection = async (targetCollectionId: string) => {
    if (selectedIds.size === 0) return
    setBulkActionLoading(true)
    setShowAddToCollectionMenu(false)
    try {
      const bookIds = Array.from(selectedIds)
      // Get existing memberships to avoid duplicates
      const { data: existing } = await supabase
        .from('book_collections')
        .select('book_id')
        .eq('collection_id', targetCollectionId)
        .in('book_id', bookIds)
      const existingSet = new Set((existing || []).map((r: any) => r.book_id))
      const toInsert = bookIds.filter(id => !existingSet.has(id))
      if (toInsert.length > 0) {
        // Insert in batches of 500
        for (let i = 0; i < toInsert.length; i += 500) {
          const batch = toInsert.slice(i, i + 500).map(bookId => ({
            book_id: bookId,
            collection_id: targetCollectionId,
          }))
          await supabase.from('book_collections').insert(batch)
        }
      }
      const colName = bulkCollections.find(c => c.id === targetCollectionId)?.name || 'collection'
      alert(`Added ${toInsert.length} book(s) to "${colName}" (${existingSet.size} already there)`)
    } catch (err) {
      alert('Failed to add books to collection')
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Bulk remove from current collection
  const handleBulkRemoveFromCollection = async () => {
    if (selectedIds.size === 0 || !collectionId) return
    setBulkActionLoading(true)
    try {
      const bookIds = Array.from(selectedIds)
      for (let i = 0; i < bookIds.length; i += 500) {
        const batch = bookIds.slice(i, i + 500)
        await supabase
          .from('book_collections')
          .delete()
          .eq('collection_id', collectionId)
          .in('book_id', batch)
      }
      // Remove from local state
      setBooks(prev => prev.filter(b => !selectedIds.has(b.id)))
      setTotalCount(prev => prev - selectedIds.size)
      setSelectedIds(new Set())
      setSelectionMode(false)
    } catch (err) {
      alert('Failed to remove books from collection')
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Export handler - downloads file via fetch to handle authentication
  const handleExport = async (format: 'xlsx' | 'csv' | 'json') => {
    setExporting(true)
    setShowExportMenu(false)
    
    try {
      // Build API URL with format, and optionally with selected IDs
      let apiUrl = `/api/export?format=${format}`
      if (selectedIds.size > 0) {
        // Export only selected books
        const idsParam = Array.from(selectedIds).join(',')
        apiUrl += `&ids=${encodeURIComponent(idsParam)}`
      }
      // If no selection, export all (no ids param = current behavior)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        // Try to get error details from response
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.details || errorData.error || 'Export failed')
        }
        throw new Error(`Export failed: ${response.status}`)
      }
      
      const blob = await response.blob()
      const date = new Date().toISOString().split('T')[0]
      const filename = `shelvd_export_${date}.${format}`
      
      // Create download link and trigger it
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export error:', err)
      const message = err instanceof Error ? err.message : 'Export failed'
      alert(`Export failed: ${message}`)
    } finally {
      setExporting(false)
    }
  }

  const selectedCount = selectedIds.size
  const confirmTextExpected = selectedCount === 1 ? 'delete' : `delete ${selectedCount} books`
  const isConfirmValid = confirmText.toLowerCase() === confirmTextExpected.toLowerCase()

  const getFilterLabel = (key: string, value: string) => {
    const labels: Record<string, string> = {
      title: 'Title',
      subtitle: 'Subtitle',
      original_title: 'Original Title',
      series: 'Series',
      author: 'Author',
      publisher_name: 'Publisher',
      publication_place: 'Place',
      publication_year: 'Year',
      language: 'Language',
      condition: 'Condition',
      status: 'Status',
      isbn: 'ISBN',
      storage_location: 'Location',
      shelf: 'Shelf'
    }
    const fieldLabel = labels[key] || key
    
    // Special labels for empty/not-empty search
    if (value === '=') {
      return `${fieldLabel}: empty`
    } else if (value === '!=') {
      return `${fieldLabel}: not empty`
    }
    
    return `${fieldLabel}: "${value}"`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {hasAnySearch ? 'Search Results' : collectionName ? collectionName : tagName ? `Tag: ${tagName}` : 'My Collection'}
          </h1>
          <p className="text-muted-foreground">
            {hasAnySearch 
              ? `Found ${formatInteger(totalCount, userLocale)} ${totalCount === 1 ? 'book' : 'books'}`
              : totalCount === 0 
                ? "You haven't added any books yet"
                : `${formatInteger(totalCount, userLocale)} ${totalCount === 1 ? 'book' : 'books'} in your collection`
            }
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex border border-border">
            <button
              onClick={() => setView('list')}
              className={`p-2 ${view === 'list' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`p-2 ${view === 'grid' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant={selectionMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
            className="gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            {selectionMode ? 'Cancel' : 'Select'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/books/import" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Link>
          </Button>
          <div className="relative" ref={exportMenuRef}>
            <Button 
              variant="outline" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="gap-2"
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? 'Exporting...' : 'Export'}
              {!exporting && <ChevronDown className="w-3 h-3" />}
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button 
                  onClick={() => handleExport('xlsx')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Excel (.xlsx)
                </button>
                <button 
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CSV (.csv)
                </button>
                <button 
                  onClick={() => handleExport('json')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  JSON (.json)
                </button>
              </div>
            )}
          </div>
          <Button variant="outline" asChild>
            <Link href="/books/duplicates" className="gap-2">
              <Copy className="w-4 h-4" />
              Duplicates
            </Link>
          </Button>
          <LimitGate limitKey="max_books" currentCount={totalCount}>
            <Button asChild>
              <Link href="/books/add" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Book
              </Link>
            </Button>
          </LimitGate>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="mb-6" ref={searchContainerRef}>
        <form onSubmit={handleGlobalSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={globalSearchInput}
              onChange={(e) => setGlobalSearchInput(e.target.value)}
              onFocus={() => recentSearches.length > 0 && setShowRecentSearches(true)}
              placeholder="Search all fields..."
              className="w-full h-10 pl-10 pr-4 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground"
            />
            {globalSearchInput && (
              <button
                type="button"
                onClick={() => {
                  setGlobalSearchInput('')
                  if (hasGlobalSearch) router.push('/books')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg z-50 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <History className="w-3 h-3" />
                    Recent Searches
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    onClick={() => handleSelectRecentSearch(search)}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {search.type === 'global' ? (
                        <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <SlidersHorizontal className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">{search.label}</span>
                      {search.type === 'advanced' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground flex-shrink-0">
                          Advanced
                        </span>
                      )}
                      {search.resultCount !== undefined && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          ({search.resultCount})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecentSearch(search.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" variant="default" className="gap-2">
            <Search className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/books/search" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced</span>
            </Link>
          </Button>
        </form>
      </div>

      {/* Collection filter indicator */}
      {collectionId && collectionName && (
        <div className="mb-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Viewing collection: <strong>{collectionName}</strong>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/books')}>
            <X className="w-3 h-3 mr-1" />
            Show All Books
          </Button>
        </div>
      )}

      {/* Tag filter indicator */}
      {tagId && tagName && (
        <div className="mb-4 p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Filtering by tag: <strong>{tagName}</strong>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/books')}>
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Global Search indicator */}
      {hasGlobalSearch && !hasAdvancedFilters && (
        <div className="mb-6 p-3 bg-muted/50 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              Searching for: <strong>"{globalSearchQuery}"</strong>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Advanced filters bar */}
      {hasAdvancedFilters && (
        <div className="mb-6 p-4 bg-red-50/50 dark:bg-red-950/20 border border-dashed border-red-200 dark:border-red-900/50">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900 dark:text-red-100">
                Advanced Search
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                {searchMode.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                {matchMode === 'fuzzy' ? 'Contains' : 'Exact'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/books/search?${searchParams.toString()}`}>
                  <SlidersHorizontal className="w-3 h-3 mr-1" />
                  Modify
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
              >
                {getFilterLabel(key, value)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selection action bar */}
      {selectionMode && (
        <div className="mb-4 p-3 bg-muted border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedCount === 0 
                ? 'Select books to delete' 
                : `${selectedCount} ${selectedCount === 1 ? 'book' : 'books'} selected`
              }
            </span>
            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Add to Collection dropdown */}
            <div className="relative" ref={addToCollectionMenuRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddToCollectionMenu(!showAddToCollectionMenu)}
                disabled={selectedCount === 0 || bulkActionLoading}
                className="gap-2"
              >
                {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                <span className="hidden sm:inline">Add to Collection</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
              {showAddToCollectionMenu && bulkCollections.length > 0 && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {bulkCollections.map(col => (
                    <button
                      key={col.id}
                      onClick={() => handleBulkAddToCollection(col.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Remove from Collection (only when viewing a specific collection) */}
            {collectionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkRemoveFromCollection}
                disabled={selectedCount === 0 || bulkActionLoading}
                className="gap-2"
              >
                <FolderMinus className="w-4 h-4" />
                <span className="hidden sm:inline">Remove from Collection</span>
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={selectedCount === 0}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Selected</span>
            </Button>
          </div>
        </div>
      )}

      {/* Value summary bar */}
      {valueSummary && valueSummary.bookCount > 0 && !loading && (() => {
        const { totalAcquired, totalEstimated, bookCount, currency } = valueSummary
        const diff = totalEstimated - totalAcquired
        const pct = totalAcquired > 0 ? ((diff / totalAcquired) * 100).toFixed(1) : null
        const isGain = diff >= 0
        const fmt = (n: number) => fmtCurr(n, currency, userLocale, { decimals: false })
        return (
          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {totalAcquired > 0 && <span>Cost: <span className="font-medium text-foreground">{fmt(totalAcquired)}</span></span>}
            {totalEstimated > 0 && <span>Value: <span className="font-medium text-foreground">{fmt(totalEstimated)}</span></span>}
            {totalAcquired > 0 && totalEstimated > 0 && (
              <span className={isGain ? 'text-green-700' : 'text-red-600'}>
                {isGain ? '+' : ''}{fmt(diff)}
                {pct ? ` (${isGain ? '+' : ''}${pct}%)` : ''}
              </span>
            )}
          </div>
        )
      })()}

      {/* Onboarding checklist */}
      {!loading && <OnboardingChecklistLoader />}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!loading && books.length === 0 && (
        hasAnySearch ? (
          <div className="text-center py-24 border-2 border-dashed border-border">
            <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No books found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or clear the filters.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/books/search">Advanced Search</Link>
              </Button>
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-border">
            <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Every great library started with a single book</h3>
            <p className="text-muted-foreground mb-2 max-w-md mx-auto">
              Yours is waiting. Type a title, paste an ISBN, or look it up in 22 libraries across 4 continents.
            </p>
            <p className="text-muted-foreground/60 mb-8 text-sm italic max-w-md mx-auto">
              We promise the add form is less scary than it looks.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/books/add" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Book
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/books/lookup" className="gap-2">
                  <Search className="w-4 h-4" />
                  Library Lookup
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/books/import" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                </Link>
              </Button>
            </div>
          </div>
        )
      )}

      {/* List View */}
      {!loading && books.length > 0 && view === 'list' && (
        <div className="border border-border">
          <div className={`grid ${selectionMode ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'} gap-4 px-4 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border`}>
            {selectionMode && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected
                  }}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                  title={isAllSelected ? 'Deselect all' : 'Select all'}
                />
              </div>
            )}
            <div className="grid grid-cols-12 gap-4">
              <button 
                onClick={() => handleSort('title')} 
                className="col-span-4 flex items-center gap-1 hover:text-foreground transition-colors text-left"
              >
                Title
                {sortField === 'title' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-30" />
                )}
              </button>
              <button 
                onClick={() => handleSort('author')} 
                className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left"
              >
                Author
                {sortField === 'author' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-30" />
                )}
              </button>
              <button 
                onClick={() => handleSort('publisher')} 
                className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left"
              >
                Publisher
                {sortField === 'publisher' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-30" />
                )}
              </button>
              <button 
                onClick={() => handleSort('place')} 
                className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors text-left"
              >
                Place
                {sortField === 'place' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-30" />
                )}
              </button>
              <button 
                onClick={() => handleSort('year')} 
                className="col-span-1 flex items-center gap-1 hover:text-foreground transition-colors text-left"
              >
                Year
                {sortField === 'year' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-30" />
                )}
              </button>
              <button 
                onClick={() => handleSort('status')} 
                className="col-span-1 flex items-center gap-1 hover:text-foreground transition-colors text-left"
              >
                Status
                {sortField === 'status' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-30" />
                )}
              </button>
            </div>
          </div>
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              className={`grid ${selectionMode ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'} gap-4 items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors text-sm ${
                selectionMode && selectedIds.has(book.id) ? 'bg-muted/50' : ''
              }`}
            >
              {selectionMode && (
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(book.id)}
                    onChange={() => toggleSelect(book.id)}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                </div>
              )}
              <Link
                href={`/books/${book.id}`}
                className="block sm:contents"
              >
                {/* Mobile card layout */}
                <div className="sm:hidden flex items-center gap-3">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt="" className="w-8 h-12 object-cover flex-shrink-0 bg-muted rounded-sm" onError={e => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="w-8 h-12 bg-muted/50 flex-shrink-0 rounded-sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{book.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {getAuthors(book.contributors)}{book.publication_year ? ` · ${book.publication_year}` : ''}
                    </div>
                  </div>
                </div>

                {/* Desktop grid layout */}
                <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 text-muted-foreground line-clamp-2 flex items-center gap-2">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt="" className="w-6 h-9 object-cover flex-shrink-0 bg-muted rounded-sm" onError={e => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="w-6 h-9 bg-muted/50 flex-shrink-0 rounded-sm" />
                  )}
                  <span>{book.title}</span>
                </div>
                <div className="col-span-2 text-muted-foreground truncate">
                  {getAuthors(book.contributors) || '—'}
                </div>
                <div className="col-span-2 text-muted-foreground truncate">
                  {book.publisher || '—'}
                </div>
                <div className="col-span-2 text-muted-foreground truncate">
                  {book.publication_place || '—'}
                </div>
                <div className="col-span-1 text-muted-foreground">
                  {book.publication_year || '—'}
                </div>
                <div className="col-span-1">
                  <span className={`text-xs px-2 py-0.5 ${
                    book.status === 'draft' ? 'bg-red-100 text-red-700' :
                    book.status === 'on_sale' ? 'bg-red-600 text-white' :
                    book.status === 'to_sell' ? 'bg-red-100 text-red-700' :
                    book.status === 'reserved' ? 'border border-red-600 text-red-600' :
                    book.status === 'sold' ? 'bg-gray-100 text-gray-500' :
                    book.status === 'lent' ? 'border border-black text-black' :
                    book.status === 'borrowed' ? 'border border-black text-black' :
                    book.status === 'double' ? 'bg-gray-100 text-gray-600' :
                    book.status === 'ordered' ? 'bg-gray-100 text-gray-600' :
                    book.status === 'lost' ? 'bg-black text-white' :
                    book.status === 'donated' ? 'bg-gray-100 text-gray-500' :
                    book.status === 'destroyed' ? 'bg-black text-white' :
                    book.status === 'unknown' ? 'bg-gray-200 text-gray-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {book.status === 'draft' ? 'Draft' :
                     book.status === 'in_collection' ? 'In Col.' : 
                     book.status === 'on_sale' ? 'On Sale' :
                     book.status === 'to_sell' ? 'To Sell' :
                     book.status === 'reserved' ? 'Reserved' :
                     book.status === 'sold' ? 'Sold' :
                     book.status === 'lent' ? 'Lent' :
                     book.status === 'borrowed' ? 'Borrowed' :
                     book.status === 'double' ? 'Double' :
                     book.status === 'ordered' ? 'Ordered' :
                     book.status === 'lost' ? 'Lost' :
                     book.status === 'donated' ? 'Donated' :
                     book.status === 'destroyed' ? 'Destroyed' :
                     book.status === 'unknown' ? 'Unknown' :
                     book.status}
                  </span>
                </div>
                </div>{/* end desktop grid */}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {!loading && books.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              className={`group bg-card border border-border hover:border-foreground/20 transition-colors relative ${
                selectionMode && selectedIds.has(book.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              {selectionMode && (
                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(book.id)}
                    onChange={() => toggleSelect(book.id)}
                    className="w-4 h-4 rounded border-border cursor-pointer bg-background"
                  />
                </div>
              )}
              
              <Link href={`/books/${book.id}`}>
                <div className="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
                  ) : null}
                  <div className={`text-center ${book.cover_image_url ? 'hidden' : ''}`}>
                    <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">No cover</p>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                    {getAuthors(book.contributors) || 'Unknown author'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {book.publication_year || '—'}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && books.length > 0 && (
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              `Load more (${books.length} of ${formatInteger(totalCount, userLocale)})`
            )}
          </Button>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />

          <div className="relative bg-background border border-border shadow-lg p-6 w-full max-w-md mx-4">
            <button
              onClick={() => !deleting && setShowDeleteModal(false)}
              disabled={deleting}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete {selectedCount} {selectedCount === 1 ? 'Book' : 'Books'}</h3>
            </div>

            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800">
              <p className="text-sm font-semibold mb-1">
                ⚠️ You are about to permanently delete {selectedCount} {selectedCount === 1 ? 'book' : 'books'}!
              </p>
              <p className="text-sm">
                This action <strong>cannot be undone</strong>. All data associated with {selectedCount === 1 ? 'this book' : 'these books'} will be permanently removed.
              </p>
            </div>

            <div className="mb-4 text-sm">
              <p className="text-muted-foreground mb-2">Books to delete:</p>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {books
                  .filter(b => selectedIds.has(b.id))
                  .slice(0, 5)
                  .map(book => (
                    <li key={book.id} className="truncate text-muted-foreground">
                      • {book.title}
                    </li>
                  ))
                }
                {selectedCount > 5 && (
                  <li className="text-muted-foreground italic">
                    ... and {selectedCount - 5} more
                  </li>
                )}
              </ul>
            </div>

            <p className="text-sm mb-2">
              Type <strong className="font-mono bg-muted px-1">{confirmTextExpected}</strong> to confirm:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type '${confirmTextExpected}' to confirm`}
              disabled={deleting}
              className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 mb-4 disabled:opacity-50"
              autoFocus
            />

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setConfirmText('')
                  setDeleteError(null)
                  exitSelectionMode()
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={!isConfirmValid || deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedCount} {selectedCount === 1 ? 'Book' : 'Books'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
