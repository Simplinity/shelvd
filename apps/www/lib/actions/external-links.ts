'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type LinkTypeResult = {
  error?: string
  success?: boolean
  message?: string
}

export async function getExternalLinkTypes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // RLS handles visibility: system types (user_id IS NULL) + user's own custom types
  const { data, error } = await supabase
    .from('external_link_types')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return []
  return data || []
}

export async function addCustomLinkType(formData: FormData): Promise<LinkTypeResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const label = (formData.get('label') as string)?.trim()
  const domain = (formData.get('domain') as string)?.trim() || null

  if (!label) return { error: 'Label is required' }

  // Generate slug from label
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)

  if (!slug) return { error: 'Invalid label' }

  const { error } = await supabase
    .from('external_link_types')
    .insert({
      slug,
      label,
      domain,
      category: 'custom',
      sort_order: 950,
      is_system: false,
      user_id: user.id,
    })

  if (error) {
    if (error.code === '23505') {
      return { error: 'A type with this name already exists' }
    }
    return { error: 'Failed to add link type' }
  }

  revalidatePath('/settings')
  return { success: true, message: 'Link type added' }
}

export async function deleteCustomLinkType(id: string): Promise<LinkTypeResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // RLS ensures only own non-system types can be deleted
  const { error } = await supabase
    .from('external_link_types')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_system', false)

  if (error) return { error: 'Failed to delete link type' }

  revalidatePath('/settings')
  return { success: true, message: 'Link type deleted' }
}
