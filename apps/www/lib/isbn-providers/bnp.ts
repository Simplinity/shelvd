// BNP / PORBASE — Biblioteca Nacional de Portugal / Union Catalog
// URN HTTP service returning MODS XML
// https://opendata.bnportugal.gov.pt/eng_services.htm
// No API key required. Free access.
// PORBASE = union catalog of Portuguese libraries (broader coverage than BNP alone)

import type { IsbnProvider, ProviderResult, BookData } from './types'

// Use PORBASE (union catalog) for broader coverage; BNP catalog at urn.bnportugal.gov.pt
const BASE_URL = 'https://urn.porbase.org/isbn/mods/xml'

/**
 * Extract text content from an XML element by tag name.
 * Returns first match or undefined.
 */
function getText(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i')
  const match = xml.match(re)
  return match?.[1]?.trim()
}

/**
 * Extract all text values for a tag.
 */
function getAllText(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'gi')
  const results: string[] = []
  let match
  while ((match = re.exec(xml)) !== null) {
    const val = match[1].trim()
    if (val) results.push(val)
  }
  return results
}

/**
 * Extract year from dateIssued, dateOther, or dateCreated fields.
 */
function extractYear(xml: string): string | undefined {
  for (const tag of ['dateOther', 'dateIssued', 'dateCreated']) {
    const val = getText(xml, tag)
    if (val) {
      const m = val.match(/(\d{4})/)
      if (m) return m[1]
    }
  }
  return undefined
}

/**
 * Extract page count from <extent> field.
 */
function extractPages(extent: string | undefined): number | undefined {
  if (!extent) return undefined
  const m = extent.match(/(\d+)\s*(?:p\.|pages?|pp\.?|f\.)/i)
  return m ? parseInt(m[1]) : undefined
}

/**
 * Extract authors from <name> elements.
 * MODS uses <name type="personal"><namePart>...</namePart></name>
 */
function extractAuthors(xml: string): string[] {
  const authors: string[] = []
  // Match <name ...type="personal"...>...<namePart>NAME</namePart>...</name>
  const nameBlocks = xml.match(/<name[^>]*type="personal"[^>]*>[\s\S]*?<\/name>/gi) || []
  for (const block of nameBlocks) {
    const namePart = getText(block, 'namePart')
    if (namePart) authors.push(namePart)
  }
  return authors
}

/**
 * Parse MODS XML into BookData.
 */
function parseModsToBookData(xml: string): BookData {
  // ISBN — look for <identifier type="isbn">
  let isbn_13: string | undefined
  let isbn_10: string | undefined
  const isbnMatches = xml.match(/<identifier type="isbn">([^<]+)<\/identifier>/gi) || []
  for (const m of isbnMatches) {
    const val = m.replace(/<[^>]+>/g, '').replace(/[-\s]/g, '')
    if (/^\d{13}$/.test(val) && (val.startsWith('978') || val.startsWith('979'))) {
      isbn_13 = val
    } else if (/^\d{9}[\dXx]$/.test(val)) {
      isbn_10 = val
    }
  }

  const title = getText(xml, 'title')
  const subtitle = getText(xml, 'subTitle')
  const authors = extractAuthors(xml)
  const publisher = getText(xml, 'publisher')
  const year = extractYear(xml)
  const extent = getText(xml, 'extent')
  const pages = extractPages(extent)
  const edition = getText(xml, 'edition')

  // Language — <languageTerm type="code">por</languageTerm>
  const langMatch = xml.match(/<languageTerm[^>]*type="code"[^>]*>([^<]+)<\/languageTerm>/i)
  const language = langMatch?.[1]?.trim()

  // Place — <placeTerm type="text">Alfragide</placeTerm>
  const placeMatch = xml.match(/<placeTerm[^>]*type="text"[^>]*>([^<]+)<\/placeTerm>/i)
  const publication_place = placeMatch?.[1]?.trim()

  // Subjects — <subject><topic>...</topic></subject>
  const subjects = getAllText(xml, 'topic')

  return {
    title,
    subtitle,
    authors: authors.length > 0 ? authors : undefined,
    publisher,
    publication_year: year,
    publication_place,
    pages,
    language,
    isbn_13,
    isbn_10,
    edition,
    subjects: subjects.length > 0 ? subjects : undefined,
    pagination_description: extent,
  }
}

export const bnp: IsbnProvider = {
  code: 'bnp',
  name: 'BNP / PORBASE (Portugal)',
  country: 'PT',
  type: 'api',

  async search(isbn: string): Promise<ProviderResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')

    try {
      const url = `${BASE_URL}?id=${cleanIsbn}`
      const response = await fetch(url, {
        headers: { 'Accept': 'application/xml, text/xml' },
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, provider: 'bnp' }
      }

      const xml = await response.text()

      // Check for "Registo inexistente" (record not found)
      if (xml.includes('Registo inexistente') || xml.includes('inexistente')) {
        return { success: false, error: 'ISBN not found', provider: 'bnp' }
      }

      // Check we got actual MODS data
      if (!xml.includes('<mods') && !xml.includes('<modsCollection')) {
        return { success: false, error: 'Invalid response format', provider: 'bnp' }
      }

      const bookData = parseModsToBookData(xml)

      if (!bookData.title) {
        return { success: false, error: 'No title in response', provider: 'bnp' }
      }

      // Ensure lookup ISBN is preserved
      if (!bookData.isbn_13 && cleanIsbn.length === 13) bookData.isbn_13 = cleanIsbn
      if (!bookData.isbn_10 && cleanIsbn.length === 10) bookData.isbn_10 = cleanIsbn

      // Extract BNP record ID for source URL
      const idMatch = xml.match(/<identifier type="uri">([^<]+)<\/identifier>/i)
      const recordUri = idMatch?.[1]?.trim()
      const sourceUrl = recordUri || `https://porbase.bnportugal.gov.pt/ipac20/ipac.jsp?menu=search&aspect=basic_search&npp=20&ipp=20&spp=20&profile=porbase&index=ISBN&term=${cleanIsbn}`

      return {
        success: true,
        data: bookData,
        provider: 'bnp',
        source_url: sourceUrl,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        provider: 'bnp',
      }
    }
  },

  // Minimal searchByFields: only works when ISBN is provided
  async searchByFields(params: import('./types').SearchParams): Promise<import('./types').SearchResults> {
    const isbn = params.isbn?.replace(/[-\s]/g, '')
    if (!isbn) {
      return { items: [], total: 0, provider: 'bnp', error: 'BNP/PORBASE only supports ISBN lookup' }
    }

    const result = await this.search(isbn)
    if (!result.success || !result.data) {
      return { items: [], total: 0, provider: 'bnp', error: result.error }
    }

    return {
      items: [{
        title: result.data.title || '',
        authors: result.data.authors,
        publisher: result.data.publisher,
        publication_year: result.data.publication_year,
        isbn_13: result.data.isbn_13,
        isbn_10: result.data.isbn_10,
        edition_key: isbn,
      }],
      total: 1,
      provider: 'bnp',
    }
  },
}

export default bnp
