// Europeana Search & Record API Provider
// https://api.europeana.eu/ — 200M+ records from 4,000+ European cultural institutions
// Requires API key: https://pro.europeana.eu/page/get-api
// Free tier, JSON responses, supports ISBN/title/author search

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const API_KEY = process.env.EUROPEANA_API_KEY || ''
const SEARCH_URL = 'https://api.europeana.eu/record/v2/search.json'
const RECORD_URL = 'https://api.europeana.eu/record/v2'

// EDM item from Search API response
interface EuropeanaItem {
  id: string
  title?: string[]
  dcCreator?: string[]
  dcCreatorLangAware?: Record<string, string[]>
  dcDescription?: string[]
  dcDescriptionLangAware?: Record<string, string[]>
  dcPublisher?: string[]
  dcIdentifier?: string[]
  dcDate?: string[]
  dcLanguage?: string[]
  dcSubject?: string[]
  dcType?: string[]
  dcFormat?: string[]
  dctermsExtent?: string[]
  year?: string[]
  dataProvider?: string[]
  provider?: string[]
  country?: string[]
  edmPreview?: string[]
  edmIsShownAt?: string[]
  edmIsShownBy?: string[]
  guid?: string
  link?: string
  type?: string
  europeanaCompleteness?: number
}

// Record API full response
interface EuropeanaRecord {
  object?: {
    europeanaAggregation?: {
      edmPreview?: string
    }
    proxies?: Array<{
      dcTitle?: Record<string, string[]>
      dcCreator?: Record<string, string[]>
      dcPublisher?: Record<string, string[]>
      dcDescription?: Record<string, string[]>
      dcIdentifier?: Record<string, string[]>
      dcDate?: Record<string, string[]>
      dcLanguage?: Record<string, string[]>
      dcSubject?: Record<string, string[]>
      dcFormat?: Record<string, string[]>
      dcType?: Record<string, string[]>
      dctermsExtent?: Record<string, string[]>
      dcSource?: Record<string, string[]>
      dcRelation?: Record<string, string[]>
      about?: string
    }>
    aggregations?: Array<{
      edmIsShownAt?: string
      edmIsShownBy?: string
      edmDataProvider?: Record<string, string[]>
      edmProvider?: Record<string, string[]>
    }>
  }
}

/**
 * Extract first value from a lang-aware map or string array
 */
function firstVal(field?: Record<string, string[]> | string[]): string | undefined {
  if (!field) return undefined
  if (Array.isArray(field)) return field[0]
  // Lang-aware map: prefer 'en', then 'def', then first available
  if (field['en']?.[0]) return field['en'][0]
  if (field['def']?.[0]) return field['def'][0]
  const keys = Object.keys(field)
  if (keys.length > 0 && field[keys[0]]?.[0]) return field[keys[0]][0]
  return undefined
}

/**
 * Extract all values from a lang-aware map or string array
 */
function allVals(field?: Record<string, string[]> | string[]): string[] {
  if (!field) return []
  if (Array.isArray(field)) return field
  const result: string[] = []
  for (const vals of Object.values(field)) {
    result.push(...vals)
  }
  return Array.from(new Set(result))
}

/**
 * Extract ISBN from dcIdentifier values
 */
function extractIsbn(identifiers: string[]): { isbn_13?: string; isbn_10?: string } {
  const result: { isbn_13?: string; isbn_10?: string } = {}
  for (const id of identifiers) {
    const clean = id.replace(/[-\s]/g, '')
    if (/^\d{13}$/.test(clean) && (clean.startsWith('978') || clean.startsWith('979'))) {
      result.isbn_13 = clean
    } else if (/^\d{9}[\dXx]$/.test(clean)) {
      result.isbn_10 = clean
    }
  }
  return result
}

/**
 * Extract year from dcDate or year fields
 */
function extractYear(dates: string[]): string | undefined {
  for (const d of dates) {
    const match = d.match(/(\d{4})/)
    if (match) return match[1]
  }
  return undefined
}

