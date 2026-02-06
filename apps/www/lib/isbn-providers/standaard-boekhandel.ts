// Standaard Boekhandel ISBN Provider (HTML + internal API)
// Uses autocomplete API for search + JSON-LD structured data from product pages
// No authentication required, no blocking/WAF detected

import type { IsbnProvider, ProviderResult, SearchParams, SearchResults, SearchResultItem, BookData } from './types'

const BASE_URL = 'https://www.standaardboekhandel.be'
const AUTOCOMPLETE_URL = `${BASE_URL}/services/Ecom-SB/nl-BE/SuggestionSearch/Autocomplete?dataSource=%7BDECFDF39-DC39-4706-B61B-27D0FB06CE38%7D`
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

interface AutocompleteItem {
  propertyLabel: string | null
  searchText: string
  text: string
  subText: string | null  // usually author name
  relativeUrl: string     // e.g. "/p/le-petit-prince-9782070408504"
  imageUrl: string | null
  score: number
  productTypeName: string | null  // "BOOK", etc.
  renderImage: boolean
  preferredNavigation: boolean
}

interface AutocompleteGroup {
  groupName: string       // "Zoekresultaten", "Zoeksuggesties"
  autocompletes: AutocompleteItem[]
  groupRendering: string
}

interface AutocompleteResponse {
  autocomplete: AutocompleteGroup[]
  executeCurrentSearchText: string
  navigationUrl: string | null
}

// Schema.org JSON-LD from product page
interface JsonLdBook {
  '@type': string
  name?: string
  description?: string
  image?: { '@type': string; url: string } | string
  url?: string
  author?: Array<{ '@type': string; name: string }> | { '@type': string; name: string }
  publisher?: Array<{ '@type': string; name: string }> | { '@type': string; name: string }
  offers?: {
    priceCurrency?: string
    price?: string
    availability?: string
  }
  workExample?: {
    isbn?: string
    datePublished?: string
    numberOfPages?: number | string
    bookFormat?: string
    name?: string
  }
}

/**
 * Extract ISBN from a Standaard Boekhandel product URL
 * URLs look like: /p/le-petit-prince-9782070408504
 */
function extractIsbnFromUrl(url: string): string | undefined {
  const match = url.match(/(\d{13}|\d{10})(?:\?|$|#)/) || url.match(/-(\d{13})$/) || url.match(/-(\d{10})$/)
  return match ? match[1] : undefined
}

/**
 * Search autocomplete API
 */
async function searchAutocomplete(query: string): Promise<AutocompleteItem[]> {
  const response = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: `searchText=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Autocomplete HTTP ${response.status}`)
  }

  const data: AutocompleteResponse = await response.json()

  // Collect all product items from all groups
  const items: AutocompleteItem[] = []
  for (const group of data.autocomplete) {
    for (const item of group.autocompletes) {
      // Only include items with product URLs (not category/author links)
      if (item.relativeUrl && item.relativeUrl.startsWith('/p/')) {
        items.push(item)
      }
    }
  }

  return items
}

/**
 * Fetch and parse JSON-LD structured data from a product page
 */
