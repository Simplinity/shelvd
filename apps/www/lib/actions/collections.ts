'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CollectionResult = {
  error?: string
  success?: boolean
  message?: string
  data?: any
}

// ─── Fetch all collections for current user ───

export async function getCollections() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', data: [] }

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return { error: 'Failed to fetch collections', data: [] }
  return { data: data || [] }
}

// ─── Fetch collections with book counts ───

export async function getCollectionsWithCounts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', data: [] }

  const { data: collections, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return { error: 'Failed to fetch collections', data: [] }

  // Get counts per collection
  const counts: Record<string, number> = {}
  for (const col of collections || []) {
    const { count } = await supabase
      .from('book_collections')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', col.id)
    counts[col.id] = count || 0
  }

  const result = (collections || []).map(c => ({
    ...c,
    book_count: counts[c.id] || 0,
  }))

  return { data: result }
}

// ─── Create a new collection ───

export async function createCollection(formData: FormData): Promise<CollectionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const icon = (formData.get('icon') as string)?.trim() || null
  const color = (formData.get('color') as string)?.trim() || null

  if (!name) return { error: 'Name is required' }
  if (name.length > 100) return { error: 'Name must be 100 characters or less' }

  // Get next sort_order
  const { data: existing } = await supabase
    .from('collections')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .range(0, 0)

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { error } = await supabase
    .from('collections')
    .insert({
      user_id: user.id,
      name,
      description,
      icon,
      color,
      sort_order: nextOrder,
      is_default: false,
    })

  if (error) return { error: 'Failed to create collection' }

  revalidatePath('/books')
  return { success: true, message: 'Collection created' }
}

// ─── Update a collection ───

export async function updateCollection(id: string, formData: FormData): Promise<CollectionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const icon = (formData.get('icon') as string)?.trim() || null
  const color = (formData.get('color') as string)?.trim() || null

  if (!name) return { error: 'Name is required' }
  if (name.length > 100) return { error: 'Name must be 100 characters or less' }

  const { error } = await supabase
    .from('collections')
    .update({ name, description, icon, color })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to update collection' }

  revalidatePath('/books')
  return { success: true, message: 'Collection updated' }
}

// ─── Delete a collection (not default) ───

export async function deleteCollection(id: string): Promise<CollectionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check it's not the default
  const { data: collection } = await supabase
    .from('collections')
    .select('is_default')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!collection) return { error: 'Collection not found' }
  if (collection.is_default) return { error: 'Cannot delete the default collection' }

  // Delete collection (book_collections rows cascade)
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to delete collection' }

  revalidatePath('/books')
  return { success: true, message: 'Collection deleted' }
}

// ─── Reorder collections ───

export async function reorderCollections(orderedIds: string[]): Promise<CollectionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('collections')
      .update({ sort_order: i })
      .eq('id', orderedIds[i])
      .eq('user_id', user.id)
  }

  revalidatePath('/books')
  return { success: true }
}

// ─── Get collections for a specific book ───

export async function getBookCollections(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', data: [] }

  const { data, error } = await supabase
    .from('book_collections')
    .select('collection_id')
    .eq('book_id', bookId)

  if (error) return { error: 'Failed to fetch book collections', data: [] }
  return { data: (data || []).map(r => r.collection_id) }
}

// ─── Set collections for a book (replace all) ───

export async function setBookCollections(bookId: string, collectionIds: string[]): Promise<CollectionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Remove all existing
  await supabase
    .from('book_collections')
    .delete()
    .eq('book_id', bookId)

  // Insert new ones
  if (collectionIds.length > 0) {
    const rows = collectionIds.map(cid => ({
      book_id: bookId,
      collection_id: cid,
    }))

    const { error } = await supabase
      .from('book_collections')
      .insert(rows)

    if (error) return { error: 'Failed to update book collections' }
  }

  revalidatePath('/books')
  return { success: true }
}

// ─── Add books to a collection (bulk) ───

export async function addBooksToCollection(bookIds: string[], collectionId: string): Promise<CollectionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get existing to avoid duplicates
  const { data: existing } = await supabase
    .from('book_collections')
    .select('book_id')
    .eq('collection_id', collectionId)
    .in('book_id', bookIds)

  const existingSet = new Set((existing || []).map(r => r.book_id))
  const newIds = bookIds.filter(id => !existingSet.has(id))

  if (newIds.length > 0) {
    // Batch in groups of 500
    for (let i = 0; i < newIds.length; i += 500) {
      const batch = newIds.slice(i, i + 500).map(bid => ({
        book_id: bid,
        collection_id: collectionId,
      }))

      const { error } = await supabase
        .from('book_collections')
        .insert(batch)

      if (error) return { error: 'Failed to add books to collection' }
    }
  }

  revalidatePath('/books')
  return { success: true, message: `${newIds.length} book(s) added to collection` }
}

// ─── Remove books from a collection (bulk) ───

export async function removeBooksFromCollection(bookIds: string[], collectionId: string): Promise<CollectionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Batch in groups of 500
  for (let i = 0; i < bookIds.length; i += 500) {
    const batch = bookIds.slice(i, i + 500)

    const { error } = await supabase
      .from('book_collections')
      .delete()
      .eq('collection_id', collectionId)
      .in('book_id', batch)

    if (error) return { error: 'Failed to remove books from collection' }
  }

  revalidatePath('/books')
  return { success: true, message: `${bookIds.length} book(s) removed from collection` }
}
