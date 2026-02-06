// ISBN Provider Registry and Orchestrator

import type { IsbnProvider, ProviderResult, ActiveProvider } from './types'
import { openLibrary } from './open-library'
import { bolNl } from './bol-nl'
import { googleBooks } from './google-books'
import { loc, bnf, dnb, k10plus, sudoc } from './sru-libraries'
import { libris } from './libris'

// Registry of all implemented providers
const providers: Record<string, IsbnProvider> = {
  'open_library': openLibrary,
  'bol_nl': bolNl,
  'google_books': googleBooks,
  'loc': loc,
  'bnf': bnf,
  'dnb': dnb,
  'k10plus': k10plus,
  'sudoc': sudoc,
  'libris': libris,
  // 'bl': bl, // Disabled — Cloudflare blocks server-side SRU requests
}

/**
 * Search for a book by ISBN using multiple providers
 * Returns the first successful result, or all errors if none succeed
 */
export async function searchIsbn(
  isbn: string,
  activeProviders: ActiveProvider[]
): Promise<{
  result: ProviderResult | null
  attempted: string[]
  errors: Record<string, string>
}> {
  const cleanIsbn = isbn.replace(/[-\s]/g, '')
  const attempted: string[] = []
  const errors: Record<string, string> = {}
  
  // Sort by priority (lower = higher priority)
  const sortedProviders = [...activeProviders]
    .filter(p => p.is_active)
    .sort((a, b) => a.priority - b.priority)
  
  for (const activeProvider of sortedProviders) {
    const provider = providers[activeProvider.code]
    
    if (!provider) {
      // Provider not implemented yet
      errors[activeProvider.code] = 'Provider not implemented'
      continue
    }
    
    attempted.push(activeProvider.code)
    
    try {
      const result = await provider.search(cleanIsbn)
      
      if (result.success && result.data) {
        return {
          result,
          attempted,
          errors,
        }
      } else {
        errors[activeProvider.code] = result.error || 'No data returned'
      }
    } catch (err) {
      errors[activeProvider.code] = err instanceof Error ? err.message : 'Unknown error'
    }
  }
  
  return {
    result: null,
    attempted,
    errors,
  }
}

/**
 * Search a specific provider by code
 */
export async function searchProvider(
  isbn: string,
  providerCode: string
): Promise<ProviderResult> {
  const provider = providers[providerCode]
  
  if (!provider) {
    return {
      success: false,
      error: 'Provider not implemented',
      provider: providerCode,
    }
  }
  
  return provider.search(isbn)
}

/**
 * Get list of implemented provider codes
 */
export function getImplementedProviders(): string[] {
  return Object.keys(providers)
}

/**
 * Check if a provider is implemented
 */
export function isProviderImplemented(code: string): boolean {
  return code in providers
}

/**
 * Check if a provider supports multi-field search
 */
export function supportsFieldSearch(code: string): boolean {
  const provider = providers[code]
  return !!provider?.searchByFields
}

/**
 * Search by multiple fields using a specific provider
 */
export async function searchByFields(
  params: import('./types').SearchParams,
  providerCode: string
): Promise<import('./types').SearchResults> {
  const provider = providers[providerCode]
  
  if (!provider) {
    return { items: [], total: 0, provider: providerCode, error: 'Provider not implemented' }
  }
  
  if (!provider.searchByFields) {
    return { items: [], total: 0, provider: providerCode, error: 'Provider does not support field search' }
  }
  
  return provider.searchByFields(params)
}

/**
 * Get full details for a search result item
 */
export async function getProviderDetails(
  editionKey: string,
  providerCode: string
): Promise<import('./types').ProviderResult> {
  const provider = providers[providerCode]
  
  if (!provider) {
    return { success: false, error: 'Provider not implemented', provider: providerCode }
  }
  
  if (!provider.getDetails) {
    return { success: false, error: 'Provider does not support detail fetch', provider: providerCode }
  }
  
  return provider.getDetails(editionKey)
}

export type { IsbnProvider, ProviderResult, BookData, ActiveProvider, SearchParams, SearchResults, SearchResultItem } from './types'
