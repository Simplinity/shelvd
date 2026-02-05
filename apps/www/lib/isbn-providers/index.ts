// ISBN Provider Registry and Orchestrator

import type { IsbnProvider, ProviderResult, ActiveProvider } from './types'
import { openLibrary } from './open-library'
import { bolNl } from './bol-nl'

// Registry of all implemented providers
const providers: Record<string, IsbnProvider> = {
  'open_library': openLibrary,
  'bol_nl': bolNl,
  // Add more providers here as they are implemented
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

export type { IsbnProvider, ProviderResult, BookData, ActiveProvider } from './types'
