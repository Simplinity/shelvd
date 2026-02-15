// COBISS (Co-operative Online Bibliographic System & Services) Provider
// Union catalog network covering 9 countries in SE Europe: Slovenia, Serbia,
// North Macedonia, Bosnia & Herzegovina, Montenegro, Bulgaria, Albania, Kosovo
// 10M+ bibliographic records across 780+ libraries
// https://www.cobiss.net/
//
// APPROACH: Scrape the legacy COBISS+ interface (plus-legacy.cobiss.net)
// which returns server-rendered HTML (unlike the modern SPA at plus.cobiss.net).
// Expert search with CQL-style prefixes: BN= (ISBN), TI= (title), AU= (author), PY= (year)
// Record pages contain structured HTML with bibliographic metadata.
//
// COUNTRIES & CODES:
//   SI = Slovenia, SR = Serbia, MK = North Macedonia
//   BH = Bosnia & Herzegovina, CG = Montenegro, BG = Bulgaria
//   AL = Albania, KS = Kosovo
// Each country has its own COBIB shared database.
// We search Slovenia (SI) by default as it has the largest collection,
// but searchByFields exposes a country parameter for broader coverage.

import type { IsbnProvider, ProviderResult, BookData, SearchParams, SearchResults, SearchResultItem } from './types'

// Default country for searches (Slovenia has the richest catalog)
const DEFAULT_COUNTRY = 'si'
const LANG = 'en'
const SEARCH_BASE = 'https://plus-legacy.cobiss.net/cobiss'  // Legacy: server-rendered HTML
const RECORD_BASE = 'https://plus.cobiss.net/cobiss'            // Modern: record pages have SSR metadata

// All COBISS member countries
const COBISS_COUNTRIES = ['si', 'sr', 'mk', 'bh', 'cg', 'bg', 'al', 'ks'] as const

// ===================== HTML PARSING HELPERS =====================

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

/**
 * Extract COBISS.xx-ID numbers from search result HTML
 * These appear as links to /cobiss/{cc}/{lang}/bib/{id}
 */
function extractRecordIds(html: string, country: string): string[] {
  const ids: string[] = []
  // Pattern: /cobiss/{cc}/{lang}/bib/{numeric_id}
  const regex = new RegExp(`/cobiss/${country}/${LANG}/bib/(\\d+)`, 'g')
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    if (!ids.includes(match[1])) {
      ids.push(match[1])
    }
  }
  return ids
}

/**
 * Parse a COBISS+ record detail page into BookData.
 * The record page HTML contains structured data in labeled sections.
 */
