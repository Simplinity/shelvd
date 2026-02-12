// CERL HPB — Heritage of the Printed Book Provider
// Consortium of European Research Libraries — 6M+ records (1455–1830)
// SRU at sru.k10plus.de/hpb — MARCXML output
// Public access, no authentication required
// Ideal for antiquarian / rare book collectors
// Unique indexes: printer (pica.dru), provenance (pica.prv), dimensions (pica.dim)

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const SRU_BASE = 'http://sru.k10plus.de/hpb'
const TIMEOUT_MS = 15000

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
 * Extract all <record> blocks from SRU searchRetrieveResponse
 */
function extractRecords(xml: string): string[] {
  const records: string[] = []
  const regex = /<record xmlns="http:\/\/www\.loc\.gov\/MARC21\/slim">([\s\S]*?)<\/record>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    records.push(match[1])
  }
  return records
}

/**
 * Get total number of records from SRU response
 */
function getNumberOfRecords(xml: string): number {
  const match = xml.match(/<zs:numberOfRecords>(\d+)<\/zs:numberOfRecords>/)
  return match ? parseInt(match[1]) : 0
}

/**
 * Get a controlfield value by tag (e.g. 001, 008)
 */
function getControlfield(recordXml: string, tag: string): string | undefined {
  const regex = new RegExp(`<controlfield tag="${tag}">(.*?)</controlfield>`)
  const match = recordXml.match(regex)
  return match ? decodeXmlEntities(match[1]) : undefined
}

/**
 * Extract all datafields with a given tag.
 * Returns array of objects: { ind1, ind2, subfields: Map<code, value[]> }
 */
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

/**
 * Get the first value of a subfield code from a DataField
 */
function sf(field: DataField, code: string): string | undefined {
  return field.subfields.get(code)?.[0]
}

/**
 * Get all values of a subfield code from a DataField
 */
function sfAll(field: DataField, code: string): string[] {
  return field.subfields.get(code) || []
}

// ===================== MARCXML → BookData PARSER =====================

/**
 * Parse a MARCXML record into BookData.
 * MARC21 field mapping:
 *   001       → edition_key (PPN)
 *   008[35-37] → language code
 *   008[7-10]  → publication year (fallback)
 *   035 $a     → CERL ID (for source URL)
 *   100/700 $a → authors (personal names)
 *   100/700 $d → author dates (life dates)
 *   245 $a     → title
 *   245 $b     → subtitle (remainder of title)
 *   245 $c     → statement of responsibility
 *   250 $a     → edition statement
 *   264 $a     → publication place
 *   264 $b     → publisher/printer
 *   264 $c     → publication date
 *   300 $a     → extent (pages)
 *   300 $b     → illustrations
 *   300 $c     → dimensions
 *   490 $a     → series title
 *   490 $v     → series number/volume
 *   500 $a     → general notes (provenance, binding, etc.)
 *   650 $a     → subjects
 *   700 $e     → contributor role (printer, binder, etc.)
 *   710 $a     → corporate names (publishers, presses)
 */
