'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Plus, LayoutGrid, List, Loader2, Trash2, X, CheckSquare } from 'lucide-react'
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
  
  // Selection state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === books.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(books.map(b => b.id)))
    }
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const isAllSelected = books.length > 0 && selectedIds.size === books.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < books.length

  // Bulk delete
  const handleBulkDelete = async () => {
    const expectedText = selectedIds.size === 1 ? 'delete' : `delete ${selectedIds.size} books`
    if (confirmText.toLowerCase() !== expectedText.toLowerCase()) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const idsToDelete = Array.from(selectedIds)

      // First delete book_contributors for all selected books
      const { error: contributorsError } = await supabase
        .from('book_contributors')
        .delete()
        .in('book_id', idsToDelete)

      if (contributorsError) {
        throw new Error(`Failed to delete contributors: ${contributorsError.message}`)
      }

      // Then delete the books
      const { error: booksError } = await supabase
        .from('books')
        .delete()
        .in('id', idsToDelete)

      if (booksError) {
        throw new Error(`Failed to delete books: ${booksError.message}`)
      }

      // Update local state
      setBooks(prev => prev.filter(b => !selectedIds.has(b.id)))
      setTotalCount(prev => prev - selectedIds.size)
      setSelectedIds(new Set())
      setSelectionMode(false)
      setShowDeleteModal(false)
      setConfirmText('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete books'
      setDeleteError(message)
    } finally {
      setDeleting(false)
    }
  }

  const selectedCount = selectedIds.size
  const confirmTextExpected = selectedCount === 1 ? 'delete' : `delete ${selectedCount} books`
  const isConfirmValid = confirmText.toLowerCase() === confirmTextExpected.toLowerCase()

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
          {/* Select mode toggle */}
          <Button
            variant={selectionMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
            className="gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            {selectionMode ? 'Cancel' : 'Select'}
          </Button>
          <Button asChild>
            <Link href="/books/add" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Book
            </Link>
          </Button>
        </div>
      </div>

      {/* Selection action bar */}
      {selectionMode && (
        <div className="mb-4 p-3 bg-muted border border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedCount === 0 
                ? 'Select books to delete' 
                : `${selectedCount} ${selectedCount === 1 ? 'book' : 'books'} selected`
              }
            </span>
            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </button>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={selectedCount === 0}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </Button>
        </div>
      )}

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
          <div className={`grid ${selectionMode ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'} gap-4 px-4 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border`}>
            {selectionMode && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected
                  }}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                  title={isAllSelected ? 'Deselect all' : 'Select all'}
                />
              </div>
            )}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Author</div>
              <div className="col-span-2">Publisher</div>
              <div className="col-span-2">Place</div>
              <div className="col-span-1">Year</div>
              <div className="col-span-1">Status</div>
            </div>
          </div>
          {/* Rows */}
          {books.map((book) => (
            <div
              key={book.id}
              className={`grid ${selectionMode ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'} gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors text-sm ${
                selectionMode && selectedIds.has(book.id) ? 'bg-muted/50' : ''
              }`}
            >
              {selectionMode && (
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(book.id)}
                    onChange={() => toggleSelect(book.id)}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                </div>
              )}
              <Link
                href={`/books/${book.id}`}
                className="grid grid-cols-12 gap-4"
              >
                <div className="col-span-4 text-muted-foreground line-clamp-2">
                  {book.title}
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
                    // Sales flow
                    book.status === 'on_sale' ? 'bg-green-100 text-green-700' :
                    book.status === 'to_sell' ? 'bg-green-50 text-green-600' :
                    book.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                    book.status === 'sold' ? 'bg-gray-100 text-gray-500' :
                    // Special possession
                    book.status === 'lent' ? 'bg-blue-100 text-blue-700' :
                    book.status === 'borrowed' ? 'bg-purple-100 text-purple-700' :
                    book.status === 'double' ? 'bg-orange-100 text-orange-700' :
                    // Acquisition
                    book.status === 'ordered' ? 'bg-cyan-100 text-cyan-700' :
                    // No longer in possession
                    book.status === 'lost' ? 'bg-red-100 text-red-700' :
                    book.status === 'donated' ? 'bg-pink-100 text-pink-700' :
                    book.status === 'destroyed' ? 'bg-red-200 text-red-800' :
                    book.status === 'unknown' ? 'bg-gray-200 text-gray-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {book.status === 'in_collection' ? 'In Col.' : 
                     book.status === 'on_sale' ? 'On Sale' :
                     book.status === 'to_sell' ? 'To Sell' :
                     book.status === 'reserved' ? 'Reserved' :
                     book.status === 'sold' ? 'Sold' :
                     book.status === 'lent' ? 'Lent' :
                     book.status === 'borrowed' ? 'Borrowed' :
                     book.status === 'double' ? 'Double' :
                     book.status === 'ordered' ? 'Ordered' :
                     book.status === 'lost' ? 'Lost' :
                     book.status === 'donated' ? 'Donated' :
                     book.status === 'destroyed' ? 'Destroyed' :
                     book.status === 'unknown' ? 'Unknown' :
                     book.status}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {books.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className={`group bg-card border border-border hover:border-foreground/20 transition-colors relative ${
                selectionMode && selectedIds.has(book.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Checkbox overlay */}
              {selectionMode && (
                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(book.id)}
                    onChange={() => toggleSelect(book.id)}
                    className="w-4 h-4 rounded border-border cursor-pointer bg-background"
                  />
                </div>
              )}
              
              <Link href={`/books/${book.id}`}>
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
            </div>
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

      {/* Bulk Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-background border border-border shadow-lg p-6 w-full max-w-md mx-4">
            <button
              onClick={() => !deleting && setShowDeleteModal(false)}
              disabled={deleting}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete {selectedCount} {selectedCount === 1 ? 'Book' : 'Books'}</h3>
            </div>

            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800">
              <p className="text-sm font-semibold mb-1">
                ⚠️ You are about to permanently delete {selectedCount} {selectedCount === 1 ? 'book' : 'books'}!
              </p>
              <p className="text-sm">
                This action <strong>cannot be undone</strong>. All data associated with {selectedCount === 1 ? 'this book' : 'these books'} will be permanently removed.
              </p>
            </div>

            {/* Show list of books to delete (max 5) */}
            <div className="mb-4 text-sm">
              <p className="text-muted-foreground mb-2">Books to delete:</p>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {books
                  .filter(b => selectedIds.has(b.id))
                  .slice(0, 5)
                  .map(book => (
                    <li key={book.id} className="truncate text-muted-foreground">
                      • {book.title}
                    </li>
                  ))
                }
                {selectedCount > 5 && (
                  <li className="text-muted-foreground italic">
                    ... and {selectedCount - 5} more
                  </li>
                )}
              </ul>
            </div>

            <p className="text-sm mb-2">
              Type <strong className="font-mono bg-muted px-1">{confirmTextExpected}</strong> to confirm:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type '${confirmTextExpected}' to confirm`}
              disabled={deleting}
              className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 mb-4 disabled:opacity-50"
              autoFocus
            />

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setConfirmText('')
                  setDeleteError(null)
                  exitSelectionMode()
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={!isConfirmValid || deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedCount} {selectedCount === 1 ? 'Book' : 'Books'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
