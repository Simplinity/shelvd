'use server'

import { createClient } from '@/lib/supabase/server'
import { searchIsbn, searchProvider, searchByFields, getProviderDetails, type ProviderResult, type ActiveProvider, type SearchParams, type SearchResults } from '@/lib/isbn-providers'

export async function lookupIsbn(isbn: string): Promise<{
  result: ProviderResult | null
  attempted: string[]
  errors: Record<string, string>
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      result: null,
      attempted: [],
      errors: { auth: 'Not authenticated' },
    }
  }
  
  // Get user's active providers
  const { data: providers, error } = await (supabase as any).rpc('get_user_isbn_providers')
  
  if (error || !providers) {
    return {
      result: null,
      attempted: [],
      errors: { database: error?.message || 'Failed to load providers' },
    }
  }
  
  return searchIsbn(isbn, providers as ActiveProvider[])
}

export async function lookupIsbnWithProvider(
  isbn: string,
  providerCode: string
): Promise<ProviderResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
      provider: providerCode,
    }
  }
  
  return searchProvider(isbn, providerCode)
}

export async function lookupByFields(
  params: SearchParams,
  providerCode: string
): Promise<SearchResults> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { items: [], total: 0, provider: providerCode, error: 'Not authenticated' }
  }
  
  return searchByFields(params, providerCode)
}

export async function lookupDetails(
  editionKey: string,
  providerCode: string
): Promise<ProviderResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated', provider: providerCode }
  }
  
  return getProviderDetails(editionKey, providerCode)
}

export async function getActiveProviders(): Promise<ActiveProvider[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }
  
  const { data } = await (supabase as any).rpc('get_user_isbn_providers')
  return (data || []) as ActiveProvider[]
}
