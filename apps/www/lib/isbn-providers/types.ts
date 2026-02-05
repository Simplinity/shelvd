// ISBN Provider Types

export interface BookData {
  title?: string
  subtitle?: string
  authors?: string[]  // Array of author names
  publisher?: string
  publication_year?: string
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
}

export interface ProviderResult {
  success: boolean
  data?: BookData
  error?: string
  provider: string  // Provider code that returned this result
  source_url?: string  // URL where data was found
}

export interface IsbnProvider {
  code: string
  name: string
  country?: string  // ISO country code
  type: 'api' | 'sru' | 'html'
  
  search(isbn: string): Promise<ProviderResult>
}

export interface ActiveProvider {
  provider_id: string
  code: string
  name: string
  country: string | null
  provider_type: 'api' | 'sru' | 'html'
  base_url: string
  is_active: boolean
  priority: number
}
