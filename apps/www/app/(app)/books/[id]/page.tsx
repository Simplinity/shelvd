import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch book data
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !book) {
    console.error('Book fetch error:', error)
    notFound()
  }

  // Cast to any to avoid TypeScript issues with dynamic data
  const bookRecord = book as any

  // Fetch previous and next books (alphabetically by title)
  const [{ data: prevBook }, { data: nextBook }] = await Promise.all([
    supabase
      .from('books')
      .select('id, title')
      .lt('title', bookRecord.title)
      .order('title', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('books')
      .select('id, title')
      .gt('title', bookRecord.title)
      .order('title', { ascending: true })
      .limit(1)
      .single()
  ])

  // Fetch contributors separately
  const { data: bookContributors } = await supabase
    .from('book_contributors')
    .select(`
      contributor:contributors ( canonical_name ),
      role:contributor_roles ( name )
    `)
    .eq('book_id', id)

  // Fetch related data
  const { data: language } = bookRecord.language_id 
    ? await supabase.from('languages').select('name_en').eq('id', bookRecord.language_id).single()
    : { data: null }
  
  const { data: originalLanguage } = bookRecord.original_language_id
    ? await supabase.from('languages').select('name_en').eq('id', bookRecord.original_language_id).single()
    : { data: null }

  const { data: condition } = bookRecord.condition_id
    ? await supabase.from('conditions').select('name').eq('id', bookRecord.condition_id).single()
    : { data: null }

  const { data: binding } = bookRecord.binding_id
    ? await supabase.from('bindings').select('name').eq('id', bookRecord.binding_id).single()
    : { data: null }

  // Combine all data
  const bookData = {
    ...bookRecord,
    language,
    original_language: originalLanguage,
    condition,
    binding,
    book_contributors: bookContributors || []
  }

  // Group contributors by role
  const contributorsByRole: Record<string, string[]> = {}
  for (const bc of bookData.book_contributors || []) {
    const role = bc.role?.name || 'Contributor'
    const name = bc.contributor?.canonical_name || 'Unknown'
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
    if (bookData.height_mm) parts.push(`${bookData.height_mm}mm H`)
    else if (bookData.height_cm) parts.push(`${bookData.height_cm}cm H`)
    if (bookData.width_mm) parts.push(`${bookData.width_mm}mm W`)
    else if (bookData.width_cm) parts.push(`${bookData.width_cm}cm W`)
    if (bookData.depth_mm) parts.push(`${bookData.depth_mm}mm D`)
    return parts.length > 0 ? parts.join(' × ') : null
  }

  const formatWeight = () => {
    if (bookData.weight_grams) return `${bookData.weight_grams}g`
    if (bookData.weight_g) return `${bookData.weight_g}g`
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Navigation bar */}
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/books" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to collection
        </Link>

        {/* Prev/Next navigation */}
        <div className="flex items-center gap-2">
          {prevBook ? (
            <Link 
              href={`/books/${prevBook.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
              title={prevBook.title}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border text-muted-foreground/50 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </span>
          )}
          
          {nextBook ? (
            <Link 
              href={`/books/${nextBook.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors"
              title={nextBook.title}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border text-muted-foreground/50 cursor-not-allowed">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{bookData.title}</h1>
          {bookData.subtitle && (
            <p className="text-xl text-muted-foreground mb-4">{bookData.subtitle}</p>
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
          bookData.status === 'for_sale' ? 'bg-green-100 text-green-700' :
          bookData.status === 'sold' ? 'bg-gray-100 text-gray-500' :
          bookData.status === 'lost' ? 'bg-red-100 text-red-700' :
          'bg-muted text-muted-foreground'
        }`}>
          {bookData.status === 'in_collection' ? 'In Collection' : 
           bookData.status === 'for_sale' ? 'For Sale' :
           bookData.status === 'sold' ? 'Sold' :
           bookData.status === 'lost' ? 'Lost' : bookData.status}
        </span>
      </div>

      {/* Main content grid */}
      <div className="space-y-8">
        
        {/* Publication */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Publication</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Publisher" value={bookData.publisher_name} />
            <Field label="Place" value={bookData.publication_place} />
            <Field label="Year" value={bookData.publication_year} />
            <Field label="Language" value={bookData.language?.name_en} />
            <Field label="Original Title" value={bookData.original_title} />
            <Field label="Original Language" value={bookData.original_language?.name_en} />
            <Field label="Series" value={bookData.series} />
            <Field label="Series Number" value={bookData.series_number} />
          </dl>
        </section>

        {/* Edition */}
        {(bookData.edition || bookData.impression || bookData.issue_state || bookData.edition_notes) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Edition</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Edition" value={bookData.edition} />
              <Field label="Impression" value={bookData.impression} />
              <Field label="Issue State" value={bookData.issue_state} className="col-span-2" />
              <Field label="Edition Notes" value={bookData.edition_notes} className="col-span-2 md:col-span-4" />
            </dl>
          </section>
        )}

        {/* Physical Description */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Physical Description</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Pages" value={bookData.page_count} />
            <Field label="Volumes" value={bookData.volumes} />
            <Field label="Dimensions" value={formatDimensions()} />
            <Field label="Weight" value={formatWeight()} />
            <Field label="Cover Type" value={bookData.cover_type} />
            <Field label="Binding" value={bookData.binding?.name} />
            <Field label="Dust Jacket" value={bookData.has_dust_jacket ? 'Yes' : null} />
            <Field label="Signed" value={bookData.is_signed ? 'Yes' : null} />
            <Field label="Pagination" value={bookData.pagination_description || bookData.pagination} />
          </dl>
        </section>

        {/* Condition */}
        {(bookData.condition?.name || bookData.condition_notes) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Condition</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Condition" value={bookData.condition?.name} />
              <Field label="Condition Notes" value={bookData.condition_notes} className="col-span-2 md:col-span-3" />
            </dl>
          </section>
        )}

        {/* Identifiers */}
        {(bookData.isbn_13 || bookData.isbn_10 || bookData.oclc_number || bookData.lccn || bookData.user_catalog_id) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Identifiers</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="ISBN-13" value={bookData.isbn_13} />
              <Field label="ISBN-10" value={bookData.isbn_10} />
              <Field label="OCLC" value={bookData.oclc_number} />
              <Field label="LCCN" value={bookData.lccn} />
              <Field label="Catalog ID" value={bookData.user_catalog_id || bookData.collection_id} />
            </dl>
          </section>
        )}

        {/* Storage */}
        {(bookData.storage_location || bookData.shelf || bookData.shelf_section) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Storage Location</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Location" value={bookData.storage_location} />
              <Field label="Shelf" value={bookData.shelf} />
              <Field label="Section" value={bookData.shelf_section} />
            </dl>
          </section>
        )}

        {/* Acquisition */}
        {(bookData.acquired_from || bookData.purchase_source || bookData.acquired_date || bookData.acquired_price || bookData.purchase_price) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Acquisition</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Acquired From" value={bookData.acquired_from || bookData.purchase_source} />
              <Field label="Date" value={bookData.acquired_date} />
              <Field label="Price Paid" value={formatPrice(bookData.acquired_price || bookData.purchase_price, bookData.acquired_currency || bookData.purchase_currency)} />
              <Field label="Notes" value={bookData.acquired_notes} />
            </dl>
          </section>
        )}

        {/* Valuation */}
        {(bookData.lowest_price || bookData.price_lowest || bookData.highest_price || bookData.price_highest || bookData.estimated_value || bookData.price_estimated || bookData.sales_price || bookData.price_sales) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Valuation</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Lowest Price" value={formatPrice(bookData.lowest_price || bookData.price_lowest, bookData.price_currency)} />
              <Field label="Highest Price" value={formatPrice(bookData.highest_price || bookData.price_highest, bookData.price_currency)} />
              <Field label="Estimated Value" value={formatPrice(bookData.estimated_value || bookData.price_estimated, bookData.price_currency)} />
              <Field label="Sales Price" value={formatPrice(bookData.sales_price || bookData.price_sales, bookData.price_currency)} />
            </dl>
          </section>
        )}

        {/* Notes & Description */}
        {(bookData.summary || bookData.provenance || bookData.bibliography || bookData.illustrations || bookData.illustrations_description || bookData.signature_details || bookData.signatures_description || bookData.private_notes || bookData.internal_notes) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Notes & Description</h2>
            <dl className="space-y-4">
              <Field label="Summary" value={bookData.summary} />
              <Field label="Provenance" value={bookData.provenance} />
              <Field label="Bibliography" value={bookData.bibliography} />
              <Field label="Illustrations" value={bookData.illustrations || bookData.illustrations_description} />
              <Field label="Signatures" value={bookData.signature_details || bookData.signatures_description} />
              <Field label="Private Notes" value={bookData.private_notes || bookData.internal_notes} />
            </dl>
          </section>
        )}

        {/* Catalog Entry */}
        {bookData.catalog_entry && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Catalog Entry</h2>
            <p className="text-sm whitespace-pre-wrap bg-muted p-4">{bookData.catalog_entry}</p>
          </section>
        )}

        {/* Metadata */}
        <section className="text-xs text-muted-foreground pt-4 border-t">
          <p>Created: {new Date(bookData.created_at).toLocaleDateString()}</p>
          <p>Last updated: {new Date(bookData.updated_at).toLocaleDateString()}</p>
        </section>

      </div>
    </div>
  )
}
