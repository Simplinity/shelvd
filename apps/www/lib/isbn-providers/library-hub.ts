// Library Hub Discover (UK) Provider
// Aggregates 100+ UK academic and research library catalogs (Jisc)
// Uses SRU but returns MODS XML (not MARCXML) — needs its own parser
// Docs: https://discover.libraryhub.jisc.ac.uk/support/api/

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const SRU_BASE = 'https://discover.libraryhub.jisc.ac.uk/sru-api'

// ===================== MODS XML PARSER =====================

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim()
}

function cleanTrailing(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value.replace(/[\s,:;/]+$/, '').trim() || undefined
}

function getElementText(xml: string, tag: string): string | undefined {
  // Match both namespaced and non-namespaced, handling attributes
  const regex = new RegExp(`<(?:mods:)?${tag}(?:\\s[^>]*)?>([^<]*)<\\/(?:mods:)?${tag}>`)
  const match = xml.match(regex)
  return match ? decodeXmlEntities(match[1]) : undefined
}

function getAllElementTexts(xml: string, tag: string): string[] {
  const results: string[] = []
  const regex = new RegExp(`<(?:mods:)?${tag}(?:\\s[^>]*)?>([^<]*)<\\/(?:mods:)?${tag}>`, 'g')
  let match
  while ((match = regex.exec(xml)) !== null) {
    const val = decodeXmlEntities(match[1])
    if (val) results.push(val)
  }
  return results
}

function getElements(xml: string, tag: string): string[] {
  const results: string[] = []
  const regex = new RegExp(`<(?:mods:)?${tag}[^>]*>[\\s\\S]*?<\\/(?:mods:)?${tag}>`, 'g')
  let match
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[0])
  }
  return results
}

function getElementWithAttr(xml: string, tag: string, attr: string, value: string): string | undefined {
  const regex = new RegExp(`<(?:mods:)?${tag}[^>]*${attr}="${value}"[^>]*>([^<]*)<\\/(?:mods:)?${tag}>`)
  const match = xml.match(regex)
  return match ? decodeXmlEntities(match[1]) : undefined
}

function parseModsRecord(recordXml: string): BookData {
  // Title — <titleInfo><title>...</title><subTitle>...</subTitle></titleInfo>
  const titleInfos = getElements(recordXml, 'titleInfo')
  let title = ''
  let subtitle: string | undefined
  // Use first titleInfo without type attribute (= main title)
  for (const ti of titleInfos) {
    if (ti.includes('type=')) continue // skip alternative/abbreviated titles
    title = cleanTrailing(getElementText(ti, 'title')) || ''
    subtitle = cleanTrailing(getElementText(ti, 'subTitle'))
    if (title) break
  }
  if (!title && titleInfos.length > 0) {
    title = cleanTrailing(getElementText(titleInfos[0], 'title')) || ''
    subtitle = cleanTrailing(getElementText(titleInfos[0], 'subTitle'))
  }

  // Authors — <name><namePart>...</namePart><role><roleTerm>...</roleTerm></role></name>
  const authors: string[] = []
  const nameElements = getElements(recordXml, 'name')
  for (const nameEl of nameElements) {
    const nameParts = getAllElementTexts(nameEl, 'namePart')
    if (nameParts.length > 0) {
      const fullName = cleanTrailing(nameParts.join(', '))
      if (fullName && !authors.includes(fullName)) authors.push(fullName)
    }
  }

  // Publication — <originInfo><publisher>, <place><placeTerm>, <dateIssued>
  let publisher: string | undefined
  let publication_place: string | undefined
  let publication_year: string | undefined
  const originInfos = getElements(recordXml, 'originInfo')
  if (originInfos.length > 0) {
    const oi = originInfos[0]
    publisher = cleanTrailing(getElementText(oi, 'publisher'))
    publication_place = cleanTrailing(getElementText(oi, 'placeTerm'))
    const dateIssued = getElementText(oi, 'dateIssued')
    if (dateIssued) {
      const yearMatch = dateIssued.match(/(\d{4})/)
      if (yearMatch) publication_year = yearMatch[1]
    }
  }

  // ISBN — <identifier type="isbn">
  let isbn_13: string | undefined
  let isbn_10: string | undefined
  const identifiers = getElements(recordXml, 'identifier')
  for (const idEl of identifiers) {
    if (!idEl.includes('type="isbn"')) continue
    const raw = getElementText(idEl, 'identifier')
    if (raw) {
      const clean = raw.replace(/[-\s]/g, '').replace(/\(.*\)/, '').trim()
      if (clean.length === 13 && !isbn_13) isbn_13 = clean
      if (clean.length === 10 && !isbn_10) isbn_10 = clean
    }
  }

  // Pages — <physicalDescription><extent>
  let pages: number | undefined
  let pagination_description: string | undefined
  const physDescs = getElements(recordXml, 'physicalDescription')
  if (physDescs.length > 0) {
    const extent = getElementText(physDescs[0], 'extent')
    if (extent) {
      pagination_description = cleanTrailing(extent)
      const pageMatch = extent.match(/(\d+)\s*p/i)
      if (pageMatch) pages = parseInt(pageMatch[1])
    }
  }

  // Language — <language><languageTerm>
  let language: string | undefined
  const langElements = getElements(recordXml, 'language')
  if (langElements.length > 0) {
    language = getElementText(langElements[0], 'languageTerm')
  }

  // Subjects — <subject><topic>
  let subjects: string[] | undefined
  const subjectElements = getElements(recordXml, 'subject')
  if (subjectElements.length > 0) {
    const mapped = subjectElements
      .map(s => cleanTrailing(getElementText(s, 'topic')))
      .filter(Boolean) as string[]
    if (mapped.length > 0) subjects = mapped
  }

  // Description — <abstract>
  const description = getElementText(recordXml, 'abstract')

  // Edition — <originInfo><edition>
  let edition: string | undefined
  if (originInfos.length > 0) {
    edition = cleanTrailing(getElementText(originInfos[0], 'edition'))
  }

  // Notes — <note>
  let notes: string | undefined
  const noteTexts = getAllElementTexts(recordXml, 'note')
  if (noteTexts.length > 0) notes = noteTexts.join('; ')

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
    description,
    subjects,
    notes,
    pagination_description,
  }
}

