export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DuplicatesClient from './duplicates-client'

export default async function DuplicatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Fetch all books with fields needed for duplicate detection
  const allBooks: any[] = []
  let offset = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('books')
      .select(`
        id,
        title,
        subtitle,
        isbn_13,
        isbn_10,
        oclc_number,
        publication_year,
        publisher_name,
        condition:conditions ( name ),
        created_at
      `)
      .order('title')
      .range(offset, offset + batchSize - 1)

    console.log('Batch', offset, '- fetched:', data?.length, 'error:', error?.message)
    
    if (error || !data || data.length === 0) break
    allBooks.push(...data)
    if (data.length < batchSize) break
    offset += batchSize
  }
  
  console.log('Total books fetched:', allBooks.length)

  // Fetch first contributor (author) for each book
  const bookIds = allBooks.map(b => b.id)
  const contributorMap = new Map<string, string>()

  if (bookIds.length > 0) {
    for (let i = 0; i < bookIds.length; i += 500) {
      const batch = bookIds.slice(i, i + 500)
      const { data: contributors } = await supabase
        .from('book_contributors')
        .select('book_id, contributor:contributors ( canonical_name )')
        .in('book_id', batch)
        .order('sort_order')

      if (contributors) {
        for (const c of contributors) {
          if (!contributorMap.has(c.book_id)) {
            contributorMap.set(c.book_id, (c.contributor as any)?.canonical_name || '')
          }
        }
      }
    }
  }

  const enrichedBooks = allBooks.map(book => ({
    id: book.id,
    title: book.title || '',
    subtitle: book.subtitle || '',
    isbn_13: book.isbn_13 || '',
    isbn_10: book.isbn_10 || '',
    oclc_number: book.oclc_number || '',
    publication_year: book.publication_year || '',
    publisher_name: book.publisher_name || '',
    condition_name: (book.condition as any)?.name || '',
    author: contributorMap.get(book.id) || '',
    created_at: book.created_at || '',
  }))

  console.log('Duplicates page - user:', user?.id, 'books fetched:', enrichedBooks.length)
  
  return <DuplicatesClient books={enrichedBooks} />
}
