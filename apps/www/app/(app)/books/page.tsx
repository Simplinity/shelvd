'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Plus, LayoutGrid, List, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type BookListItem = {
  id: string
  title: string
  subtitle: string | null
  publication_year: string | null
  publication_place: string | null
  publisher: string | null
  status: string
  cover_type: string | null
  condition_id: number | null
  user_catalog_id: string | null
  // Joined data
  contributors: { name: string; role: string }[]
}

const ITEMS_PER_PAGE = 250

export default function BooksPage() {
  const [books, setBooks] = useState<BookListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [page, setPage] = useState(0)

  const supabase = createClient()

  // Fetch books
  const fetchBooks = async (pageNum: number, append = false) => {
    if (pageNum === 0) setLoading(true)
    else setLoadingMore(true)

    const from = pageNum * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('books')
      .select(`
        id, title, subtitle, publication_year, publication_place, publisher_name,
        status, cover_type, condition_id, user_catalog_id,
        book_contributors (
          contributor:contributors ( canonical_name ),
          role:contributor_roles ( name )
        )
      `)
      .order('title', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('Error fetching books:', error)
    } else if (data) {
      const formattedBooks: BookListItem[] = data.map((book: any) => ({
        id: book.id,
        title: book.title,
        subtitle: book.subtitle,
        publication_year: book.publication_year,
        publication_place: book.publication_place,
        publisher: book.publisher_name,
        status: book.status,
        cover_type: book.cover_type,
        condition_id: book.condition_id,
        user_catalog_id: book.user_catalog_id,
        contributors: (book.book_contributors || []).map((bc: any) => ({
          name: bc.contributor?.canonical_name || 'Unknown',
          role: bc.role?.name || 'Contributor'
        }))
      }))

      if (append) {
        setBooks(prev => [...prev, ...formattedBooks])
      } else {
        setBooks(formattedBooks)
      }
    }

    setLoading(false)
    setLoadingMore(false)
  }

  // Get total count
  const fetchCount = async () => {
    const { count } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
    setTotalCount(count || 0)
  }

  useEffect(() => {
    fetchCount()
    fetchBooks(0)
  }, [])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBooks(nextPage, true)
  }

  const hasMore = books.length < totalCount

  // Get primary author(s)
  const getAuthors = (contributors: { name: string; role: string }[]) => {
    const authors = contributors.filter(c => c.role === 'Author')
    if (authors.length === 0) return null
    if (authors.length === 1) return authors[0].name
    if (authors.length === 2) return `${authors[0].name} & ${authors[1].name}`
    return `${authors[0].name} et al.`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Collection</h1>
          <p className="text-muted-foreground">
            {totalCount === 0 
              ? "You haven't added any books yet"
              : `${totalCount.toLocaleString()} ${totalCount === 1 ? 'book' : 'books'} in your collection`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-border">
            <button
              onClick={() => setView('list')}
              className={`p-2 ${view === 'list' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`p-2 ${view === 'grid' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button asChild>
            <Link href="/books/add" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Book
            </Link>
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {books.length === 0 && !loading && (
        <div className="text-center py-24 border-2 border-dashed border-border">
          <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No books yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start building your collection by adding your first book.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/books/add" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Book
            </Link>
          </Button>
        </div>
      )}

      {/* List View */}
      {books.length > 0 && view === 'list' && (
        <div className="border border-border">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Author</div>
            <div className="col-span-2">Publisher</div>
            <div className="col-span-2">Place</div>
            <div className="col-span-1">Year</div>
            <div className="col-span-1">Status</div>
          </div>
          {/* Rows */}
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors text-sm"
            >
              <div className="col-span-4">
                <span className="font-medium line-clamp-2">{book.title}</span>
              </div>
              <div className="col-span-2 text-muted-foreground truncate">
                {getAuthors(book.contributors) || '—'}
              </div>
              <div className="col-span-2 text-muted-foreground truncate">
                {book.publisher || '—'}
              </div>
              <div className="col-span-2 text-muted-foreground truncate">
                {book.publication_place || '—'}
              </div>
              <div className="col-span-1 text-muted-foreground">
                {book.publication_year || '—'}
              </div>
              <div className="col-span-1">
                <span className={`text-xs px-2 py-0.5 ${
                  book.status === 'for_sale' ? 'bg-green-100 text-green-700' :
                  book.status === 'sold' ? 'bg-gray-100 text-gray-500' :
                  book.status === 'lost' ? 'bg-red-100 text-red-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {book.status === 'in_collection' ? 'In Col.' : 
                   book.status === 'for_sale' ? 'For Sale' :
                   book.status === 'sold' ? 'Sold' :
                   book.status === 'lost' ? 'Lost' : book.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Grid View */}
      {books.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-card border border-border hover:border-foreground/20 transition-colors"
            >
              {/* Book cover placeholder - smaller */}
              <div className="aspect-[3/4] bg-muted flex items-center justify-center p-4">
                <div className="text-center">
                  <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">No cover</p>
                </div>
              </div>
              
              {/* Book info */}
              <div className="p-3">
                <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                  {getAuthors(book.contributors) || 'Unknown author'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {book.publication_year || '—'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && books.length > 0 && (
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              `Load more (${books.length} of ${totalCount.toLocaleString()})`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