// ===================== SRU FETCH =====================

function extractModsRecords(xml: string): string[] {
  const records: string[] = []
  // Library Hub wraps MODS in <recordData><mods:mods> or <mods>
  const regex = /<(?:mods:)?mods[\s>][\s\S]*?<\/(?:mods:)?mods>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    records.push(match[0])
  }
  return records
}

function extractTotalResults(xml: string): number {
  const match = xml.match(/<(?:srw:|zs:)?numberOfRecords>(\d+)<\/(?:srw:|zs:)?numberOfRecords>/i)
  return match ? parseInt(match[1]) : 0
}

async function sruFetch(query: string, maxRecords: number = 20, startRecord: number = 1): Promise<{ xml: string; ok: boolean; error?: string }> {
  const startParam = startRecord > 1 ? `&startRecord=${startRecord}` : ''
  const url = `${SRU_BASE}?version=1.1&operation=searchRetrieve&query=${encodeURIComponent(query)}&maximumRecords=${maxRecords}${startParam}`

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/xml, text/xml' },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return { xml: '', ok: false, error: `HTTP ${response.status}` }
    }

    const xml = await response.text()

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

// ===================== RECORD CACHE =====================

const recordCache = new Map<string, string>()

// ===================== PROVIDER =====================

export const libraryHub: IsbnProvider = {
  code: 'library_hub',
  name: 'Library Hub Discover (UK)',
  country: 'GB',
  type: 'sru-mods',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const query = `dc.identifier = "${cleanIsbn}"`
    const { xml, ok, error } = await sruFetch(query, 1)

    if (!ok) {
      return { success: false, error: error || 'Search failed', provider: 'library_hub' }
    }

    const records = extractModsRecords(xml)
    if (records.length === 0) {
      return { success: false, error: 'ISBN not found', provider: 'library_hub' }
    }

    const bookData = parseModsRecord(records[0])
    if (!bookData.title) {
      return { success: false, error: 'No title in record', provider: 'library_hub' }
    }

    // Ensure lookup ISBN is preserved
    if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
    if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

    return {
      success: true,
      data: bookData,
      provider: 'library_hub',
      source_url: `https://discover.libraryhub.jisc.ac.uk/search?isbn=${cleanIsbn}`,
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    const parts: string[] = []
    if (params.isbn) parts.push(`dc.identifier = "${params.isbn.replace(/[-\s]/g, '')}"`)
    if (params.title) parts.push(`dc.title = "${params.title}"`)
    if (params.author) parts.push(`dc.creator = "${params.author}"`)
    if (params.publisher) parts.push(`dc.publisher = "${params.publisher}"`)

    if (parts.length === 0) {
      return { items: [], total: 0, provider: 'library_hub', error: 'No search parameters' }
    }

    const query = parts.join(' and ')
    const limit = params.limit || 20
    const offset = params.offset || 0
    const startRecord = offset + 1

    const { xml, ok, error } = await sruFetch(query, limit, startRecord)

    if (!ok) {
      return { items: [], total: 0, provider: 'library_hub', error: error || 'Search failed' }
    }

    const total = extractTotalResults(xml)
    const records = extractModsRecords(xml)

    if (records.length === 0) {
      return { items: [], total: 0, provider: 'library_hub' }
    }

    // Cache records for detail fetch
    records.forEach((rec, i) => {
      recordCache.set(`library_hub:record-${offset + i}`, rec)
    })

    const items: SearchResultItem[] = records.map((rec, i) => {
      const data = parseModsRecord(rec)
      return {
        title: data.title || 'Untitled',
        subtitle: data.subtitle,
        authors: data.authors,
        publisher: data.publisher,
        publication_year: data.publication_year,
        isbn_13: data.isbn_13,
        isbn_10: data.isbn_10,
        edition_key: `record-${offset + i}`,
      }
    })

    const hasMore = (offset + records.length) < total
    return { items, total, provider: 'library_hub', hasMore }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    const cacheKey = `library_hub:${editionKey}`
    const cachedXml = recordCache.get(cacheKey)

    if (!cachedXml) {
      return { success: false, error: 'Record not found in cache', provider: 'library_hub' }
    }

    const bookData = parseModsRecord(cachedXml)
    if (!bookData.title) {
      return { success: false, error: 'No title in record', provider: 'library_hub' }
    }

    let source_url: string | undefined
    if (bookData.isbn_13 || bookData.isbn_10) {
      source_url = `https://discover.libraryhub.jisc.ac.uk/search?isbn=${bookData.isbn_13 || bookData.isbn_10}`
    }

    return {
      success: true,
      data: bookData,
      provider: 'library_hub',
      source_url,
    }
  },
}
