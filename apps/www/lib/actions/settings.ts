'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SettingsResult = {
  error?: string
  success?: boolean
  message?: string
}

export async function updateProfile(formData: FormData): Promise<SettingsResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const display_name = formData.get('display_name') as string
  const full_name = formData.get('full_name') as string

  const { error } = await supabase
    .from('user_profiles')
    .update({
      display_name: display_name || null,
      full_name: full_name || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update profile' }

  revalidatePath('/settings')
  return { success: true, message: 'Profile updated' }
}

export async function updatePassword(formData: FormData): Promise<SettingsResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  if (password !== confirm) {
    return { error: 'Passwords do not match' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: 'Failed to update password' }

  return { success: true, message: 'Password updated' }
}

export async function updatePreferences(formData: FormData): Promise<SettingsResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const default_currency = formData.get('default_currency') as string
  const locale = formData.get('locale') as string
  const items_per_page_list = parseInt(formData.get('items_per_page_list') as string) || 50
  const items_per_page_grid = parseInt(formData.get('items_per_page_grid') as string) || 25

  const { error } = await supabase
    .from('user_profiles')
    .update({
      default_currency: default_currency || 'EUR',
      locale: locale || 'en-GB',
      items_per_page_list,
      items_per_page_grid,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update preferences' }

  revalidatePath('/settings')
  return { success: true, message: 'Preferences updated' }
}

export async function updateAddress(formData: FormData): Promise<SettingsResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      street_address: (formData.get('street_address') as string) || null,
      city: (formData.get('city') as string) || null,
      postal_code: (formData.get('postal_code') as string) || null,
      country: (formData.get('country') as string) || null,
      vat_number: (formData.get('vat_number') as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update address' }

  revalidatePath('/settings')
  return { success: true, message: 'Address updated' }
}

export async function deleteAccount(): Promise<SettingsResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Delete books first (cascade should handle book_contributors)
  const { error: booksError } = await supabase
    .from('books')
    .delete()
    .eq('user_id', user.id)

  if (booksError) return { error: 'Failed to delete books' }

  // Delete user_stats
  await supabase
    .from('user_stats')
    .delete()
    .eq('user_id', user.id)

  // Delete profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', user.id)

  if (profileError) return { error: 'Failed to delete profile' }

  // Sign out (auth.users deletion would need service_role or admin API)
  await supabase.auth.signOut()

  return { success: true, message: 'Account deleted' }
}