function parseMarcRecord(recordXml: string): BookData {
  const bookData: BookData = {}

  // === Title (245) ===
  const f245 = getDatafields(recordXml, '245')
  if (f245.length > 0) {
    const titleRaw = sf(f245[0], 'a')
    if (titleRaw) {
      // Remove trailing punctuation (MARC convention: ends with / or : or ;)
      bookData.title = titleRaw.replace(/[\s/:;]+$/, '').trim()
    }
    const subtitleRaw = sf(f245[0], 'b')
    if (subtitleRaw) {
      bookData.subtitle = subtitleRaw.replace(/[\s/:;.]+$/, '').trim()
    }
  }

  // === Authors (100 + 700 with role=aut or no specific role) ===
  const authors: string[] = []
  const authorDates: string[] = [] // Collected separately for notes
  const contributors: string[] = [] // printers, binders, etc.

  // 100 = main entry personal name
  const f100 = getDatafields(recordXml, '100')
  for (const f of f100) {
    const name = sf(f, 'a')
    if (name) {
      const cleanName = name.replace(/[,.\s]+$/, '').trim()
      authors.push(cleanName)
      const dates = sf(f, 'd')
      if (dates) authorDates.push(`${cleanName} (${dates.replace(/[.\s]+$/, '')})`)
    }
  }

  // 700 = added entry personal name
  const f700 = getDatafields(recordXml, '700')
  for (const f of f700) {
    const name = sf(f, 'a')
    if (!name) continue
    const cleanName = name.replace(/[,.\s]+$/, '').trim()
    const role = sf(f, 'e') || sf(f, '4') || ''
    const dates = sf(f, 'd')

    // Only add as author if role is 'aut' or no role specified
    if (role === 'aut' || role === '') {
      if (!authors.includes(cleanName)) {
        authors.push(cleanName)
        if (dates) authorDates.push(`${cleanName} (${dates.replace(/[.\s]+$/, '')})`)
      }
    } else {
      // Other roles: printer, editor, illustrator, binder, etc.
      const roleName = role === 'oth' ? '' : role
      const entry = roleName
        ? `${cleanName}${dates ? ` (${dates.replace(/[.\s]+$/, '')})` : ''} [${roleName}]`
        : `${cleanName}${dates ? ` (${dates.replace(/[.\s]+$/, '')})` : ''}`
      contributors.push(entry)
    }
  }

  if (authors.length > 0) bookData.authors = authors

  // === Edition (250) ===
  const f250 = getDatafields(recordXml, '250')
  if (f250.length > 0) {
    const edition = sf(f250[0], 'a')
    if (edition) bookData.edition = edition.replace(/[.\s]+$/, '').trim()
  }

  // === Publication info (264, fallback to 260) ===
  const f264 = getDatafields(recordXml, '264')
  const f260 = getDatafields(recordXml, '260')
  const pubField = f264.length > 0 ? f264[0] : (f260.length > 0 ? f260[0] : null)

  if (pubField) {
    const place = sf(pubField, 'a')
    if (place) bookData.publication_place = place.replace(/[\s:;,]+$/, '').trim()

    const publisher = sf(pubField, 'b')
    if (publisher) bookData.publisher = publisher.replace(/[\s,;.]+$/, '').trim()

    const dateRaw = sf(pubField, 'c')
    if (dateRaw) {
      // Extract 4-digit year from various formats: "1745", "[1745?]", "MDCCXLV [1745]", "anno 1665"
      const yearMatch = dateRaw.match(/\[?(\d{4})\]?/)
      if (yearMatch) bookData.publication_year = yearMatch[1]
    }
  }

  // Fallback year from 008 field (positions 7-10)
  if (!bookData.publication_year) {
    const f008 = getControlfield(recordXml, '008')
    if (f008 && f008.length >= 11) {
      const year008 = f008.substring(7, 11).trim()
      if (/^\d{4}$/.test(year008)) bookData.publication_year = year008
    }
  }

  // === Physical description (300) ===
  const f300 = getDatafields(recordXml, '300')
  if (f300.length > 0) {
    const extent = sf(f300[0], 'a')
    if (extent) {
      bookData.pagination_description = extent.replace(/[.\s]+$/, '').trim()
      // Try to extract page count
      const pageMatch = extent.match(/(\d+)\s*p/)
      if (pageMatch) bookData.pages = parseInt(pageMatch[1])
    }

    const illus = sf(f300[0], 'b')
    const dimensions = sf(f300[0], 'c')

    // Build physical notes (valuable for rare books)
    const physParts: string[] = []
    if (illus) physParts.push(`Illustrations: ${illus.replace(/[.\s]+$/, '')}`)
    if (dimensions) physParts.push(`Dimensions: ${dimensions.replace(/[.\s]+$/, '')}`)
    if (physParts.length > 0) {
      bookData.format = physParts.join('; ')
    }
  }

  // === Series (490) ===
  const f490 = getDatafields(recordXml, '490')
  if (f490.length > 0) {
    const series = sf(f490[0], 'a')
    if (series) bookData.series = series.replace(/[;\s]+$/, '').trim()
    const vol = sf(f490[0], 'v')
    if (vol) bookData.series_number = vol.replace(/[.\s]+$/, '').trim()
  }

  // === Language from 008 or 041 ===
  const f041 = getDatafields(recordXml, '041')
  if (f041.length > 0) {
    const lang = sf(f041[0], 'a')
    if (lang && lang !== 'und') bookData.language = lang
  }
  if (!bookData.language) {
    const f008 = getControlfield(recordXml, '008')
    if (f008 && f008.length >= 38) {
      const lang008 = f008.substring(35, 38).trim()
      if (lang008 && lang008 !== 'und') bookData.language = lang008
    }
  }

  // === Subjects (650) ===
  const f650 = getDatafields(recordXml, '650')
  const subjects = f650.map(f => sf(f, 'a')).filter(Boolean) as string[]
  if (subjects.length > 0) {
    bookData.subjects = subjects.map(s => s.replace(/[.\s]+$/, '').trim())
  }

  // === Notes (500) — crucial for rare books: provenance, binding, inscriptions ===
  const f500 = getDatafields(recordXml, '500')
  const noteTexts = f500.map(f => sf(f, 'a')).filter(Boolean) as string[]

  // === Corporate contributors (710) — printers, publishers, presses ===
  const f710 = getDatafields(recordXml, '710')
  for (const f of f710) {
    const name = sf(f, 'a')
    if (name) {
      const cleanName = name.replace(/[.\s]+$/, '').trim()
      // Skip place names used as corporate entries
      if (cleanName !== bookData.publication_place) {
        contributors.push(cleanName)
      }
    }
  }

  // Build combined notes
  const noteParts: string[] = []

  // Author dates (valuable for rare books)
  if (authorDates.length > 0) {
    noteParts.push(`Author dates: ${authorDates.join('; ')}`)
  }

  // Contributors (printers, binders, illustrators)
  if (contributors.length > 0) {
    noteParts.push(`Contributors: ${contributors.join('; ')}`)
  }

  // General notes from 500 fields
  if (noteTexts.length > 0) {
    noteParts.push(...noteTexts)
  }

  if (noteParts.length > 0) {
    bookData.notes = noteParts.join('\n')
  }

  return bookData
}

