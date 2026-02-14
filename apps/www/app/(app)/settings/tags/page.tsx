import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TagsManager } from './tags-manager'

export const metadata = { title: 'Tags' }

export default async function TagsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <TagsManager />
}
