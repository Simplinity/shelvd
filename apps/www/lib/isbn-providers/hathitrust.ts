// HathiTrust Bibliographic API Provider
// 13M+ digitised volumes from 200+ research libraries
// REST JSON at catalog.hathitrust.org/api/volumes/
// Public access, no authentication required
// ISBN/OCLC/LCCN lookup only (not a search API)
// Unique: holding library info, links to digitised versions, rights status

import type { IsbnProvider, ProviderResult, BookData } from './types'

const API_BASE = 'https://catalog.hathitrust.org/api/volumes'
const TIMEOUT_MS = 15000

// ===================== XML HELPER FUNCTIONS =====================
// Reused from CERL HPB — MARC21 parsing for the full endpoint

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

interface DataField {
  ind1: string
  ind2: string
  subfields: Map<string, string[]>
}

function getDatafields(recordXml: string, tag: string): DataField[] {
  const results: DataField[] = []
  const regex = new RegExp(
    `<datafield tag="${tag}" ind1="(.*?)" ind2="(.*?)">(.*?)</datafield>`,
    'gs'
  )
  let match: RegExpExecArray | null
  while ((match = regex.exec(recordXml)) !== null) {
    const subfields = new Map<string, string[]>()
    const subRegex = /<subfield code="(\w)">([\s\S]*?)<\/subfield>/g
    let sub: RegExpExecArray | null
    while ((sub = subRegex.exec(match[3])) !== null) {
      const code = sub[1]
      const value = decodeXmlEntities(sub[2])
      if (!subfields.has(code)) subfields.set(code, [])
      subfields.get(code)!.push(value)
    }
    results.push({ ind1: match[1], ind2: match[2], subfields })
  }
  return results
}

function getControlfield(recordXml: string, tag: string): string | undefined {
  const regex = new RegExp(`<controlfield tag="${tag}">(.*?)</controlfield>`)
  const match = recordXml.match(regex)
  return match ? decodeXmlEntities(match[1]) : undefined
}

function sf(field: DataField, code: string): string | undefined {
  return field.subfields.get(code)?.[0]
}

// ===================== TYPES =====================

interface HathiRecord {
  recordURL: string
  titles: string[]
  isbns: string[]
  issns: string[]
  oclcs: string[]
  lccns: string[]
  publishDates: string[]
  'marc-xml'?: string
}

interface HathiItem {
  orig: string       // holding library name
  fromRecord: string // record number
  htid: string       // HathiTrust volume ID
  itemURL: string    // link to digitised version
  rightsCode: string  // e.g. "ic" (in copyright), "pd" (public domain)
  lastUpdate: string
  enumcron: string   // volume/edition info (e.g. "v.1")
  usRightsString: string // e.g. "Full view", "Limited (search-only)"
}

interface HathiResponse {
  records: Record<string, HathiRecord>
  items: HathiItem[]
}

// ===================== MARC-XML → BookData PARSER =====================

