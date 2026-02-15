// OPAC SBN (Italy) Provider
// Union catalog of 6,300+ Italian libraries — 17M+ bibliographic records
// JSON API via http://opac.sbn.it/opacmobilegw/

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const API_BASE = 'http://opac.sbn.it/opacmobilegw'
const CHANNEL = 'VMSBNTT'

// Actual OPAC SBN brief record structure
interface SbnBriefRecord {
  progressivoId: number
  codiceIdentificativo: string   // SBN ID e.g. "IT\ICCU\UBO\4350179"
  isbn?: string
  autorePrincipale?: string      // Main author
  copertina?: string             // Cover URL (LibraryThing)
  titolo?: string                // Title (may include SoR after " / ")
  pubblicazione?: string         // Combined "Place : Publisher, Year"
  livello?: string               // "Monografia", "Spoglio", etc.
  tipo?: string                  // "Testo a stampa", etc.
  numeri?: string[]
  note?: string[]
  nomi?: string[]
  luogoNormalizzato?: string[]
  localizzazioni?: string[]
  citazioni?: string[]
}

interface SbnSearchResponse {
  numFound: number
  start: number
  rows: number
  briefRecords?: SbnBriefRecord[]
}

/**
 * Parse "Place : Publisher, Year" string
 */
function parsePubblicazione(pub: string | undefined): { place?: string; publisher?: string; year?: string } {
  if (!pub) return {}
  const result: { place?: string; publisher?: string; year?: string } = {}

  // Extract year
  const yearMatch = pub.match(/(\d{4})/)
  if (yearMatch) result.year = yearMatch[1]

  // Split "Place : Publisher, Year"
  const colonIdx = pub.indexOf(':')
  if (colonIdx > 0) {
    result.place = pub.substring(0, colonIdx).trim().replace(/[\[\]]/g, '')
    // Publisher is between : and ,/year
    let rest = pub.substring(colonIdx + 1).trim()
    // Remove year and trailing punctuation
    rest = rest.replace(/,?\s*(?:stampa\s+)?\[?\d{4}\]?.*$/, '').trim()
    rest = rest.replace(/[.,;]+$/, '').trim()
    if (rest) result.publisher = rest
  }

  return result
}

/**
 * Parse title — remove statement of responsibility after " / "
 */
function parseTitle(titolo: string | undefined): { title: string; subtitle?: string } {
  if (!titolo) return { title: '' }
  // Remove SoR
  let clean = titolo.split(' / ')[0].trim()
  // Split title : subtitle
  const colonIdx = clean.indexOf(' : ')
  if (colonIdx > 0) {
    return {
      title: clean.substring(0, colonIdx).trim(),
      subtitle: clean.substring(colonIdx + 3).trim(),
    }
  }
  return { title: clean }
}

/**
 * Parse a brief record into BookData
 */
function parseSbnRecord(record: SbnBriefRecord): BookData {
  const { title, subtitle } = parseTitle(record.titolo)
  const pub = parsePubblicazione(record.pubblicazione)

  const bookData: BookData = {
    title,
    subtitle,
    publisher: pub.publisher,
    publication_place: pub.place,
    publication_year: pub.year,
  }

  // Author
  if (record.autorePrincipale) {
    bookData.authors = [record.autorePrincipale]
  }

  // ISBN
  if (record.isbn) {
    const clean = record.isbn.replace(/[-\s]/g, '')
    if (clean.length === 13) bookData.isbn_13 = clean
    else if (clean.length === 10) bookData.isbn_10 = clean
  }

  // Cover
  if (record.copertina) {
    bookData.cover_url = record.copertina
  }

  return bookData
}

/**
 * Build source URL for an SBN record
 */
function sourceUrl(bid: string): string {
  return `https://opac.sbn.it/risultati-ricerca-avanzata/-/opac-adv?search_query=${encodeURIComponent(bid)}`
}

export const opacSbn: IsbnProvider = {
  code: 'opac_sbn',
  name: 'OPAC SBN (Italy)',
  country: 'IT',
  type: 'api',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const url = `${API_BASE}/search.json?searchField=isbn&channel=${CHANNEL}&fieldstruct=1&resultForPage=1&isbn=${cleanIsbn}`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'opac_sbn' }
      }

      const data: SbnSearchResponse = await response.json()

      if (!data.briefRecords || data.briefRecords.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'opac_sbn' }
      }

      const bookData = parseSbnRecord(data.briefRecords[0])

      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'opac_sbn' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      return {
        success: true,
        data: bookData,
        provider: 'opac_sbn',
        source_url: sourceUrl(data.briefRecords[0].codiceIdentificativo),
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'opac_sbn',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    let url: string
    const limit = params.limit || 20
    const start = params.offset || 0

    if (params.isbn) {
      const cleanIsbn = params.isbn.replace(/[-\s]/g, '')
      url = `${API_BASE}/search.json?searchField=isbn&channel=${CHANNEL}&fieldstruct=1&resultForPage=${limit}&start=${start}&isbn=${cleanIsbn}`
    } else {
      const parts: string[] = []
      if (params.title) parts.push(params.title)
      if (params.author) parts.push(params.author)

      if (parts.length === 0) {
        return { items: [], total: 0, provider: 'opac_sbn', error: 'No search parameters' }
      }

      const any = parts.join(' ')
      url = `${API_BASE}/search.json?any=${encodeURIComponent(any)}&channel=${CHANNEL}&resultForPage=${limit}&start=${start}`
    }

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'opac_sbn', error: `HTTP ${response.status}` }
      }

      const data: SbnSearchResponse = await response.json()
      const records = data.briefRecords || []

      const items: SearchResultItem[] = records.map(rec => {
        const parsed = parseSbnRecord(rec)
        return {
          title: parsed.title || 'Untitled',
          subtitle: parsed.subtitle,
          authors: parsed.authors,
          publisher: parsed.publisher,
          publication_year: parsed.publication_year,
          isbn_13: parsed.isbn_13,
          isbn_10: parsed.isbn_10,
          cover_url: parsed.cover_url,
          edition_key: rec.codiceIdentificativo,
        }
      })

      const total = data.numFound || records.length
      const hasMore = (start + records.length) < total

      return { items, total, provider: 'opac_sbn', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'opac_sbn',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    // editionKey is the codiceIdentificativo (SBN bid)
    const url = `${API_BASE}/search.json?searchField=bid&channel=${CHANNEL}&fieldstruct=1&resultForPage=1&bid=${encodeURIComponent(editionKey)}`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'opac_sbn' }
      }

      const data: SbnSearchResponse = await response.json()

      if (!data.briefRecords || data.briefRecords.length === 0) {
        return { success: false, error: 'Record not found', provider: 'opac_sbn' }
      }

      const bookData = parseSbnRecord(data.briefRecords[0])
      return {
        success: true,
        data: bookData,
        provider: 'opac_sbn',
        source_url: sourceUrl(editionKey),
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'opac_sbn',
      }
    }
  },
}
