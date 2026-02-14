import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LookupForm } from './lookup-form'

export const metadata = { title: 'Book Lookup' }

export default async function LookupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  // Get user's active providers for display
  const { data: providers } = await (supabase as any).rpc('get_user_isbn_providers')
  
  const activeProviders = (providers || [])
    .filter((p: { is_active: boolean }) => p.is_active)
    .sort((a: { priority: number }, b: { priority: number }) => a.priority - b.priority)
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-2">Book Lookup</h1>
      <p className="text-muted-foreground mb-8">
        Search external sources to auto-fill book details
      </p>
      
      <LookupForm activeProviders={activeProviders} />
    </div>
  )
}
