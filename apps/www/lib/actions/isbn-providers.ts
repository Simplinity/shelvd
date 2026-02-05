'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleIsbnProvider(providerId: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (isActive) {
    // Upsert the provider setting as active
    const { error } = await (supabase as any)
      .from('user_isbn_providers')
      .upsert({
        user_id: user.id,
        provider_id: providerId,
        is_active: true
      }, {
        onConflict: 'user_id,provider_id'
      })
    
    if (error) {
      return { error: error.message }
    }
  } else {
    // Upsert the provider setting as inactive
    const { error } = await (supabase as any)
      .from('user_isbn_providers')
      .upsert({
        user_id: user.id,
        provider_id: providerId,
        is_active: false
      }, {
        onConflict: 'user_id,provider_id'
      })
    
    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/settings')
  return { success: true }
}
