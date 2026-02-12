import { createClient } from '@/lib/supabase/server'

type Tier = 'collector' | 'collector_pro' | 'dealer'

/**
 * Tier hierarchy (higher = more access).
 */
const TIER_RANK: Record<Tier, number> = {
  collector: 0,
  collector_pro: 1,
  dealer: 2,
}

function highestTier(...tiers: Tier[]): Tier {
  return tiers.reduce((a, b) => TIER_RANK[b] > TIER_RANK[a] ? b : a)
}

/**
 * Resolve the effective tier for a user.
 * Takes the HIGHEST of: membership_tier, lifetime pro, and active benefit.
 * This ensures is_lifetime_free never downgrades a dealer to collector_pro.
 */
export async function getEffectiveTier(userId: string): Promise<Tier> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('membership_tier, is_lifetime_free, benefit_expires_at')
    .eq('id', userId)
    .single()

  if (!data) return 'collector'

  const baseTier = (data.membership_tier as Tier) || 'collector'

  // Lifetime Pro grants at least collector_pro
  if (data.is_lifetime_free) return highestTier(baseTier, 'collector_pro')

  // Active benefit trial grants at least collector_pro
  if (data.benefit_expires_at && new Date(data.benefit_expires_at) > new Date()) {
    return highestTier(baseTier, 'collector_pro')
  }

  return baseTier
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
 * Returns the numeric limit (0 = none).
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
