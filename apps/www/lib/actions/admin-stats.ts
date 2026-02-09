import { createClient } from '@/lib/supabase/server'

export interface AdminStats {
  // Key metrics
  totalBooks: number
  totalUsers: number
  totalEstimatedValue: number
  totalSalesValue: number
  avgBookValue: number
  booksWithValue: number
  // Counts
  totalCollections: number
  totalTags: number
  totalProvenance: number
  totalExternalLinks: number
  booksWithoutIsbn: number
  // Distributions
  booksByStatus: { label: string; count: number }[]
  booksByLanguage: { label: string; count: number }[]
  booksByCondition: { label: string; count: number }[]
  topPublishers: { label: string; count: number }[]
  // Growth
  booksByMonth: { month: string; count: number }[]
  signupsByMonth: { month: string; count: number }[]
  // Per-user
  booksPerUser: { email: string; count: number }[]
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient()

  // Total books (RPC bypasses RLS)
  let totalBooks = 0
  try {
    const { data } = await supabase.rpc('get_total_books_for_admin')
    totalBooks = Number(data) || 0
  } catch {}

  // Total users
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  // Value stats — use raw SQL via RPC or just fetch from books
  // We'll do it via a simple query on books the admin can see
  const { data: valueData } = await supabase
    .from('books')
    .select('estimated_value, sales_price')

  let totalEstimatedValue = 0
  let totalSalesValue = 0
  let booksWithValue = 0
  if (valueData) {
    for (const b of valueData) {
      if (b.estimated_value && b.estimated_value > 0) {
        totalEstimatedValue += Number(b.estimated_value)
        booksWithValue++
      }
      if (b.sales_price && b.sales_price > 0) {
        totalSalesValue += Number(b.sales_price)
      }
    }
  }
  const avgBookValue = booksWithValue > 0 ? totalEstimatedValue / booksWithValue : 0

  // Counts
  const { count: totalCollections } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true })

  const { count: totalTags } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true })

  const { count: totalProvenance } = await supabase
    .from('provenance_entries')
    .select('*', { count: 'exact', head: true })

  const { count: totalExternalLinks } = await supabase
    .from('book_external_links')
    .select('*', { count: 'exact', head: true })

  // Books without ISBN
  const { data: allBooks } = await supabase
    .from('books')
    .select('isbn_13, isbn_10')

  const booksWithoutIsbn = allBooks?.filter(b => !b.isbn_13 && !b.isbn_10).length || 0

  // Books by status
  const { data: statusData } = await supabase
    .from('books')
    .select('status')

  const statusCounts = new Map<string, number>()
  statusData?.forEach(b => {
    const s = b.status || 'unknown'
    statusCounts.set(s, (statusCounts.get(s) || 0) + 1)
  })
  const booksByStatus = Array.from(statusCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  // Books by language
  const { data: langData } = await supabase
    .from('books')
    .select('language:languages(name_en)')

  const langCounts = new Map<string, number>()
  langData?.forEach((b: any) => {
    const lang = b.language?.name_en || 'Unknown'
    langCounts.set(lang, (langCounts.get(lang) || 0) + 1)
  })
  const booksByLanguage = Array.from(langCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Books by condition
  const { data: condData } = await supabase
    .from('books')
    .select('condition:conditions(name)')

  const condCounts = new Map<string, number>()
  condData?.forEach((b: any) => {
    if (b.condition?.name) {
      condCounts.set(b.condition.name, (condCounts.get(b.condition.name) || 0) + 1)
    }
  })
  const booksByCondition = Array.from(condCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  // Top publishers
  const { data: pubData } = await supabase
    .from('books')
    .select('publisher_name')
    .not('publisher_name', 'is', null)

  const pubCounts = new Map<string, number>()
  pubData?.forEach(b => {
    if (b.publisher_name) {
      pubCounts.set(b.publisher_name, (pubCounts.get(b.publisher_name) || 0) + 1)
    }
  })
  const topPublishers = Array.from(pubCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Books by month
  const { data: bookDates } = await supabase
    .from('books')
    .select('created_at')
    .order('created_at', { ascending: true })

  const monthBookCounts = new Map<string, number>()
  bookDates?.forEach(b => {
    const m = b.created_at?.substring(0, 7) || 'unknown'
    monthBookCounts.set(m, (monthBookCounts.get(m) || 0) + 1)
  })
  const booksByMonth = Array.from(monthBookCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Signups by month
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

  // Books per user
  const { data: bookCountData } = await supabase.rpc('get_book_counts_for_admin')
  const { data: authUsers } = await supabase.rpc('get_users_for_admin')
  const emailMap = new Map((authUsers as any[])?.map((u: any) => [u.id, u.email]) || [])

  const booksPerUser = (bookCountData as any[])
    ?.map((row: any) => ({
      email: emailMap.get(row.user_id) || 'Unknown',
      count: Number(row.book_count),
    }))
    .sort((a: any, b: any) => b.count - a.count) || []

  return {
    totalBooks,
    totalUsers: totalUsers || 0,
    totalEstimatedValue,
    totalSalesValue,
    avgBookValue,
    booksWithValue,
    totalCollections: totalCollections || 0,
    totalTags: totalTags || 0,
    totalProvenance: totalProvenance || 0,
    totalExternalLinks: totalExternalLinks || 0,
    booksWithoutIsbn,
    booksByStatus,
    booksByLanguage,
    booksByCondition,
    topPublishers,
    booksByMonth,
    signupsByMonth,
    booksPerUser,
  }
}
