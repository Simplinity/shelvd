export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import BookSearchForm from './book-search-form'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BookSearchPage({ searchParams }: Props) {
  const supabase = await createClient()
  const params = await searchParams

  const [
    { data: languages },
    { data: conditions }
  ] = await Promise.all([
    supabase.from('languages').select('id, name_en').order('name_en'),
    supabase.from('conditions').select('id, name').order('sort_order')
  ])

  // Extract initial values from URL params
  const initialValues = {
    title: (params.title as string) || '',
    subtitle: (params.subtitle as string) || '',
    original_title: (params.original_title as string) || '',
    series: (params.series as string) || '',
    author: (params.author as string) || '',
    publisher_name: (params.publisher_name as string) || '',
    publication_place: (params.publication_place as string) || '',
    publication_year: (params.publication_year as string) || '',
    language: (params.language as string) || '',
    condition: (params.condition as string) || '',
    status: (params.status as string) || '',
    isbn: (params.isbn as string) || '',
    storage_location: (params.storage_location as string) || '',
    shelf: (params.shelf as string) || '',
  }

  const initialMode = (params.mode as string) || 'and'
  const initialMatch = (params.match as string) || 'fuzzy'

  return (
    <BookSearchForm 
      languages={languages || []} 
      conditions={conditions || []}
      initialValues={initialValues}
      initialMode={initialMode as 'and' | 'or'}
      initialMatch={initialMatch as 'fuzzy' | 'exact'}
    />
  )
}
