import { createClient } from '@/lib/supabase/server'

type Tier = 'collector' | 'collector_pro' | 'dealer'

/**
 * Resolve the effective tier for a user.
 * Checks is_lifetime_free (→ collector_pro) and benefit_expires_at.
 */
export async function getEffectiveTier(userId: string): Promise<Tier> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('membership_tier, is_lifetime_free, benefit_expires_at')
    .eq('id', userId)
    .single()

  if (!data) return 'collector'

  // Lifetime Pro overrides everything (but NOT to Dealer)
  if (data.is_lifetime_free) return 'collector_pro'

  // Active benefit trial → collector_pro
  if (data.benefit_expires_at && new Date(data.benefit_expires_at) > new Date()) {
    return 'collector_pro'
  }

  return (data.membership_tier as Tier) || 'collector'
}

/**
 * Check if a user has access to a specific feature.
 */
export async function hasFeature(userId: string, feature: string): Promise<boolean> {
  const tier = await getEffectiveTier(userId)
  const supabase = await createClient()

  const { data } = await supabase
    .from('tier_features')
    .select('enabled')
    .eq('tier', tier)
    .eq('feature', feature)
    .single()

  return data?.enabled ?? false
}

/**
 * Get a tier limit value for a user.
 * Returns -1 for unlimited, 0 for none, or the actual limit.
 */
export async function getTierLimit(userId: string, limitKey: string): Promise<number> {
  const tier = await getEffectiveTier(userId)
  const supabase = await createClient()

  const { data } = await supabase
    .from('tier_limits')
    .select('limit_value')
    .eq('tier', tier)
    .eq('limit_key', limitKey)
    .single()

  return data?.limit_value ?? 0
}

/**
 * Get all tier data for a user in one call (for passing to client components).
 * Returns the effective tier, all enabled features, and all limits.
 */
export async function getUserTierData(userId: string) {
  const tier = await getEffectiveTier(userId)
  const supabase = await createClient()

  const [featuresRes, limitsRes] = await Promise.all([
    supabase
      .from('tier_features')
      .select('feature')
      .eq('tier', tier)
      .eq('enabled', true),
    supabase
      .from('tier_limits')
      .select('limit_key, limit_value')
      .eq('tier', tier),
  ])

  const features = new Set((featuresRes.data || []).map(f => f.feature))
  const limits: Record<string, number> = {}
  for (const l of limitsRes.data || []) {
    limits[l.limit_key] = Number(l.limit_value)
  }

  return { tier, features: Array.from(features), limits }
}
