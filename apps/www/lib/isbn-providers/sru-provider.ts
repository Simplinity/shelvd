// Shared SRU (Search/Retrieve via URL) provider
// Parses MARCXML responses from national library catalogs
// Each library uses the same protocol with slightly different endpoints and CQL indexes

import type { IsbnProvider, ProviderResult, SearchParams, SearchResults, SearchResultItem, BookData } from './types'

// Per-library SRU configuration
export interface SruConfig {
  code: string
  name: string
  country?: string
  // SRU endpoint URL
  baseUrl: string
  // Record schema to request (usually 'marcxml' or 'marcrecord')
  recordSchema: string
  // CQL index names (vary per library)
  indexes: {
    isbn?: string
    title?: string
    author?: string
    publisher?: string
    year?: string
  }
  // Some libraries use different SRU versions
  version?: string
  // Source URL pattern for individual records (optional)
  sourceUrlPattern?: string
  // Set to true for UNIMARC-based libraries (BnF, etc.)
  isUnimarc?: boolean
}

// ===================== MARCXML PARSER =====================

function getDatafields(xml: string, tag: string): string[] {
  const results: string[] = []
  const regex = new RegExp(`<(?:marc:)?datafield[^>]*tag="${tag}"[^>]*>([\\s\\S]*?)</(?:marc:)?datafield>`, 'g')
  let match
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1])
  }
  return results
}

function getSubfield(datafieldContent: string, code: string): string | undefined {
  const regex = new RegExp(`<(?:marc:)?subfield[^>]*code="${code}"[^>]*>([^<]*)</(?:marc:)?subfield>`)
  const match = datafieldContent.match(regex)
  return match ? decodeXmlEntities(match[1].trim()) : undefined
}

function getAllSubfields(datafieldContent: string, code: string): string[] {
  const results: string[] = []
  const regex = new RegExp(`<(?:marc:)?subfield[^>]*code="${code}"[^>]*>([^<]*)</(?:marc:)?subfield>`, 'g')
  let match
  while ((match = regex.exec(datafieldContent)) !== null) {
    const val = decodeXmlEntities(match[1].trim())
    if (val) results.push(val)
  }
  return results
}

