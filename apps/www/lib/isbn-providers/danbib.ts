// DanBib — Danish Union Catalog Provider
// 14M+ records from all Danish libraries via OpenSearch API (DKABM format)
// https://opensearch.addi.dk/test_5.2/
// No auth required — public endpoint
// CQL search with DKABM (Danish extension of Dublin Core) response format
// Note: OpenSearch is "under udfasning" (being phased out) but still operational with no deadline

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const OPENSEARCH_BASE = 'https://opensearch.addi.dk/test_5.2/'
const AGENCY = '100200'
const PROFILE = 'test'

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
 * Extract text content of a single XML element (first match)
 * Handles namespaced tags like dc:title, dkdcplus:version
 */
function getElementText(xml: string, tag: string): string | undefined {
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
 * Extract text of element matching a specific xsi:type attribute
 * e.g. getElementByType(xml, 'dc:title', 'dkdcplus:full') → full title
 */
function getElementByType(xml: string, tag: string, type: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*xsi:type="${type}"[^>]*>([\\s\\S]*?)</${tag}>`)
  const match = xml.match(regex)
  if (!match) return undefined
  return decodeXmlEntities(match[1])
}

/**
 * Extract all elements matching a specific xsi:type
 */
function getAllElementsByType(xml: string, tag: string, type: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*xsi:type="${type}"[^>]*>([\\s\\S]*?)</${tag}>`, 'g')
  const results: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    const text = decodeXmlEntities(match[1])
    if (text) results.push(text)
  }
  return results
}

/**
 * Extract all <object> blocks from search response
 * Each object contains a <dkabm:record> with the bibliographic data
 */
function extractObjects(xml: string): string[] {
  const objects: string[] = []
  const regex = /<object>([\s\S]*?)<\/object>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    objects.push(match[1])
  }
  return objects
}

/**
 * Get total hit count from response
 */
function getHitCount(xml: string): number {
  const match = xml.match(/<hitCount>(\d+)<\/hitCount>/)
  return match ? parseInt(match[1]) : 0
}

/**
 * Check if more results available
 */
function hasMoreResults(xml: string): boolean {
  return /<more>true<\/more>/.test(xml)
}

/**
 * Parse a DKABM object XML into BookData
 * DKABM uses Dublin Core (dc:*) with Danish extensions (dkdcplus:*, dcterms:*)
 */
