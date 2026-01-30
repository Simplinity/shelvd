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

  // Fetch reference data
  const [
    { data: languages },
    { data: conditions },
    { data: bindings },
    { data: bisacCodes },
    { data: seriesData },
    { data: publisherData },
    { data: acquiredFromData },
    { data: storageLocationData },
    { data: publicationPlaceData },
    { data: printingPlaceData }
  ] = await Promise.all([
    supabase.from('languages').select('id, name_en').order('name_en'),
    supabase.from('conditions').select('id, name').order('sort_order'),
    supabase.from('bindings').select('id, name').order('name'),
    supabase.from('bisac_codes').select('code, subject').order('subject'),
    // Get distinct values for combobox fields
    supabase.from('books').select('series').not('series', 'is', null).order('series'),
    supabase.from('books').select('publisher_name').not('publisher_name', 'is', null).order('publisher_name'),
    supabase.from('books').select('acquired_from').not('acquired_from', 'is', null).order('acquired_from'),
    supabase.from('books').select('storage_location').not('storage_location', 'is', null).order('storage_location'),
    supabase.from('books').select('publication_place').not('publication_place', 'is', null).order('publication_place'),
    supabase.from('books').select('printing_place').not('printing_place', 'is', null).order('printing_place')
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

  // Helper to extract unique values
  const getUniqueValues = (data: any[] | null, field: string): string[] => {
    return [...new Set((data || []).map(item => item[field]).filter(Boolean))] as string[]
  }

  const referenceData = {
    languages: languages || [],
    conditions: conditions || [],
    bindings: uniqueBindings,
    bisacCodes: bisacCodes || [],
    seriesList: getUniqueValues(seriesData, 'series'),
    publisherList: getUniqueValues(publisherData, 'publisher_name'),
    acquiredFromList: getUniqueValues(acquiredFromData, 'acquired_from'),
    storageLocationList: getUniqueValues(storageLocationData, 'storage_location'),
    publicationPlaceList: getUniqueValues(publicationPlaceData, 'publication_place'),
    printingPlaceList: getUniqueValues(printingPlaceData, 'printing_place')
  }

  return (
    <BookEditForm 
      book={book} 
      referenceData={referenceData} 
    />
  )
}