async function fetchProductPage(relativeUrl: string): Promise<{ jsonLd: JsonLdBook | null; fullUrl: string }> {
  const fullUrl = `${BASE_URL}${relativeUrl}`
  const response = await fetch(fullUrl, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Product page HTTP ${response.status}`)
  }

  const html = await response.text()

  // Extract JSON-LD script tag with Book type
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  let jsonLdMatch: RegExpExecArray | null
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(jsonLdMatch[1])
      if (parsed['@type'] === 'Book') {
        return { jsonLd: parsed, fullUrl }
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return { jsonLd: null, fullUrl }
}

/**
 * Parse JSON-LD Book data into our BookData format
 */
function parseJsonLdToBookData(jsonLd: JsonLdBook, relativeUrl: string): BookData {
  const bookData: BookData = {}

  // Title
  if (jsonLd.name) bookData.title = jsonLd.name
  if (jsonLd.description) bookData.description = jsonLd.description

  // Authors
  if (jsonLd.author) {
    const authors = Array.isArray(jsonLd.author) ? jsonLd.author : [jsonLd.author]
    bookData.authors = authors
      .map(a => typeof a === 'string' ? a : a.name)
      .filter(Boolean)
  }

  // Publisher (note: SB sometimes shows distributor e.g. "GARDNERS" instead of real publisher)
  if (jsonLd.publisher) {
    const publishers = Array.isArray(jsonLd.publisher) ? jsonLd.publisher : [jsonLd.publisher]
    const pubName = typeof publishers[0] === 'string' ? publishers[0] : publishers[0]?.name
    if (pubName) bookData.publisher = pubName
  }

  // Cover image
  if (jsonLd.image) {
    if (typeof jsonLd.image === 'string') {
      bookData.cover_url = jsonLd.image
    } else if (jsonLd.image.url) {
      bookData.cover_url = jsonLd.image.url
    }
  }

  // workExample contains ISBN, pages, date, format
  const work = jsonLd.workExample
  if (work) {
    if (work.isbn) {
      const isbn = work.isbn.replace(/[-\s]/g, '')
      if (isbn.length === 13) bookData.isbn_13 = isbn
      else if (isbn.length === 10) bookData.isbn_10 = isbn
    }

    if (work.datePublished) {
      const yearMatch = work.datePublished.match(/(\d{4})/)
      if (yearMatch) bookData.publication_year = yearMatch[1]
    }

    if (work.numberOfPages) {
      const pages = typeof work.numberOfPages === 'string'
        ? parseInt(work.numberOfPages)
        : work.numberOfPages
      if (!isNaN(pages)) bookData.pages = pages
    }

    if (work.bookFormat) {
      // Schema.org format like "http://schema.org/Paperback"
      const formatMatch = work.bookFormat.match(/schema\.org\/(\w+)$/)
      if (formatMatch) bookData.format = formatMatch[1]
    }
  }

  // Try to extract ISBN from URL as fallback
  if (!bookData.isbn_13 && !bookData.isbn_10) {
    const urlIsbn = extractIsbnFromUrl(relativeUrl)
    if (urlIsbn) {
      if (urlIsbn.length === 13) bookData.isbn_13 = urlIsbn
      else if (urlIsbn.length === 10) bookData.isbn_10 = urlIsbn
    }
  }

  return bookData
}

/**
 * Convert autocomplete item to search result list item
 */
function autocompleteToListItem(item: AutocompleteItem): SearchResultItem {
  const isbn = extractIsbnFromUrl(item.relativeUrl)

  return {
    title: item.text || item.searchText,
    authors: item.subText ? [item.subText] : undefined,
    isbn_13: isbn && isbn.length === 13 ? isbn : undefined,
    isbn_10: isbn && isbn.length === 10 ? isbn : undefined,
    cover_url: item.imageUrl || undefined,
    format: item.productTypeName === 'EBOOK' ? 'eBook' : undefined,
    // Use relative URL as edition key for getDetails
    edition_key: item.relativeUrl,
  }
}

export const standaardBoekhandel: IsbnProvider = {
  code: 'standaard',
  name: 'Standaard Boekhandel',
  country: 'BE',
  type: 'html',

  async search(isbn: string): Promise<ProviderResult> {
    try {
      const cleanIsbn = isbn.replace(/[-\s]/g, '')

      // Step 1: Search by ISBN via autocomplete
      const items = await searchAutocomplete(cleanIsbn)

      if (items.length === 0) {
        return { success: false, error: 'No results found', provider: 'standaard' }
      }

      // Find the best match (prefer exact ISBN match in URL)
      const exactMatch = items.find(item => item.relativeUrl.includes(cleanIsbn))
      const bestItem = exactMatch || items[0]

      // Step 2: Fetch full details from product page
      const { jsonLd, fullUrl } = await fetchProductPage(bestItem.relativeUrl)

      if (!jsonLd) {
        // Fallback: return what we have from autocomplete
        const fallbackData: BookData = {
          title: bestItem.text || bestItem.searchText,
          authors: bestItem.subText ? [bestItem.subText] : undefined,
          isbn_13: cleanIsbn.length === 13 ? cleanIsbn : undefined,
          isbn_10: cleanIsbn.length === 10 ? cleanIsbn : undefined,
          cover_url: bestItem.imageUrl || undefined,
        }
        return {
          success: true,
          data: fallbackData,
          provider: 'standaard',
          source_url: fullUrl,
        }
      }

      const bookData = parseJsonLdToBookData(jsonLd, bestItem.relativeUrl)

      return {
        success: true,
        data: bookData,
        provider: 'standaard',
        source_url: fullUrl,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'standaard',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    try {
      // Build a search query from params
      const queryParts: string[] = []
      if (params.isbn) queryParts.push(params.isbn.replace(/[-\s]/g, ''))
      if (params.title) queryParts.push(params.title)
      if (params.author) queryParts.push(params.author)
      // Publisher search not well supported by autocomplete, but add it anyway
      if (params.publisher && !params.title && !params.author) queryParts.push(params.publisher)

      if (queryParts.length === 0) {
        return { items: [], total: 0, provider: 'standaard', error: 'No search parameters' }
      }

      const query = queryParts.join(' ')
      const items = await searchAutocomplete(query)

      const results = items
        .filter(item => {
          // Only include books (skip non-book product types)
          if (item.productTypeName && item.productTypeName !== 'BOOK' && item.productTypeName !== 'EBOOK') {
            return false
          }
          return true
        })
        .map(autocompleteToListItem)

      // Apply pagination (autocomplete returns max ~10 items anyway)
      const offset = params.offset || 0
      const limit = params.limit || 20
      const paged = results.slice(offset, offset + limit)

      return {
        items: paged,
        total: results.length,
        provider: 'standaard',
        hasMore: (offset + paged.length) < results.length,
      }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'standaard',
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    try {
      // editionKey is the relative URL, e.g. "/p/le-petit-prince-9782070408504"
      const { jsonLd, fullUrl } = await fetchProductPage(editionKey)

      if (!jsonLd) {
        return {
          success: false,
          error: 'No structured data found on product page',
          provider: 'standaard',
          source_url: fullUrl,
        }
      }

      const bookData = parseJsonLdToBookData(jsonLd, editionKey)

      if (!bookData.title) {
        return {
          success: false,
          error: 'No title in structured data',
          provider: 'standaard',
          source_url: fullUrl,
        }
      }

      return {
        success: true,
        data: bookData,
        provider: 'standaard',
        source_url: fullUrl,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'standaard',
      }
    }
  },
}

export default standaardBoekhandel
