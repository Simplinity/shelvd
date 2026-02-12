// KB Netherlands (Koninklijke Bibliotheek) Provider
// National Library of the Netherlands — 4M+ works
// SRU with Dublin Core XML (dcx schema) — NOT MARCXML
// http://jsru.kb.nl/sru/sru — CC0 metadata license

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const SRU_BASE = 'http://jsru.kb.nl/sru/sru'
const RECORD_SCHEMA = 'dcx'
const SRU_VERSION = '1.1'
const COLLECTION = 'GGC' // GGC = Gemeenschappelijke GegevensCollectie (shared catalog)

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
 * Extract text of a single XML element (first occurrence)
 * Handles namespaced elements like dc:title, dcx:isPartOf, etc.
 */
function getElementText(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`)
  const match = xml.match(regex)
  if (!match) return undefined
  // Strip inner tags (e.g. <dcx:recordIdentifier>...)
  const text = match[1].replace(/<[^>]+>/g, '').trim()
  return decodeXmlEntities(text) || undefined
}

/**
 * Extract text of all matching elements
 */
function getAllElementTexts(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g')
  const results: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim()
    const decoded = decodeXmlEntities(text)
    if (decoded) results.push(decoded)
  }
  return results
}

/**
 * Extract an attribute value from the first matching element
 */
function getElementAttr(xml: string, tag: string, attr: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`)
  const match = xml.match(regex)
  return match ? decodeXmlEntities(match[1]) : undefined
}

/**
 * Extract SRU records from response XML
 */
function extractSruRecords(xml: string): string[] {
  const records: string[] = []
  // KB uses srw:record or just record tags
  const regex = /<(?:srw:)?record>([\s\S]*?)<\/(?:srw:)?record>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    records.push(match[1])
  }
  return records
}

/**
 * Extract total number of records from SRU response
 */
