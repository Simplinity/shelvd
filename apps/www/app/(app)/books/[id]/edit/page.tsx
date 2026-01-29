import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookEditForm from './book-edit-form'
import type { Tables } from '@/lib/supabase/database.types'

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
    { data: bindings }
  ] = await Promise.all([
    supabase.from('languages').select('id, name_en').order('name_en'),
    supabase.from('conditions').select('id, name').order('sort_order'),
    supabase.from('bindings').select('id, name').order('name')
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

  const referenceData = {
    languages: languages || [],
    conditions: conditions || [],
    bindings: uniqueBindings
  }

  return (
    <BookEditForm 
      book={book} 
      referenceData={referenceData} 
    />
  )
}