/**
 * Extract page count from dctermsExtent or dcFormat
 */
function extractPages(extents: string[]): number | undefined {
  for (const e of extents) {
    const match = e.match(/(\d+)\s*(?:p\.|pages?|pp\.?|S\.)/i)
    if (match) return parseInt(match[1])
  }
  return undefined
}

/**
 * Parse a search result item from the Search API
 */
function parseSearchItem(item: EuropeanaItem): SearchResultItem {
  const identifiers = item.dcIdentifier || []
  const isbns = extractIsbn(identifiers)
  const year = item.year?.[0] || extractYear(item.dcDate || [])

  return {
    title: item.title?.[0] || 'Untitled',
    authors: item.dcCreator,
    publisher: item.dcPublisher?.[0],
    publication_year: year,
    isbn_13: isbns.isbn_13,
    isbn_10: isbns.isbn_10,
    cover_url: item.edmPreview?.[0],
    edition_key: item.id, // Europeana record ID like /2021672/resource_xxx
  }
}

/**
 * Parse full BookData from a Search API item
 */
function parseItemToBookData(item: EuropeanaItem): BookData {
  const identifiers = item.dcIdentifier || []
  const isbns = extractIsbn(identifiers)
  const dates = [...(item.year || []), ...(item.dcDate || [])]
  const year = extractYear(dates)
  const extents = item.dctermsExtent || item.dcFormat || []
  const pages = extractPages(extents)

  return {
    title: item.title?.[0],
    authors: item.dcCreator,
    publisher: item.dcPublisher?.[0],
    publication_year: year,
    pages,
    language: item.dcLanguage?.[0],
    isbn_13: isbns.isbn_13,
    isbn_10: isbns.isbn_10,
    cover_url: item.edmPreview?.[0],
    description: item.dcDescription?.[0],
    subjects: item.dcSubject,
    format: item.dcFormat?.[0],
    pagination_description: extents[0],
  }
}

/**
 * Parse full BookData from the Record API response
 */
function parseRecordToBookData(record: EuropeanaRecord): BookData {
  // Use the provider proxy (first one) — Europeana proxy is second
  const proxy = record.object?.proxies?.[0]
  const agg = record.object?.aggregations?.[0]
  
  if (!proxy) return {}

  const identifiers = allVals(proxy.dcIdentifier)
  const isbns = extractIsbn(identifiers)
  const dates = allVals(proxy.dcDate)
  const year = extractYear(dates)
  const extents = [...allVals(proxy.dctermsExtent), ...allVals(proxy.dcFormat)]
  const pages = extractPages(extents)

  return {
    title: firstVal(proxy.dcTitle),
    authors: allVals(proxy.dcCreator),
    publisher: firstVal(proxy.dcPublisher),
    publication_year: year,
    pages,
    language: firstVal(proxy.dcLanguage),
    isbn_13: isbns.isbn_13,
    isbn_10: isbns.isbn_10,
    cover_url: record.object?.europeanaAggregation?.edmPreview,
    description: firstVal(proxy.dcDescription),
    subjects: allVals(proxy.dcSubject),
    format: firstVal(proxy.dcFormat),
    pagination_description: firstVal(proxy.dctermsExtent),
    notes: firstVal(proxy.dcSource),
  }
}

