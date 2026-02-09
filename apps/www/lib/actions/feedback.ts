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