function parseMarcXml(marcXml: string): BookData {
  const bookData: BookData = {}

  // Title (245)
  const f245 = getDatafields(marcXml, '245')
  if (f245.length > 0) {
    const titleRaw = sf(f245[0], 'a')
    if (titleRaw) bookData.title = titleRaw.replace(/[\s/:;,]+$/, '').trim()
    const subtitleRaw = sf(f245[0], 'b')
    if (subtitleRaw) bookData.subtitle = subtitleRaw.replace(/[\s/:;.]+$/, '').trim()
  }

  // Authors (100 + 700)
  const authors: string[] = []
  for (const f of getDatafields(marcXml, '100')) {
    const name = sf(f, 'a')
    if (name) authors.push(name.replace(/[,.\s]+$/, '').trim())
  }
  for (const f of getDatafields(marcXml, '700')) {
    const name = sf(f, 'a')
    if (name) {
      const clean = name.replace(/[,.\s]+$/, '').trim()
      if (!authors.includes(clean)) authors.push(clean)
    }
  }
  if (authors.length > 0) bookData.authors = authors

  // Edition (250)
  const f250 = getDatafields(marcXml, '250')
  if (f250.length > 0) {
    const edition = sf(f250[0], 'a')
    if (edition) bookData.edition = edition.replace(/[.\s]+$/, '').trim()
  }

  // Publication info (260/264)
  const f264 = getDatafields(marcXml, '264')
  const f260 = getDatafields(marcXml, '260')
  const pubField = f264.length > 0 ? f264[0] : (f260.length > 0 ? f260[0] : null)
  if (pubField) {
    const place = sf(pubField, 'a')
    if (place) bookData.publication_place = place.replace(/[\s:;,]+$/, '').trim()
    const publisher = sf(pubField, 'b')
    if (publisher) bookData.publisher = publisher.replace(/[\s,;.]+$/, '').trim()
    const dateRaw = sf(pubField, 'c')
    if (dateRaw) {
      const yearMatch = dateRaw.match(/\[?(\d{4})\]?/)
      if (yearMatch) bookData.publication_year = yearMatch[1]
    }
  }

  // Fallback year from 008
  if (!bookData.publication_year) {
    const f008 = getControlfield(marcXml, '008')
    if (f008 && f008.length >= 11) {
      const year008 = f008.substring(7, 11).trim()
      if (/^\d{4}$/.test(year008)) bookData.publication_year = year008
    }
  }

  // Physical description (300)
  const f300 = getDatafields(marcXml, '300')
  if (f300.length > 0) {
    const extent = sf(f300[0], 'a')
    if (extent) {
      bookData.pagination_description = extent.replace(/[.\s]+$/, '').trim()
      const pageMatch = extent.match(/(\d+)\s*p/)
      if (pageMatch) bookData.pages = parseInt(pageMatch[1])
    }
    const dimensions = sf(f300[0], 'c')
    if (dimensions) bookData.format = `Dimensions: ${dimensions.replace(/[.\s]+$/, '')}`
  }

  // ISBNs (020)
  for (const f of getDatafields(marcXml, '020')) {
    const isbn = sf(f, 'a')
    if (isbn) {
      const clean = isbn.replace(/[^0-9X]/gi, '')
      if (clean.length === 13 && !bookData.isbn_13) bookData.isbn_13 = clean
      if (clean.length === 10 && !bookData.isbn_10) bookData.isbn_10 = clean
    }
  }

  // LCCN (010)
  const f010 = getDatafields(marcXml, '010')
  if (f010.length > 0) {
    const lccn = sf(f010[0], 'a')
    if (lccn) bookData.lccn = lccn.trim()
  }

  // OCLC (035)
  for (const f of getDatafields(marcXml, '035')) {
    const id = sf(f, 'a')
    if (id && id.includes('OCoLC')) {
      const match = id.match(/\(OCoLC\)(\d+)/)
      if (match) { bookData.oclc_number = match[1]; break }
    }
  }

  // DDC (082)
  const f082 = getDatafields(marcXml, '082')
  if (f082.length > 0) {
    const ddc = sf(f082[0], 'a')
    if (ddc) bookData.ddc = ddc.trim()
  }

  // LCC (050)
  const f050 = getDatafields(marcXml, '050')
  if (f050.length > 0) {
    const parts = [sf(f050[0], 'a'), sf(f050[0], 'b')].filter(Boolean)
    if (parts.length > 0) bookData.lcc = parts.join(' ').trim()
  }

  // Language (041 / 008)
  const f041 = getDatafields(marcXml, '041')
  if (f041.length > 0) {
    const lang = sf(f041[0], 'a')
    if (lang && lang !== 'und') bookData.language = lang
  }
  if (!bookData.language) {
    const f008 = getControlfield(marcXml, '008')
    if (f008 && f008.length >= 38) {
      const lang008 = f008.substring(35, 38).trim()
      if (lang008 && lang008 !== 'und') bookData.language = lang008
    }
  }

  // Subjects (650)
  const subjects = getDatafields(marcXml, '650')
    .map(f => sf(f, 'a'))
    .filter(Boolean) as string[]
  if (subjects.length > 0) {
    bookData.subjects = subjects.map(s => s.replace(/[.\s]+$/, '').trim())
  }

  // Series (490)
  const f490 = getDatafields(marcXml, '490')
  if (f490.length > 0) {
    const series = sf(f490[0], 'a')
    if (series) bookData.series = series.replace(/[;\s]+$/, '').trim()
  }

  // Notes (500)
  const noteTexts = getDatafields(marcXml, '500')
    .map(f => sf(f, 'a'))
    .filter(Boolean) as string[]
  if (noteTexts.length > 0) bookData.notes = noteTexts.join('\n')

  return bookData
}

// ===================== RESPONSE ENRICHMENT =====================

