import { createClient } from '@/lib/supabase/server'

export interface PublicStats {
  totalBooks: number
  totalContributors: number
  totalImages: number
  totalCollections: number
}

export async function getPublicStats(): Promise<PublicStats> {
  const supabase = await createClient()

  // These RPC functions are SECURITY DEFINER — work without auth
  let totalBooks = 0
  try {
    const { data } = await supabase.rpc('get_total_books_for_admin')
    totalBooks = Number(data) || 0
  } catch {}

  // Count contributors (public table or use count)
  let totalContributors = 0
  try {
    const { count } = await supabase
      .from('contributors')
      .select('*', { count: 'exact', head: true })
    totalContributors = count || 0
  } catch {}

  // Count images
  let totalImages = 0
  try {
    const { count } = await supabase
      .from('book_images')
      .select('*', { count: 'exact', head: true })
    totalImages = count || 0
  } catch {}

  // Count collections
  let totalCollections = 0
  try {
    const { count } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true })
    totalCollections = count || 0
  } catch {}

  return { totalBooks, totalContributors, totalImages, totalCollections }
}
