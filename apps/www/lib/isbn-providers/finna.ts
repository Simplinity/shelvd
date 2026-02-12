// Finna (Finland) Provider
// Finnish discovery service aggregating 460+ archives, libraries, museums
// REST JSON API — no auth, CC0 license, CORS enabled
// https://api.finna.fi/ — Swagger: https://api.finna.fi/v1?swagger

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const API_BASE = 'https://api.finna.fi/api/v1'

// Fields we request from the API (minimises response size)
const SEARCH_FIELDS = [
  'title', 'subTitle', 'nonPresenterAuthors', 'publishers',
  'publicationDates', 'languages', 'subjects', 'ISBNs',
  'formats', 'images', 'series', 'physicalDescriptions',
  'summary', 'id', 'dedupIds',
].join(',')

const DETAIL_FIELDS = [
  ...SEARCH_FIELDS.split(','),
  'edition', 'classifications', 'identifierString',
].join(',')

// Finna API response types
interface FinnaAuthor {
  name: string
  role?: string
}

interface FinnaRecord {
  id: string
  title: string
  subTitle?: string
  nonPresenterAuthors?: FinnaAuthor[]
  publishers?: string[]
  publicationDates?: string[]
  languages?: string[]
  subjects?: string[][]
  ISBNs?: string[]
  formats?: Array<{ value: string; translated: string }>
  images?: string[]
  series?: Array<{ name: string; additional?: string }>
  physicalDescriptions?: string[]
  summary?: string[]
  edition?: string
  classifications?: Array<{ label: string; value: string }>
  dedupIds?: string[]
}

interface FinnaSearchResponse {
  resultCount: number
  records?: FinnaRecord[]
  status: string
}

/**
 * Parse a Finna record into our BookData format
 */
function parseFinnaRecord(record: FinnaRecord): BookData {
  const bookData: BookData = {}

  // Title & subtitle
  if (record.title) bookData.title = record.title
  if (record.subTitle) bookData.subtitle = record.subTitle

  // Authors
  if (record.nonPresenterAuthors && record.nonPresenterAuthors.length > 0) {
    bookData.authors = record.nonPresenterAuthors.map(a => a.name)
  }

  // Publisher
  if (record.publishers && record.publishers.length > 0) {
    bookData.publisher = record.publishers[0]
  }

  // Publication year
  if (record.publicationDates && record.publicationDates.length > 0) {
    const yearMatch = record.publicationDates[0].match(/(\d{4})/)
    if (yearMatch) bookData.publication_year = yearMatch[1]
  }

  // Language
  if (record.languages && record.languages.length > 0) {
    bookData.language = record.languages[0]
  }

  // ISBNs
  if (record.ISBNs && record.ISBNs.length > 0) {
    for (const isbn of record.ISBNs) {
      const clean = isbn.replace(/[-\s]/g, '')
      if (clean.length === 13 && !bookData.isbn_13) bookData.isbn_13 = clean
      else if (clean.length === 10 && !bookData.isbn_10) bookData.isbn_10 = clean
    }
  }

  // Subjects
  if (record.subjects && record.subjects.length > 0) {
    // Finna subjects are arrays of arrays — flatten them
    bookData.subjects = record.subjects.map(group => group.join(' -- '))
  }

  // Description/summary
  if (record.summary && record.summary.length > 0) {
    bookData.description = record.summary.join(' ')
  }

  // Physical description (pagination)
  if (record.physicalDescriptions && record.physicalDescriptions.length > 0) {
    bookData.pagination_description = record.physicalDescriptions[0]
    const pageMatch = record.physicalDescriptions[0].match(/(\d+)\s*(?:p\.|pages|s\.|sivua)/i)
    if (pageMatch) bookData.pages = parseInt(pageMatch[1])
  }

  // Series
  if (record.series && record.series.length > 0) {
    bookData.series = record.series[0].name
    if (record.series[0].additional) {
      bookData.series_number = record.series[0].additional
    }
  }

  // Format
  if (record.formats && record.formats.length > 0) {
    const format = record.formats.find(f => f.value.includes('Book'))
    if (format) bookData.format = format.translated || 'Book'
  }

  // Edition
  if (record.edition) bookData.edition = record.edition

  // Cover image — Finna image paths are relative
  if (record.images && record.images.length > 0) {
    const imgPath = record.images[0]
    if (imgPath.startsWith('http')) {
      bookData.cover_url = imgPath
    } else {
      bookData.cover_url = `https://api.finna.fi${imgPath}`
    }
  }

  // Classifications (DDC)
  if (record.classifications) {
    const ddc = record.classifications.find(c => c.label === 'YKL' || c.label === 'UDK' || c.label === 'DDC')
    if (ddc) bookData.ddc = ddc.value
  }

  return bookData
}

export const finna: IsbnProvider = {
  code: 'finna',
  name: 'Finna (Finland)',
  country: 'FI',
  type: 'api',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const url = `${API_BASE}/search?lookfor=${cleanIsbn}&type=ISN&field[]=${SEARCH_FIELDS}&limit=1`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'finna' }
      }

      const data: FinnaSearchResponse = await response.json()

      if (!data.records || data.records.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'finna' }
      }

      const bookData = parseFinnaRecord(data.records[0])

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'finna' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      return {
        success: true,
        data: bookData,
        provider: 'finna',
        source_url: `https://finna.fi/Record/${data.records[0].id}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'finna',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    // Build Finna search query
    const parts: string[] = []
    if (params.isbn) parts.push(params.isbn.replace(/[-\s]/g, ''))
    if (params.title) parts.push(`title:${params.title}`)
    if (params.author) parts.push(`author:${params.author}`)

    if (parts.length === 0) {
      return { items: [], total: 0, provider: 'finna', error: 'No search parameters' }
    }

    const lookfor = parts.join(' ')
    const limit = Math.min(params.limit || 20, 100)
    const page = params.offset ? Math.floor(params.offset / limit) + 1 : 1
    const searchType = params.isbn ? 'ISN' : 'AllFields'

    const url = `${API_BASE}/search?lookfor=${encodeURIComponent(lookfor)}&type=${searchType}&field[]=${SEARCH_FIELDS}&limit=${limit}&page=${page}`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'finna', error: `HTTP ${response.status}` }
      }

      const data: FinnaSearchResponse = await response.json()
      const records = data.records || []

      const items: SearchResultItem[] = records.map(rec => {
        const parsed = parseFinnaRecord(rec)
        return {
          title: parsed.title || 'Untitled',
          subtitle: parsed.subtitle,
          authors: parsed.authors,
          publisher: parsed.publisher,
          publication_year: parsed.publication_year,
          isbn_13: parsed.isbn_13,
          isbn_10: parsed.isbn_10,
          cover_url: parsed.cover_url,
          format: parsed.format,
          edition_key: rec.id,
        }
      })

      const hasMore = (page * limit) < data.resultCount
      return { items, total: data.resultCount, provider: 'finna', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'finna',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    const url = `${API_BASE}/record?id=${encodeURIComponent(editionKey)}&field[]=${DETAIL_FIELDS}`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'finna' }
      }

      const data = await response.json()
      const records = data.records || []

      if (records.length === 0) {
        return { success: false, error: 'Record not found', provider: 'finna' }
      }

      const bookData = parseFinnaRecord(records[0])
      return {
        success: true,
        data: bookData,
        provider: 'finna',
        source_url: `https://finna.fi/Record/${editionKey}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'finna',
      }
    }
  },
}