function parseDkabmObject(objectXml: string): BookData {
  const bookData: BookData = {}

  // Title — prefer dkdcplus:full, fall back to plain dc:title
  const fullTitle = getElementByType(objectXml, 'dc:title', 'dkdcplus:full')
  const plainTitle = getElementText(objectXml, 'dc:title')

  if (fullTitle) {
    // Full title often contains subtitle after " : " e.g. "Min kamp : roman. 1. bog"
    const parts = fullTitle.split(' : ')
    bookData.title = parts[0].trim()
    if (parts.length > 1) {
      bookData.subtitle = parts.slice(1).join(' : ').trim()
    }
  } else if (plainTitle) {
    bookData.title = plainTitle
  }

  // Series — dc:title with type dkdcplus:series e.g. "Min kamp ; 1"
  const seriesTitle = getElementByType(objectXml, 'dc:title', 'dkdcplus:series')
  if (seriesTitle) {
    // Extract series name and number: "Harry Potter ; 4" → series="Harry Potter", series_number="4"
    const seriesMatch = seriesTitle.match(/^(.+?)\s*;\s*(.+)$/)
    if (seriesMatch) {
      bookData.series = seriesMatch[1].trim()
      bookData.series_number = seriesMatch[2].trim()
    } else {
      bookData.series = seriesTitle
    }
  }

  // Authors — dc:creator with type oss:sort gives "Last, First" format (perfect for Shelvd)
  const sortAuthors = getAllElementsByType(objectXml, 'dc:creator', 'oss:sort')
  const authors = getAllElementsByType(objectXml, 'dc:creator', 'dkdcplus:aut')
  if (sortAuthors.length > 0) {
    bookData.authors = [...new Set(sortAuthors)]
  } else if (authors.length > 0) {
    bookData.authors = authors
  }

  // ISBN — dc:identifier with type dkdcplus:ISBN
  const isbn = getElementByType(objectXml, 'dc:identifier', 'dkdcplus:ISBN')
  if (isbn) {
    const clean = isbn.replace(/[-\s]/g, '')
    if (clean.length === 13) bookData.isbn_13 = clean
    else if (clean.length === 10) bookData.isbn_10 = clean
  }

  // Publisher — dc:publisher
  const publisher = getElementText(objectXml, 'dc:publisher')
  if (publisher) bookData.publisher = publisher

  // Publication year — dc:date
  const date = getElementText(objectXml, 'dc:date')
  if (date) {
    const yearMatch = date.match(/(\d{4})/)
    if (yearMatch) bookData.publication_year = yearMatch[1]
  }

  // Language — dc:language with type dcterms:ISO639-2 (3-letter code)
  const langCode = getElementByType(objectXml, 'dc:language', 'dcterms:ISO639-2')
  if (langCode) bookData.language = langCode

  // Edition — dkdcplus:version e.g. "2. udgave, 1. oplag (2011)"
  const version = getElementText(objectXml, 'dkdcplus:version')
  if (version) bookData.edition = version

  // Pages/extent — dcterms:extent e.g. "487 sider"
  const extent = getElementText(objectXml, 'dcterms:extent')
  if (extent) {
    bookData.pagination_description = extent
    const pageMatch = extent.match(/(\d+)\s*(?:sider|pages|p\b|s\b)/)
    if (pageMatch) bookData.pages = parseInt(pageMatch[1])
  }

  // Description/abstract — dcterms:abstract
  const abstract = getElementText(objectXml, 'dcterms:abstract')
  if (abstract) bookData.description = abstract

  // Subjects — dc:subject with type DBCS (controlled terms)
  const subjects = getAllElementsByType(objectXml, 'dc:subject', 'dkdcplus:DBCS')
  if (subjects.length > 0) bookData.subjects = subjects

  // Contributors (translator etc.) — dc:contributor with type dkdcplus:trl
  const translator = getElementByType(objectXml, 'dc:contributor', 'dkdcplus:trl')
  if (translator && !bookData.authors?.includes(translator)) {
    bookData.notes = `Oversætter: ${translator}`
  }

  return bookData
}

/**
 * Get DanBib record identifier from object XML (e.g. "870970-basis:28692765")
 */
function getObjectIdentifier(objectXml: string): string | undefined {
  return getElementText(objectXml, 'identifier')
}

/**
 * Get bibliotek.dk URL for a record
 */
function getBibliotekDkUrl(identifier: string): string {
  return `https://bibliotek.dk/materiale/${encodeURIComponent(identifier)}`
}

/**
 * Check if object is a book (type "Bog")
 */
function isBook(objectXml: string): boolean {
  const bibType = getElementByType(objectXml, 'dc:type', 'dkdcplus:BibDK-Type')
  if (!bibType) return true // If no type, include it
  return bibType === 'Bog'
}

/**
 * Build OpenSearch URL with parameters
 */
function buildSearchUrl(query: string, start: number, stepValue: number): string {
  const params = new URLSearchParams({
    action: 'search',
    query,
    agency: AGENCY,
    profile: PROFILE,
    start: String(start),
    stepValue: String(stepValue),
  })
  return `${OPENSEARCH_BASE}?${params.toString()}`
}

