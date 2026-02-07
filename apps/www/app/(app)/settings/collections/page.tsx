import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CollectionsManager } from './collections-manager'

export default async function CollectionsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <CollectionsManager />
}
