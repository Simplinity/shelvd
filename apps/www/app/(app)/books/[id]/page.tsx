import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch book with all related data
  const { data: book, error } = await supabase
    .from('books')
    .select(`
      *,
      language:languages!books_language_id_fkey ( name ),
      original_language:languages!books_original_language_id_fkey ( name ),
      condition:conditions ( name ),
      binding:bindings ( name ),
      book_contributors (
        contributor:contributors ( canonical_name ),
        role:contributor_roles ( name )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !book) {
    notFound()
  }

  // Group contributors by role
  const contributorsByRole: Record<string, string[]> = {}
  for (const bc of book.book_contributors || []) {
    const role = (bc.role as any)?.name || 'Contributor'
    const name = (bc.contributor as any)?.canonical_name || 'Unknown'
    if (!contributorsByRole[role]) {
      contributorsByRole[role] = []
    }
    contributorsByRole[role].push(name)
  }

  // Helper to render a field
  const Field = ({ label, value, className = '' }: { label: string; value: any; className?: string }) => {
    if (value === null || value === undefined || value === '') return null
    return (
      <div className={className}>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</dt>
        <dd className="text-sm">{value}</dd>
      </div>
    )
  }

  // Format currency
  const formatPrice = (amount: number | null, currency: string | null) => {
    if (!amount) return null
    return `${currency || 'EUR'} ${amount.toFixed(2)}`
  }

  // Format dimensions
  const formatDimensions = () => {
    const parts = []
    if (book.height_mm) parts.push(`${book.height_mm}mm H`)
    else if (book.height_cm) parts.push(`${book.height_cm}cm H`)
    if (book.width_mm) parts.push(`${book.width_mm}mm W`)
    else if (book.width_cm) parts.push(`${book.width_cm}cm W`)
    if (book.depth_mm) parts.push(`${book.depth_mm}mm D`)
    return parts.length > 0 ? parts.join(' × ') : null
  }

  const formatWeight = () => {
    if (book.weight_grams) return `${book.weight_grams}g`
    if (book.weight_g) return `${book.weight_g}g`
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link 
        href="/books" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to collection
      </Link>

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{book.title}</h1>
          {book.subtitle && (
            <p className="text-xl text-muted-foreground mb-4">{book.subtitle}</p>
          )}
          
          {/* Contributors */}
          {Object.keys(contributorsByRole).length > 0 && (
            <div className="space-y-1">
              {Object.entries(contributorsByRole).map(([role, names]) => (
                <p key={role} className="text-sm">
                  <span className="text-muted-foreground">{role}: </span>
                  <span>{names.join(', ')}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" asChild>
          <Link href={`/books/${id}/edit`} className="gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Status badge */}
      <div className="mb-8">
        <span className={`inline-block text-sm px-3 py-1 ${
          book.status === 'for_sale' ? 'bg-green-100 text-green-700' :
          book.status === 'sold' ? 'bg-gray-100 text-gray-500' :
          book.status === 'lost' ? 'bg-red-100 text-red-700' :
          'bg-muted text-muted-foreground'
        }`}>
          {book.status === 'in_collection' ? 'In Collection' : 
           book.status === 'for_sale' ? 'For Sale' :
           book.status === 'sold' ? 'Sold' :
           book.status === 'lost' ? 'Lost' : book.status}
        </span>
      </div>

      {/* Main content grid */}
      <div className="space-y-8">
        
        {/* Publication */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Publication</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Publisher" value={book.publisher_name} />
            <Field label="Place" value={book.publication_place} />
            <Field label="Year" value={book.publication_year} />
            <Field label="Language" value={(book.language as any)?.name} />
            <Field label="Original Title" value={book.original_title} />
            <Field label="Original Language" value={(book.original_language as any)?.name} />
            <Field label="Series" value={book.series} />
            <Field label="Series Number" value={book.series_number} />
          </dl>
        </section>

        {/* Edition */}
        {(book.edition || book.impression || book.issue_state || book.edition_notes) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Edition</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Edition" value={book.edition} />
              <Field label="Impression" value={book.impression} />
              <Field label="Issue State" value={book.issue_state} className="col-span-2" />
              <Field label="Edition Notes" value={book.edition_notes} className="col-span-2 md:col-span-4" />
            </dl>
          </section>
        )}

        {/* Physical Description */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Physical Description</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Pages" value={book.page_count} />
            <Field label="Volumes" value={book.volumes} />
            <Field label="Dimensions" value={formatDimensions()} />
            <Field label="Weight" value={formatWeight()} />
            <Field label="Cover Type" value={book.cover_type} />
            <Field label="Binding" value={(book.binding as any)?.name} />
            <Field label="Dust Jacket" value={book.has_dust_jacket ? 'Yes' : null} />
            <Field label="Signed" value={book.is_signed ? 'Yes' : null} />
            <Field label="Pagination" value={book.pagination_description || book.pagination} />
          </dl>
        </section>

        {/* Condition */}
        {((book.condition as any)?.name || book.condition_notes) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Condition</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Condition" value={(book.condition as any)?.name} />
              <Field label="Condition Notes" value={book.condition_notes} className="col-span-2 md:col-span-3" />
            </dl>
          </section>
        )}

        {/* Identifiers */}
        {(book.isbn_13 || book.isbn_10 || book.oclc_number || book.lccn || book.user_catalog_id) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Identifiers</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="ISBN-13" value={book.isbn_13} />
              <Field label="ISBN-10" value={book.isbn_10} />
              <Field label="OCLC" value={book.oclc_number} />
              <Field label="LCCN" value={book.lccn} />
              <Field label="Catalog ID" value={book.user_catalog_id || book.collection_id} />
            </dl>
          </section>
        )}

        {/* Storage */}
        {(book.storage_location || book.shelf || book.shelf_section) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Storage Location</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Location" value={book.storage_location} />
              <Field label="Shelf" value={book.shelf} />
              <Field label="Section" value={book.shelf_section} />
            </dl>
          </section>
        )}

        {/* Acquisition */}
        {(book.acquired_from || book.purchase_source || book.acquired_date || book.acquired_price || book.purchase_price) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Acquisition</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Acquired From" value={book.acquired_from || book.purchase_source} />
              <Field label="Date" value={book.acquired_date} />
              <Field label="Price Paid" value={formatPrice(book.acquired_price || book.purchase_price, book.acquired_currency || book.purchase_currency)} />
              <Field label="Notes" value={book.acquired_notes} />
            </dl>
          </section>
        )}

        {/* Valuation */}
        {(book.lowest_price || book.price_lowest || book.highest_price || book.price_highest || book.estimated_value || book.price_estimated || book.sales_price || book.price_sales) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Valuation</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Lowest Price" value={formatPrice(book.lowest_price || book.price_lowest, book.price_currency)} />
              <Field label="Highest Price" value={formatPrice(book.highest_price || book.price_highest, book.price_currency)} />
              <Field label="Estimated Value" value={formatPrice(book.estimated_value || book.price_estimated, book.price_currency)} />
              <Field label="Sales Price" value={formatPrice(book.sales_price || book.price_sales, book.price_currency)} />
            </dl>
          </section>
        )}

        {/* Notes & Description */}
        {(book.summary || book.provenance || book.bibliography || book.illustrations || book.illustrations_description || book.signature_details || book.signatures_description || book.private_notes || book.internal_notes) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Notes & Description</h2>
            <dl className="space-y-4">
              <Field label="Summary" value={book.summary} />
              <Field label="Provenance" value={book.provenance} />
              <Field label="Bibliography" value={book.bibliography} />
              <Field label="Illustrations" value={book.illustrations || book.illustrations_description} />
              <Field label="Signatures" value={book.signature_details || book.signatures_description} />
              <Field label="Private Notes" value={book.private_notes || book.internal_notes} />
            </dl>
          </section>
        )}

        {/* Catalog Entry */}
        {book.catalog_entry && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Catalog Entry</h2>
            <p className="text-sm whitespace-pre-wrap bg-muted p-4">{book.catalog_entry}</p>
          </section>
        )}

        {/* Metadata */}
        <section className="text-xs text-muted-foreground pt-4 border-t">
          <p>Created: {new Date(book.created_at).toLocaleDateString()}</p>
          <p>Last updated: {new Date(book.updated_at).toLocaleDateString()}</p>
        </section>

      </div>
    </div>
  )
}
