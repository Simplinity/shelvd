import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookImportForm from './book-import-form'

export default async function ImportBooksPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch reference data for validation and lookups
  const [
    { data: languages },
    { data: conditions },
    { data: bindings },
    { data: bookFormats },
    { data: contributorRoles },
    { data: allContributors },
  ] = await Promise.all([
    supabase.from('languages').select('id, name_en').order('name_en'),
    supabase.from('conditions').select('id, name').order('name'),
    supabase.from('bindings').select('id, name').order('name'),
    supabase.from('book_formats').select('id, type, name, abbreviation').order('name'),
    supabase.from('contributor_roles').select('id, name').order('name'),
    supabase.from('contributors').select('id, canonical_name').order('canonical_name'),
  ])

  // Get distinct values for combobox fields
  const { data: books } = await supabase
    .from('books')
    .select('series, publisher_name, storage_location, shelf, shelf_section, publication_place, printing_place')

  const getDistinct = (field: string) => {
    if (!books) return []
    const values = books.map((b: Record<string, unknown>) => b[field]).filter(Boolean) as string[]
    return [...new Set(values)].sort()
  }

  const referenceData = {
    languages: languages || [],
    conditions: conditions || [],
    bindings: bindings || [],
    bookFormats: bookFormats || [],
    contributorRoles: contributorRoles || [],
    allContributors: (allContributors || []).map(c => ({ id: c.id, name: c.canonical_name })),
    seriesList: getDistinct('series'),
    publisherList: getDistinct('publisher_name'),
    storageLocationList: getDistinct('storage_location'),
    shelfList: getDistinct('shelf'),
    shelfSectionList: getDistinct('shelf_section'),
    publicationPlaceList: getDistinct('publication_place'),
    printingPlaceList: getDistinct('printing_place'),
  }

  return <BookImportForm referenceData={referenceData} userId={user.id} />
}