function getTotalRecords(xml: string): number {
  const match = xml.match(/<(?:srw:)?numberOfRecords>(\d+)<\//)
  return match ? parseInt(match[1]) : 0
}

/**
 * Extract the recordData content from an SRU record
 */
function getRecordData(recordXml: string): string {
  const match = recordXml.match(/<(?:srw:)?recordData>([\s\S]*?)<\/(?:srw:)?recordData>/)
  return match ? match[1] : recordXml
}

/**
 * Parse a Dublin Core (dcx) record into BookData
 * KB Netherlands uses dcx schema with dc: and dcx: prefixed elements
 */
function parseDcxRecord(recordXml: string): BookData {
  const data = getRecordData(recordXml)
  const bookData: BookData = {}

  // Title — dc:title
  const title = getElementText(data, 'dc:title')
  if (title) {
    // May contain subtitle after " : "
    const parts = title.split(' : ')
    bookData.title = parts[0].trim()
    if (parts.length > 1) {
      bookData.subtitle = parts.slice(1).join(' : ').trim()
    }
  }

  // Authors — dc:creator and dcx:creator-personal
  const creators = [
    ...getAllElementTexts(data, 'dc:creator'),
    ...getAllElementTexts(data, 'dcx:creator-personal'),
  ]
  // Deduplicate
  const uniqueAuthors = [...new Set(creators)]
  if (uniqueAuthors.length > 0) bookData.authors = uniqueAuthors

  // Publisher — dc:publisher or dcx:publisher
  const publisher = getElementText(data, 'dc:publisher') || getElementText(data, 'dcx:publisher')
  if (publisher) bookData.publisher = publisher

  // Publication date — dc:date
  const date = getElementText(data, 'dc:date')
  if (date) {
    const yearMatch = date.match(/(\d{4})/)
    if (yearMatch) bookData.publication_year = yearMatch[1]
  }

  // Language — dc:language
  const lang = getElementText(data, 'dc:language')
  if (lang) bookData.language = lang

  // Identifiers — dc:identifier (ISBN, OCLC, etc.)
  const identifiers = getAllElementTexts(data, 'dc:identifier')
  for (const id of identifiers) {
    const clean = id.replace(/[-\s]/g, '')
    if (/^\d{13}$/.test(clean) && !bookData.isbn_13) {
      bookData.isbn_13 = clean
    } else if (/^\d{10}$/.test(clean) && !bookData.isbn_10) {
      bookData.isbn_10 = clean
    } else if (/^URN:ISBN:/.test(id)) {
      const isbn = id.replace('URN:ISBN:', '').replace(/[-\s]/g, '')
      if (isbn.length === 13 && !bookData.isbn_13) bookData.isbn_13 = isbn
      else if (isbn.length === 10 && !bookData.isbn_10) bookData.isbn_10 = isbn
    }
  }

  // Also check dcx:ISBN
  const dcxIsbns = getAllElementTexts(data, 'dcx:ISBN')
  for (const isbn of dcxIsbns) {
    const clean = isbn.replace(/[-\s]/g, '')
    if (clean.length === 13 && !bookData.isbn_13) bookData.isbn_13 = clean
    else if (clean.length === 10 && !bookData.isbn_10) bookData.isbn_10 = clean
  }

  // Subjects — dc:subject
  const subjects = getAllElementTexts(data, 'dc:subject')
  if (subjects.length > 0) bookData.subjects = subjects

  // Description — dc:description
  const description = getElementText(data, 'dc:description')
  if (description) bookData.description = description

  // Format / extent — dc:format or dcterms:extent
  const extent = getElementText(data, 'dcterms:extent') || getElementText(data, 'dc:format')
  if (extent) {
    bookData.pagination_description = extent
    const pageMatch = extent.match(/(\d+)\s*p/)
    if (pageMatch) bookData.pages = parseInt(pageMatch[1])
  }

  // Type — dc:type
  const dcType = getElementText(data, 'dc:type')
  if (dcType) bookData.format = dcType

  // Series — dcx:isPartOf or dcterms:isPartOf
  const series = getElementText(data, 'dcx:isPartOf') || getElementText(data, 'dcterms:isPartOf')
  if (series) bookData.series = series

  // Publication place — dcx:place (if available)
  const place = getElementText(data, 'dcx:place')
  if (place) bookData.publication_place = place

  return bookData
}

/**
 * Build an SRU query URL for KB Netherlands
 */
function buildSruUrl(query: string, startRecord: number = 1, maxRecords: number = 10): string {
  return `${SRU_BASE}?version=${SRU_VERSION}&operation=searchRetrieve&query=${encodeURIComponent(query)}&recordSchema=${RECORD_SCHEMA}&x-collection=${COLLECTION}&startRecord=${startRecord}&maximumRecords=${maxRecords}`
}

export const kbNl: IsbnProvider = {
  code: 'kb_nl',
  name: 'KB (Netherlands)',
  country: 'NL',
  type: 'sru',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const query = `dc.identifier=${cleanIsbn}`
    const url = buildSruUrl(query, 1, 1)

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/xml, text/xml' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'kb_nl' }
      }

      const xml = await response.text()
      const records = extractSruRecords(xml)

      if (records.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'kb_nl' }
      }

      const bookData = parseDcxRecord(records[0])

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'kb_nl' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      return {
        success: true,
        data: bookData,
        provider: 'kb_nl',
        source_url: `https://opc4.kb.nl/DB=1/SET=1/TTL=1/CMD?ACT=SRCHA&IKT=1007&SRT=YOP&TRM=${cleanIsbn}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'kb_nl',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    // Build CQL query for KB Netherlands
    const parts: string[] = []
    if (params.isbn) parts.push(`dc.identifier=${params.isbn.replace(/[-\s]/g, '')}`)
    if (params.title) parts.push(`dc.title=${params.title}`)
    if (params.author) parts.push(`dc.creator=${params.author}`)
    if (params.publisher) parts.push(`dc.publisher=${params.publisher}`)
    if (params.yearFrom) parts.push(`dc.date>=${params.yearFrom}`)
    if (params.yearTo) parts.push(`dc.date<=${params.yearTo}`)

    if (parts.length === 0) {
      return { items: [], total: 0, provider: 'kb_nl', error: 'No search parameters' }
    }

    const query = parts.join(' and ')
    const limit = Math.min(params.limit || 20, 50)
    const offset = params.offset || 0
    const startRecord = offset + 1 // SRU is 1-based
    const url = buildSruUrl(query, startRecord, limit)

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/xml, text/xml' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'kb_nl', error: `HTTP ${response.status}` }
      }

      const xml = await response.text()
      const records = extractSruRecords(xml)
      const total = getTotalRecords(xml)

      const items: SearchResultItem[] = records.map((rec, i) => {
        const parsed = parseDcxRecord(rec)
        return {
          title: parsed.title || 'Untitled',
          subtitle: parsed.subtitle,
          authors: parsed.authors,
          publisher: parsed.publisher,
          publication_year: parsed.publication_year,
          isbn_13: parsed.isbn_13,
          isbn_10: parsed.isbn_10,
          format: parsed.format,
          edition_key: `kb-${startRecord + i}`,
        }
      })

      const hasMore = (offset + records.length) < total
      return { items, total, provider: 'kb_nl', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'kb_nl',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },
}
