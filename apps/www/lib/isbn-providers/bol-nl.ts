// Bol.com ISBN Provider (HTML Parser)
// Searches bol.com (Netherlands/Belgium) for book data

import type { IsbnProvider, ProviderResult, SearchParams, SearchResults, SearchResultItem } from './types'

const BOL_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export const bolNl: IsbnProvider = {
  code: 'bol_nl',
  name: 'Bol.com',
  country: 'NL',
  type: 'html',
  
  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    const searchUrl = `https://www.bol.com/nl/nl/s/?searchtext=${cleanIsbn}`
    
    try {
      const response = await fetch(searchUrl, {
        headers: BOL_HEADERS,
        signal: AbortSignal.timeout(15000),
      })
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          provider: 'bol_nl',
        }
      }
      
      const html = await response.text()
      
      // Check if we got redirected to a product page (direct match)
      const productMatch = html.match(/<h1[^>]*class="[^"]*pdp-header__title[^"]*"[^>]*>([^<]+)<\/h1>/i)
      
      if (productMatch) {
        // We're on a product page - parse it
        return parseProductPage(html, response.url)
      }
      
      // We're on search results - find first book result
      const productLinkMatch = html.match(/href="(\/nl\/nl\/p\/[^"]+)"/i)
      
      if (!productLinkMatch) {
        return {
          success: false,
          error: 'No results found',
          provider: 'bol_nl',
        }
      }
      
      // Fetch the product page
      const productUrl = `https://www.bol.com${productLinkMatch[1]}`
      const productResponse = await fetch(productUrl, {
        headers: BOL_HEADERS,
        signal: AbortSignal.timeout(15000),
      })
      
      if (!productResponse.ok) {
        return {
          success: false,
          error: `HTTP ${productResponse.status} on product page`,
          provider: 'bol_nl',
        }
      }
      
      const productHtml = await productResponse.text()
      return parseProductPage(productHtml, productUrl)
      
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'bol_nl',
      }
    }
  },

  async searchByFields(params: SearchParams): Promise<SearchResults> {
    try {
      // Build search query from all fields
      const parts: string[] = []
      if (params.title) parts.push(params.title)
      if (params.author) parts.push(params.author)
      if (params.publisher) parts.push(params.publisher)
      if (params.isbn) parts.push(params.isbn.replace(/[-\s]/g, ''))

      if (parts.length === 0) {
        return { items: [], total: 0, provider: 'bol_nl', error: 'No search parameters' }
      }

      const query = parts.join(' ')
      const offset = params.offset || 0
      const page = Math.floor(offset / 24) + 1 // Bol.com uses 24 items per page
      const pageParam = page > 1 ? `&page=${page}` : ''
      const searchUrl = `https://www.bol.com/nl/nl/s/?searchtext=${encodeURIComponent(query)}&view=list&category=boeken${pageParam}`

      const response = await fetch(searchUrl, {
        headers: BOL_HEADERS,
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        return { items: [], total: 0, provider: 'bol_nl', error: `HTTP ${response.status}` }
      }

      const html = await response.text()

      // Extract total results count (e.g. "22.404 resultaten")
      const totalMatch = html.match(/([\d.]+)\s*result/i)
      const total = totalMatch ? parseInt(totalMatch[1].replace(/\./g, ''), 10) : 0

      // Extract unique product links from HTML
      const seen = new Set<string>()
      const items: SearchResultItem[] = []
      const regex = /\/nl\/nl\/p\/([^\/]+)\/(\d+)\//g
      let m: RegExpExecArray | null
      while ((m = regex.exec(html)) !== null) {
        const [, slug, id] = m
        if (seen.has(id)) continue
        seen.add(id)
        const productUrl = `https://www.bol.com/nl/nl/p/${slug}/${id}/`
        items.push({
          title: slugToTitle(slug),
          edition_key: productUrl,
        })
      }

      const hasMore = items.length > 0 && (offset + items.length) < total
      return { items, total, provider: 'bol_nl', hasMore }
    } catch (err) {
      return { items: [], total: 0, provider: 'bol_nl', error: err instanceof Error ? err.message : 'Search failed' }
    }
  },

  async getDetails(editionKey: string): Promise<ProviderResult> {
    try {
      const response = await fetch(editionKey, {
        headers: BOL_HEADERS,
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'bol_nl' }
      }

      const html = await response.text()
      return parseProductPage(html, editionKey)
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Fetch failed', provider: 'bol_nl' }
    }
  },
}