export const danbib: IsbnProvider = {
  code: 'danbib',
  name: 'DanBib (bibliotek.dk)',
  country: 'DK',
  type: 'api',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    // CQL: dkcclterm.is searches all standard numbers (ISBN, ISSN, etc.)
    // AND term.type=bog limits to books only
    const query = `dkcclterm.is=${cleanIsbn} AND term.type=bog`
    const url = buildSearchUrl(query, 1, 5)

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/xml, text/xml' },
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'danbib' }
      }

      const xml = await response.text()
      const objects = extractObjects(xml)

      if (objects.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'danbib' }
      }

      // Find the first book-type object
      const bookObj = objects.find(isBook) || objects[0]
      const bookData = parseDkabmObject(bookObj)

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'danbib' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      const identifier = getObjectIdentifier(bookObj)
      const sourceUrl = identifier
        ? getBibliotekDkUrl(identifier)
        : `https://bibliotek.dk/search?query=${cleanIsbn}`

      return {
        success: true,
        data: bookData,
        provider: 'danbib',
        source_url: sourceUrl,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'danbib',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    // Build CQL query from search parameters
    const clauses: string[] = []

    if (params.isbn) {
      clauses.push(`dkcclterm.is=${params.isbn.replace(/[-\s]/g, '')}`)
    }
    if (params.title) {
      const title = params.title.includes(' ')
        ? `"${params.title}"`
        : params.title
      clauses.push(`dkcclterm.ti=${title}`)
    }
    if (params.author) {
      const author = params.author.includes(' ')
        ? `"${params.author}"`
        : params.author
      clauses.push(`dkcclterm.fo=${author}`)
    }
    if (params.publisher) {
      const pub = params.publisher.includes(' ')
        ? `"${params.publisher}"`
        : params.publisher
      clauses.push(`dkcclterm.lg=${pub}`)
    }
    if (params.yearFrom && params.yearTo && params.yearFrom === params.yearTo) {
      clauses.push(`dkcclterm.år=${params.yearFrom}`)
    } else {
      if (params.yearFrom) clauses.push(`dkcclterm.år>=${params.yearFrom}`)
      if (params.yearTo) clauses.push(`dkcclterm.år<=${params.yearTo}`)
    }

    // Always limit to books
    clauses.push('term.type=bog')

    if (clauses.length <= 1) {
      return { items: [], total: 0, provider: 'danbib', error: 'No search parameters' }
    }

    const query = clauses.join(' AND ')
    const limit = Math.min(params.limit || 20, 50)
    const offset = params.offset || 0
    const start = offset + 1 // OpenSearch is 1-based

    const url = buildSearchUrl(query, start, limit)

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/xml, text/xml' },
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'danbib', error: `HTTP ${response.status}` }
      }

      const xml = await response.text()
      const objects = extractObjects(xml)
      const total = getHitCount(xml)
      const moreAvailable = hasMoreResults(xml)

      const items: SearchResultItem[] = objects
        .filter(isBook)
        .map((objectXml) => {
          const parsed = parseDkabmObject(objectXml)
          const identifier = getObjectIdentifier(objectXml)

          return {
            title: parsed.title || 'Untitled',
            subtitle: parsed.subtitle,
            authors: parsed.authors,
            publisher: parsed.publisher,
            publication_year: parsed.publication_year,
            isbn_13: parsed.isbn_13,
            isbn_10: parsed.isbn_10,
            format: parsed.edition,
            edition_key: identifier || undefined,
          }
        })

      return { items, total, provider: 'danbib', hasMore: moreAvailable }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'danbib',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    // editionKey is the DanBib identifier, e.g. "870970-basis:28692765"
    const params = new URLSearchParams({
      action: 'getObject',
      identifier: editionKey,
      agency: AGENCY,
      profile: PROFILE,
    })
    const url = `${OPENSEARCH_BASE}?${params.toString()}`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/xml, text/xml' },
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'danbib' }
      }

      const xml = await response.text()
      const objects = extractObjects(xml)

      if (objects.length === 0) {
        return { success: false, error: 'Record not found', provider: 'danbib' }
      }

      const bookData = parseDkabmObject(objects[0])

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'danbib' }
      }

      return {
        success: true,
        data: bookData,
        provider: 'danbib',
        source_url: getBibliotekDkUrl(editionKey),
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'danbib',
      }
    }
  },
}
