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
