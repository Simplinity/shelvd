// NDL — National Diet Library (Japan) Provider
// Largest library in Japan — OpenSearch API returning RSS with Dublin Core
// https://ndlsearch.ndl.go.jp/api/opensearch
// No auth required

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const OPENSEARCH_BASE = 'https://ndlsearch.ndl.go.jp/api/opensearch'

// ===================== XML HELPER FUNCTIONS =====================

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
    .trim()
}

/**
 * Extract text content of a single XML element (first occurrence)
 */
function getElementText(xml: string, tag: string): string | undefined {
  // Handle both namespaced (dc:title, dcndl:titleTranscription) and plain tags
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`)
  const match = xml.match(regex)
  if (!match) return undefined
  return decodeXmlEntities(match[1])
}

/**
 * Extract text of all matching elements
 */
function getAllElementTexts(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g')
  const results: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    const text = decodeXmlEntities(match[1])
    if (text) results.push(text)
  }
  return results
}

/**
 * Extract all <item> blocks from RSS
 */
function extractItems(rssXml: string): string[] {
  const items: string[] = []
  const regex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(rssXml)) !== null) {
    items.push(match[1])
  }
  return items
}

/**
 * Get total results count from openSearch:totalResults
 */
function getTotalResults(xml: string): number {
  const match = xml.match(/<openSearch:totalResults>(\d+)<\/openSearch:totalResults>/)
  return match ? parseInt(match[1]) : 0
}

/**
 * Parse an NDL RSS <item> into BookData
 * NDL uses Dublin Core (dc:*) and NDL-specific (dcndl:*) elements
 */
function parseNdlItem(itemXml: string): BookData {
  const bookData: BookData = {}

  // Title — dc:title (may include subtitle after " : ")
  const title = getElementText(itemXml, 'dc:title')
  if (title) {
    const parts = title.split(' : ')
    bookData.title = parts[0].trim()
    if (parts.length > 1) {
      bookData.subtitle = parts.slice(1).join(' : ').trim()
    }
  }

  // Authors — dc:creator (can be multiple)
  const creators = getAllElementTexts(itemXml, 'dc:creator')
  if (creators.length > 0) {
    bookData.authors = creators
  }

  // Publisher — dc:publisher
  const publisher = getElementText(itemXml, 'dc:publisher')
  if (publisher) bookData.publisher = publisher

  // Publication date — dc:date or dcterms:issued
  const date = getElementText(itemXml, 'dc:date') || getElementText(itemXml, 'dcterms:issued')
  if (date) {
    const yearMatch = date.match(/(\d{4})/)
    if (yearMatch) bookData.publication_year = yearMatch[1]
  }

  // Language — dc:language
  const lang = getElementText(itemXml, 'dc:language')
  if (lang) bookData.language = lang

  // ISBN — dc:identifier with xsi:type="dcndl:ISBN" or just text matching
  const identifiers = getAllElementTexts(itemXml, 'dc:identifier')
  for (const id of identifiers) {
    const clean = id.replace(/[-\s]/g, '')
    if (/^\d{13}$/.test(clean)) {
      if (!bookData.isbn_13) bookData.isbn_13 = clean
    } else if (/^\d{10}$/.test(clean)) {
      if (!bookData.isbn_10) bookData.isbn_10 = clean
    }
  }

  // Also check dcndl:ISBN specifically
  const ndlIsbns = getAllElementTexts(itemXml, 'dcndl:ISBN')
  for (const isbn of ndlIsbns) {
    const clean = isbn.replace(/[-\s]/g, '')
    if (clean.length === 13 && !bookData.isbn_13) bookData.isbn_13 = clean
    else if (clean.length === 10 && !bookData.isbn_10) bookData.isbn_10 = clean
  }

  // Subjects — dc:subject
  const subjects = getAllElementTexts(itemXml, 'dc:subject')
  if (subjects.length > 0) bookData.subjects = subjects

  // Description — dc:description
  const description = getElementText(itemXml, 'dc:description')
  if (description) bookData.description = description

  // Physical extent (pages) — dcterms:extent
  const extent = getElementText(itemXml, 'dcterms:extent')
  if (extent) {
    bookData.pagination_description = extent
    const pageMatch = extent.match(/(\d+)\s*p/)
    if (pageMatch) bookData.pages = parseInt(pageMatch[1])
  }

  // Series — dcndl:seriesTitle
  const series = getElementText(itemXml, 'dcndl:seriesTitle')
  if (series) bookData.series = series

  // Edition — dcndl:edition
  const edition = getElementText(itemXml, 'dcndl:edition')
  if (edition) bookData.edition = edition

  // DDC — dc:subject with xsi:type="dcndl:DDC"
  // We check for DDC pattern in identifiers
  const ddcMatch = itemXml.match(/<dc:subject\s+xsi:type="dcndl:DDC"[^>]*>([^<]+)<\/dc:subject>/)
  if (ddcMatch) bookData.ddc = decodeXmlEntities(ddcMatch[1])

  // NDL classification — dcndl:NDC
  const ndcMatch = itemXml.match(/<dc:subject\s+xsi:type="dcndl:NDC[^"]*"[^>]*>([^<]+)<\/dc:subject>/)
  if (ndcMatch && !bookData.ddc) bookData.ddc = decodeXmlEntities(ndcMatch[1])

  return bookData
}

/**
 * Get the source URL from an <item>'s <link> or <guid>
 */
function getItemUrl(itemXml: string): string | undefined {
  return getElementText(itemXml, 'link') || getElementText(itemXml, 'guid')
}

export const ndl: IsbnProvider = {
  code: 'ndl',
  name: 'NDL (Japan)',
  country: 'JP',
  type: 'api',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const url = `${OPENSEARCH_BASE}?isbn=${cleanIsbn}&cnt=1`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'ndl' }
      }

      const xml = await response.text()
      const items = extractItems(xml)

      if (items.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'ndl' }
      }

      const bookData = parseNdlItem(items[0])

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'ndl' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      return {
        success: true,
        data: bookData,
        provider: 'ndl',
        source_url: getItemUrl(items[0]) || `https://ndlsearch.ndl.go.jp/search?isbn=${cleanIsbn}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'ndl',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    // Build NDL OpenSearch query params
    const queryParams = new URLSearchParams()

    if (params.isbn) queryParams.set('isbn', params.isbn.replace(/[-\s]/g, ''))
    if (params.title) queryParams.set('title', params.title)
    if (params.author) queryParams.set('creator', params.author)
    if (params.publisher) queryParams.set('publisher', params.publisher)
    if (params.yearFrom) queryParams.set('from', params.yearFrom)
    if (params.yearTo) queryParams.set('until', params.yearTo)

    if (queryParams.toString() === '') {
      return { items: [], total: 0, provider: 'ndl', error: 'No search parameters' }
    }

    const limit = Math.min(params.limit || 20, 200)
    const offset = params.offset || 0
    queryParams.set('cnt', String(limit))
    queryParams.set('idx', String(offset + 1)) // 1-based

    const url = `${OPENSEARCH_BASE}?${queryParams.toString()}`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'ndl', error: `HTTP ${response.status}` }
      }

      const xml = await response.text()
      const rssItems = extractItems(xml)
      const total = getTotalResults(xml)

      const items: SearchResultItem[] = rssItems.map((itemXml, i) => {
        const parsed = parseNdlItem(itemXml)
        const itemUrl = getItemUrl(itemXml)
        // Extract NDL record ID from URL for edition_key
        const idMatch = itemUrl?.match(/\/(\d+)(?:\?|$)/) || itemUrl?.match(/bibid=(\d+)/)
        const editionKey = idMatch ? idMatch[1] : `ndl-${offset + i}`

        return {
          title: parsed.title || 'Untitled',
          subtitle: parsed.subtitle,
          authors: parsed.authors,
          publisher: parsed.publisher,
          publication_year: parsed.publication_year,
          isbn_13: parsed.isbn_13,
          isbn_10: parsed.isbn_10,
          format: parsed.format,
          edition_key: editionKey,
        }
      })

      const hasMore = (offset + rssItems.length) < total
      return { items, total, provider: 'ndl', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'ndl',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },
}
