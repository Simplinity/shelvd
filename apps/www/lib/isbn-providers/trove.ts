// Trove / NLA (Australia) Provider
// National Library of Australia discovery service — billions of items
// REST JSON v3 API — requires free API key
// https://trove.nla.gov.au/about/create-something/using-api

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const API_BASE = 'https://api.trove.nla.gov.au/v3'
const API_KEY = process.env.TROVE_API_KEY || ''

// Trove API v3 response types
interface TroveContributor {
  name: string
  id?: string
}

interface TroveWork {
  id: string
  url: string
  title: string
  contributor?: string[]
  issued?: number   // year
  type?: string[]
  isPartOf?: { value?: string; type?: string }[]
  subject?: string[]
  language?: { value?: string; code?: string }[]
  identifier?: { value: string; type: string }[]
  abstract?: string
  troveUrl?: string
}

interface TroveSearchCategory {
  code: string
  name: string
  records: {
    total: number
    next?: string
    work?: TroveWork[]
    s?: string
    n?: number
  }
}

interface TroveSearchResponse {
  category?: TroveSearchCategory[]
}

interface TroveWorkResponse {
  id: string
  title: string
  contributor?: string[]
  issued?: number
  type?: string[]
  isPartOf?: { value?: string; type?: string }[]
  subject?: string[]
  language?: { value?: string; code?: string }[]
  identifier?: { value: string; type: string }[]
  abstract?: string
  troveUrl?: string
  holding?: Array<{
    nuc?: string
    name?: string
  }>
}

/**
 * Parse a Trove work into BookData
 */
function parseTroveWork(work: TroveWork | TroveWorkResponse): BookData {
  const bookData: BookData = {}

  // Title — may contain subtitle after " : "
  if (work.title) {
    const parts = work.title.split(' : ')
    bookData.title = parts[0].trim().replace(/\s*\/\s*$/, '') // Remove trailing " /"
    if (parts.length > 1) {
      bookData.subtitle = parts.slice(1).join(' : ').trim().replace(/\s*\/\s*$/, '')
    }
  }

  // Authors
  if (work.contributor && work.contributor.length > 0) {
    bookData.authors = work.contributor
  }

  // Publication year
  if (work.issued) {
    bookData.publication_year = String(work.issued)
  }

  // Language
  if (work.language && work.language.length > 0) {
    bookData.language = work.language[0].code || work.language[0].value
  }

  // Identifiers (ISBN, OCLC, etc.)
  if (work.identifier) {
    for (const id of work.identifier) {
      if (id.type === 'isbn') {
        const clean = id.value.replace(/[-\s]/g, '')
        if (clean.length === 13 && !bookData.isbn_13) bookData.isbn_13 = clean
        else if (clean.length === 10 && !bookData.isbn_10) bookData.isbn_10 = clean
      }
      if (id.type === 'oclc' && !bookData.oclc_number) {
        bookData.oclc_number = id.value
      }
    }
  }

  // Subjects
  if (work.subject && work.subject.length > 0) {
    bookData.subjects = work.subject
  }

  // Description/abstract
  if (work.abstract) {
    bookData.description = work.abstract
  }

  // Series — isPartOf
  if (work.isPartOf) {
    const seriesPart = work.isPartOf.find(p => p.type === 'series')
    if (seriesPart && seriesPart.value) {
      bookData.series = seriesPart.value
    }
  }

  // Format — type
  if (work.type && work.type.length > 0) {
    bookData.format = work.type[0]
  }

  return bookData
}

/**
 * Build fetch headers with API key
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Accept': 'application/json' }
  if (API_KEY) headers['X-API-KEY'] = API_KEY
  return headers
}

export const trove: IsbnProvider = {
  code: 'trove',
  name: 'Trove (Australia)',
  country: 'AU',
  type: 'api',

  async search(isbn: string): Promise<ProviderResult> {
    if (!API_KEY) {
      return { success: false, error: 'TROVE_API_KEY not configured', provider: 'trove' }
    }

    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const url = `${API_BASE}/result?q=isbn:${cleanIsbn}&category=book&encoding=json&n=1`

    try {
      const response = await fetch(url, {
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'trove' }
      }

      const data: TroveSearchResponse = await response.json()
      const bookCategory = data.category?.find(c => c.code === 'book')

      if (!bookCategory?.records?.work || bookCategory.records.work.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'trove' }
      }

      const bookData = parseTroveWork(bookCategory.records.work[0])

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'trove' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      const troveUrl = bookCategory.records.work[0].troveUrl || bookCategory.records.work[0].url
      return {
        success: true,
        data: bookData,
        provider: 'trove',
        source_url: troveUrl || `https://trove.nla.gov.au/search?keyword=isbn:${cleanIsbn}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'trove',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    if (!API_KEY) {
      return { items: [], total: 0, provider: 'trove', error: 'TROVE_API_KEY not configured' }
    }

    // Build Trove query
    const parts: string[] = []
    if (params.isbn) parts.push(`isbn:${params.isbn.replace(/[-\s]/g, '')}`)
    if (params.title) parts.push(`title:(${params.title})`)
    if (params.author) parts.push(`creator:(${params.author})`)
    if (params.publisher) parts.push(`publisher:(${params.publisher})`)

    if (parts.length === 0) {
      return { items: [], total: 0, provider: 'trove', error: 'No search parameters' }
    }

    const query = parts.join(' ')
    const limit = Math.min(params.limit || 20, 100)
    const offset = params.offset || 0

    // Trove uses s= for start offset and n= for count
    const url = `${API_BASE}/result?q=${encodeURIComponent(query)}&category=book&encoding=json&n=${limit}&s=${offset}`

    try {
      const response = await fetch(url, {
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'trove', error: `HTTP ${response.status}` }
      }

      const data: TroveSearchResponse = await response.json()
      const bookCategory = data.category?.find(c => c.code === 'book')
      const works = bookCategory?.records?.work || []
      const total = bookCategory?.records?.total || 0

      const items: SearchResultItem[] = works.map(work => {
        const parsed = parseTroveWork(work)
        return {
          title: parsed.title || 'Untitled',
          subtitle: parsed.subtitle,
          authors: parsed.authors,
          publisher: parsed.publisher,
          publication_year: parsed.publication_year,
          isbn_13: parsed.isbn_13,
          isbn_10: parsed.isbn_10,
          format: parsed.format,
          edition_key: work.id,
        }
      })

      const hasMore = (offset + works.length) < total
      return { items, total, provider: 'trove', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'trove',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    if (!API_KEY) {
      return { success: false, error: 'TROVE_API_KEY not configured', provider: 'trove' }
    }

    const url = `${API_BASE}/work/${editionKey}?encoding=json&include=holdings`

    try {
      const response = await fetch(url, {
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'trove' }
      }

      const data: TroveWorkResponse = await response.json()
      const bookData = parseTroveWork(data)

      return {
        success: true,
        data: bookData,
        provider: 'trove',
        source_url: data.troveUrl || `https://trove.nla.gov.au/work/${editionKey}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'trove',
      }
    }
  },
}
