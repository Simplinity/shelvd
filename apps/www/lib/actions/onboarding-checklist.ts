'use server'

import { createClient } from '@/lib/supabase/server'

export interface ChecklistStep {
  key: string
  label: string
  description: string
  href: string
  done: boolean
}

export async function getChecklistSteps(): Promise<ChecklistStep[] | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get profile for onboarding state
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_type, collection_size_estimate, interests, onboarding_completed, onboarding_dismissed_at')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // Already completed or dismissed
  if (profile.onboarding_completed || profile.onboarding_dismissed_at) return null

  // No wizard done yet
  if (!profile.user_type) return null

  // ─── Detect completion of each step ───

  // 1. Has at least one book?
  const { count: bookCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
  const hasBooks = (bookCount || 0) > 0

  // 2. Used enrich? (check activity_log)
  let usedEnrich = false
  try {
    const { count } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('category', 'enrich')
    usedEnrich = (count || 0) > 0
  } catch {}

  // 3. Set condition on any book?
  const { count: conditionCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .not('condition_id', 'is', null)
  const hasCondition = (conditionCount || 0) > 0

  // 4. Created a non-default collection?
  const { data: collections } = await supabase
    .from('collections')
    .select('id, is_default')
  const hasCustomCollection = (collections || []).some(c => !c.is_default)

  // ─── Build base checklist (everyone) ───
  const steps: ChecklistStep[] = [
    {
      key: 'first_book',
      label: 'Add your first book',
      description: "Type a title, or paste an ISBN. We'll do the rest.",
      href: '/books/add',
      done: hasBooks,
    },
    {
      key: 'used_enrich',
      label: 'Try Library Lookup',
      description: '22 libraries, 4 continents. Your book is probably in at least one.',
      href: '/books/lookup',
      done: usedEnrich,
    },
    {
      key: 'set_condition',
      label: 'Set a condition',
      description: "Fine? Very Good? 'It survived my toddler'?",
      href: hasBooks ? '/books' : '/books/add',
      done: hasCondition,
    },
    {
      key: 'created_collection',
      label: 'Create a collection',
      description: "Library is your default. But maybe you want 'To Read', 'Signed Copies', or 'Books I Pretend I've Read'.",
      href: '/collections',
      done: hasCustomCollection,
    },
  ]

  // ─── Profile-driven extras (max 2) ───
  const interests = profile.interests || []
  const extras: ChecklistStep[] = []

  if (profile.user_type === 'dealer') {
    const hasCompany = await checkHasCompanyProfile(supabase, user.id)
    extras.push({
      key: 'business_profile',
      label: 'Set up your business profile',
      description: 'Company name, VAT, the boring stuff that makes you look professional.',
      href: '/settings',
      done: hasCompany,
    })
  }

  if (interests.includes('Tracking provenance & history')) {
    let hasProv = false
    try {
      const { count } = await supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('category', 'provenance')
      hasProv = (count || 0) > 0
    } catch {}
    extras.push({
      key: 'added_provenance',
      label: 'Add provenance to a book',
      description: 'Where did it come from? Every book has a story.',
      href: hasBooks ? '/books' : '/books/add',
      done: hasProv,
    })
  }

  if (interests.includes('Insurance & valuation')) {
    let hasVal = false
    try {
      const { count } = await supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('category', 'valuation')
      hasVal = (count || 0) > 0
    } catch {}
    extras.push({
      key: 'recorded_valuation',
      label: 'Record a valuation',
      description: "What's it worth? More than you paid, hopefully.",
      href: hasBooks ? '/books' : '/books/add',
      done: hasVal,
    })
  }

  const sizeEstimate = profile.collection_size_estimate
  if (sizeEstimate === '500_5000' || sizeEstimate === '5000_plus') {
    let hasImported = false
    try {
      const { count } = await supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('category', 'import')
      hasImported = (count || 0) > 0
    } catch {}
    extras.push({
      key: 'imported_csv',
      label: 'Import via CSV',
      description: "Bring your spreadsheet. We won't judge the formatting.",
      href: '/books/import',
      done: hasImported,
    })
  }

  // Add max 2 extras
  return [...steps, ...extras.slice(0, 2)]
}

// Helper: check if user has company_name set
async function checkHasCompanyProfile(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_profiles')
    .select('company_name')
    .eq('id', userId)
    .single()
  return !!(data?.company_name && data.company_name.trim() !== '')
}
