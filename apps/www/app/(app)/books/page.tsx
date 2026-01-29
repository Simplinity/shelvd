import { createClient } from '@/lib/supabase/server'
import { BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function BooksPage() {
  const supabase = await createClient()
  
  // Haal boeken op voor de ingelogde user
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const bookCount = books?.length ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-h1 font-bold mb-2">Mijn Collectie</h1>
          <p className="text-gray-600">
            {bookCount === 0 
              ? 'Je hebt nog geen boeken toegevoegd'
              : `${bookCount} ${bookCount === 1 ? 'boek' : 'boeken'} in je collectie`
            }
          </p>
        </div>
        <Link
          href="/books/add"
          className="inline-flex items-center gap-2 px-6 py-3 bg-swiss-red text-white font-semibold text-small uppercase tracking-wide hover:bg-swiss-red-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Boek toevoegen
        </Link>
      </div>

      {/* Empty state */}
      {bookCount === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-h3 font-bold mb-2">Geen boeken</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Begin met het opbouwen van je collectie door je eerste boek toe te voegen.
          </p>
          <Link
            href="/books/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold text-small uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Voeg je eerste boek toe
          </Link>
        </div>
      )}

      {/* Books grid */}
      {bookCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books?.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-white border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {/* Book cover placeholder */}
              <div className="aspect-[2/3] bg-gray-100 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-gray-300" />
              </div>
              
              {/* Book info */}
              <div className="p-4">
                <h3 className="font-semibold text-body mb-1 group-hover:text-swiss-red transition-colors line-clamp-2">
                  {book.title}
                </h3>
                {book.year_published && (
                  <p className="text-tiny text-gray-500">{book.year_published}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
