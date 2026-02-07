import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, ChevronLeft, ChevronRight, ExternalLink as ExternalLinkIcon, ScanBarcode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteBookButton from '@/components/delete-book-button'
import MoveToLibraryButton from '@/components/move-to-library-button'
import CollectionChips from '@/components/collection-chips'

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

  // Fetch user profile for date format preference
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase
    .from('user_profiles')
    .select('date_format')
    .eq('id', user.id)
    .single() : { data: null }

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

  const { data: dustJacketCondition } = bookRecord.dust_jacket_condition_id
    ? await supabase.from('conditions').select('name').eq('id', bookRecord.dust_jacket_condition_id).single()
    : { data: null }

  const { data: binding } = bookRecord.binding_id
    ? await supabase.from('bindings').select('name').eq('id', bookRecord.binding_id).single()
    : { data: null }

  const { data: bookFormat } = bookRecord.format_id
    ? await supabase.from('book_formats').select('name, abbreviation').eq('id', bookRecord.format_id).single()
    : { data: null }

  // Fetch BISAC codes
  const bisacCodes = [bookRecord.bisac_code, bookRecord.bisac_code_2, bookRecord.bisac_code_3].filter(Boolean)
  const { data: bisacData } = bisacCodes.length > 0
    ? await supabase.from('bisac_codes').select('code, subject').in('code', bisacCodes)
    : { data: [] }

  // Fetch external links with their type info
  const { data: externalLinks } = await supabase
    .from('book_external_links')
    .select('id, url, label, sort_order, link_type_id, link_type:external_link_types ( label, domain, category )')
    .eq('book_id', id)
    .order('sort_order')

  // Fetch book's collection memberships, ALL user collections, and tags
  const [{ data: bookCollections }, { data: allCollections }, { data: bookTags }] = await Promise.all([
    supabase
      .from('book_collections')
      .select('collection_id')
      .eq('book_id', id),
    supabase
      .from('collections')
      .select('id, name, is_default')
      .order('sort_order', { ascending: true }),
    supabase
      .from('book_tags')
      .select('tag_id, tags ( id, name, color )')
      .eq('book_id', id)
  ])

  const bookCollectionIds = new Set((bookCollections || []).map((bc: any) => bc.collection_id))
  const libraryCollection = (allCollections || []).find((c: any) => c.name === 'Library' && c.is_default)
  const wishlistCollection = (allCollections || []).find((c: any) => c.name === 'Wishlist' && c.is_default)
  const isInWishlist = wishlistCollection ? bookCollectionIds.has(wishlistCollection.id) : false
  const isInLibrary = libraryCollection ? bookCollectionIds.has(libraryCollection.id) : false
  const showMoveToLibrary = isInWishlist && !isInLibrary && !!libraryCollection && !!wishlistCollection

  // All collections with membership status (for toggleable chips)
  const collectionsForChips = (allCollections || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    isMember: bookCollectionIds.has(c.id),
  }))

  // Tags for display
  const tags = (bookTags || []).map((bt: any) => bt.tags).filter(Boolean) as { id: string; name: string; color: string }[]

  // Combine all data
  const bookData = {
    ...bookRecord,
    language,
    original_language: originalLanguage,
    condition,
    dust_jacket_condition: dustJacketCondition,
    binding,
    bookFormat,
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

  // Format date based on user preference
  const dateFormat = profile?.date_format || 'DD/MM/YYYY'
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    switch (dateFormat) {
      case 'MM/DD/YYYY': return `${mm}/${dd}/${yyyy}`
      case 'YYYY-MM-DD': return `${yyyy}-${mm}-${dd}`
      case 'DD.MM.YYYY': return `${dd}.${mm}.${yyyy}`
      case 'DD/MM/YYYY':
      default: return `${dd}/${mm}/${yyyy}`
    }
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

  // Format cover type from snake_case to readable
  const formatCoverType = (coverType: string | null) => {
    if (!coverType) return null
    const coverTypeMap: Record<string, string> = {
      'softcover': 'Softcover',
      'softcover_dj': 'Softcover with dust jacket',
      'hardcover': 'Hardcover',
      'hardcover_dj': 'Hardcover with dust jacket',
      'full_leather_hardcover': 'Full leather hardcover',
      'full_leather_softcover': 'Full leather softcover',
      'full_calf_hardcover': 'Full calf hardcover',
      'full_calf_softcover': 'Full calf softcover',
      'full_vellum_hardcover': 'Full vellum hardcover',
      'full_vellum_softcover': 'Full vellum softcover',
      'full_morocco_hardcover': 'Full morocco hardcover',
      'full_morocco_softcover': 'Full morocco softcover',
      'full_faux_leather_hardcover': 'Full faux leather hardcover',
      'full_faux_leather_softcover': 'Full faux leather softcover',
      'full_cloth_hardcover': 'Full cloth hardcover',
      'full_cloth_softcover': 'Full cloth softcover',
      'full_buckram_hardcover': 'Full buckram hardcover',
      'full_buckram_softcover': 'Full buckram softcover',
      'full_linen_hardcover': 'Full linen hardcover',
      'full_linen_softcover': 'Full linen softcover',
      'full_silk_hardcover': 'Full silk hardcover',
      'full_silk_softcover': 'Full silk softcover',
      'full_canvas_hardcover': 'Full canvas hardcover',
      'full_canvas_softcover': 'Full canvas softcover',
      'full_moire_hardcover': 'Full moiré hardcover',
      'full_moire_softcover': 'Full moiré softcover',
      'quarter_leather_paper': 'Quarter binding (leather-paper)',
      'quarter_leather_cloth': 'Quarter binding (leather-cloth)',
      'quarter_faux_leather_paper': 'Quarter binding (faux leather-paper)',
      'quarter_faux_leather_cloth': 'Quarter binding (faux leather-cloth)',
      'quarter_cloth_paper': 'Quarter binding (cloth-paper)',
      'half_leather_paper': 'Half binding (leather-paper)',
      'half_leather_cloth': 'Half binding (leather-cloth)',
      'half_faux_leather_paper': 'Half binding (faux leather-paper)',
      'half_faux_leather_cloth': 'Half binding (faux leather-cloth)',
      'half_cloth_paper': 'Half binding (cloth-paper)',
      'three_quarter_leather_paper': 'Three quarter binding (leather-paper)',
      'three_quarter_leather_cloth': 'Three quarter binding (leather-cloth)',
      'three_quarter_faux_leather_paper': 'Three quarter binding (faux leather-paper)',
      'three_quarter_faux_leather_cloth': 'Three quarter binding (faux leather-cloth)',
      'three_quarter_cloth_paper': 'Three quarter binding (cloth-paper)',
      'cardboard_covers': 'Cardboard covers',
      'paper_boards': 'Paper boards',
      'library_binding': 'Library binding',
      'original_wraps': 'Original wraps',
      'printed_wrappers': 'Printed wrappers',
      'stiff_wraps': 'Stiff wraps',
      'limp_leather': 'Limp leather',
      'limp_vellum': 'Limp vellum',
    }
    return coverTypeMap[coverType] || coverType
  }

  // Format protective enclosure
  const formatProtectiveEnclosure = (enclosure: string | null) => {
    if (!enclosure || enclosure === 'none') return null
    const enclosureMap: Record<string, string> = {
      'slipcase_publisher': "Slipcase (publisher's)",
      'slipcase_custom': 'Slipcase (custom)',
      'clamshell_box': 'Clamshell box',
      'chemise': 'Chemise',
      'solander_box': 'Solander box',
    }
    return enclosureMap[enclosure] || enclosure
  }

  // Format paper type
  const formatPaperType = (paperType: string | null) => {
    if (!paperType) return null
    const paperTypeMap: Record<string, string> = {
      'wove': 'Wove paper', 'laid': 'Laid paper', 'rag': 'Rag paper', 'wood_pulp': 'Wood pulp paper',
      'acid_free': 'Acid-free paper', 'vellum': 'Vellum', 'parchment': 'Parchment', 'japan': 'Japan paper',
      'india': 'India paper', 'handmade': 'Handmade paper', 'machine_made': 'Machine-made paper',
      'coated': 'Coated paper', 'uncoated': 'Uncoated paper', 'calendered': 'Calendered paper',
      'rice': 'Rice paper', 'tapa': 'Tapa/bark cloth',
    }
    return paperTypeMap[paperType] || paperType
  }

  // Format edge treatment
  const formatEdgeTreatment = (edge: string | null) => {
    if (!edge) return null
    const edgeMap: Record<string, string> = {
      'untrimmed': 'Untrimmed', 'uncut': 'Uncut', 'rough_cut': 'Rough cut', 'trimmed': 'Trimmed',
      'gilt_all': 'Gilt (all edges)', 'gilt_top': 'Gilt (top edge only)', 'gilt_fore': 'Gilt (fore-edge)',
      'silver': 'Silver edges', 'gauffered': 'Gauffered', 'painted': 'Painted edges',
      'fore_edge_painting': 'Fore-edge painting', 'sprinkled': 'Sprinkled', 'stained': 'Stained',
      'marbled': 'Marbled edges', 'deckle': 'Deckle edges', 'red_edges': 'Red stained',
      'blue_edges': 'Blue stained', 'yellow_edges': 'Yellow stained',
    }
    return edgeMap[edge] || edge
  }

  // Format endpapers type
  const formatEndpapersType = (endpapers: string | null) => {
    if (!endpapers || endpapers === 'none') return null
    const endpapersMap: Record<string, string> = {
      'plain_white': 'Plain white', 'plain_colored': 'Plain colored', 'marbled': 'Marbled',
      'combed_marbled': 'Combed marbled', 'paste_paper': 'Paste paper', 'printed': 'Printed',
      'illustrated': 'Illustrated', 'maps': 'Maps', 'photographic': 'Photographic',
      'decorative': 'Decorative pattern', 'self_ends': 'Self-ends', 'cloth': 'Cloth',
      'leather': 'Leather doublures', 'silk': 'Silk', 'vellum': 'Vellum',
    }
    return endpapersMap[endpapers] || endpapers
  }

  // Format text block condition
  const formatTextBlockCondition = (condition: string | null) => {
    if (!condition) return null
    const conditionMap: Record<string, string> = {
      'tight': 'Tight', 'solid': 'Solid', 'sound': 'Sound', 'tender': 'Tender',
      'shaken': 'Shaken', 'loose': 'Loose', 'detached': 'Detached', 'broken': 'Broken',
      'recased': 'Recased', 'rebacked': 'Rebacked', 'rebound': 'Rebound',
    }
    return conditionMap[condition] || condition
  }

  // Status display helper
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'draft': { label: 'Draft', className: 'bg-red-100 text-red-700' },
      'in_collection': { label: 'In Collection', className: 'bg-gray-100 text-gray-600' },
      'on_sale': { label: 'On Sale', className: 'bg-red-600 text-white' },
      'to_sell': { label: 'To Sell', className: 'bg-red-100 text-red-700' },
      'reserved': { label: 'Reserved', className: 'border border-red-600 text-red-600' },
      'sold': { label: 'Sold', className: 'bg-gray-100 text-gray-500' },
      'lent': { label: 'Lent', className: 'border border-black text-black' },
      'borrowed': { label: 'Borrowed', className: 'border border-black text-black' },
      'double': { label: 'Double', className: 'bg-gray-100 text-gray-600' },
      'ordered': { label: 'Ordered', className: 'bg-gray-100 text-gray-600' },
      'lost': { label: 'Lost', className: 'bg-black text-white' },
      'donated': { label: 'Donated', className: 'bg-gray-100 text-gray-500' },
      'destroyed': { label: 'Destroyed', className: 'bg-black text-white' },
      'unknown': { label: 'Unknown', className: 'bg-gray-200 text-gray-600' },
    }
    return statusMap[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  }

  const statusDisplay = getStatusDisplay(bookData.status)

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

          {/* Collection membership chips (toggleable) */}
          {collectionsForChips.length > 0 && (
            <CollectionChips bookId={id} collections={collectionsForChips} />
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {tags.map(tag => (
                <Link
                  key={tag.id}
                  href={`/books?tag=${tag.id}`}
                  className="text-xs px-2 py-0.5 text-white hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: tag.color || '#6b7280' }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showMoveToLibrary && (
            <MoveToLibraryButton
              bookId={id}
              libraryCollectionId={libraryCollection!.id}
              wishlistCollectionId={wishlistCollection!.id}
            />
          )}
          <Button variant="outline" asChild>
            <Link href="/books/lookup" className="gap-2">
              <ScanBarcode className="w-4 h-4" />
              Lookup
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/books/${id}/edit`} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </Button>
          <DeleteBookButton bookId={id} bookTitle={bookData.title} />
        </div>
      </div>

      {/* Main content grid */}
      <div className="space-y-8">
        
        {/* 1. Title & Series - only show if series exists */}
        {(bookData.original_title || bookData.series) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Title & Series</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Original Title" value={bookData.original_title} className="col-span-2" />
              <Field label="Series" value={bookData.series} />
              <Field label="Series Number" value={bookData.series_number} />
            </dl>
          </section>
        )}

        {/* 2. Language */}
        {(bookData.language?.name_en || bookData.original_language?.name_en) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Language</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Language" value={bookData.language?.name_en} />
              <Field label="Original Language" value={bookData.original_language?.name_en} />
            </dl>
          </section>
        )}

        {/* 3. Publication */}
        {(bookData.publisher_name || bookData.publication_place || bookData.publication_year || bookData.printer) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Publication</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Publisher" value={bookData.publisher_name} />
              <Field label="Place" value={bookData.publication_place} />
              <Field label="Year" value={bookData.publication_year} />
              <Field label="Printer" value={bookData.printer} />
              <Field label="Place Printed" value={bookData.printing_place} />
            </dl>
          </section>
        )}

        {/* 4. Edition */}
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

        {/* 5. Physical Description */}
        {(bookData.pagination_description || bookData.page_count || bookData.volumes || formatDimensions() || formatWeight() || bookData.cover_type || bookData.binding?.name || bookData.bookFormat || bookData.protective_enclosure || bookData.has_dust_jacket || bookData.is_signed) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Physical Description</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Pagination" value={bookData.pagination_description || bookData.pagination} className="col-span-2" />
              <Field label="Volumes" value={bookData.volumes} />
              <div /> {/* Empty cell */}
              <Field label="Dimensions" value={formatDimensions()} />
              <Field label="Weight" value={formatWeight()} />
              <div /> {/* Empty cell */}
              <div /> {/* Empty cell */}
              <Field label="Cover Type" value={formatCoverType(bookData.cover_type)} className="col-span-2" />
              <Field label="Binding" value={bookData.binding?.name} className="col-span-2" />
              <Field label="Book Format" value={bookData.bookFormat ? (bookData.bookFormat.abbreviation ? `${bookData.bookFormat.name} (${bookData.bookFormat.abbreviation})` : bookData.bookFormat.name) : null} className="col-span-2" />
              <Field label="Protective Enclosure" value={formatProtectiveEnclosure(bookData.protective_enclosure)} className="col-span-2" />
              <Field label="Paper Type" value={formatPaperType(bookData.paper_type)} />
              <Field label="Edge Treatment" value={formatEdgeTreatment(bookData.edge_treatment)} />
              <Field label="Endpapers" value={formatEndpapersType(bookData.endpapers_type)} />
              <Field label="Text Block" value={formatTextBlockCondition(bookData.text_block_condition)} />
              <Field label="Dust Jacket" value={bookData.has_dust_jacket ? 'Yes' : null} />
              <Field label="Signed" value={bookData.is_signed ? 'Yes' : null} />
            </dl>
          </section>
        )}

        {/* 6. Condition & Status */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Condition & Status</h2>
          <div className="flex gap-2 flex-wrap mb-4">
            <span className={`inline-block text-sm px-3 py-1 ${statusDisplay.className}`}>
              {statusDisplay.label}
            </span>
            {bookData.action_needed && bookData.action_needed !== 'none' && (
              <span className="inline-block text-sm px-3 py-1 bg-red-100 text-red-700">
                Action: {bookData.action_needed.charAt(0).toUpperCase() + bookData.action_needed.slice(1)}
              </span>
            )}
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Condition" value={bookData.condition?.name} />
            <Field label="Dust Jacket Condition" value={bookData.dust_jacket_condition?.name} />
            <Field label="Condition Notes" value={bookData.condition_notes} className="col-span-2" />
          </dl>
        </section>

        {/* 7. Identifiers */}
        {(bookData.isbn_13 || bookData.isbn_10 || bookData.oclc_number || bookData.lccn || bookData.user_catalog_id || bookData.ddc || bookData.lcc || bookData.udc || bookData.topic) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Identifiers</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="ISBN-13" value={bookData.isbn_13} />
              <Field label="ISBN-10" value={bookData.isbn_10} />
              <Field label="OCLC" value={bookData.oclc_number} />
              <Field label="LCCN" value={bookData.lccn} />
              <Field label="Catalog ID" value={bookData.user_catalog_id || bookData.collection_id} />
              <Field label="DDC" value={bookData.ddc} />
              <Field label="LCC" value={bookData.lcc} />
              <Field label="UDC" value={bookData.udc} />
              <Field label="Topic" value={bookData.topic} className="col-span-2" />
            </dl>
          </section>
        )}

        {/* 8. BISAC Subject Codes */}
        {bisacData && bisacData.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">BISAC Subject Codes</h2>
            <dl className="space-y-2">
              {bisacData.map((bisac: { code: string; subject: string }, index: number) => (
                <div key={bisac.code}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Tertiary'}
                  </dt>
                  <dd className="text-sm">
                    <span className="font-mono text-xs text-muted-foreground mr-2">{bisac.code}</span>
                    {bisac.subject}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 9. Storage */}
        {(bookData.storage_location || bookData.shelf || bookData.shelf_section) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Storage</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Location" value={bookData.storage_location} />
              <Field label="Shelf" value={bookData.shelf} />
              <Field label="Section" value={bookData.shelf_section} />
            </dl>
          </section>
        )}

        {/* 10. Acquisition */}
        {(bookData.acquired_from || bookData.purchase_source || bookData.acquired_date || bookData.acquired_price || bookData.purchase_price) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Acquisition</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Acquired From" value={bookData.acquired_from || bookData.purchase_source} />
              <Field label="Date" value={formatDate(bookData.acquired_date)} />
              <Field label="Price Paid" value={formatPrice(bookData.acquired_price || bookData.purchase_price, bookData.acquired_currency || bookData.purchase_currency)} />
              <Field label="Notes" value={bookData.acquired_notes} />
            </dl>
          </section>
        )}

        {/* 11. Valuation */}
        {(bookData.lowest_price || bookData.price_lowest || bookData.highest_price || bookData.price_highest || bookData.estimated_value || bookData.price_estimated || bookData.sales_price || bookData.price_sales) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Valuation</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Lowest Price" value={formatPrice(bookData.lowest_price || bookData.price_lowest, bookData.price_currency)} />
              <Field label="Highest Price" value={formatPrice(bookData.highest_price || bookData.price_highest, bookData.price_currency)} />
              <Field label="Estimated Value" value={formatPrice(bookData.estimated_value || bookData.price_estimated, bookData.price_currency)} />
              <Field label="Sales Price" value={formatPrice(bookData.sales_price || bookData.price_sales, bookData.price_currency)} />
              <Field label="Valuation Date" value={formatDate(bookData.valuation_date)} />
            </dl>
          </section>
        )}

        {/* 12. Notes */}
        {(bookData.summary || bookData.provenance || bookData.bibliography || bookData.illustrations || bookData.illustrations_description || bookData.signature_details || bookData.signatures_description || bookData.private_notes || bookData.internal_notes) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Notes</h2>
            <dl className="space-y-4">
              <Field label="Summary" value={bookData.summary} />
              <Field label="Provenance" value={bookData.provenance} />
              <Field label="Dedication / Inscription" value={bookData.dedication_text} />
              <Field label="Colophon" value={bookData.colophon_text} />
              <Field label="Bibliography" value={bookData.bibliography} />
              <Field label="Illustrations" value={bookData.illustrations || bookData.illustrations_description} />
              <Field label="Signatures" value={bookData.signature_details || bookData.signatures_description} />
              <Field label="Private Notes" value={bookData.private_notes || bookData.internal_notes} />
            </dl>
          </section>
        )}

        {/* 13. Catalog Entry */}
        {bookData.catalog_entry && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Catalog Entry</h2>
            <p className="text-sm whitespace-pre-wrap bg-muted p-4">{bookData.catalog_entry}</p>
          </section>
        )}

        {/* 14. External Links */}
        {externalLinks && externalLinks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">External Links</h2>
            <div className="space-y-1.5">
              {externalLinks.map((link: any) => {
                const domain = link.link_type?.domain || (() => { try { return new URL(link.url).hostname } catch { return null } })()
                const typeLabel = link.link_type?.label || link.label || domain || 'Link'
                const hasUrl = link.url && link.url.trim()
                return (
                  <div key={link.id} className="flex items-center gap-2.5">
                    {domain && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                        alt=""
                        width={16}
                        height={16}
                        className="flex-shrink-0"
                      />
                    )}
                    {hasUrl ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline flex items-center gap-1.5 min-w-0"
                      >
                        <span className="flex-shrink-0">{typeLabel}</span>
                        <span className="text-xs text-muted-foreground truncate">{link.url}</span>
                        <ExternalLinkIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{typeLabel} <span className="text-xs italic">(no URL)</span></span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Metadata */}
        <section className="text-xs text-muted-foreground pt-4 border-t">
          {bookData.created_at && <p>Created: {formatDate(bookData.created_at)}</p>}
          {bookData.updated_at && bookData.updated_at !== bookData.created_at && (
            <p>Last updated: {formatDate(bookData.updated_at)}</p>
          )}
        </section>

      </div>
    </div>
  )
}