function parseRecordHtml(html: string, cobissId: string): BookData {
  const bookData: BookData = {}

  // --- Title ---
  // Title appears in <h3> or in "Title" row, or in the main heading area
  // Look for the main record title — typically in a prominent heading or the first large text
  const titlePatterns = [
    // <h3 class="recordTitle"> or similar
    /<h[23][^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h[23]>/i,
    // Title field in detail view
    /(?:Title|Naslov)\s*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*\s*([\s\S]*?)(?:<\/(?:td|div|dd|span)>)/i,
  ]
  for (const pattern of titlePatterns) {
    const match = html.match(pattern)
    if (match) {
      const raw = stripHtml(match[1])
      if (raw && raw.length > 2) {
        // Split title / subtitle at " : "
        const colonIdx = raw.indexOf(' : ')
        if (colonIdx > 0) {
          bookData.title = raw.substring(0, colonIdx).trim()
          bookData.subtitle = raw.substring(colonIdx + 3).trim()
        } else {
          // Remove statement of responsibility after " / "
          bookData.title = raw.split(' / ')[0].trim()
        }
        break
      }
    }
  }

  // Fallback: try <title> tag "BookTitle :: COBISS Plus" or og:title
  if (!bookData.title) {
    const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/)
    if (ogTitle) {
      const raw = decodeHtmlEntities(ogTitle[1])
      const cleaned = raw.replace(/\s*::\s*COBISS.*$/i, '').trim()
      if (cleaned.length > 2) {
        bookData.title = cleaned.split(' / ')[0].split(' : ')[0].trim()
        const subtitlePart = cleaned.split(' : ')[1]
        if (subtitlePart) bookData.subtitle = subtitlePart.split(' / ')[0].trim()
      }
    }
  }

  // Fallback: page <title>
  if (!bookData.title) {
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    if (titleTag) {
      const raw = stripHtml(titleTag[1])
      const cleaned = raw.replace(/\s*::\s*COBISS.*$/i, '').trim()
      if (cleaned.length > 2) {
        bookData.title = cleaned.split(' / ')[0].split(' : ')[0].trim()
      }
    }
  }

  // --- Authors ---
  // Authors appear in links with /conor/ path or labeled Author/Avtor section
  const authorPatterns = [
    // Links to CONOR authority records
    /\/conor\/[^"]*"[^>]*>([^<]+)<\/a>/g,
    // Author field in detail view
    /(?:Author|Avtor|Autor)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([\s\S]*?)(?:<\/(?:td|div|dd)>)/i,
  ]

  const authors: string[] = []
  // Try CONOR links first
  const conorRegex = /\/conor\/[^"]*"[^>]*>([^<]+)<\/a>/g
  let authorMatch: RegExpExecArray | null
  while ((authorMatch = conorRegex.exec(html)) !== null) {
    const name = stripHtml(authorMatch[1])
    if (name && name.length > 2 && !authors.includes(name)) {
      authors.push(name)
    }
  }
  if (authors.length > 0) bookData.authors = authors

  // --- Publication info ---
  // "Publication and manufacture" or "Založništvo in izdelava" section
  // Contains: Place : Publisher, Year
  const pubPatterns = [
    /(?:Publication and manufacture|Založništvo|Izdanje|Издање)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([\s\S]*?)(?:<\/(?:td|div|dd|p)>)/i,
    /(?:Impresum|Izlaznost)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([\s\S]*?)(?:<\/(?:td|div|dd|p)>)/i,
  ]
  for (const pattern of pubPatterns) {
    const match = html.match(pattern)
    if (match) {
      const raw = stripHtml(match[1])
      if (raw) {
        // Parse "Place : Publisher, Year" or "Place : Publisher, Year"
        const yearMatch = raw.match(/(\d{4})/)
        if (yearMatch) bookData.publication_year = yearMatch[1]

        const colonIdx = raw.indexOf(':')
        if (colonIdx > 0) {
          bookData.publication_place = raw.substring(0, colonIdx).trim().replace(/[\[\]]/g, '')
          let rest = raw.substring(colonIdx + 1).trim()
          rest = rest.replace(/,?\s*(?:cop\.?\s*)?(?:stampa\s+)?\[?\d{4}\]?.*$/, '').trim()
          rest = rest.replace(/[.,;]+$/, '').trim()
          if (rest) bookData.publisher = rest
        }
        break
      }
    }
  }

  // --- Publication year (fallback) ---
  if (!bookData.publication_year) {
    // "Publish date" or year in metadata
    const yearPatterns = [
      /(?:Publish date|Leto izida|Godina)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*\s*(\d{4})/i,
      /(?:Publication year|Leto)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*\s*(\d{4})/i,
    ]
    for (const pattern of yearPatterns) {
      const match = html.match(pattern)
      if (match) {
        bookData.publication_year = match[1]
        break
      }
    }
  }

  // --- ISBN ---
  const isbnPatterns = [
    /ISBN\s*[-–:]?\s*([\d][\d\s-]{8,16}[\dXx])/gi,
    /(?:isbn[^<]*(?:<[^>]*>)*\s*[-–:]?\s*)([\d][\d\s-]{8,16}[\dXx])/gi,
  ]
  for (const pattern of isbnPatterns) {
    let isbnMatch: RegExpExecArray | null
    while ((isbnMatch = pattern.exec(html)) !== null) {
      const clean = isbnMatch[1].replace(/[-\s]/g, '')
      if (clean.length === 13 && !bookData.isbn_13) bookData.isbn_13 = clean
      else if (clean.length === 10 && !bookData.isbn_10) bookData.isbn_10 = clean
    }
    if (bookData.isbn_13 || bookData.isbn_10) break
  }

  // --- Language ---
  const langPatterns = [
    /(?:Language|Jezik|Језик|Език)\s*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*\s*([a-zA-Zščžćđ]+)/i,
  ]
  for (const pattern of langPatterns) {
    const match = html.match(pattern)
    if (match) {
      bookData.language = match[1].trim().toLowerCase()
      break
    }
  }

  // --- Type of material / Format ---
  const typePatterns = [
    /(?:Type of material|Vrsta gradiva|Врста грађе)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([\s\S]*?)(?:<\/(?:td|div|dd|span)>)/i,
  ]
  for (const pattern of typePatterns) {
    const match = html.match(pattern)
    if (match) {
      bookData.format = stripHtml(match[1])
      break
    }
  }

  // --- Physical description / Pages ---
  const physPatterns = [
    /(?:Physical desc|Fizični opis|Физички опис)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([\s\S]*?)(?:<\/(?:td|div|dd|p)>)/i,
    /(\d+)\s*(?:str\.|p\.|pages|stran)/i,
  ]
  for (const pattern of physPatterns) {
    const match = html.match(pattern)
    if (match) {
      const raw = stripHtml(match[1] || match[0])
      if (raw) {
        bookData.pagination_description = raw
        const pageMatch = raw.match(/(\d+)\s*(?:str\.|p\.|pages|stran)/)
        if (pageMatch) bookData.pages = parseInt(pageMatch[1])
      }
      break
    }
  }

  // --- Subjects ---
  const subjectPatterns = [
    /(?:Topics|Teme|Предметне одреднице|Ключови думи)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([\s\S]*?)(?:<\/(?:td|div|dd)>)/i,
  ]
  for (const pattern of subjectPatterns) {
    const match = html.match(pattern)
    if (match) {
      const raw = stripHtml(match[1])
      if (raw) {
        bookData.subjects = raw.split(/\s*[|,]\s*/).map(s => s.trim()).filter(s => s.length > 0)
      }
      break
    }
  }

  // --- Edition ---
  const editionPatterns = [
    /(?:Edition|Izdaja|Издање)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([\s\S]*?)(?:<\/(?:td|div|dd)>)/i,
  ]
  for (const pattern of editionPatterns) {
    const match = html.match(pattern)
    if (match) {
      bookData.edition = stripHtml(match[1])
      break
    }
  }

  // --- Series ---
  const seriesPatterns = [
    /(?:Series|Zbirka|Серија|Едиция)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([\s\S]*?)(?:<\/(?:td|div|dd)>)/i,
  ]
  for (const pattern of seriesPatterns) {
    const match = html.match(pattern)
    if (match) {
      bookData.series = stripHtml(match[1])
      break
    }
  }

  // --- UDC Classification ---
  const udcPatterns = [
    /(?:UDC|UDK)\s*[-–:]?\s*([\d.:;\[\]()]+)/i,
  ]
  for (const pattern of udcPatterns) {
    const match = html.match(pattern)
    if (match) {
      bookData.ddc = match[1].trim() // Store UDC in ddc field as closest equivalent
      break
    }
  }

  return bookData
}

/**
 * Parse search results from the legacy COBISS+ search results page.
 * Results appear as a list with basic bibliographic info.
 */
function parseSearchResults(html: string, country: string): { items: SearchResultItem[]; total: number } {
  const items: SearchResultItem[] = []

  // Total hits — "hits: 123" or "zadetkov: 123" or "резултата: 123"
  let total = 0
  const totalMatch = html.match(/(?:hits|zadetkov|резултата|rezultata|rezultati|Резултати|Hits)\s*:\s*(\d[\d,.]*)/i)
  if (totalMatch) {
    total = parseInt(totalMatch[1].replace(/[,.]/g, ''))
  }

  // Extract record IDs from result links
  const recordIds = extractRecordIds(html, country)

  // Parse individual result entries
  // Each result in the legacy interface appears as a table row or list item
  // with number, title (as link), author, publication info, material type, ISBN, COBISS-ID

  // Split HTML into individual result blocks
  // Results are typically in table rows or numbered divs
  const resultBlocks = html.split(/(?=<tr[^>]*class="[^"]*result[^"]*"|<div[^>]*class="[^"]*result[^"]*"|<li[^>]*class="[^"]*result[^"]*")/i)

  // Alternative: look for COBISS.SI-ID patterns to find result blocks
  // Each result contains a link to /bib/{id} and surrounding metadata

  // Try to parse results from the search page - each result has:
  // - a link to the record page
  // - title text (often the link text)
  // - author, publication info inline

  // Strategy: for each record ID, find surrounding context and extract basic info
  for (const id of recordIds) {
    // Find the section of HTML around this ID
    const idIdx = html.indexOf(`/bib/${id}`)
    if (idIdx < 0) continue

    // Get a generous context window
    const start = Math.max(0, idIdx - 500)
    const end = Math.min(html.length, idIdx + 1500)
    const context = html.substring(start, end)

    const item: SearchResultItem = {
      title: '',
      edition_key: `${country}:${id}`,
    }

    // Title — usually the link text to /bib/{id}
    const linkPattern = new RegExp(`/bib/${id}[^"]*"[^>]*>([\\s\\S]*?)</a>`)
    const linkMatch = context.match(linkPattern)
    if (linkMatch) {
      const raw = stripHtml(linkMatch[1])
      item.title = raw.split(' / ')[0].split(' : ')[0].trim()
      const subtitlePart = raw.split(' : ')[1]
      if (subtitlePart) item.subtitle = subtitlePart.split(' / ')[0].trim()
    }

    // Skip if no title extracted
    if (!item.title) continue

    // Author — look for author links (conor) near this result
    const authorLinks = context.match(/\/conor\/[^"]*"[^>]*>([^<]+)<\/a>/g)
    if (authorLinks) {
      item.authors = authorLinks
        .map(a => {
          const m = a.match(/>([^<]+)</)
          return m ? stripHtml(m[1]) : ''
        })
        .filter(a => a.length > 2)
    }

    // Publication year
    const yearMatch = context.match(/(?:Publication|Založništvo|Izdanje|Publish date)[^<]*(?:<[^>]*>)*[^<]*(\d{4})/i)
      || context.match(/[,;]\s*(\d{4})\s*[.<)]/);
    if (yearMatch) item.publication_year = yearMatch[1]

    // Publisher
    const pubMatch = context.match(/(?:Publication and manufacture|Založništvo)[^<]*(?:<[^>]*>)*\s*[-–:]\s*(?:<[^>]*>)*([^<]+)/i)
    if (pubMatch) {
      const raw = stripHtml(pubMatch[1])
      const colonIdx = raw.indexOf(':')
      if (colonIdx > 0) {
        let pub = raw.substring(colonIdx + 1).trim()
        pub = pub.replace(/,?\s*\d{4}.*$/, '').trim()
        if (pub) item.publisher = pub
      }
    }

    // ISBN
    const isbnMatch = context.match(/ISBN\s*[-–:]?\s*([\d][\d\s-]{8,16}[\dXx])/i)
    if (isbnMatch) {
      const clean = isbnMatch[1].replace(/[-\s]/g, '')
      if (clean.length === 13) item.isbn_13 = clean
      else if (clean.length === 10) item.isbn_10 = clean
    }

    items.push(item)
  }

  // If no results parsed from context but we have IDs, create minimal items
  if (items.length === 0 && recordIds.length > 0) {
    for (const id of recordIds) {
      items.push({
        title: `COBISS record ${id}`,
        edition_key: `${country}:${id}`,
      })
    }
  }

  return { items, total: total || items.length }
}

/**
 * Build expert search URL for COBISS+ legacy interface
 */
function buildSearchUrl(country: string, query: string): string {
  return `${SEARCH_BASE}/${country}/${LANG}/bib/search/expert?c=${encodeURIComponent(query)}&db=cobib&mat=allmaterials`
}

/**
 * Build record URL (legacy for parsing, modern for source_url)
 */
function buildRecordUrl(country: string, cobissId: string, legacy = false): string {
  const base = legacy ? SEARCH_BASE : RECORD_BASE
  return `${base}/${country}/${LANG}/bib/${cobissId}`
}

export const cobiss: IsbnProvider = {
  code: 'cobiss',
  name: 'COBISS',
  country: 'SI',  // Primary country, but covers 9 countries
  type: 'html',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')

    // Search across multiple COBISS countries, starting with Slovenia (largest catalog)
    // Stop at first successful hit
    const countriesToSearch = [DEFAULT_COUNTRY, 'sr', 'bg', 'mk', 'bh', 'cg', 'al', 'ks']

    for (const country of countriesToSearch) {
      try {
        const query = `BN=${cleanIsbn}`
        const searchUrl = buildSearchUrl(country, query)

        const response = await fetch(searchUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'User-Agent': 'Mozilla/5.0 (compatible; Shelvd/1.0; bibliographic lookup)',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(12000),
        })

        if (!response.ok) continue

        const html = await response.text()

        // Check if we got redirected to a single record (direct hit)
        const finalUrl = response.url
        const directHitMatch = finalUrl.match(/\/bib\/(\d+)/)

        if (directHitMatch) {
          // Direct hit — parse the record page
          const bookData = parseRecordHtml(html, directHitMatch[1])
          if (bookData.title) {
            // Ensure ISBN is preserved
            if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
            if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn
            return {
              success: true,
              data: bookData,
              provider: 'cobiss',
              source_url: buildRecordUrl(country, directHitMatch[1]),  // modern URL for user
            }
          }
        }

        // Multiple results — extract first record ID and fetch its detail page
        const recordIds = extractRecordIds(html, country)
        if (recordIds.length === 0) continue

        // Fetch the first record's detail page (use legacy for reliable HTML)
        const recordFetchUrl = buildRecordUrl(country, recordIds[0], true)
        const recordResponse = await fetch(recordFetchUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'User-Agent': 'Mozilla/5.0 (compatible; Shelvd/1.0; bibliographic lookup)',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(10000),
        })

        if (!recordResponse.ok) continue

        const recordHtml = await recordResponse.text()
        const bookData = parseRecordHtml(recordHtml, recordIds[0])

        if (bookData.title) {
          if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
          if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn
          return {
            success: true,
            data: bookData,
            provider: 'cobiss',
            source_url: buildRecordUrl(country, recordIds[0]),  // modern URL for user
          }
        }
      } catch {
        // Try next country
        continue
      }
    }

    return { success: false, error: 'ISBN not found in any COBISS catalog', provider: 'cobiss' }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    const country = DEFAULT_COUNTRY

    // Build expert search query using COBISS CQL prefixes
    if (params.isbn) {
      const cleanIsbn = params.isbn.replace(/[-\s]/g, '')
      const query = `BN=${cleanIsbn}`
      const searchUrl = buildSearchUrl(country, query)

      try {
        const response = await fetch(searchUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'User-Agent': 'Mozilla/5.0 (compatible; Shelvd/1.0; bibliographic lookup)',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(12000),
        })

        if (!response.ok) {
          return { items: [], total: 0, provider: 'cobiss', error: `HTTP ${response.status}` }
        }

        const html = await response.text()
        const { items, total } = parseSearchResults(html, country)
        return { items, total, provider: 'cobiss', hasMore: false }
      } catch (err) {
        return {
          items: [],
          total: 0,
          provider: 'cobiss',
          error: err instanceof Error ? err.message : 'Network error',
        }
      }
    }

    // Non-ISBN: combine title/author/year with AND
    const queryParts: string[] = []
    if (params.title) queryParts.push(`TI=${params.title}`)
    if (params.author) queryParts.push(`AU=${params.author}`)
    if (params.yearFrom && params.yearTo) {
      queryParts.push(`PY=${params.yearFrom}:${params.yearTo}`)
    } else if (params.yearFrom) {
      queryParts.push(`PY=${params.yearFrom}`)
    }

    if (queryParts.length === 0) {
      return { items: [], total: 0, provider: 'cobiss', error: 'No search parameters' }
    }

    const query = queryParts.join(' AND ')
    const searchUrl = buildSearchUrl(country, query)

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; Shelvd/1.0; bibliographic lookup)',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'cobiss', error: `HTTP ${response.status}` }
      }

      const html = await response.text()
      const { items, total } = parseSearchResults(html, country)
      const hasMore = items.length < total
      return { items, total, provider: 'cobiss', hasMore }
    } catch (err) {
      return {
        items: [],
        total: 0,
        provider: 'cobiss',
        error: err instanceof Error ? err.message : 'Network error',
      }
    }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    // editionKey format: "{country}:{cobiss_id}"
    const [country, cobissId] = editionKey.includes(':')
      ? editionKey.split(':', 2)
      : [DEFAULT_COUNTRY, editionKey]

    const recordFetchUrl = buildRecordUrl(country, cobissId, true)  // legacy for fetching
    const recordUrl = buildRecordUrl(country, cobissId)               // modern for source_url

    try {
      const response = await fetch(recordFetchUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; Shelvd/1.0; bibliographic lookup)',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'cobiss' }
      }

      const html = await response.text()
      const bookData = parseRecordHtml(html, cobissId)

      if (!bookData.title) {
        return { success: false, error: 'Could not parse record', provider: 'cobiss' }
      }

      return {
        success: true,
        data: bookData,
        provider: 'cobiss',
        source_url: recordUrl,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        provider: 'cobiss',
      }
    }
  },
}
