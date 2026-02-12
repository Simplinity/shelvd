'use server'

import { createClient } from '@/lib/supabase/server'

// ─── Types ───

export type AuditSeverity = 'high' | 'medium' | 'low'

export type AuditFixType = 'enrich' | 'edit'

export interface AuditBook {
  id: string
  title: string
}

export interface AuditCategory {
  key: string
  label: string
  severity: AuditSeverity
  fixType: AuditFixType
  fixSection?: string        // Optional: which section to scroll to on edit page
  count: number
  passed: number             // How many books pass this check
  books: AuditBook[]         // First 50 affected books
}

export interface CollectionAuditResult {
  totalBooks: number
  score: number              // 0–100 percentage
  totalIssues: number        // Sum of all category counts
  categories: AuditCategory[]
  error?: string
}

// ─── Audit check definitions ───

const AUDIT_CHECKS: Omit<AuditCategory, 'count' | 'passed' | 'books'>[] = [
  { key: 'no_identifiers', label: 'No identifiers', severity: 'high', fixType: 'enrich' },
  { key: 'no_contributors', label: 'No contributors', severity: 'high', fixType: 'edit', fixSection: 'contributors' },
  { key: 'no_cover', label: 'No cover image', severity: 'medium', fixType: 'enrich' },
  { key: 'no_condition', label: 'No condition', severity: 'medium', fixType: 'edit', fixSection: 'condition' },
  { key: 'no_publisher', label: 'No publisher', severity: 'medium', fixType: 'enrich' },
  { key: 'no_year', label: 'No publication year', severity: 'medium', fixType: 'enrich' },
  { key: 'no_provenance', label: 'No provenance', severity: 'low', fixType: 'edit', fixSection: 'provenance' },
  { key: 'no_valuation', label: 'No valuation', severity: 'low', fixType: 'edit', fixSection: 'valuation' },
  { key: 'no_language', label: 'No language', severity: 'low', fixType: 'edit', fixSection: 'basic' },
  { key: 'no_location', label: 'No location', severity: 'low', fixType: 'edit', fixSection: 'physical' },
]

const MAX_BOOKS_PER_CATEGORY = 50

// ─── Main audit function ───

