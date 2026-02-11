'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTierFeatures() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tier_features')
    .select('*')
    .order('tier')
    .order('feature')
  return { data: data || [], error }
}

export async function getTierLimits() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tier_limits')
    .select('*')
    .order('tier')
    .order('limit_key')
  return { data: data || [], error }
}

export async function toggleTierFeature(tier: string, feature: string, enabled: boolean) {
  const supabase = await createClient()

  // Check admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('tier_features')
    .update({ enabled })
    .eq('tier', tier)
    .eq('feature', feature)

  if (error) return { error: error.message }
  return { success: true }
}

export async function addTierFeature(tier: string, feature: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('tier_features')
    .insert({ tier, feature, enabled: true })

  if (error) return { error: error.message }
  return { success: true }
}

export async function removeTierFeature(tier: string, feature: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('tier_features')
    .delete()
    .eq('tier', tier)
    .eq('feature', feature)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateTierLimit(tier: string, limitKey: string, limitValue: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('tier_limits')
    .update({ limit_value: limitValue })
    .eq('tier', tier)
    .eq('limit_key', limitKey)

  if (error) return { error: error.message }
  return { success: true }
}