/**
 * Get PPN (Pica Production Number) from 001 controlfield
 */
function getPpn(recordXml: string): string | undefined {
  return getControlfield(recordXml, '001')
}

/**
 * Get CERL ID from 035 field for source URL
 */
function getCerlId(recordXml: string): string | undefined {
  const f035 = getDatafields(recordXml, '035')
  for (const f of f035) {
    const id = sf(f, 'a')
    if (id && id.includes('CERL')) {
      // Extract CERL identifier: "(CERL)UkWE.01.B24858" → "UkWE.01.B24858"
      const match = id.match(/\(CERL\)(.+)/)
      return match ? match[1] : undefined
    }
  }
  return undefined
}

/**
 * Build source URL from PPN
 */
function getSourceUrl(ppn: string): string {
  return `https://opac.k10plus.de/DB=9.1/PPNSET?PPN=${ppn}`
}

// ===================== SRU QUERY BUILDER =====================

/**
 * Build SRU CQL query for HPB.
 * HPB uses PICA indexes:
 *   pica.tit  = title words
 *   pica.per  = personal name (author)
 *   pica.ver  = publisher
 *   pica.jah  = publication year
 *   pica.isn  = ISBN/ISSN
 *   pica.dru  = printer
 *   pica.prv  = provenance
 *   pica.fmo  = former owner
 *   pica.dim  = dimensions/format
 *   pica.all  = all fields
 */
function buildSruUrl(query: string, startRecord: number = 1, maxRecords: number = 20): string {
  const params = new URLSearchParams({
    version: '1.1',
    operation: 'searchRetrieve',
    query,
    startRecord: String(startRecord),
    maximumRecords: String(maxRecords),
    recordSchema: 'marcxml',
  })
  return `${SRU_BASE}?${params.toString()}`
}

// ===================== PROVIDER IMPLEMENTATION =====================