function parseProductPage(html: string, url: string): ProviderResult {
  try {
    // Title - look for the main product title
    let title: string | undefined
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                       html.match(/"name"\s*:\s*"([^"]+)"/i)
    if (titleMatch) {
      title = decodeHtmlEntities(titleMatch[1].trim())
    }
    
    // Subtitle - often in specs or separate element
    let subtitle: string | undefined
    const subtitleMatch = html.match(/Subtitel[^<]*<[^>]+>([^<]+)/i)
    if (subtitleMatch) {
      subtitle = decodeHtmlEntities(subtitleMatch[1].trim())
    }
    
    // Authors - look for author links or specs
    const authors: string[] = []
    const authorMatches = html.matchAll(/Auteur[^<]*<[^>]+>([^<]+)/gi)
    for (const match of authorMatches) {
      const author = decodeHtmlEntities(match[1].trim())
      if (author && !authors.includes(author)) {
        authors.push(author)
      }
    }
    // Also try JSON-LD
    const authorJsonMatch = html.match(/"author"\s*:\s*\[\s*\{[^}]*"name"\s*:\s*"([^"]+)"/i)
    if (authorJsonMatch && !authors.length) {
      authors.push(decodeHtmlEntities(authorJsonMatch[1]))
    }
    
    // Publisher
    let publisher: string | undefined
    const publisherMatch = html.match(/Uitgever[^<]*<[^>]+>([^<]+)/i)
    if (publisherMatch) {
      publisher = decodeHtmlEntities(publisherMatch[1].trim())
    }
    
    // Publication year - look for date or year
    let publication_year: string | undefined
    const yearMatch = html.match(/Verschijningsdatum[^<]*<[^>]+>([^<]+)/i) ||
                      html.match(/Jaar[^<]*<[^>]+>(\d{4})/i)
    if (yearMatch) {
      const dateStr = yearMatch[1].trim()
      const yearOnly = dateStr.match(/(\d{4})/)
      if (yearOnly) {
        publication_year = yearOnly[1]
      }
    }
    
    // Pages
    let pages: number | undefined
    const pagesMatch = html.match(/Aantal pagina['']?s[^<]*<[^>]+>(\d+)/i)
    if (pagesMatch) {
      pages = parseInt(pagesMatch[1], 10)
    }
    
    // Language
    let language: string | undefined
    const langMatch = html.match(/Taal[^<]*<[^>]+>([^<]+)/i)
    if (langMatch) {
      language = decodeHtmlEntities(langMatch[1].trim())
    }
    
    // ISBN-13
    let isbn_13: string | undefined
    const isbn13Match = html.match(/ISBN13[^<]*<[^>]+>([0-9-]+)/i) ||
                        html.match(/"isbn"\s*:\s*"(\d{13})"/i) ||
                        html.match(/(\d{3}-\d-\d{2,5}-\d{4,5}-\d)/i)
    if (isbn13Match) {
      isbn_13 = isbn13Match[1].replace(/-/g, '')
    }
    
    // ISBN-10
    let isbn_10: string | undefined
    const isbn10Match = html.match(/ISBN10[^<]*<[^>]+>([0-9X-]+)/i)
    if (isbn10Match) {
      isbn_10 = isbn10Match[1].replace(/-/g, '')
    }
    
    // Cover URL
    let cover_url: string | undefined
    const coverMatch = html.match(/"image"\s*:\s*"([^"]+)"/i) ||
                       html.match(/src="([^"]+)"[^>]*class="[^"]*product-image/i)
    if (coverMatch) {
      cover_url = coverMatch[1]
    }
    
    // Format/binding
    let format: string | undefined
    const formatMatch = html.match(/Bindwijze[^<]*<[^>]+>([^<]+)/i)
    if (formatMatch) {
      format = decodeHtmlEntities(formatMatch[1].trim())
    }
    
    if (!title) {
      return {
        success: false,
        error: 'Could not parse title from page',
        provider: 'bol_nl',
      }
    }
    
    return {
      success: true,
      data: {
        title,
        subtitle,
        authors: authors.length > 0 ? authors : undefined,
        publisher,
        publication_year,
        pages,
        language,
        isbn_13,
        isbn_10,
        cover_url,
        format,
      },
      provider: 'bol_nl',
      source_url: url,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Parse error',
      provider: 'bol_nl',
    }
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

export default bolNl
