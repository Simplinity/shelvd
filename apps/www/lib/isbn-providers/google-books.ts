// Google Books ISBN Provider (API)
// Uses Google Books API — free, no key required for basic usage

import type { IsbnProvider, ProviderResult, SearchParams, SearchResults, SearchResultItem, BookData } from './types'

function parseVolumeToBookData(volume: any): BookData {
  const info = volume.volumeInfo || {}
  
  // ISBNs
  let isbn_13: string | undefined
  let isbn_10: string | undefined
  if (info.industryIdentifiers && Array.isArray(info.industryIdentifiers)) {
    for (const id of info.industryIdentifiers) {
      if (id.type === 'ISBN_13') isbn_13 = id.identifier
      if (id.type === 'ISBN_10') isbn_10 = id.identifier
    }
  }

  // Publication year from publishedDate (can be "2004", "2004-03", "2004-03-15")
  let publication_year: string | undefined
  if (info.publishedDate) {
    const yearMatch = info.publishedDate.match(/(\d{4})/)
    if (yearMatch) publication_year = yearMatch[1]
  }

  // Cover URL — prefer large, fallback to medium/small/thumbnail
  let cover_url: string | undefined
  const images = info.imageLinks
  if (images) {
    cover_url = images.extraLarge || images.large || images.medium || images.small || images.thumbnail
    // Google returns http URLs, upgrade to https
    if (cover_url) cover_url = cover_url.replace(/^http:/, 'https:')
  }

  // Language — Google returns ISO 639-1 (e.g. "en", "fr", "nl")
  let language: string | undefined
  if (info.language) language = info.language

  // Pages
  let pages: number | undefined
  if (info.pageCount) pages = info.pageCount

  // Description
  let description: string | undefined
  if (info.description) description = info.description

  // Categories → subjects
  let subjects: string[] | undefined
  if (info.categories && Array.isArray(info.categories) && info.categories.length > 0) {
    subjects = info.categories
  }

  return {
    title: info.title,
    subtitle: info.subtitle,
    authors: info.authors,
    publisher: info.publisher,
    publication_year,
    pages,
    language,
    isbn_13,
    isbn_10,
    cover_url,
    description,
    subjects,
    format: info.printType === 'BOOK' ? undefined : info.printType,
  }
}

function parseVolumeToListItem(volume: any): SearchResultItem {
  const info = volume.volumeInfo || {}

  let isbn_13: string | undefined
  let isbn_10: string | undefined
  if (info.industryIdentifiers && Array.isArray(info.industryIdentifiers)) {
    for (const id of info.industryIdentifiers) {
      if (id.type === 'ISBN_13') isbn_13 = id.identifier
      if (id.type === 'ISBN_10') isbn_10 = id.identifier
    }
  }

  let publication_year: string | undefined
  if (info.publishedDate) {
    const yearMatch = info.publishedDate.match(/(\d{4})/)
    if (yearMatch) publication_year = yearMatch[1]
  }

  let cover_url: string | undefined
  const images = info.imageLinks
  if (images) {
    cover_url = images.smallThumbnail || images.thumbnail
    if (cover_url) cover_url = cover_url.replace(/^http:/, 'https:')
  }

  return {
    title: info.title || 'Untitled',
    subtitle: info.subtitle,
    authors: info.authors,
    publisher: info.publisher,
    publication_year,
    isbn_13,
    isbn_10,
    cover_url,
    edition_key: volume.id, // Google Books volume ID
  }
}

export const googleBooks: IsbnProvider = {
  code: 'google_books',
  name: 'Google Books',
  type: 'api',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}&maxResults=1`,
        { headers: { 'Accept': 'application/json' } }
      )

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'google_books' }
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        return { success: false, error: 'ISBN not found', provider: 'google_books' }
      }

      const volume = data.items[0]
      const bookData = parseVolumeToBookData(volume)

      if (!bookData.title) {
        return { success: false, error: 'No title in response', provider: 'google_books' }
      }

      // Ensure the lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      return {
        success: true,
        data: bookData,
        provider: 'google_books',
        source_url: volume.volumeInfo?.infoLink || `https://books.google.com/books?id=${volume.id}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'google_books',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    try {
      // Build Google Books query with field-specific operators
      const queryParts: string[] = []
      if (params.title) queryParts.push(`intitle:${params.title}`)
      if (params.author) queryParts.push(`inauthor:${params.author}`)
      if (params.publisher) queryParts.push(`inpublisher:${params.publisher}`)
      if (params.isbn) queryParts.push(`isbn:${params.isbn.replace(/[-\s]/g, '')}`)

      if (queryParts.length === 0) {
        return { items: [], total: 0, provider: 'google_books', error: 'No search parameters' }
      }

      const q = encodeURIComponent(queryParts.join('+'))
      const limit = Math.min(params.limit || 40, 40) // Google Books max is 40
      const offset = params.offset || 0
      const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=${limit}&startIndex=${offset}&printType=books&orderBy=relevance`

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'google_books', error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        return { items: [], total: 0, provider: 'google_books' }
      }

      // Filter by year range client-side (Google Books API doesn't support year range)
      let volumes = data.items
      if (params.yearFrom || params.yearTo) {
        const from = params.yearFrom ? parseInt(params.yearFrom) : 0
        const to = params.yearTo ? parseInt(params.yearTo) : 9999
        volumes = volumes.filter((v: any) => {
          const date = v.volumeInfo?.publishedDate
          if (!date) return true
          const yearMatch = date.match(/(\d{4})/)
          if (!yearMatch) return true
          const year = parseInt(yearMatch[1])
          return year >= from && year <= to
        })
      }

      const items = volumes.map(parseVolumeToListItem)

      const total = data.totalItems || items.length
      const hasMore = (offset + data.items.length) < total

      return {
        items,
        total,
        provider: 'google_books',
        hasMore,
      }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'google_books',
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  },

  async getDetails(volumeId: string): Promise<ProviderResult> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${volumeId}`,
        { headers: { 'Accept': 'application/json' } }
      )

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'google_books' }
      }

      const volume = await response.json()
      const bookData = parseVolumeToBookData(volume)

      if (!bookData.title) {
        return { success: false, error: 'No title in response', provider: 'google_books' }
      }

      return {
        success: true,
        data: bookData,
        provider: 'google_books',
        source_url: volume.volumeInfo?.infoLink || `https://books.google.com/books?id=${volumeId}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'google_books',
      }
    }
  },
}

export default googleBooks
