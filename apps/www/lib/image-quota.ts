import { SupabaseClient } from '@supabase/supabase-js'

// Tier storage limits in bytes
const TIER_LIMITS: Record<string, number> = {
  collector: 0,                           // URL-only, no uploads
  collector_pro: 1 * 1024 * 1024 * 1024,  // 1 GB
  dealer: 25 * 1024 * 1024 * 1024,        // 25 GB
}

export function getStorageLimit(tier: string): number {
  return TIER_LIMITS[tier] || 0
}

export function canUploadImages(tier: string): boolean {
  return getStorageLimit(tier) > 0
}

export async function getUsedStorage(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase
    .from('book_images')
    .select('file_size_bytes')
    .eq('user_id', userId)

  return (data || []).reduce((sum, row) => sum + (row.file_size_bytes || 0), 0)
}

export async function getStorageQuota(supabase: SupabaseClient, userId: string, tier: string) {
  const limit = getStorageLimit(tier)
  const used = limit > 0 ? await getUsedStorage(supabase, userId) : 0
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    percentage: limit > 0 ? Math.round((used / limit) * 100) : 0,
    canUpload: limit > 0,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
