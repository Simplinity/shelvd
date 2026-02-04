'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type LinkTypeResult = {
  error?: string
  success?: boolean
  message?: string
}

export async function addCustomLinkType(formData: FormData): Promise<LinkTypeResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const label = (formData.get('label') as string)?.trim()
  const domain = (formData.get('domain') as string)?.trim() || null

  if (!label) return { error: 'Label is required' }

  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)

  if (!slug) return { error: 'Invalid label' }

  const { data: inserted, error } = await supabase
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
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'A type with this name already exists' }
    return { error: 'Failed to add link type' }
  }

  // Auto-activate the newly added custom type
  if (inserted) {
    await supabase
      .from('user_active_link_types')
      .insert({ user_id: user.id, link_type_id: inserted.id })
  }

  revalidatePath('/settings')
  return { success: true, message: 'Link type added' }
}

export async function deleteCustomLinkType(id: string): Promise<LinkTypeResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Remove activation first
  await supabase
    .from('user_active_link_types')
    .delete()
    .eq('user_id', user.id)
    .eq('link_type_id', id)

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

export async function activateLinkType(linkTypeId: string): Promise<LinkTypeResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_active_link_types')
    .insert({ user_id: user.id, link_type_id: linkTypeId })

  if (error && error.code !== '23505') return { error: 'Failed to activate' }

  revalidatePath('/settings')
  return { success: true }
}

export async function deactivateLinkType(linkTypeId: string): Promise<LinkTypeResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_active_link_types')
    .delete()
    .eq('user_id', user.id)
    .eq('link_type_id', linkTypeId)

  if (error) return { error: 'Failed to deactivate' }

  revalidatePath('/settings')
  return { success: true }
}
