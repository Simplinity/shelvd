import { createClient } from '@/lib/supabase/server'

export interface PublicStats {
  totalBooks: number
  totalContributors: number
  totalPublishers: number
  totalCollections: number
}

export async function getPublicStats(): Promise<PublicStats> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('get_public_stats')
    if (!error && data) {
      const stats = typeof data === 'string' ? JSON.parse(data) : data
      return {
        totalBooks: stats.total_books || 0,
        totalContributors: stats.total_contributors || 0,
        totalPublishers: stats.total_publishers || 0,
        totalCollections: stats.total_collections || 0,
      }
    }
  } catch {}

  return { totalBooks: 0, totalContributors: 0, totalPublishers: 0, totalCollections: 0 }
}
