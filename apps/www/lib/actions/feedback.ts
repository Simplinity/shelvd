'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type FeedbackResult = {
  error?: string
  success?: boolean
  message?: string
  data?: any
}

// ─── Submit feedback ───

export async function submitFeedback(formData: FormData): Promise<FeedbackResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const type = formData.get('type') as string
  if (!type || !['bug', 'contact', 'callback'].includes(type)) {
    return { error: 'Invalid feedback type' }
  }

  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  // Type-specific validation
  if (type === 'bug' && (!subject || !message)) {
    return { error: 'Subject and description are required for bug reports' }
  }
  if (type === 'contact' && (!subject || !message)) {
    return { error: 'Subject and message are required for contact requests' }
  }
  if (type === 'callback') {
    const phone = formData.get('phone') as string
    if (!phone) return { error: 'Phone number is required for callback requests' }
  }

  // Build insert object
  const record: Record<string, any> = {
    user_id: user.id,
    type,
    subject: subject || null,
    message: message || null,
  }

  // Bug-specific fields
  if (type === 'bug') {
    record.severity = formData.get('severity') || 'minor'
    record.steps_to_reproduce = formData.get('steps_to_reproduce') || null
  }

  // Contact-specific fields
  if (type === 'contact') {
    record.category = formData.get('category') || 'general'
    record.preferred_response = formData.get('preferred_response') || 'email'
  }

  // Callback-specific fields
  if (type === 'callback') {
    record.phone = formData.get('phone') || null
    record.preferred_time = formData.get('preferred_time') || 'morning'
    record.timezone = formData.get('timezone') || null
    record.urgency = formData.get('urgency') || 'normal'
    record.message = formData.get('reason') || null
  }

  // Browser info (passed as JSON string from client)
  const browserInfoStr = formData.get('browser_info') as string
  if (browserInfoStr) {
    try {
      record.browser_info = JSON.parse(browserInfoStr)
    } catch {
      record.browser_info = {}
    }
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert(record)
    .select('id')
    .single()

  if (error) return { error: 'Failed to submit feedback. Please try again.' }

  revalidatePath('/support')
  return { 
    success: true, 
    message: `Your ${type === 'bug' ? 'bug report' : type === 'callback' ? 'callback request' : 'message'} has been submitted. We'll get back to you soon.`,
    data: { id: data.id }
  }
}

// ─── Admin: get all feedback ───

export async function getAllFeedback(filters?: {
  type?: string
  status?: string
  priority?: string
}): Promise<{ error?: string; data: any[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', data: [] }

  // Verify admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { error: 'Not authorized', data: [] }

  let query = supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority)
  }

  const { data, error } = await query
  if (error) return { error: 'Failed to load feedback', data: [] }
  return { data: data || [] }
}

// ─── Admin: get new feedback count ───

export async function getNewFeedbackCount(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  return count || 0
}

// ─── Admin: update feedback status ───

export async function updateFeedbackStatus(
  feedbackId: string,
  status: string
): Promise<FeedbackResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const update: Record<string, any> = { status }

  if (status === 'resolved' || status === 'closed') {
    update.resolved_by = user.id
    update.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('feedback')
    .update(update)
    .eq('id', feedbackId)

  if (error) return { error: 'Failed to update status' }
  revalidatePath('/admin/support')
  return { success: true, message: `Status updated to ${status}` }
}

// ─── Admin: update feedback priority ───

export async function updateFeedbackPriority(
  feedbackId: string,
  priority: string
): Promise<FeedbackResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('feedback')
    .update({ priority })
    .eq('id', feedbackId)

  if (error) return { error: 'Failed to update priority' }
  revalidatePath('/admin/support')
  return { success: true }
}

// ─── Admin: update admin notes ───

export async function updateAdminNotes(
  feedbackId: string,
  notes: string
): Promise<FeedbackResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('feedback')
    .update({ admin_notes: notes })
    .eq('id', feedbackId)

  if (error) return { error: 'Failed to update notes' }
  revalidatePath('/admin/support')
  return { success: true }
}

// ─── Admin: send response to user ───

export async function sendAdminResponse(
  feedbackId: string,
  response: string
): Promise<FeedbackResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('feedback')
    .update({ 
      admin_response: response,
      status: 'resolved',
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', feedbackId)

  if (error) return { error: 'Failed to send response' }
  revalidatePath('/admin/support')
  revalidatePath('/support')
  return { success: true, message: 'Response sent' }
}

// ─── Admin: delete feedback ───

export async function deleteFeedback(feedbackId: string): Promise<FeedbackResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('feedback')
    .delete()
    .eq('id', feedbackId)

  if (error) return { error: 'Failed to delete' }
  revalidatePath('/admin/support')
  return { success: true, message: 'Deleted' }
}

// ─── Admin: bulk update status ───

export async function bulkUpdateFeedbackStatus(
  feedbackIds: string[],
  status: string
): Promise<FeedbackResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const update: Record<string, any> = { status }
  if (status === 'resolved' || status === 'closed') {
    update.resolved_by = user.id
    update.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('feedback')
    .update(update)
    .in('id', feedbackIds)

  if (error) return { error: 'Failed to update' }
  revalidatePath('/admin/support')
  return { success: true, message: `${feedbackIds.length} items updated` }
}

// ─── Admin: bulk delete ───

export async function bulkDeleteFeedback(feedbackIds: string[]): Promise<FeedbackResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('feedback')
    .delete()
    .in('id', feedbackIds)

  if (error) return { error: 'Failed to delete' }
  revalidatePath('/admin/support')
  return { success: true, message: `${feedbackIds.length} items deleted` }
}

// ─── Get user's own submissions ───

export async function getUserFeedback(): Promise<{ error?: string; data: any[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', data: [] }

  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: 'Failed to load submissions', data: [] }
  return { data: data || [] }
}
