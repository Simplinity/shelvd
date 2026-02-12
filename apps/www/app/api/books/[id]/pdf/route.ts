import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCatalogCard } from '@/lib/pdf/catalog-card'
import { generateCatalogSheet } from '@/lib/pdf/catalog-sheet'
import { BookPdfData, PaperSize, PdfType } from '@/lib/pdf/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || 'catalog-sheet') as PdfType
  const paperSize = (searchParams.get('size') || 'a4') as PaperSize
  
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Fetch book
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }
  
  const b = book as any
  
  // Fetch related data in parallel
  const [
    { data: contributors },
    { data: language },
    { data: originalLanguage },
    { data: condition },
    { data: djCondition },
    { data: binding },
    { data: bookFormat },
    { data: bisacData },
    { data: externalLinks },
    { data: bookCollections },
    { data: bookTags },
    { data: provenanceData },
    { data: conditionHistoryData },
    { data: valuationData },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('book_contributors')
      .select('contributor:contributors ( canonical_name ), role:contributor_roles ( name )')
      .eq('book_id', id),
    b.language_id
      ? supabase.from('languages').select('name_en').eq('id', b.language_id).single()
      : Promise.resolve({ data: null }),
    b.original_language_id
      ? supabase.from('languages').select('name_en').eq('id', b.original_language_id).single()
      : Promise.resolve({ data: null }),
    b.condition_id
      ? supabase.from('conditions').select('name').eq('id', b.condition_id).single()
      : Promise.resolve({ data: null }),
    b.dust_jacket_condition_id
      ? supabase.from('conditions').select('name').eq('id', b.dust_jacket_condition_id).single()
      : Promise.resolve({ data: null }),
    b.binding_id
      ? supabase.from('bindings').select('name').eq('id', b.binding_id).single()
      : Promise.resolve({ data: null }),
    b.format_id
      ? supabase.from('book_formats').select('name, abbreviation').eq('id', b.format_id).single()
      : Promise.resolve({ data: null }),
    (() => {
      const codes = [b.bisac_code, b.bisac_code_2, b.bisac_code_3].filter(Boolean)
      return codes.length > 0
        ? supabase.from('bisac_codes').select('code, subject').in('code', codes)
        : Promise.resolve({ data: [] })
    })(),
    supabase
      .from('book_external_links')
      .select('url, label, link_type:external_link_types ( label )')
      .eq('book_id', id)
      .order('sort_order'),
    supabase
      .from('book_collections')
      .select('collection:collections ( name )')
      .eq('book_id', id),
    supabase
      .from('book_tags')
      .select('tag:tags ( name )')
      .eq('book_id', id),
    supabase
      .from('provenance_entries')
      .select('owner_name, owner_type, date_from, date_to, transaction_type, notes')
      .eq('book_id', id)
      .order('position'),
    supabase
      .from('condition_history')
      .select(`
        event_date, event_type, description, performed_by, cost, cost_currency, notes,
        before_condition:conditions!condition_history_before_condition_id_fkey ( name ),
        after_condition:conditions!condition_history_after_condition_id_fkey ( name )
      `)
      .eq('book_id', id)
      .order('position'),
    supabase
      .from('valuation_history')
      .select('value, currency, source')
      .eq('book_id', id)
      .order('position', { ascending: false }),
    supabase.from('user_profiles').select('full_name').eq('id', user.id).single(),
  ])
  
  // Build BookPdfData
  const pdfData: BookPdfData = {
    title: b.title || 'Untitled',
    subtitle: b.subtitle || undefined,
    original_title: b.original_title || undefined,
    series: b.series || undefined,
    series_number: b.series_number || undefined,
    
    contributors: (contributors || []).map((c: any) => ({
      name: c.contributor?.canonical_name || 'Unknown',
      role: c.role?.name || 'Contributor',
    })),
    
    language: language?.name_en || undefined,
    original_language: originalLanguage?.name_en || undefined,
    
    publisher: b.publisher_name || undefined,
    publication_place: b.publication_place || undefined,
    publication_year: b.publication_year || undefined,
    printer: b.printer || undefined,
    printing_place: b.printing_place || undefined,
    
    edition: b.edition || undefined,
    impression: b.impression || undefined,
    issue_state: b.issue_state || undefined,
    edition_notes: b.edition_notes || undefined,
    
    pagination: b.pagination_description || undefined,
    volumes: b.volumes || undefined,
    height_mm: b.height_mm || undefined,
    width_mm: b.width_mm || undefined,
    depth_mm: b.depth_mm || undefined,
    weight_grams: b.weight_grams || undefined,
    cover_type: b.cover_type || undefined,
    binding: binding?.name || undefined,
    format: bookFormat ? (bookFormat.abbreviation ? `${bookFormat.name} (${bookFormat.abbreviation})` : bookFormat.name) : undefined,
    protective_enclosure: b.protective_enclosure || undefined,
    has_dust_jacket: b.has_dust_jacket || false,
    is_signed: b.is_signed || false,
    paper_type: b.paper_type || undefined,
    edge_treatment: b.edge_treatment || undefined,
    endpapers: b.endpapers_type || undefined,
    text_block_condition: b.text_block_condition || undefined,
    
    condition: condition?.name || undefined,
    dust_jacket_condition: djCondition?.name || undefined,
    condition_notes: b.condition_notes || undefined,
    status: b.status || undefined,
    action_needed: b.action_needed || undefined,
    
    isbn_13: b.isbn_13 || undefined,
    isbn_10: b.isbn_10 || undefined,
    oclc_number: b.oclc_number || undefined,
    lccn: b.lccn || undefined,
    user_catalog_id: b.user_catalog_id || undefined,
    ddc: b.ddc || undefined,
    lcc: b.lcc || undefined,
    udc: b.udc || undefined,
    topic: b.topic || undefined,
    
    bisac_subjects: (bisacData || []).map((bs: any) => `${bs.code} — ${bs.subject}`),
    
    storage_location: b.storage_location || undefined,
    shelf: b.shelf || undefined,
    shelf_section: b.shelf_section || undefined,
    
    estimated_value: (() => {
      const latest = (valuationData || [])[0]
      return latest?.value ? Number(latest.value) : undefined
    })(),
    lowest_price: (() => {
      const mrs = (valuationData || []).filter((v: any) => v.source === 'market_research')
      const vals = mrs.map((v: any) => Number(v.value)).filter((n: number) => n > 0)
      return vals.length > 0 ? Math.min(...vals) : undefined
    })(),
    highest_price: (() => {
      const mrs = (valuationData || []).filter((v: any) => v.source === 'market_research')
      const vals = mrs.map((v: any) => Number(v.value)).filter((n: number) => n > 0)
      return vals.length > 0 ? Math.max(...vals) : undefined
    })(),
    sales_price: b.sales_price || undefined,
    price_currency: (valuationData || [])[0]?.currency || b.price_currency || undefined,
    
    provenance: (provenanceData || []).map((p: any) => ({
      owner_name: p.owner_name,
      owner_type: p.owner_type,
      date_from: p.date_from || undefined,
      date_to: p.date_to || undefined,
      transaction_type: p.transaction_type || undefined,
      notes: p.notes || undefined,
    })),
    
    condition_history: (conditionHistoryData || []).map((ch: any) => ({
      event_date: ch.event_date || undefined,
      event_type: ch.event_type || undefined,
      description: ch.description || undefined,
      before_condition: ch.before_condition?.name || undefined,
      after_condition: ch.after_condition?.name || undefined,
      performed_by: ch.performed_by || undefined,
      cost: ch.cost || undefined,
      cost_currency: ch.cost_currency || undefined,
      notes: ch.notes || undefined,
    })),
    
    summary: b.summary || undefined,
    dedication_text: b.dedication_text || undefined,
    colophon_text: b.colophon_text || undefined,
    bibliography: b.bibliography || undefined,
    illustrations_description: b.illustrations_description || undefined,
    signatures_description: b.signatures_description || undefined,
    internal_notes: b.internal_notes || undefined,
    
    tags: (bookTags || []).map((bt: any) => bt.tag?.name).filter(Boolean),
    collections: (bookCollections || []).map((bc: any) => bc.collection?.name).filter(Boolean),
    
    external_links: (externalLinks || []).map((el: any) => ({
      label: el.label || el.link_type?.label || 'Link',
      url: el.url,
    })),
    
    catalog_entry: b.catalog_entry || undefined,
    owner_name: profile?.full_name || undefined,
  }
  
  // Generate PDF
  try {
    let pdfBytes: Uint8Array
    let filename: string
    
    if (type === 'catalog-card') {
      pdfBytes = await generateCatalogCard(pdfData)
      filename = `${sanitizeFilename(b.title)}_card.pdf`
    } else {
      pdfBytes = await generateCatalogSheet(pdfData, paperSize)
      filename = `${sanitizeFilename(b.title)}_catalog_${paperSize}.pdf`
    }
    
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed', detail: err?.message || String(err) }, { status: 500 })
  }
}

function sanitizeFilename(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 60)
    .toLowerCase()
}
