export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import BookSearchForm from './book-search-form'

export default async function BookSearchPage() {
  const supabase = await createClient()

  const [
    { data: languages },
    { data: conditions }
  ] = await Promise.all([
    supabase.from('languages').select('id, name_en').order('name_en'),
    supabase.from('conditions').select('id, name').order('sort_order')
  ])

  return (
    <BookSearchForm 
      languages={languages || []} 
      conditions={conditions || []} 
    />
  )
}
