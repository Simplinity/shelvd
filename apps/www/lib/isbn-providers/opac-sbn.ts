// OPAC SBN (Italy) Provider
// Union catalog of 6,300+ Italian libraries — 17M+ bibliographic records
// Undocumented JSON API discovered via mobile app reverse-engineering
// http://opac.sbn.it/opacmobilegw/

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

const API_BASE = 'http://opac.sbn.it/opacmobilegw'
const CHANNEL = 'VMSBNTT'

// OPAC SBN response types (Italian field names)
interface SbnRecord {
  bid: string                // SBN identifier (e.g. "IT\ICCU\UFI\0001234")
  titolo?: string            // Title
  autorePrincipale?: string  // Main author
  altriAutori?: string[]     // Other authors
  editore?: string           // Publisher
  luogoPubblicazione?: string  // Publication place
  dataPubblicazione?: string   // Publication date
  isbn?: string              // ISBN
  lingua?: string            // Language
  paese?: string             // Country
  natura?: string            // Nature/type (M=monograph, S=serial)
  soggetti?: string[]        // Subjects
  classificazione?: string   // Classification (DDC)
  descrizione?: string       // Physical description
  collana?: string           // Series
  numerazione?: string       // Series numbering
  nota?: string[]            // Notes
}

interface SbnSearchResponse {
  esito: number              // 0 = success
  totale?: number            // Total results
  risultati?: SbnRecord[]    // Results
  messaggio?: string         // Error message
}

/**
 * Parse an SBN record into our BookData format
 */
function parseSbnRecord(record: SbnRecord): BookData {
  const bookData: BookData = {}

  // Title — may contain subtitle after " : " or " / "
  if (record.titolo) {
    const titleParts = record.titolo.split(' : ')
    bookData.title = titleParts[0].trim()
    if (titleParts.length > 1) {
      bookData.subtitle = titleParts.slice(1).join(' : ').trim()
    }
    // Remove statement of responsibility after " / "
    if (bookData.title.includes(' / ')) {
      bookData.title = bookData.title.split(' / ')[0].trim()
    }
    if (bookData.subtitle && bookData.subtitle.includes(' / ')) {
      bookData.subtitle = bookData.subtitle.split(' / ')[0].trim()
    }
  }

  // Authors
  const authors: string[] = []
  if (record.autorePrincipale) {
    authors.push(record.autorePrincipale)
  }
  if (record.altriAutori) {
    authors.push(...record.altriAutori)
  }
  if (authors.length > 0) bookData.authors = authors

  // Publisher & publication place
  if (record.editore) bookData.publisher = record.editore
  if (record.luogoPubblicazione) bookData.publication_place = record.luogoPubblicazione

  // Publication year
  if (record.dataPubblicazione) {
    const yearMatch = record.dataPubblicazione.match(/(\d{4})/)
    if (yearMatch) bookData.publication_year = yearMatch[1]
  }

  // ISBN
  if (record.isbn) {
    const clean = record.isbn.replace(/[-\s]/g, '')
    if (clean.length === 13) bookData.isbn_13 = clean
    else if (clean.length === 10) bookData.isbn_10 = clean
  }

  // Language
  if (record.lingua) bookData.language = record.lingua

  // Subjects
  if (record.soggetti && record.soggetti.length > 0) {
    bookData.subjects = record.soggetti
  }

  // Classification (DDC)
  if (record.classificazione) bookData.ddc = record.classificazione

  // Physical description (pages, dimensions)
  if (record.descrizione) {
    bookData.pagination_description = record.descrizione
    const pageMatch = record.descrizione.match(/(\d+)\s*p/)
    if (pageMatch) bookData.pages = parseInt(pageMatch[1])
  }

  // Series
  if (record.collana) {
    bookData.series = record.collana
    if (record.numerazione) bookData.series_number = record.numerazione
  }

  // Notes
  if (record.nota && record.nota.length > 0) {
    bookData.notes = record.nota.join('; ')
  }

  return bookData
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

      if (data.esito !== 0 || !data.risultati || data.risultati.length === 0) {
        return { success: false, error: data.messaggio || 'ISBN not found', provider: 'opac_sbn' }
      }

      const bookData = parseSbnRecord(data.risultati[0])

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
        source_url: `http://opac.sbn.it/opacsbn/opac/iccu/scheda.jsp?bid=${data.risultati[0].bid}`,
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
    // Build SBN search query
    const queryParts: string[] = []

    if (params.isbn) {
      const url = `${API_BASE}/search.json?searchField=isbn&channel=${CHANNEL}&fieldstruct=1&resultForPage=${params.limit || 20}&isbn=${params.isbn.replace(/[-\s]/g, '')}`
      return fetchSbnSearch(url, params)
    }

    // For non-ISBN search, use the "any" search field
    if (params.title) queryParts.push(params.title)
    if (params.author) queryParts.push(params.author)

    if (queryParts.length === 0) {
      return { items: [], total: 0, provider: 'opac_sbn', error: 'No search parameters' }
    }

    const any = queryParts.join(' ')
    const limit = params.limit || 20
    const start = params.offset || 0
    const url = `${API_BASE}/search.json?any=${encodeURIComponent(any)}&channel=${CHANNEL}&resultForPage=${limit}&start=${start}`

    return fetchSbnSearch(url, params)
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    // editionKey is the SBN bid
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

      if (!data.risultati || data.risultati.length === 0) {
        return { success: false, error: 'Record not found', provider: 'opac_sbn' }
      }

      const bookData = parseSbnRecord(data.risultati[0])
      return {
        success: true,
        data: bookData,
        provider: 'opac_sbn',
        source_url: `http://opac.sbn.it/opacsbn/opac/iccu/scheda.jsp?bid=${editionKey}`,
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

/**
 * Helper to fetch and parse SBN search results
 */
async function fetchSbnSearch(url: string, params: SearchParams): Promise<SearchResults> {
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return { items: [], total: 0, provider: 'opac_sbn', error: `HTTP ${response.status}` }
    }

    const data: SbnSearchResponse = await response.json()
    const records = data.risultati || []

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
        format: parsed.format,
        edition_key: rec.bid,
      }
    })

    const total = data.totale || records.length
    const offset = params.offset || 0
    const limit = params.limit || 20
    const hasMore = (offset + records.length) < total

    return { items, total, provider: 'opac_sbn', hasMore }
  } catch (err) {
    return {
      items: [],
      total: 0,
      provider: 'opac_sbn',
      error: err instanceof Error ? err.message : 'Network error',
    }
  }
}
