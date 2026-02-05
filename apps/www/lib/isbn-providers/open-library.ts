// Open Library ISBN Provider (API)
// Uses Open Library's free API

import type { IsbnProvider, ProviderResult } from './types'

export const openLibrary: IsbnProvider = {
  code: 'open_library',
  name: 'Open Library',
  type: 'api',
  
  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    
    try {
      // Open Library ISBN API - returns edition data
      const response = await fetch(
        `https://openlibrary.org/isbn/${cleanIsbn}.json`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      
      if (response.status === 404) {
        return {
          success: false,
          error: 'ISBN not found',
          provider: 'open_library',
        }
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          provider: 'open_library',
        }
      }
      
      const data = await response.json()
      
      // Get authors - they're stored as references, need to resolve
      const authors: string[] = []
      if (data.authors && Array.isArray(data.authors)) {
        for (const authorRef of data.authors) {
          if (authorRef.key) {
            try {
              const authorResponse = await fetch(`https://openlibrary.org${authorRef.key}.json`)
              if (authorResponse.ok) {
                const authorData = await authorResponse.json()
                if (authorData.name) {
                  authors.push(authorData.name)
                }
              }
            } catch {
              // Skip author if fetch fails
            }
          }
        }
      }
      
      // Extract publication year from publish_date
      let publication_year: string | undefined
      if (data.publish_date) {
        const yearMatch = data.publish_date.match(/(\d{4})/)
        if (yearMatch) {
          publication_year = yearMatch[1]
        }
      }
      
      // Build cover URL
      let cover_url: string | undefined
      if (data.covers && data.covers.length > 0) {
        cover_url = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
      }
      
      // Extract ISBNs
      let isbn_13: string | undefined
      let isbn_10: string | undefined
      if (data.isbn_13 && data.isbn_13.length > 0) {
        isbn_13 = data.isbn_13[0].replace(/-/g, '')
      }
      if (data.isbn_10 && data.isbn_10.length > 0) {
        isbn_10 = data.isbn_10[0].replace(/-/g, '')
      }
      
      // Pages
      let pages: number | undefined
      if (data.number_of_pages) {
        pages = parseInt(data.number_of_pages, 10)
      }
      
      // Series info from works
      let series: string | undefined
      let series_number: string | undefined
      if (data.series && Array.isArray(data.series) && data.series.length > 0) {
        series = data.series[0]
      }
      
      const title = data.title || data.full_title
      
      if (!title) {
        return {
          success: false,
          error: 'No title in response',
          provider: 'open_library',
        }
      }
      
      return {
        success: true,
        data: {
          title,
          subtitle: data.subtitle,
          authors: authors.length > 0 ? authors : undefined,
          publisher: data.publishers?.[0],
          publication_year,
          pages,
          isbn_13,
          isbn_10,
          cover_url,
          series,
          series_number,
          edition: data.edition_name,
          format: data.physical_format,
          description: typeof data.description === 'string' 
            ? data.description 
            : data.description?.value,
        },
        provider: 'open_library',
        source_url: `https://openlibrary.org/isbn/${cleanIsbn}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'open_library',
      }
    }
  }
}

export default openLibrary
