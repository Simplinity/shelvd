import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Load external link types + user's active selections
  const { data: linkTypes } = await supabase
    .from('external_link_types')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: activeTypes } = await supabase
    .from('user_active_link_types')
    .select('link_type_id')
    .eq('user_id', user.id)

  // If user has no configuration yet, all types are active by default
  const hasConfigured = (activeTypes || []).length > 0
  const activeIds = hasConfigured
    ? new Set((activeTypes || []).map(a => a.link_type_id))
    : new Set((linkTypes || []).map(lt => lt.id))

  // Load ISBN providers + user's settings
  const { data: isbnProviders } = await (supabase as any).rpc('get_user_isbn_providers')

  const tab = params.tab || 'account'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Tab navigation */}
      <div className="flex gap-0 border-b mb-10">
        <a
          href="/settings?tab=account"
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'account'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Account
        </a>
        <a
          href="/settings?tab=configuration"
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'configuration'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Configuration
        </a>
        <a
          href="/settings?tab=external-links"
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'external-links'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          External Links
        </a>
        <a
          href="/settings?tab=book-lookup"
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'book-lookup'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Book Lookup
        </a>
        <a
          href="/settings/collections"
          className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-muted-foreground hover:text-foreground"
        >
          Collections
        </a>
      </div>

      <SettingsForm
        tab={tab}
        email={user.email || ''}
        lastSignIn={user.last_sign_in_at || null}
        profile={profile}
        linkTypes={linkTypes || []}
        activeIds={Array.from(activeIds)}
        isbnProviders={isbnProviders || []}
      />
    </div>
  )
}
