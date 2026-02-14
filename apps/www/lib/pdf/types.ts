export interface BookPdfData {
  // Core
  title: string
  subtitle?: string
  original_title?: string
  series?: string
  series_number?: string
  
  // Contributors
  contributors: { name: string; role: string }[]
  
  // Language
  language?: string
  original_language?: string
  
  // Publication
  publisher?: string
  publication_place?: string
  publication_year?: string
  printer?: string
  printing_place?: string
  
  // Edition
  edition?: string
  impression?: string
  issue_state?: string
  edition_notes?: string
  
  // Physical Description
  pagination?: string
  volumes?: string
  height_mm?: number
  width_mm?: number
  depth_mm?: number
  weight_grams?: number
  cover_type?: string
  binding?: string
  format?: string
  protective_enclosure?: string
  has_dust_jacket?: boolean
  is_signed?: boolean
  paper_type?: string
  edge_treatment?: string
  endpapers?: string
  text_block_condition?: string
  
  // Condition
  condition?: string
  dust_jacket_condition?: string
  condition_notes?: string
  status?: string
  action_needed?: string
  
  // Identifiers
  isbn_13?: string
  isbn_10?: string
  oclc_number?: string
  lccn?: string
  user_catalog_id?: string
  ddc?: string
  lcc?: string
  udc?: string
  topic?: string
  
  // BISAC
  bisac_subjects?: string[]
  
  // Storage
  storage_location?: string
  shelf?: string
  shelf_section?: string
  
  // Valuation
  lowest_price?: number
  highest_price?: number
  estimated_value?: number
  sales_price?: number
  price_currency?: string
  
  // Provenance
  provenance: {
    owner_name: string
    owner_type: string
    date_from?: string
    date_to?: string
    transaction_type?: string
    notes?: string
  }[]
  
  // Condition History
  condition_history: {
    event_date?: string
    event_type?: string
    description?: string
    before_condition?: string
    after_condition?: string
    performed_by?: string
    cost?: number
    cost_currency?: string
    notes?: string
  }[]
  
  // Notes
  summary?: string
  dedication_text?: string
  colophon_text?: string
  bibliography?: string
  illustrations_description?: string
  signatures_description?: string
  internal_notes?: string
  
  // Tags & Collections
  tags: string[]
  collections: string[]
  
  // External Links
  external_links: { label: string; url: string }[]
  
  // Catalog Entry
  catalog_entry?: string
  catalog_entry_isbd?: string
  
  // Owner info
  owner_name?: string
}

export type PaperSize = 'a4' | 'a5' | 'a6' | 'us-letter' | 'us-legal' | 'us-half-letter'
export type PdfType = 'catalog-card' | 'catalog-sheet'

export const PAPER_SIZES: Record<PaperSize, { width: number; height: number; label: string }> = {
  'a4':             { width: 595.28, height: 841.89, label: 'A4' },
  'a5':             { width: 419.53, height: 595.28, label: 'A5' },
  'a6':             { width: 297.64, height: 419.53, label: 'A6' },
  'us-letter':      { width: 612, height: 792, label: 'US Letter' },
  'us-legal':       { width: 612, height: 1008, label: 'US Legal' },
  'us-half-letter': { width: 396, height: 612, label: 'US Half Letter' },
}
