'use server'

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'

export type ActivityAction =
  // Books
  | 'book.created'
  | 'book.updated'
  | 'book.deleted'
  | 'book.enriched'
  | 'book.status_changed'
  | 'book.cover_uploaded'
  | 'book.cover_removed'
  // Collections
  | 'collection.created'
  | 'collection.renamed'
  | 'collection.deleted'
  | 'collection.book_added'
  | 'collection.book_removed'
  // Provenance
  | 'provenance.entry_added'
  | 'provenance.entry_updated'
  | 'provenance.entry_removed'
  | 'provenance.source_added'
  // Contributors & Tags
  | 'contributor.added'
  | 'contributor.removed'
  | 'tag.added'
  | 'tag.removed'
  // Account
  | 'account.signup'
  | 'account.profile_updated'
  | 'account.settings_changed'
  // Admin
  | 'admin.user_status_changed'
  | 'admin.membership_changed'
  | 'admin.note_added'
  | 'admin.announcement_created'
  | 'admin.announcement_toggled'
  | 'admin.announcement_deleted'
  | 'admin.ticket_status_changed'
  // Import
  | 'import.completed'

export type ActivityCategory = 'book' | 'collection' | 'provenance' | 'contributor' | 'tag' | 'account' | 'admin' | 'import'

export type ActivitySource = 'app' | 'import' | 'api' | 'admin' | 'system'

export interface LogActivityParams {
  userId: string
  action: ActivityAction
  category: ActivityCategory
  entityType?: string
  entityId?: string
  entityLabel?: string
  metadata?: Record<string, unknown>
  source?: ActivitySource
}

/**
 * Log a user activity. Fire-and-forget — errors are silently caught
 * so logging never breaks the main flow.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('activity_log').insert({
      user_id: params.userId,
      action: params.action,
      category: params.category,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      entity_label: params.entityLabel ?? null,
      metadata: (params.metadata ?? {}) as Json,
      source: params.source ?? 'app',
    })
  } catch {
    // Silent — logging should never break the main flow
    console.error('[activity-log] Failed to log activity:', params.action)
  }
}

// Note: computeDiff and bookLabel are in @/lib/activity-utils (non-server, for client use)

// ─── Admin: fetch recent activity ───

export type ActivityLogEntry = {
  id: string
  created_at: string
  user_id: string | null
  user_email: string | null
  action: string
  category: string
  entity_type: string | null
  entity_id: string | null
  entity_label: string | null
  metadata: Record<string, unknown>
  source: string
}

export async function getRecentActivityForAdmin(options?: {
  limit?: number
  category?: string
  userId?: string
}): Promise<{ data: ActivityLogEntry[]; error?: string }> {
  try {
    const supabase = await createClient()
    const params: Record<string, unknown> = { lim: options?.limit ?? 20 }
    if (options?.category) params.category_filter = options.category
    if (options?.userId) params.user_filter = options.userId
    const { data, error } = await supabase.rpc('get_recent_activity_for_admin', params as any)

    if (error) return { data: [], error: error.message }
    return { data: (data ?? []) as ActivityLogEntry[] }
  } catch {
    return { data: [], error: 'Failed to fetch activity' }
  }
}

export async function getActivityPageForAdmin(options?: {
  limit?: number
  offset?: number
  category?: string
  userId?: string
  search?: string
}): Promise<{ data: ActivityLogEntry[]; total: number; error?: string }> {
  try {
    const supabase = await createClient()

    // Fetch page
    const pageParams: Record<string, unknown> = {
      lim: options?.limit ?? 50,
      off_set: options?.offset ?? 0,
    }
    if (options?.category) pageParams.category_filter = options.category
    if (options?.userId) pageParams.user_filter = options.userId
    if (options?.search) pageParams.search_filter = options.search
    const { data, error } = await supabase.rpc('get_activity_page_for_admin', pageParams as any)

    // Fetch count
    const countParams: Record<string, unknown> = {}
    if (options?.category) countParams.category_filter = options.category
    if (options?.userId) countParams.user_filter = options.userId
    if (options?.search) countParams.search_filter = options.search
    const { data: countData } = await supabase.rpc('get_activity_count_filtered', countParams as any)

    if (error) return { data: [], total: 0, error: error.message }
    return { data: (data ?? []) as ActivityLogEntry[], total: Number(countData) || 0 }
  } catch {
    return { data: [], total: 0, error: 'Failed to fetch activity' }
  }
}

// ─── User: fetch own activity (RLS-scoped) ───

export async function getMyActivity(options?: {
  limit?: number
  offset?: number
  category?: string
  search?: string
}): Promise<{ data: ActivityLogEntry[]; total: number; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], total: 0, error: 'Not authenticated' }

    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0

    let query = supabase
      .from('activity_log')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (options?.category) query = query.eq('category', options.category)
    if (options?.search) query = query.ilike('entity_label', `%${options.search}%`)

    const { data, count, error } = await query

    if (error) return { data: [], total: 0, error: error.message }

    const entries: ActivityLogEntry[] = (data ?? []).map(row => toEntry(row as unknown as Record<string, unknown>))
    return { data: entries, total: count ?? 0 }
  } catch {
    return { data: [], total: 0, error: 'Failed to fetch activity' }
  }
}

// ─── User: fetch activity for a specific book ───

export async function getBookActivity(bookId: string, options?: {
  limit?: number
}): Promise<{ data: ActivityLogEntry[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('entity_id', bookId)
      .order('created_at', { ascending: false })
      .limit(options?.limit ?? 20)

    if (error) return { data: [], error: error.message }

    const entries: ActivityLogEntry[] = (data ?? []).map(row => toEntry(row as unknown as Record<string, unknown>))
    return { data: entries }
  } catch {
    return { data: [], error: 'Failed to fetch book activity' }
  }
}

// Helper: map DB row to ActivityLogEntry
function toEntry(row: Record<string, unknown>): ActivityLogEntry {
  return {
    id: String(row.id ?? ''),
    created_at: String(row.created_at ?? ''),
    user_id: row.user_id ? String(row.user_id) : null,
    user_email: row.user_email ? String(row.user_email) : null,
    action: String(row.action ?? ''),
    category: String(row.category ?? ''),
    entity_type: row.entity_type ? String(row.entity_type) : null,
    entity_id: row.entity_id ? String(row.entity_id) : null,
    entity_label: row.entity_label ? String(row.entity_label) : null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    source: String(row.source ?? 'app'),
  }
}
