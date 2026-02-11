'use server'

import { createClient } from '@/lib/supabase/server'

export type InviteCode = {
  id: string
  code: string
  label: string | null
  source_type: string
  source_name: string | null
  benefit_type: string
  benefit_days: number
  max_uses: number | null
  times_used: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export type CodeRedemption = {
  user_id: string
  user_email: string
  redeemed_at: string
  user_status: string
  book_count: number
}

export async function getInviteCodes(): Promise<{ data: InviteCode[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_invite_codes_for_admin')
    if (error) return { data: [], error: error.message }
    return { data: (data ?? []) as InviteCode[] }
  } catch {
    return { data: [], error: 'Failed to fetch codes' }
  }
}

export async function getCodeRedemptions(codeId: string): Promise<{ data: CodeRedemption[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_code_redemptions_for_admin', { p_code_id: codeId })
    if (error) return { data: [], error: error.message }
    return { data: (data ?? []) as CodeRedemption[] }
  } catch {
    return { data: [], error: 'Failed to fetch redemptions' }
  }
}

export async function createInviteCode(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const code = (formData.get('code') as string)?.trim().toUpperCase()
    if (!code) return { success: false, error: 'Code is required' }

    const label = (formData.get('label') as string)?.trim() || null
    const sourceType = (formData.get('sourceType') as string) || 'personal'
    const sourceName = (formData.get('sourceName') as string)?.trim() || null
    const benefitType = (formData.get('benefitType') as string) || 'none'
    const benefitDays = parseInt(formData.get('benefitDays') as string) || 0
    const maxUses = (formData.get('maxUses') as string)?.trim()
    const expiresAt = (formData.get('expiresAt') as string)?.trim() || null

    const { error } = await supabase.from('invite_codes').insert({
      code,
      label,
      source_type: sourceType,
      source_name: sourceName,
      benefit_type: benefitType,
      benefit_days: benefitDays,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt || null,
      created_by: user.id,
    })

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return { success: false, error: 'This code already exists' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create code' }
  }
}

export async function toggleInviteCode(codeId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('invite_codes')
      .update({ is_active: isActive })
      .eq('id', codeId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to toggle code' }
  }
}
