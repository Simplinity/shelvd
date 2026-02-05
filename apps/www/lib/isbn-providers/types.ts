// ISBN Provider Types

export interface BookData {
  title?: string
  subtitle?: string
  authors?: string[]  // Array of author names
  publisher?: string
  publication_year?: string
  publication_place?: string
  pages?: number
  language?: string  // ISO code or full name
  isbn_13?: string
  isbn_10?: string
  cover_url?: string
  description?: string
  // Additional fields
  edition?: string
  series?: string
  series_number?: string
  format?: string  // e.g. "Paperback", "Hardcover"
  // Classification & identifiers
  lccn?: string  // Library of Congress Control Number
  oclc_number?: string  // OCLC/WorldCat number
  ddc?: string  // Dewey Decimal Classification
  lcc?: string  // Library of Congress Classification
  // Subject/topic
  subjects?: string[]  // Subject headings
  // Notes
  notes?: string  // Bibliography, index info, etc.
  pagination_description?: string  // e.g. "x, 643 p."
}

export interface ProviderResult {
  success: boolean
  data?: BookData
  error?: string
  provider: string  // Provider code that returned this result
  source_url?: string  // URL where data was found
}

// Search parameters for multi-field search
export interface SearchParams {
  title?: string
  author?: string
  publisher?: string
  isbn?: string
  yearFrom?: string
  yearTo?: string
}

// Lightweight result for search lists
export interface SearchResultItem {
  title: string
  subtitle?: string
  authors?: string[]
  publisher?: string
  publication_year?: string
  isbn_13?: string
  isbn_10?: string
  cover_url?: string
  format?: string
  // Provider-specific key to fetch full details
  edition_key?: string
}

// Multi-result search response
export interface SearchResults {
  items: SearchResultItem[]
  total: number
  provider: string
  error?: string
}

export interface IsbnProvider {
  code: string
  name: string
  country?: string  // ISO country code
  type: 'api' | 'sru' | 'html' | 'xsearch'
  
  // ISBN lookup (single result, full data)
  search(isbn: string): Promise<ProviderResult>
  
  // Multi-field search (multiple results, basic data)
  searchByFields?(params: SearchParams): Promise<SearchResults>
  
  // Get full details for a specific edition (from search result)
  getDetails?(editionKey: string): Promise<ProviderResult>
}

export interface ActiveProvider {
  provider_id: string
  code: string
  name: string
  country: string | null
  provider_type: 'api' | 'sru' | 'html' | 'xsearch'
  base_url: string
  is_active: boolean
  priority: number
}
