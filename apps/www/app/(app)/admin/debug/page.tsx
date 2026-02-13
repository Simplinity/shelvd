import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: authUsers, error: e1 } = await (supabase.rpc as any)('debug_auth_users')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles, error: e2 } = await (supabase.rpc as any)('debug_user_profiles')

  return (
    <div className="p-8 font-mono text-sm max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Debug: Auth State</h1>
      
      <section>
        <h2 className="font-bold mb-2">auth.users ({Array.isArray(authUsers) ? authUsers.length : 'error'})</h2>
        {e1 && <p className="text-red-500">Error: {e1.message}</p>}
        <pre className="bg-gray-100 p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(authUsers, null, 2)}</pre>
      </section>

      <section>
        <h2 className="font-bold mb-2">user_profiles ({Array.isArray(profiles) ? profiles.length : 'error'})</h2>
        {e2 && <p className="text-red-500">Error: {e2.message}</p>}
        <pre className="bg-gray-100 p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(profiles, null, 2)}</pre>
      </section>
    </div>
  )
}
