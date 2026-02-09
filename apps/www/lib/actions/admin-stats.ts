import { createClient } from '@/lib/supabase/server'

export interface AdminStats {
  // Key metrics
  totalBooks: number
  totalUsers: number
  avgBooksPerUser: number
  dataCompleteness: number // percentage

  // Growth (books + signups by month)
  booksByMonth: { month: string; count: number }[]
  signupsByMonth: { month: string; count: number }[]

  // Feature adoption
  featureAdoption: {
    label: string
    used: number
    total: number
    unit: string // 'books' or 'users'
  }[]

  // User engagement
  booksByStatus: { label: string; count: number }[]
  userFunnel: {
    total: number
    withBooks: number
    with10Plus: number
    with100Plus: number
    with1000Plus: number
    withZero: number
  }

  // Data health
  dataHealth: {
    label: string
    complete: number
    total: number
  }[]

  // Per-user breakdown
  booksPerUser: { email: string; count: number }[]
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient()

  // ─── TOTAL BOOKS (RPC bypasses RLS) ───
  let totalBooks = 0
  try {
    const { data } = await supabase.rpc('get_total_books_for_admin')
    totalBooks = Number(data) || 0
  } catch {}

  // ─── TOTAL USERS ───
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
  const userCount = totalUsers || 0

  // ─── AVG BOOKS / USER ───
  const avgBooksPerUser = userCount > 0 ? Math.round(totalBooks / userCount) : 0

  // ─── BOOKS DATA (for health, status, completeness) ───
  const { data: allBooks } = await supabase
    .from('books')
    .select('isbn_13, isbn_10, condition_id, publisher_name, status, created_at')

  const books = allBooks || []

  // ─── DATA COMPLETENESS ───
  // Completeness = avg of (has ISBN, has condition, has publisher) across all books
  let isbnCount = 0, conditionCount = 0, publisherCount = 0
  books.forEach(b => {
    if (b.isbn_13 || b.isbn_10) isbnCount++
    if (b.condition_id) conditionCount++
    if (b.publisher_name && b.publisher_name.trim() !== '') publisherCount++
  })
  const dataCompleteness = totalBooks > 0
    ? Math.round(((isbnCount + conditionCount + publisherCount) / (totalBooks * 3)) * 100)
    : 0

  // ─── DATA HEALTH ───
  const dataHealth = [
    { label: 'Has ISBN', complete: isbnCount, total: totalBooks },
    { label: 'Has Condition', complete: conditionCount, total: totalBooks },
    { label: 'Has Publisher', complete: publisherCount, total: totalBooks },
  ]

  // ─── BOOKS BY STATUS ───
  const statusCounts = new Map<string, number>()
  books.forEach(b => {
    const s = b.status || 'unknown'
    statusCounts.set(s, (statusCounts.get(s) || 0) + 1)
  })
  const booksByStatus = Array.from(statusCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  // ─── GROWTH: BOOKS BY MONTH ───
  const monthBookCounts = new Map<string, number>()
  books.forEach(b => {
    const m = b.created_at?.substring(0, 7) || 'unknown'
    monthBookCounts.set(m, (monthBookCounts.get(m) || 0) + 1)
  })
  const booksByMonth = Array.from(monthBookCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // ─── GROWTH: SIGNUPS BY MONTH ───
  const { data: signupDates } = await supabase
    .from('user_profiles')
    .select('created_at')
    .order('created_at', { ascending: true })

  const monthSignupCounts = new Map<string, number>()
  signupDates?.forEach(u => {
    const m = u.created_at?.substring(0, 7) || 'unknown'
    monthSignupCounts.set(m, (monthSignupCounts.get(m) || 0) + 1)
  })
  const signupsByMonth = Array.from(monthSignupCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // ─── FEATURE ADOPTION ───
  // Collections: how many books are in a non-default collection
  const { count: booksInCollections } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .not('collection_id', 'is', null)

  // Tags: how many books have at least one tag
  const { data: taggedBookIds } = await supabase
    .from('book_tags')
    .select('book_id')
  const uniqueTaggedBooks = new Set(taggedBookIds?.map(t => t.book_id) || []).size

  // Provenance: how many books have provenance entries
  const { data: provBookIds } = await supabase
    .from('provenance_entries')
    .select('book_id')
  const uniqueProvBooks = new Set(provBookIds?.map(p => p.book_id) || []).size

  // External links: how many books have links
  const { data: linkBookIds } = await supabase
    .from('book_external_links')
    .select('book_id')
  const uniqueLinkedBooks = new Set(linkBookIds?.map(l => l.book_id) || []).size

  // Collections usage by users
  const { data: userCollections } = await supabase
    .from('collections')
    .select('user_id')
  const usersWithCollections = new Set(userCollections?.map(c => c.user_id) || []).size

  const featureAdoption = [
    { label: 'In a Collection', used: booksInCollections || 0, total: totalBooks, unit: 'books' },
    { label: 'Has Provenance', used: uniqueProvBooks, total: totalBooks, unit: 'books' },
    { label: 'Has Tags', used: uniqueTaggedBooks, total: totalBooks, unit: 'books' },
    { label: 'Has External Links', used: uniqueLinkedBooks, total: totalBooks, unit: 'books' },
    { label: 'Created Collections', used: usersWithCollections, total: userCount, unit: 'users' },
  ]

  // ─── USER ENGAGEMENT / FUNNEL ───
  const { data: bookCountData } = await supabase.rpc('get_book_counts_for_admin')
  const { data: authUsers } = await supabase.rpc('get_users_for_admin')
  const emailMap = new Map((authUsers as any[])?.map((u: any) => [u.id, u.email]) || [])

  const userBookCounts = (bookCountData as any[])?.map((row: any) => ({
    email: emailMap.get(row.user_id) || 'Unknown',
    userId: row.user_id,
    count: Number(row.book_count),
  })) || []

  const withBooks = userBookCounts.filter(u => u.count > 0).length
  const with10Plus = userBookCounts.filter(u => u.count >= 10).length
  const with100Plus = userBookCounts.filter(u => u.count >= 100).length
  const with1000Plus = userBookCounts.filter(u => u.count >= 1000).length
  const withZero = userCount - withBooks

  const userFunnel = {
    total: userCount,
    withBooks,
    with10Plus,
    with100Plus,
    with1000Plus,
    withZero,
  }

  const booksPerUser = userBookCounts
    .map(u => ({ email: u.email, count: u.count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalBooks,
    totalUsers: userCount,
    avgBooksPerUser,
    dataCompleteness,
    booksByMonth,
    signupsByMonth,
    featureAdoption,
    booksByStatus,
    userFunnel,
    dataHealth,
    booksPerUser,
  }
}
