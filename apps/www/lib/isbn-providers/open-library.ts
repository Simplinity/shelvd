// Open Library ISBN Provider (API)
// Uses Open Library's free API

import type { IsbnProvider, ProviderResult, SearchParams, SearchResults, SearchResultItem } from './types'

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
      
      // Publication place
      let publication_place: string | undefined
      if (data.publish_places && Array.isArray(data.publish_places) && data.publish_places.length > 0) {
        publication_place = data.publish_places[0]
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
      // Fallback: if the lookup ISBN was 13 digits and no isbn_13 in response, use it
      if (!isbn_13 && cleanIsbn.length === 13) {
        isbn_13 = cleanIsbn
      }
      // Fallback: if the lookup ISBN was 10 digits and no isbn_10 in response, use it
      if (!isbn_10 && cleanIsbn.length === 10) {
        isbn_10 = cleanIsbn
      }
      
      // Pages
      let pages: number | undefined
      if (data.number_of_pages) {
        pages = typeof data.number_of_pages === 'number' 
          ? data.number_of_pages 
          : parseInt(String(data.number_of_pages), 10)
      }
      
      // Pagination description (e.g. "x, 643 p. ;")
      let pagination_description: string | undefined
      if (data.pagination) {
        pagination_description = data.pagination.replace(/\s*;\s*$/, '').trim()
      }
      
      // Classification identifiers
      let lccn: string | undefined
      if (data.lccn && Array.isArray(data.lccn) && data.lccn.length > 0) {
        lccn = data.lccn[0]
      }
      
      let oclc_number: string | undefined
      if (data.oclc_numbers && Array.isArray(data.oclc_numbers) && data.oclc_numbers.length > 0) {
        oclc_number = data.oclc_numbers[0]
      }
      
      let ddc: string | undefined
      if (data.dewey_decimal_class && Array.isArray(data.dewey_decimal_class) && data.dewey_decimal_class.length > 0) {
        ddc = data.dewey_decimal_class[0]
      }
      
      let lcc: string | undefined
      if (data.lc_classifications && Array.isArray(data.lc_classifications) && data.lc_classifications.length > 0) {
        lcc = data.lc_classifications[0]
      }
      
      // Subjects
      let subjects: string[] | undefined
      if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
        const mapped = data.subjects.map((s: any) => typeof s === 'string' ? s : s.name || s.value || '').filter(Boolean)
        if (mapped.length > 0) subjects = mapped
      }
      
      // Notes (bibliography, index info)
      let notes: string | undefined
      if (data.notes) {
        notes = typeof data.notes === 'string' ? data.notes : data.notes?.value
      }
      
      // Language (resolve "/languages/eng" → "eng")
      let language: string | undefined
      if (data.languages && Array.isArray(data.languages) && data.languages.length > 0) {
        const langKey = data.languages[0]?.key
        if (langKey) {
          language = langKey.replace('/languages/', '')
        }
      }
      
      // Series info from works
      let series: string | undefined
      let series_number: string | undefined
      if (data.series && Array.isArray(data.series) && data.series.length > 0) {
        series = data.series[0]
      }
      
      // If no description on edition, try fetching from Works
      let description: string | undefined = typeof data.description === 'string' 
        ? data.description 
        : data.description?.value
      
      if (!description && data.works && Array.isArray(data.works) && data.works.length > 0) {
        try {
          const worksResponse = await fetch(`https://openlibrary.org${data.works[0].key}.json`)
          if (worksResponse.ok) {
            const worksData = await worksResponse.json()
            if (worksData.description) {
              description = typeof worksData.description === 'string'
                ? worksData.description
                : worksData.description?.value
            }
          }
        } catch {
          // Skip if works fetch fails
        }
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
          publication_place,
          pages,
          language,
          isbn_13,
          isbn_10,
          cover_url,
          series,
          series_number,
          edition: data.edition_name,
          format: data.physical_format,
          description,
          lccn,
          oclc_number,
          ddc,
          lcc,
          subjects,
          notes,
          pagination_description,
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
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    try {
      // Build Open Library search query
      const queryParts: string[] = []
      if (params.isbn) {
        queryParts.push(`isbn=${encodeURIComponent(params.isbn.replace(/[-\s]/g, ''))}`)
      }
      if (params.title) {
        queryParts.push(`title=${encodeURIComponent(params.title)}`)
      }
      if (params.author) {
        queryParts.push(`author=${encodeURIComponent(params.author)}`)
      }
      if (params.publisher) {
        queryParts.push(`publisher=${encodeURIComponent(params.publisher)}`)
      }

      if (queryParts.length === 0) {
        return { items: [], total: 0, provider: 'open_library', error: 'No search parameters' }
      }

      // Request fields we need for the list + detail fetch
      const fields = 'key,title,subtitle,author_name,publisher,first_publish_year,isbn,cover_i,edition_key,number_of_pages_median,language'
      const url = `https://openlibrary.org/search.json?${queryParts.join('&')}&fields=${fields}&limit=20`

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'open_library', error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.docs || data.docs.length === 0) {
        return { items: [], total: 0, provider: 'open_library' }
      }

      // Filter by year range if specified
      let docs = data.docs
      if (params.yearFrom || params.yearTo) {
        const from = params.yearFrom ? parseInt(params.yearFrom) : 0
        const to = params.yearTo ? parseInt(params.yearTo) : 9999
        docs = docs.filter((d: any) => {
          const year = d.first_publish_year
          if (!year) return true // keep results without year
          return year >= from && year <= to
        })
      }

      const items: SearchResultItem[] = docs.map((doc: any) => {
        // Find best ISBN-13 from the isbn array
        let isbn_13: string | undefined
        let isbn_10: string | undefined
        if (doc.isbn && Array.isArray(doc.isbn)) {
          for (const isbn of doc.isbn) {
            const clean = isbn.replace(/-/g, '')
            if (clean.length === 13 && !isbn_13) isbn_13 = clean
            if (clean.length === 10 && !isbn_10) isbn_10 = clean
          }
        }

        // Cover URL from cover_i
        let cover_url: string | undefined
        if (doc.cover_i) {
          cover_url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`
        }

        // Edition key for detail fetch (first edition)
        let edition_key: string | undefined
        if (doc.edition_key && doc.edition_key.length > 0) {
          edition_key = doc.edition_key[0]
        }

        return {
          title: doc.title || 'Untitled',
          subtitle: doc.subtitle,
          authors: doc.author_name,
          publisher: doc.publisher?.[0],
          publication_year: doc.first_publish_year?.toString(),
          isbn_13,
          isbn_10,
          cover_url,
          edition_key,
        } as SearchResultItem
      })

      return {
        items,
        total: data.numFound || items.length,
        provider: 'open_library',
      }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'open_library',
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    try {
      // Fetch the edition directly
      const response = await fetch(
        `https://openlibrary.org/books/${editionKey}.json`,
        { headers: { 'Accept': 'application/json' } }
      )

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'open_library' }
      }

      const data = await response.json()

      // Reuse the same parsing logic as the ISBN search
      // We need to construct a fake "isbn search" by calling the same endpoint
      // But we already have the edition data, so let's parse it the same way

      // Get authors
      const authors: string[] = []
      if (data.authors && Array.isArray(data.authors)) {
        for (const authorRef of data.authors) {
          if (authorRef.key) {
            try {
              const authorResponse = await fetch(`https://openlibrary.org${authorRef.key}.json`)
              if (authorResponse.ok) {
                const authorData = await authorResponse.json()
                if (authorData.name) authors.push(authorData.name)
              }
            } catch { /* skip */ }
          }
        }
      }

      // Publication year
      let publication_year: string | undefined
      if (data.publish_date) {
        const yearMatch = data.publish_date.match(/(\d{4})/)
        if (yearMatch) publication_year = yearMatch[1]
      }

      // Publication place
      let publication_place: string | undefined
      if (data.publish_places && Array.isArray(data.publish_places) && data.publish_places.length > 0) {
        publication_place = data.publish_places[0]
      }

      // Cover URL
      let cover_url: string | undefined
      if (data.covers && data.covers.length > 0) {
        cover_url = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
      }

      // ISBNs
      let isbn_13: string | undefined
      let isbn_10: string | undefined
      if (data.isbn_13 && data.isbn_13.length > 0) isbn_13 = data.isbn_13[0].replace(/-/g, '')
      if (data.isbn_10 && data.isbn_10.length > 0) isbn_10 = data.isbn_10[0].replace(/-/g, '')

      // Pages
      let pages: number | undefined
      if (data.number_of_pages) {
        pages = typeof data.number_of_pages === 'number' ? data.number_of_pages : parseInt(String(data.number_of_pages), 10)
      }

      // Pagination description
      let pagination_description: string | undefined
      if (data.pagination) pagination_description = data.pagination.replace(/\s*;\s*$/, '').trim()

      // Classification
      let lccn: string | undefined
      if (data.lccn && Array.isArray(data.lccn) && data.lccn.length > 0) lccn = data.lccn[0]
      let oclc_number: string | undefined
      if (data.oclc_numbers && Array.isArray(data.oclc_numbers) && data.oclc_numbers.length > 0) oclc_number = data.oclc_numbers[0]
      let ddc: string | undefined
      if (data.dewey_decimal_class && Array.isArray(data.dewey_decimal_class) && data.dewey_decimal_class.length > 0) ddc = data.dewey_decimal_class[0]
      let lcc: string | undefined
      if (data.lc_classifications && Array.isArray(data.lc_classifications) && data.lc_classifications.length > 0) lcc = data.lc_classifications[0]

      // Subjects
      let subjects: string[] | undefined
      if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
        const mapped = data.subjects.map((s: any) => typeof s === 'string' ? s : s.name || s.value || '').filter(Boolean)
        if (mapped.length > 0) subjects = mapped
      }

      // Notes
      let notes: string | undefined
      if (data.notes) notes = typeof data.notes === 'string' ? data.notes : data.notes?.value

      // Language
      let language: string | undefined
      if (data.languages && Array.isArray(data.languages) && data.languages.length > 0) {
        const langKey = data.languages[0]?.key
        if (langKey) language = langKey.replace('/languages/', '')
      }

      // Description — try edition first, then works
      let description: string | undefined = typeof data.description === 'string' ? data.description : data.description?.value
      if (!description && data.works && Array.isArray(data.works) && data.works.length > 0) {
        try {
          const worksResponse = await fetch(`https://openlibrary.org${data.works[0].key}.json`)
          if (worksResponse.ok) {
            const worksData = await worksResponse.json()
            if (worksData.description) {
              description = typeof worksData.description === 'string' ? worksData.description : worksData.description?.value
            }
          }
        } catch { /* skip */ }
      }

      // Series
      let series: string | undefined
      if (data.series && Array.isArray(data.series) && data.series.length > 0) series = data.series[0]

      const title = data.title || data.full_title
      if (!title) {
        return { success: false, error: 'No title in response', provider: 'open_library' }
      }

      return {
        success: true,
        data: {
          title,
          subtitle: data.subtitle,
          authors: authors.length > 0 ? authors : undefined,
          publisher: data.publishers?.[0],
          publication_year,
          publication_place,
          pages,
          language,
          isbn_13,
          isbn_10,
          cover_url,
          series,
          edition: data.edition_name,
          format: data.physical_format,
          description,
          lccn,
          oclc_number,
          ddc,
          lcc,
          subjects,
          notes,
          pagination_description,
        },
        provider: 'open_library',
        source_url: `https://openlibrary.org/books/${editionKey}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'open_library',
      }
    }
  },
}

export default openLibrary