function getControlfield(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<(?:marc:)?controlfield[^>]*tag="${tag}"[^>]*>([^<]*)</(?:marc:)?controlfield>`)
  const match = xml.match(regex)
  return match ? decodeXmlEntities(match[1].trim()) : undefined
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim()
}

// Clean trailing punctuation from MARC fields (e.g. "London :" → "London")
function cleanMarc(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value.replace(/[\s,:;/]+$/, '').trim() || undefined
}

function parseMarcXmlRecord(recordXml: string): BookData {
  // 245 — Title / Subtitle
  const field245 = getDatafields(recordXml, '245')[0]
  const title = cleanMarc(getSubfield(field245 || '', 'a')) || ''
  const subtitle = cleanMarc(getSubfield(field245 || '', 'b'))

  // 100/700 — Authors
  const authors: string[] = []
  const field100 = getDatafields(recordXml, '100')
  for (const f of field100) {
    const name = cleanMarc(getSubfield(f, 'a'))
    if (name) authors.push(name)
  }
  const field700 = getDatafields(recordXml, '700')
  for (const f of field700) {
    const name = cleanMarc(getSubfield(f, 'a'))
    if (name && !authors.includes(name)) authors.push(name)
  }

  // 260/264 — Publication info
  let publisher: string | undefined
  let publication_place: string | undefined
  let publication_year: string | undefined
  
  const field260 = getDatafields(recordXml, '260')[0]
  const field264 = getDatafields(recordXml, '264')[0]
  const pubField = field260 || field264
  
  if (pubField) {
    publication_place = cleanMarc(getSubfield(pubField, 'a'))
    publisher = cleanMarc(getSubfield(pubField, 'b'))
    const dateStr = getSubfield(pubField, 'c')
    if (dateStr) {
      const yearMatch = dateStr.match(/(\d{4})/)
      if (yearMatch) publication_year = yearMatch[1]
    }
  }

  // 020 — ISBN
  let isbn_13: string | undefined
  let isbn_10: string | undefined
  const field020 = getDatafields(recordXml, '020')
  for (const f of field020) {
    const raw = getSubfield(f, 'a')
    if (raw) {
      const clean = raw.replace(/[-\s]/g, '').replace(/\(.*\)/, '').trim()
      if (clean.length === 13 && !isbn_13) isbn_13 = clean
      if (clean.length === 10 && !isbn_10) isbn_10 = clean
    }
  }

  // 300 — Physical description (pages)
  let pages: number | undefined
  let pagination_description: string | undefined
  const field300 = getDatafields(recordXml, '300')[0]
  if (field300) {
    const extent = getSubfield(field300, 'a')
    if (extent) {
      pagination_description = cleanMarc(extent)
      const pageMatch = extent.match(/(\d+)\s*p/i)
      if (pageMatch) pages = parseInt(pageMatch[1])
    }
  }

  // 010 — LCCN
  let lccn: string | undefined
  const field010 = getDatafields(recordXml, '010')[0]
  if (field010) lccn = getSubfield(field010, 'a')?.trim()

  // 035 — OCLC
  let oclc_number: string | undefined
  const field035 = getDatafields(recordXml, '035')
  for (const f of field035) {
    const val = getSubfield(f, 'a')
    if (val && val.includes('OCoLC')) {
      oclc_number = val.replace(/\(OCoLC\)/i, '').trim()
      break
    }
  }

  // 082 — DDC
  let ddc: string | undefined
  const field082 = getDatafields(recordXml, '082')[0]
  if (field082) ddc = getSubfield(field082, 'a')

  // 050 — LCC
  let lcc: string | undefined
  const field050 = getDatafields(recordXml, '050')[0]
  if (field050) {
    const a = getSubfield(field050, 'a')
    const b = getSubfield(field050, 'b')
    lcc = [a, b].filter(Boolean).join(' ') || undefined
  }

  // 650 — Subjects
  let subjects: string[] | undefined
  const field650 = getDatafields(recordXml, '650')
  if (field650.length > 0) {
    const mapped = field650.map(f => cleanMarc(getSubfield(f, 'a'))).filter(Boolean) as string[]
    if (mapped.length > 0) subjects = mapped
  }

  // 500 — Notes
  let notes: string | undefined
  const field500 = getDatafields(recordXml, '500')
  if (field500.length > 0) {
    const noteTexts = field500.map(f => getSubfield(f, 'a')).filter(Boolean)
    if (noteTexts.length > 0) notes = noteTexts.join('; ')
  }

  // 520 — Summary/description
  let description: string | undefined
  const field520 = getDatafields(recordXml, '520')[0]
  if (field520) description = getSubfield(field520, 'a')

  // 041 — Language
  let language: string | undefined
  const field041 = getDatafields(recordXml, '041')[0]
  if (field041) {
    language = getSubfield(field041, 'a')
  } else {
    // Fallback: controlfield 008 positions 35-37
    const cf008 = getControlfield(recordXml, '008')
    if (cf008 && cf008.length >= 38) {
      language = cf008.substring(35, 38).trim()
      if (language === '   ' || language === '|||') language = undefined
    }
  }

  // 250 — Edition
  let edition: string | undefined
  const field250 = getDatafields(recordXml, '250')[0]
  if (field250) edition = cleanMarc(getSubfield(field250, 'a'))

  // 490 — Series
  let series: string | undefined
  const field490 = getDatafields(recordXml, '490')[0]
  if (field490) series = cleanMarc(getSubfield(field490, 'a'))

  return {
    title,
    subtitle,
    authors: authors.length > 0 ? authors : undefined,
    publisher,
    publication_year,
    publication_place,
    pages,
    language,
    isbn_13,
    isbn_10,
    edition,
    series,
    description,
    lccn,
    oclc_number,
    ddc,
    lcc,
    subjects,
    notes,
    pagination_description,
  }
}

// ===================== UNIMARC PARSER =====================
// BnF and some other European libraries use UNIMARC instead of MARC21
// Field numbers are completely different

function parseUnimarcRecord(recordXml: string): BookData {
  // 200 — Title / Subtitle
  const field200 = getDatafields(recordXml, '200')[0]
  const title = cleanMarc(getSubfield(field200 || '', 'a')) || ''
  const subtitle = cleanMarc(getSubfield(field200 || '', 'e'))

  // 700/701 — Authors (surname $a, given name $b)
  const authors: string[] = []
  const field700u = getDatafields(recordXml, '700')
  const field701u = getDatafields(recordXml, '701')
  for (const f of [...field700u, ...field701u]) {
    const surname = cleanMarc(getSubfield(f, 'a'))
    const givenName = cleanMarc(getSubfield(f, 'b'))
    if (surname) {
      authors.push(givenName ? `${surname}, ${givenName}` : surname)
    }
  }
  // Fallback: 200$f (statement of responsibility)
  if (authors.length === 0 && field200) {
    const resp = cleanMarc(getSubfield(field200, 'f'))
    if (resp) authors.push(resp)
  }

  // 210 — Publication info (place $a, publisher $c, year $d)
  let publisher: string | undefined
  let publication_place: string | undefined
  let publication_year: string | undefined

  const field210 = getDatafields(recordXml, '210')[0]
  if (field210) {
    publication_place = cleanMarc(getSubfield(field210, 'a'))
    publisher = cleanMarc(getSubfield(field210, 'c'))
    const dateStr = getSubfield(field210, 'd')
    if (dateStr) {
      const yearMatch = dateStr.match(/(\d{4})/)
      if (yearMatch) publication_year = yearMatch[1]
    }
  }

  // 010 — ISBN ($a)
  let isbn_13: string | undefined
  let isbn_10: string | undefined
  const field010u = getDatafields(recordXml, '010')
  for (const f of field010u) {
    const raw = getSubfield(f, 'a')
    if (raw) {
      const clean = raw.replace(/[-\s]/g, '').replace(/\(.*\)/, '').trim()
      if (clean.length === 13 && !isbn_13) isbn_13 = clean
      if (clean.length === 10 && !isbn_10) isbn_10 = clean
    }
  }

  // 215 — Physical description ($a pages)
  let pages: number | undefined
  let pagination_description: string | undefined
  const field215 = getDatafields(recordXml, '215')[0]
  if (field215) {
    const extent = getSubfield(field215, 'a')
    if (extent) {
      pagination_description = cleanMarc(extent)
      const pageMatch = extent.match(/(\d+)\s*p/i)
      if (pageMatch) pages = parseInt(pageMatch[1])
    }
  }

  // 101 — Language ($a)
  let language: string | undefined
  const field101 = getDatafields(recordXml, '101')[0]
  if (field101) language = getSubfield(field101, 'a')

  // 205 — Edition ($a)
  let edition: string | undefined
  const field205 = getDatafields(recordXml, '205')[0]
  if (field205) edition = cleanMarc(getSubfield(field205, 'a'))

  // 225 — Series ($a)
  let series: string | undefined
  const field225 = getDatafields(recordXml, '225')[0]
  if (field225) series = cleanMarc(getSubfield(field225, 'a'))

  // 330 — Summary/description ($a)
  let description: string | undefined
  const field330 = getDatafields(recordXml, '330')[0]
  if (field330) description = getSubfield(field330, 'a')

  // 606 — Subjects ($a)
  let subjects: string[] | undefined
  const field606 = getDatafields(recordXml, '606')
  if (field606.length > 0) {
    const mapped = field606.map(f => cleanMarc(getSubfield(f, 'a'))).filter(Boolean) as string[]
    if (mapped.length > 0) subjects = mapped
  }

  // 300 — Notes ($a)
  let notes: string | undefined
  const field300u = getDatafields(recordXml, '300')
  if (field300u.length > 0) {
    const noteTexts = field300u.map(f => getSubfield(f, 'a')).filter(Boolean)
    if (noteTexts.length > 0) notes = noteTexts.join('; ')
  }

  return {
    title,
    subtitle,
    authors: authors.length > 0 ? authors : undefined,
    publisher,
    publication_year,
    publication_place,
    pages,
    language,
    isbn_13,
    isbn_10,
    edition,
    series,
    description,
    subjects,
    notes,
    pagination_description,
  }
}

// Detect format and parse accordingly
function parseRecord(recordXml: string, isUnimarc: boolean): BookData {
  return isUnimarc ? parseUnimarcRecord(recordXml) : parseMarcXmlRecord(recordXml)
}

function parseMarcToListItem(recordXml: string, index: number, isUnimarc: boolean = false): SearchResultItem {
  const data = parseRecord(recordXml, isUnimarc)
  return {
    title: data.title || 'Untitled',
    subtitle: data.subtitle,
    authors: data.authors,
    publisher: data.publisher,
    publication_year: data.publication_year,
    isbn_13: data.isbn_13,
    isbn_10: data.isbn_10,
    edition_key: `record-${index}`, // Will store full XML for detail fetch
  }
}

// ===================== SRU SEARCH =====================

function buildCqlQuery(params: SearchParams, indexes: SruConfig['indexes']): string {
  const parts: string[] = []

  if (params.isbn && indexes.isbn) {
    parts.push(`${indexes.isbn}="${params.isbn.replace(/[-\s]/g, '')}"`)
  }
  if (params.title && indexes.title) {
    parts.push(`${indexes.title}="${params.title}"`)
  }
  if (params.author && indexes.author) {
    parts.push(`${indexes.author}="${params.author}"`)
  }
  if (params.publisher && indexes.publisher) {
    parts.push(`${indexes.publisher}="${params.publisher}"`)
  }
  if (params.yearFrom && indexes.year) {
    parts.push(`${indexes.year}>="${params.yearFrom}"`)
  }
  if (params.yearTo && indexes.year) {
    parts.push(`${indexes.year}<="${params.yearTo}"`)
  }

  return parts.join(' and ')
}

function extractRecords(xml: string): string[] {
  const records: string[] = []
  // Match both namespaced and non-namespaced record elements
  const regex = /<(?:marc:)?record[\s>][\s\S]*?<\/(?:marc:)?record>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    records.push(match[0])
  }
  return records
}

function extractTotalResults(xml: string): number {
  const match = xml.match(/<(?:srw:)?numberOfRecords>(\d+)<\/(?:srw:)?numberOfRecords>/i)
  return match ? parseInt(match[1]) : 0
}

async function sruFetch(config: SruConfig, query: string, maxRecords: number = 20): Promise<{ xml: string; ok: boolean; error?: string }> {
  const version = config.version || '1.1'
  const url = `${config.baseUrl}?version=${version}&operation=searchRetrieve&query=${encodeURIComponent(query)}&recordSchema=${config.recordSchema}&maximumRecords=${maxRecords}`

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/xml, text/xml' },
    })

    if (!response.ok) {
      return { xml: '', ok: false, error: `HTTP ${response.status}` }
    }

    const xml = await response.text()
    
    // Check for SRU diagnostics/errors
    if (xml.includes('<diagnostic>') || xml.includes('<srw:diagnostic>')) {
      const diagMatch = xml.match(/<(?:srw:)?message>([^<]+)<\/(?:srw:)?message>/)
      if (diagMatch) {
        return { xml, ok: false, error: diagMatch[1] }
      }
    }

    return { xml, ok: true }
  } catch (err) {
    return { xml: '', ok: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}

// ===================== PROVIDER FACTORY =====================

// Cache for storing full record XML (keyed by provider code + index)
const recordCache = new Map<string, string>()

export function createSruProvider(config: SruConfig): IsbnProvider {
  return {
    code: config.code,
    name: config.name,
    country: config.country,
    type: 'sru',

    async search(isbn: string): Promise<ProviderResult> {
      const cleanIsbn = isbn.replace(/[-\s]/g, '')
      if (!config.indexes.isbn) {
        return { success: false, error: 'ISBN search not supported', provider: config.code }
      }

      const query = `${config.indexes.isbn}="${cleanIsbn}"`
      const { xml, ok, error } = await sruFetch(config, query, 1)

      if (!ok) {
        return { success: false, error: error || 'Search failed', provider: config.code }
      }

      const records = extractRecords(xml)
      if (records.length === 0) {
        return { success: false, error: 'ISBN not found', provider: config.code }
      }

      const bookData = parseRecord(records[0], !!config.isUnimarc)
      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: config.code }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      // Build source URL
      let source_url: string | undefined
      if (config.sourceUrlPattern && (bookData.isbn_13 || bookData.isbn_10)) {
        source_url = config.sourceUrlPattern.replace('{isbn}', bookData.isbn_13 || bookData.isbn_10 || '')
      }

      return {
        success: true,
        data: bookData,
        provider: config.code,
        source_url,
      }
    },

    async searchByFields(params: SearchParams): Promise<SearchResults> {
      const query = buildCqlQuery(params, config.indexes)
      if (!query) {
        return { items: [], total: 0, provider: config.code, error: 'No search parameters' }
      }

      const { xml, ok, error } = await sruFetch(config, query, 20)

      if (!ok) {
        return { items: [], total: 0, provider: config.code, error: error || 'Search failed' }
      }

      const total = extractTotalResults(xml)
      const records = extractRecords(xml)

      if (records.length === 0) {
        return { items: [], total: 0, provider: config.code }
      }

      // Cache records for detail fetch
      records.forEach((rec, i) => {
        recordCache.set(`${config.code}:record-${i}`, rec)
      })

      const items = records.map((rec, i) => parseMarcToListItem(rec, i, !!config.isUnimarc))

      return { items, total, provider: config.code }
    },

    async getDetails(editionKey: string): Promise<ProviderResult> {
      const cacheKey = `${config.code}:${editionKey}`
      const cachedXml = recordCache.get(cacheKey)

      if (!cachedXml) {
        return { success: false, error: 'Record not found in cache', provider: config.code }
      }

      const bookData = parseRecord(cachedXml, !!config.isUnimarc)
      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: config.code }
      }

      return {
        success: true,
        data: bookData,
        provider: config.code,
      }
    },
  }
}