/**
 * Build notes about holding libraries and digitised access from HathiTrust items.
 * This is the unique value: which universities hold the book + digital links.
 */
function buildHoldingNotes(items: HathiItem[]): string {
  if (items.length === 0) return ''

  // Deduplicate libraries
  const libraries = [...new Set(items.map(i => i.orig))]

  // Find full-view items (public domain / freely accessible)
  const fullView = items.filter(i =>
    i.rightsCode === 'pd' ||
    i.rightsCode === 'pdus' ||
    i.usRightsString.toLowerCase().includes('full view')
  )

  const parts: string[] = []
  parts.push(`HathiTrust: held by ${libraries.join(', ')} (${items.length} volumes)`)

  if (fullView.length > 0) {
    parts.push(`Full view available: ${fullView[0].itemURL}`)
  }

  return parts.join('\n')
}

/**
 * Parse brief record fields (from JSON, no MARC needed)
 */
function parseFromBrief(record: HathiRecord): BookData {
  const bookData: BookData = {}

  if (record.titles.length > 0) {
    bookData.title = record.titles[0].replace(/[\s/:;.]+$/, '').trim()
  }

  if (record.publishDates.length > 0) {
    const yearMatch = record.publishDates[0].match(/(\d{4})/)
    if (yearMatch) bookData.publication_year = yearMatch[1]
  }

  // Extract clean ISBNs
  for (const isbn of record.isbns) {
    const clean = isbn.replace(/[^0-9X]/gi, '')
    if (clean.length === 13 && !bookData.isbn_13) bookData.isbn_13 = clean
    if (clean.length === 10 && !bookData.isbn_10) bookData.isbn_10 = clean
  }

  if (record.lccns.length > 0) bookData.lccn = record.lccns[0].trim()
  if (record.oclcs.length > 0) bookData.oclc_number = record.oclcs[0]

  return bookData
}

// ===================== PROVIDER IMPLEMENTATION =====================

export const hathiTrust: IsbnProvider = {
  code: 'hathitrust',
  name: 'HathiTrust Digital Library',
  country: 'US',
  type: 'api',

  /**
   * ISBN lookup using the full endpoint (includes MARC-XML for rich data).
   */
  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const url = `${API_BASE}/full/isbn/${cleanIsbn}.json`

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'hathitrust' }
      }

      const data: HathiResponse = await response.json()
      const recordIds = Object.keys(data.records)

      if (recordIds.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'hathitrust' }
      }

      // Take the first record
      const recordId = recordIds[0]
      const record = data.records[recordId]

      // Parse from MARC-XML if available, otherwise use brief fields
      let bookData: BookData
      if (record['marc-xml']) {
        bookData = parseMarcXml(record['marc-xml'])
      } else {
        bookData = parseFromBrief(record)
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      // Add holding library info to notes
      const holdingNotes = buildHoldingNotes(data.items)
      if (holdingNotes) {
        bookData.notes = bookData.notes
          ? `${bookData.notes}\n${holdingNotes}`
          : holdingNotes
      }

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'hathitrust' }
      }

      return {
        success: true,
        data: bookData,
        provider: 'hathitrust',
        source_url: record.recordURL,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'hathitrust',
      }
    }
  },

  // No searchByFields — HathiTrust is an identifier lookup API, not a search API

  /**
   * Get full record details by HathiTrust record number.
   */
  async getDetails(editionKey: string): Promise<ProviderResult> {
    const url = `${API_BASE}/full/recordnumber/${editionKey}.json`

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'hathitrust' }
      }

      const data: HathiResponse = await response.json()
      const recordIds = Object.keys(data.records)

      if (recordIds.length === 0) {
        return { success: false, error: 'Record not found', provider: 'hathitrust' }
      }

      const recordId = recordIds[0]
      const record = data.records[recordId]

      let bookData: BookData
      if (record['marc-xml']) {
        bookData = parseMarcXml(record['marc-xml'])
      } else {
        bookData = parseFromBrief(record)
      }

      const holdingNotes = buildHoldingNotes(data.items)
      if (holdingNotes) {
        bookData.notes = bookData.notes
          ? `${bookData.notes}\n${holdingNotes}`
          : holdingNotes
      }

      return {
        success: true,
        data: bookData,
        provider: 'hathitrust',
        source_url: record.recordURL,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'hathitrust',
      }
    }
  },
}
