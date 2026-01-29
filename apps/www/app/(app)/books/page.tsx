import { createClient } from '@/lib/supabase/server'
import { BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Book } from '@/lib/supabase/database.types'

export default async function BooksPage() {
  const supabase = await createClient()
  
  // Fetch books for the logged in user
  const { data: books } = await supabase
    .from('books')
    .select('id, title, year_published, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const bookList = (books ?? []) as Pick<Book, 'id' | 'title' | 'year_published' | 'created_at'>[]
  const bookCount = bookList.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Collection</h1>
          <p className="text-muted-foreground">
            {bookCount === 0 
              ? "You haven't added any books yet"
              : `${bookCount} ${bookCount === 1 ? 'book' : 'books'} in your collection`
            }
          </p>
        </div>
        <Button asChild>
          <Link href="/books/add" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Book
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {bookCount === 0 && (
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

      {/* Books grid */}
      {bookCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookList.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-card border border-border hover:border-foreground/20 transition-colors"
            >
              {/* Book cover placeholder */}
              <div className="aspect-[2/3] bg-muted flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/50" />
              </div>
              
              {/* Book info */}
              <div className="p-4">
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {book.title}
                </h3>
                {book.year_published && (
                  <p className="text-xs text-muted-foreground">{book.year_published}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
