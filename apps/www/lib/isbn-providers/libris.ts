// LIBRIS (Sweden) Provider
// Uses the Xsearch lightweight API which returns MARCXML
// https://librishelp.libris.kb.se/help/xsearch_eng.jsp

import type { IsbnProvider, ProviderResult, SearchParams, SearchResults, SearchResultItem } from './types'
import { parseRecord, extractRecords } from './sru-provider'

const XSEARCH_BASE = 'http://libris.kb.se/xsearch'

export const libris: IsbnProvider = {
  code: 'libris',
  name: 'LIBRIS (Sweden)',
  country: 'SE',
  type: 'xsearch',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    // numm: searches ISBN without e-ISBN
    const url = `${XSEARCH_BASE}?query=numm:${cleanIsbn}&format=marcxml&n=1`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/xml, text/xml' },
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'libris' }
      }

      const xml = await response.text()
      const records = extractRecords(xml)

      if (records.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'libris' }
      }

      const bookData = parseRecord(records[0], false) // LIBRIS uses MARC21
      if (!bookData.title) {
        return { success: false, error: 'No title in record', provider: 'libris' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      return {
        success: true,
        data: bookData,
        provider: 'libris',
        source_url: `http://libris.kb.se/hitlist?q=numm:${cleanIsbn}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'libris',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    // Build Xsearch query
    const parts: string[] = []
    if (params.isbn) parts.push(`numm:${params.isbn.replace(/[-\s]/g, '')}`)
    if (params.title) parts.push(`tit:(${params.title})`)
    if (params.author) parts.push(`forf:(${params.author})`)
    if (params.publisher) parts.push(`forl:(${params.publisher})`)

    if (parts.length === 0) {
      return { items: [], total: 0, provider: 'libris', error: 'No search parameters' }
    }

    const query = parts.join(' AND ')
    const limit = params.limit || 50
    const offset = params.offset || 0
    const url = `${XSEARCH_BASE}?query=${encodeURIComponent(query)}&format=marcxml&n=${limit}&start=${offset + 1}`

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/xml, text/xml' },
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'libris', error: `HTTP ${response.status}` }
      }

      const xml = await response.text()
      const records = extractRecords(xml)

      // Extract total from xsearch response
      const totalMatch = xml.match(/records="(\d+)"/)
      const total = totalMatch ? parseInt(totalMatch[1]) : records.length

      const items: SearchResultItem[] = records.map((rec, i) => {
        const data = parseRecord(rec, false)
        return {
          title: data.title || 'Untitled',
          subtitle: data.subtitle,
          authors: data.authors,
          publisher: data.publisher,
          publication_year: data.publication_year,
          isbn_13: data.isbn_13,
          isbn_10: data.isbn_10,
          edition_key: `libris-${i}`,
        }
      })

      const hasMore = (offset + records.length) < total
      return { items, total, provider: 'libris', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'libris',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },
}