export const europeana: IsbnProvider = {
  code: 'europeana',
  name: 'Europeana',
  type: 'api',

  async search(isbn: string): Promise<ProviderResult> {
    if (!API_KEY) {
      return { success: false, error: 'EUROPEANA_API_KEY not configured', provider: 'europeana' }
    }

    const cleanIsbn = isbn.replace(/[-\s]/g, '')

    try {
      // Search by ISBN in dcIdentifier, filtered to TEXT type (books)
      const query = encodeURIComponent(`"${cleanIsbn}"`)
      const url = `${SEARCH_URL}?wskey=${API_KEY}&query=${query}&qf=TYPE:TEXT&rows=5&profile=standard`

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'europeana' }
      }

      const data = await response.json()

      if (!data.success || !data.items || data.items.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'europeana' }
      }

      // Find the best match — prefer items that actually contain the ISBN in dcIdentifier
      let bestItem: EuropeanaItem | undefined
      for (const item of data.items as EuropeanaItem[]) {
        const ids = item.dcIdentifier || []
        if (ids.some(id => id.replace(/[-\s]/g, '').includes(cleanIsbn))) {
          bestItem = item
          break
        }
      }
      if (!bestItem) bestItem = data.items[0]

      const bookData = parseItemToBookData(bestItem)

      if (!bookData.title) {
        return { success: false, error: 'No title in response', provider: 'europeana' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      const sourceUrl = bestItem.guid || `https://www.europeana.eu/item${bestItem.id}`

      return {
        success: true,
        data: bookData,
        provider: 'europeana',
        source_url: sourceUrl,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'europeana',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    if (!API_KEY) {
      return { items: [], total: 0, provider: 'europeana', error: 'EUROPEANA_API_KEY not configured' }
    }

    try {
      // Build Europeana query
      const queryParts: string[] = []
      if (params.isbn) {
        queryParts.push(`"${params.isbn.replace(/[-\s]/g, '')}"`)
      }
      if (params.title) {
        queryParts.push(`proxy_dc_title:("${params.title}")`)
      }
      if (params.author) {
        queryParts.push(`proxy_dc_creator:("${params.author}")`)
      }
      if (params.publisher) {
        queryParts.push(`proxy_dc_publisher:("${params.publisher}")`)
      }

      if (queryParts.length === 0) {
        return { items: [], total: 0, provider: 'europeana', error: 'No search parameters' }
      }

      const query = encodeURIComponent(queryParts.join(' AND '))
      const rows = Math.min(params.limit || 50, 100) // Europeana max is 100
      const start = (params.offset || 0) + 1 // 1-based

      // Build query filters
      const qfParts: string[] = ['TYPE:TEXT'] // books only
      if (params.yearFrom) {
        qfParts.push(`YEAR:[${params.yearFrom} TO ${params.yearTo || '*'}]`)
      } else if (params.yearTo) {
        qfParts.push(`YEAR:[* TO ${params.yearTo}]`)
      }

      const qf = qfParts.map(f => `&qf=${encodeURIComponent(f)}`).join('')
      const url = `${SEARCH_URL}?wskey=${API_KEY}&query=${query}${qf}&rows=${rows}&start=${start}&profile=standard`

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'europeana', error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.success || !data.items || data.items.length === 0) {
        return { items: [], total: data.totalResults || 0, provider: 'europeana' }
      }

      const items = (data.items as EuropeanaItem[]).map(parseSearchItem)
      const total = data.totalResults || items.length
      const hasMore = (start - 1 + data.items.length) < total

      return { items, total, provider: 'europeana', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'europeana',
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  },

  async getDetails(recordId: string): Promise<ProviderResult> {
    if (!API_KEY) {
      return { success: false, error: 'EUROPEANA_API_KEY not configured', provider: 'europeana' }
    }

    try {
      // Record API: /record/v2/{id}.json
      const url = `${RECORD_URL}${recordId}.json?wskey=${API_KEY}`

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'europeana' }
      }

      const data = await response.json() as EuropeanaRecord & { success?: boolean }

      if (data.success === false) {
        return { success: false, error: 'Record not found', provider: 'europeana' }
      }

      const bookData = parseRecordToBookData(data)

      if (!bookData.title) {
        return { success: false, error: 'No title in response', provider: 'europeana' }
      }

      return {
        success: true,
        data: bookData,
        provider: 'europeana',
        source_url: `https://www.europeana.eu/item${recordId}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'europeana',
      }
    }
  },
}

export default europeana
