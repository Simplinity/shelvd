export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import BookAddForm from './book-add-form'

export default async function BookAddPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
    { data: contributorRoles },
    { data: allContributors },
    { data: seriesData },
    { data: publisherData },
    { data: acquiredFromData },
    { data: storageLocationData },
    { data: shelfData },
    { data: shelfSectionData },
    { data: publicationPlaceData },
    { data: printingPlaceData },
    { data: allLinkTypes },
    { data: activeTypeRows },
  ] = await Promise.all([
    supabase.from('languages').select('id, name_en').order('name_en'),
    supabase.from('conditions').select('id, name').order('sort_order'),
    supabase.from('bindings').select('id, name').order('name'),
    supabase.from('book_formats').select('id, type, name, abbreviation').order('type').order('name'),
    fetchAllBisacCodes(),
    supabase.from('contributor_roles').select('id, name').order('name'),
    supabase.from('contributors').select('id, canonical_name').order('canonical_name'),
    // Get distinct values for combobox fields
    supabase.from('books').select('series').not('series', 'is', null).order('series'),
    supabase.from('books').select('publisher_name').not('publisher_name', 'is', null).order('publisher_name'),
    supabase.from('books').select('acquired_from').not('acquired_from', 'is', null).order('acquired_from'),
    supabase.from('books').select('storage_location').not('storage_location', 'is', null).order('storage_location'),
    supabase.from('books').select('shelf').not('shelf', 'is', null).order('shelf'),
    supabase.from('books').select('shelf_section').not('shelf_section', 'is', null).order('shelf_section'),
    supabase.from('books').select('publication_place').not('publication_place', 'is', null).order('publication_place'),
    supabase.from('books').select('printing_place').not('printing_place', 'is', null).order('printing_place'),
    supabase.from('external_link_types').select('id, label, domain, category, sort_order, is_system').order('sort_order'),
    user ? supabase.from('user_active_link_types').select('link_type_id').eq('user_id', user.id) : Promise.resolve({ data: null }),
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

  const referenceData = {
    languages: languages || [],
    conditions: conditions || [],
    bindings: uniqueBindings,
    bookFormats: uniqueFormats,
    bisacCodes: bisacCodes,
    contributorRoles: uniqueRoles,
    allContributors: (allContributors || []).map((c: any) => ({ id: c.id, name: c.canonical_name })),
    seriesList: getUniqueValues(seriesData, 'series'),
    publisherList: getUniqueValues(publisherData, 'publisher_name'),
    acquiredFromList: getUniqueValues(acquiredFromData, 'acquired_from'),
    storageLocationList: getUniqueValues(storageLocationData, 'storage_location'),
    shelfList: getUniqueValues(shelfData, 'shelf'),
    shelfSectionList: getUniqueValues(shelfSectionData, 'shelf_section'),
    publicationPlaceList: getUniqueValues(publicationPlaceData, 'publication_place'),
    printingPlaceList: getUniqueValues(printingPlaceData, 'printing_place'),
    linkTypes: (() => {
      const all = allLinkTypes || []
      const activeRows = activeTypeRows || []
      // No rows = new user = all active
      if (activeRows.length === 0) return all
      const activeSet = new Set(activeRows.map((r: any) => r.link_type_id))
      return all.filter((lt: any) => activeSet.has(lt.id))
    })(),
  }

  return <BookAddForm referenceData={referenceData} />
}