export async function getCollectionAudit(): Promise<CollectionAuditResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { totalBooks: 0, score: 0, totalIssues: 0, categories: [], error: 'Not authenticated' }

    // ── Query 1: All books with inline field checks ──
    // Fetch all book IDs + titles + field flags, paginated via .range()
    type BookRow = { id: string; title: string; isbn_10: string | null; isbn_13: string | null; oclc_number: string | null; lccn: string | null; cover_image_url: string | null; condition_id: string | null; publisher_name: string | null; publisher_id: string | null; publication_year: string | null; language_id: string | null; storage_location: string | null; status: string }
    const selectFields = 'id, title, isbn_10, isbn_13, oclc_number, lccn, cover_image_url, condition_id, publisher_name, publisher_id, publication_year, language_id, storage_location, status'
    let books: BookRow[] = []
    let offset = 0
    while (true) {
      const { data: pageData, error: pageError } = await supabase
        .from('books')
        .select(selectFields)
        .eq('user_id', user.id)
        .range(offset, offset + 999)
      if (pageError) return { totalBooks: 0, score: 0, totalIssues: 0, categories: [], error: pageError.message }
      const page = (pageData ?? []) as BookRow[]
      if (page.length === 0) break
      books = [...books, ...page]
      if (page.length < 1000) break
      offset += 1000
    }

    if (books.length === 0) return { totalBooks: 0, score: 100, totalIssues: 0, categories: emptyCategories() }

    const totalBooks = books.length

    // ── Queries 2–4: Related table checks (parallel) ──
    // Find book IDs that have at least one related record
    // Batch .in() in groups of 500 (Supabase limit)
    const bookIds = books.map(b => b.id)

    async function batchFetchContributorBookIds(): Promise<Set<string>> {
      const results: string[] = []
      for (let i = 0; i < bookIds.length; i += 500) {
        const { data } = await supabase.from('book_contributors').select('book_id').in('book_id', bookIds.slice(i, i + 500))
        if (data) results.push(...data.map(r => r.book_id))
      }
      return new Set(results)
    }

    async function batchFetchProvenanceBookIds(): Promise<Set<string>> {
      const results: string[] = []
      for (let i = 0; i < bookIds.length; i += 500) {
        const { data } = await supabase.from('provenance_entries').select('book_id').in('book_id', bookIds.slice(i, i + 500))
        if (data) results.push(...data.map(r => r.book_id))
      }
      return new Set(results)
    }

    async function batchFetchValuationBookIds(): Promise<Set<string>> {
      const results: string[] = []
      for (let i = 0; i < bookIds.length; i += 500) {
        const { data } = await supabase.from('valuation_history').select('book_id').in('book_id', bookIds.slice(i, i + 500))
        if (data) results.push(...data.map(r => r.book_id))
      }
      return new Set(results)
    }

    const [booksWithContributors, booksWithProvenance, booksWithValuation] = await Promise.all([
      batchFetchContributorBookIds(),
      batchFetchProvenanceBookIds(),
      batchFetchValuationBookIds(),
    ])

    // Statuses where provenance is expected
    const provenanceStatuses = new Set(['in_collection', 'lent', 'borrowed', 'double', 'to_sell', 'on_sale', 'reserved', 'sold'])

    // ── Build per-category results ──
    const categoryResults: Record<string, AuditBook[]> = {}
    for (const check of AUDIT_CHECKS) {
      categoryResults[check.key] = []
    }

    for (const book of books) {
      const entry = { id: book.id, title: book.title }

      if (!book.isbn_10 && !book.isbn_13 && !book.oclc_number && !book.lccn) categoryResults.no_identifiers.push(entry)
      if (!booksWithContributors.has(book.id)) categoryResults.no_contributors.push(entry)
      if (!book.cover_image_url) categoryResults.no_cover.push(entry)
      if (!book.condition_id) categoryResults.no_condition.push(entry)
      if (!book.publisher_name && !book.publisher_id) categoryResults.no_publisher.push(entry)
      if (!book.publication_year) categoryResults.no_year.push(entry)
      if (provenanceStatuses.has(book.status) && !booksWithProvenance.has(book.id)) categoryResults.no_provenance.push(entry)
      if (!booksWithValuation.has(book.id)) categoryResults.no_valuation.push(entry)
      if (!book.language_id) categoryResults.no_language.push(entry)
      if (!book.storage_location) categoryResults.no_location.push(entry)
    }

    // ── Calculate score ──
    // For provenance check, only count books with relevant statuses
    const provenanceEligible = books.filter(b => provenanceStatuses.has(b.status)).length

    let totalPoints = 0
    for (const book of books) {
      let points = 0
      if (book.isbn_10 || book.isbn_13 || book.oclc_number || book.lccn) points++
      if (booksWithContributors.has(book.id)) points++
      if (book.cover_image_url) points++
      if (book.condition_id) points++
      if (book.publisher_name || book.publisher_id) points++
      if (book.publication_year) points++
      if (provenanceStatuses.has(book.status)) {
        if (booksWithProvenance.has(book.id)) points++
      } else {
        points++ // Not applicable = pass
      }
      if (booksWithValuation.has(book.id)) points++
      if (book.language_id) points++
      if (book.storage_location) points++
      totalPoints += points
    }

    const maxPoints = totalBooks * 10
    const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 100

    // ── Build categories array ──
    const categories: AuditCategory[] = AUDIT_CHECKS.map(check => ({
      ...check,
      count: categoryResults[check.key].length,
      passed: check.key === 'no_provenance'
        ? provenanceEligible - categoryResults[check.key].length
        : totalBooks - categoryResults[check.key].length,
      books: categoryResults[check.key].slice(0, MAX_BOOKS_PER_CATEGORY),
    }))

    const totalIssues = categories.reduce((sum, c) => sum + c.count, 0)

    return { totalBooks, score, totalIssues, categories }
  } catch (err) {
    console.error('[audit] Failed to run collection audit:', err)
    return { totalBooks: 0, score: 0, totalIssues: 0, categories: [], error: 'Failed to run audit' }
  }
}

// Helper: empty categories (for 0-book collections)
function emptyCategories(): AuditCategory[] {
  return AUDIT_CHECKS.map(check => ({
    ...check,
    count: 0,
    passed: 0,
    books: [],
  }))
}
