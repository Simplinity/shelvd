/**
 * Human-readable metadata for features and tiers.
 * Used by UI gating components to show upgrade hints.
 */

export const TIER_NAMES: Record<string, string> = {
  collector: 'Collector',
  collector_pro: 'Collector Pro',
  dealer: 'Dealer',
}

export const TIER_PRICES: Record<string, string> = {
  collector: 'Free',
  collector_pro: '€9.99/mo',
  dealer: '€49/mo',
}

/** The minimum tier that unlocks each feature */
export const FEATURE_MIN_TIER: Record<string, string> = {
  // Collector Pro features
  image_upload: 'collector_pro',
  pdf_inserts: 'collector_pro',
  public_sharing: 'collector_pro',
  collection_audit: 'collector_pro',
  advanced_statistics: 'collector_pro',
  // Dealer features
  catalog_generator: 'dealer',
  bulk_operations: 'dealer',
  document_storage: 'dealer',
  dealer_directory: 'dealer',
  insurance_valuation_reports: 'dealer',
}

export const FEATURE_LABELS: Record<string, string> = {
  image_upload: 'Image Uploads',
  pdf_inserts: 'PDF Inserts',
  public_sharing: 'Public Catalog & Sharing',
  collection_audit: 'Collection Audit',
  advanced_statistics: 'Advanced Statistics',
  catalog_generator: 'Catalog Generator',
  bulk_operations: 'Bulk Operations',
  document_storage: 'Document Storage',
  dealer_directory: 'Dealer Directory',
  insurance_valuation_reports: 'Insurance & Valuation Reports',
}

export const LIMIT_LABELS: Record<string, string> = {
  max_books: 'books',
  max_tags: 'tags',
  storage_bytes: 'image storage',
  bandwidth_bytes_mo: 'monthly bandwidth',
}