export const cerlHpb: IsbnProvider = {
  code: 'cerl_hpb',
  name: 'CERL HPB (Heritage of the Printed Book)',
  country: 'EU',
  type: 'sru',

  /**
   * ISBN search — less common for HPB (pre-1830 books rarely have ISBNs)
   * but some later reprints/facsimiles do
   */
  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const query = `pica.isn=${cleanIsbn}`
    const url = buildSruUrl(query, 1, 1)

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'cerl_hpb' }
      }

      const xml = await response.text()
      const total = getNumberOfRecords(xml)

      if (total === 0) {
        return { success: false, error: 'ISBN not found', provider: 'cerl_hpb' }
      }

      const records = extractRecords(xml)
      if (records.length === 0) {
        return { success: false, error: 'No records in response', provider: 'cerl_hpb' }
      }

      const bookData = parseMarcRecord(records[0])
      const ppn = getPpn(records[0])

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'cerl_hpb' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      return {
        success: true,
        data: bookData,
        provider: 'cerl_hpb',
        source_url: ppn ? getSourceUrl(ppn) : undefined,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'cerl_hpb',
      }
    }
  },

  /**
   * Multi-field search using HPB PICA indexes.
   * Supports title, author, publisher, year range.
   */
  async searchByFields(params: SearchParams): Promise<SearchResults> {
    const parts: string[] = []

    if (params.isbn) {
      parts.push(`pica.isn=${params.isbn.replace(/[-\s]/g, '')}`)
    }
    if (params.title) {
      // Use word search for title (each word ANDed automatically by index)
      parts.push(`pica.tit=${params.title}`)
    }
    if (params.author) {
      parts.push(`pica.per=${params.author}`)
    }
    if (params.publisher) {
      parts.push(`pica.ver=${params.publisher}`)
    }
    // HPB only supports exact year match via pica.yop (no range operators)
    if (params.yearFrom && params.yearTo && params.yearFrom === params.yearTo) {
      parts.push(`pica.yop=${params.yearFrom}`)
    } else if (params.yearFrom && !params.yearTo) {
      // Single year as exact match
      parts.push(`pica.yop=${params.yearFrom}`)
    }
    // Note: year ranges are not supported by HPB SRU — ignored if yearFrom !== yearTo

    if (parts.length === 0) {
      return { items: [], total: 0, provider: 'cerl_hpb', error: 'No search parameters' }
    }

    const query = parts.join(' and ')
    const limit = Math.min(params.limit || 20, 100)
    const offset = params.offset || 0
    const startRecord = offset + 1 // SRU is 1-based

    const url = buildSruUrl(query, startRecord, limit)

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'cerl_hpb', error: `HTTP ${response.status}` }
      }

      const xml = await response.text()
      const total = getNumberOfRecords(xml)
      const records = extractRecords(xml)

      const items: SearchResultItem[] = records.map(rec => {
        const parsed = parseMarcRecord(rec)
        const ppn = getPpn(rec)

        return {
          title: parsed.title || 'Untitled',
          subtitle: parsed.subtitle,
          authors: parsed.authors,
          publisher: parsed.publisher,
          publication_year: parsed.publication_year,
          isbn_13: parsed.isbn_13,
          isbn_10: parsed.isbn_10,
          format: parsed.format,
          edition_key: ppn || undefined,
        }
      })

      const hasMore = (offset + records.length) < total
      return { items, total, provider: 'cerl_hpb', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'cerl_hpb',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },

  /**
   * Get full record details by PPN (edition_key from search results)
   */
  async getDetails(editionKey: string): Promise<ProviderResult> {
    // SRU query by PPN
    const query = `pica.ppn=${editionKey}`
    const url = buildSruUrl(query, 1, 1)

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'cerl_hpb' }
      }

      const xml = await response.text()
      const records = extractRecords(xml)

      if (records.length === 0) {
        return { success: false, error: 'Record not found', provider: 'cerl_hpb' }
      }

      const bookData = parseMarcRecord(records[0])
      const ppn = getPpn(records[0])

      return {
        success: true,
        data: bookData,
        provider: 'cerl_hpb',
        source_url: ppn ? getSourceUrl(ppn) : undefined,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'cerl_hpb',
      }
    }
  },
}
