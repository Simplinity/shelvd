'use server'

import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/actions/activity-log'

// ─── Types ───

export type UserType = 'collector' | 'dealer' | 'librarian' | 'explorer'
export type CollectionSize = 'under_50' | '50_500' | '500_5000' | '5000_plus'
export type CurrentSystem = 'spreadsheet' | 'notebook' | 'memory' | 'other_app' | 'nothing'

export interface WizardData {
  user_type: UserType
  collection_size_estimate: CollectionSize
  current_system: CurrentSystem
  interests: string[] // max 3
}

export interface OnboardingChecklist {
  first_book?: boolean
  used_enrich?: boolean
  set_condition?: boolean
  created_collection?: boolean
  // Profile-driven extras:
  business_profile?: boolean
  added_provenance?: boolean
  recorded_valuation?: boolean
  imported_csv?: boolean
}

// ─── Save wizard answers ───

export async function saveWizardData(data: WizardData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      user_type: data.user_type,
      collection_size_estimate: data.collection_size_estimate,
      current_system: data.current_system,
      interests: data.interests.slice(0, 3),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  void logActivity({
    userId: user.id,
    action: 'onboarding.wizard_completed',
    category: 'onboarding',
    entityType: 'user_profile',
    entityId: user.id,
    metadata: {
      user_type: data.user_type,
      collection_size: data.collection_size_estimate,
      current_system: data.current_system,
      interests: data.interests,
    },
  })

  return { success: true }
}

// ─── Complete a checklist step ───

export async function completeChecklistStep(step: keyof OnboardingChecklist) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get current checklist
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_checklist')
    .eq('id', user.id)
    .single()

  const checklist = (profile?.onboarding_checklist || {}) as OnboardingChecklist
  checklist[step] = true

  const { error } = await supabase
    .from('user_profiles')
    .update({ onboarding_checklist: checklist as Record<string, unknown> })
    .eq('id', user.id)

  if (error) return { error: error.message }

  // Check if all base steps are complete → mark onboarding as done
  const baseComplete = checklist.first_book && checklist.used_enrich && checklist.set_condition && checklist.created_collection
  if (baseComplete) {
    await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    void logActivity({
      userId: user.id,
      action: 'onboarding.completed',
      category: 'onboarding',
      entityType: 'user_profile',
      entityId: user.id,
      metadata: { checklist },
    })
  }

  return { success: true }
}

// ─── Dismiss onboarding ───

export async function dismissOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      onboarding_completed: true,
      onboarding_dismissed_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  void logActivity({
    userId: user.id,
    action: 'onboarding.checklist_dismissed',
    category: 'onboarding',
    entityType: 'user_profile',
    entityId: user.id,
  })

  return { success: true }
}

// ─── Get onboarding state ───

export async function getOnboardingState() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_type, collection_size_estimate, current_system, interests, onboarding_completed, onboarding_checklist, onboarding_dismissed_at')
    .eq('id', user.id)
    .single()

  return profile
}

// ─── Returning user nudge data ───

export async function getNudgeData(): Promise<{ daysSinceLastActivity: number } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check last activity
  const { data: lastActivity } = await supabase
    .from('activity_log')
    .select('created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!lastActivity) return { daysSinceLastActivity: 999 }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return { daysSinceLastActivity: daysSince }
}
