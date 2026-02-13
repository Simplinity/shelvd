'use server'

import { createClient } from '@/lib/supabase/server'

export async function resetOnboarding(userId: string) {
  const supabase = await createClient()
  
  await supabase
    .from('user_profiles')
    .update({
      user_type: null,
      collection_size_estimate: null,
      current_system: null,
      interests: [],
      onboarding_completed: false,
      onboarding_checklist: {},
      onboarding_dismissed_at: null,
    })
    .eq('id', userId)

  return { success: true }
}
