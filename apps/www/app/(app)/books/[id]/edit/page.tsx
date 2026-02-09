export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookEditForm from './book-edit-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BookEditPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch book data
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !book) {
    notFound()
  }

  // Fetch BISAC codes in batches (Supabase has 1000 row default limit)
  const fetchAllBisacCodes = async () => {
    const allCodes: { code: string; subject: string }[] = []
    const batchSize = 1000
    let offset = 0
    
    while (true) {
      const { data, error } = await supabase
        .from('bisac_codes')
        .select('code, subject')
        .order('subject')
        .range(offset, offset + batchSize - 1)
      
      if (error || !data || data.length === 0) break
      
      allCodes.push(...data)
      if (data.length < batchSize) break
      offset += batchSize
    }
    
    return allCodes
  }

  // Fetch reference data
  const [
    { data: languages },
    { data: conditions },
    { data: bindings },
    { data: bookFormats },
    bisacCodes,
    { data: bookContributors },
    { data: contributorRoles },
    { data: allContributors },
    { data: seriesData },
    { data: publisherData },
    { data: storageLocationData },
    { data: shelfData },
    { data: shelfSectionData },
    { data: publicationPlaceData },
    { data: printingPlaceData },
    { data: allLinkTypes },
    { data: activeTypeRows },
    { data: bookExternalLinks },
    { data: provenanceData },
    { data: conditionHistoryData },
  ] = await Promise.all([
    supabase.from('languages').select('id, name_en').order('name_en'),
    supabase.from('conditions').select('id, name').order('sort_order'),
    supabase.from('bindings').select('id, name').order('name'),
    supabase.from('book_formats').select('id, type, name, abbreviation').order('type').order('name'),
    fetchAllBisacCodes(),
    // Fetch contributors for this book (with IDs for editing)
    supabase
      .from('book_contributors')
      .select(`
        id,
        contributor_id,
        role_id,
        contributor:contributors ( id, canonical_name ),
        role:contributor_roles ( id, name )
      `)
      .eq('book_id', id),
    // Fetch all contributor roles for dropdown
    supabase.from('contributor_roles').select('id, name').order('name'),
    // Fetch all contributors for autocomplete
    supabase.from('contributors').select('id, canonical_name').order('canonical_name'),
    // Get distinct values for combobox fields
    supabase.from('books').select('series').not('series', 'is', null).order('series'),
    supabase.from('books').select('publisher_name').not('publisher_name', 'is', null).order('publisher_name'),
    supabase.from('books').select('storage_location').not('storage_location', 'is', null).order('storage_location'),
    supabase.from('books').select('shelf').not('shelf', 'is', null).order('shelf'),
    supabase.from('books').select('shelf_section').not('shelf_section', 'is', null).order('shelf_section'),
    supabase.from('books').select('publication_place').not('publication_place', 'is', null).order('publication_place'),
    supabase.from('books').select('printing_place').not('printing_place', 'is', null).order('printing_place'),
    supabase.from('external_link_types').select('id, label, domain, category, sort_order, is_system').order('sort_order'),
    supabase.from('user_active_link_types').select('link_type_id'),
    supabase.from('book_external_links').select('id, link_type_id, label, url, sort_order').eq('book_id', id).order('sort_order'),
    supabase.from('provenance_entries').select(`
      id, position, owner_name, owner_type, date_from, date_to,
      evidence_type, evidence_description, transaction_type, transaction_detail,
      price_paid, price_currency, association_type, association_note, notes,
      provenance_sources ( id, source_type, title, url, reference, notes )
    `).eq('book_id', id).order('position'),
    supabase.from('condition_history').select(`
      id, position, event_date, event_type, description, performed_by,
      cost, cost_currency, before_condition_id, after_condition_id, notes
    `).eq('book_id', id).order('position'),
  ])

  // Get unique bindings (there are duplicates in the table)
  const seenNames = new Set<string>()
  const uniqueBindings: { id: string; name: string }[] = []
  for (const binding of bindings || []) {
    if (!seenNames.has(binding.name)) {
      seenNames.add(binding.name)
      uniqueBindings.push(binding)
    }
  }

  // Get unique book formats (there are duplicates in the table)
  const seenFormats = new Set<string>()
  const uniqueFormats: { id: string; type: string | null; name: string; abbreviation: string | null }[] = []
  for (const format of bookFormats || []) {
    const key = `${format.type}-${format.name}`
    if (!seenFormats.has(key)) {
      seenFormats.add(key)
      uniqueFormats.push(format)
    }
  }

  // Get unique contributor roles (there are duplicates in the table)
  const seenRoles = new Set<string>()
  const uniqueRoles: { id: string; name: string }[] = []
  for (const role of contributorRoles || []) {
    if (!seenRoles.has(role.name)) {
      seenRoles.add(role.name)
      uniqueRoles.push(role)
    }
  }

  // Helper to extract unique values
  const getUniqueValues = (data: any[] | null, field: string): string[] => {
    return [...new Set((data || []).map(item => item[field]).filter(Boolean))] as string[]
  }

  // Transform book contributors for the form (with IDs for editing)
  const bookContributorsList = (bookContributors || []).map((bc: any) => ({
    id: bc.id,
    contributorId: bc.contributor?.id || '',
    contributorName: bc.contributor?.canonical_name || '',
    roleId: bc.role?.id || '',
    roleName: bc.role?.name || ''
  })).filter((c: any) => c.contributorName && c.roleName)

  // Simple contributors list for catalog entry generator
  const contributors = bookContributorsList.map(c => ({
    name: c.contributorName,
    role: c.roleName
  }))

  const referenceData = {
    languages: languages || [],
    conditions: conditions || [],
    bindings: uniqueBindings,
    bookFormats: uniqueFormats,
    bisacCodes: bisacCodes,
    contributors: contributors,
    bookContributors: bookContributorsList,
    contributorRoles: uniqueRoles,
    allContributors: (allContributors || []).map((c: any) => ({ id: c.id, name: c.canonical_name })),
    seriesList: getUniqueValues(seriesData, 'series'),
    publisherList: getUniqueValues(publisherData, 'publisher_name'),
    storageLocationList: getUniqueValues(storageLocationData, 'storage_location'),
    shelfList: getUniqueValues(shelfData, 'shelf'),
    shelfSectionList: getUniqueValues(shelfSectionData, 'shelf_section'),
    publicationPlaceList: getUniqueValues(publicationPlaceData, 'publication_place'),
    printingPlaceList: getUniqueValues(printingPlaceData, 'printing_place'),
    linkTypes: (() => {
      const all = allLinkTypes || []
      const activeRows = activeTypeRows || []
      if (activeRows.length === 0) return all
      const activeSet = new Set(activeRows.map((r: any) => r.link_type_id))
      return all.filter((lt: any) => activeSet.has(lt.id))
    })(),
    bookExternalLinks: (bookExternalLinks || []).map((l: any) => ({
      id: l.id,
      linkTypeId: l.link_type_id || '',
      url: l.url,
      label: l.label || '',
    })),
    conditionHistoryEntries: (conditionHistoryData || []).map((ch: any) => ({
      dbId: ch.id,
      position: ch.position,
      eventDate: ch.event_date || '',
      eventType: ch.event_type || 'assessment',
      description: ch.description || '',
      performedBy: ch.performed_by || '',
      cost: ch.cost,
      costCurrency: ch.cost_currency || '',
      beforeConditionId: ch.before_condition_id || '',
      afterConditionId: ch.after_condition_id || '',
      notes: ch.notes || '',
    })),
    provenanceEntries: (provenanceData || []).map((pe: any) => ({
      dbId: pe.id,
      position: pe.position,
      ownerName: pe.owner_name || '',
      ownerType: pe.owner_type || 'person',
      dateFrom: pe.date_from || '',
      dateTo: pe.date_to || '',
      evidenceType: pe.evidence_type || [],
      evidenceDescription: pe.evidence_description || '',
      transactionType: pe.transaction_type || 'unknown',
      transactionDetail: pe.transaction_detail || '',
      pricePaid: pe.price_paid,
      priceCurrency: pe.price_currency || '',
      associationType: pe.association_type || 'none',
      associationNote: pe.association_note || '',
      notes: pe.notes || '',
      sources: (pe.provenance_sources || []).map((s: any) => ({
        id: s.id,
        sourceType: s.source_type || 'url',
        title: s.title || '',
        url: s.url || '',
        reference: s.reference || '',
        notes: s.notes || '',
      })),
    })),
  }

  return (
    <BookEditForm 
      book={book} 
      referenceData={referenceData} 
    />
  )
}
