import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpc = supabase.rpc as any
  const { data: authUsers, error: e1 } = await rpc('debug_auth_users')
  const { data: profiles, error: e2 } = await rpc('debug_user_profiles')
  const { data: signupCheck, error: e3 } = await rpc('debug_signup_check')

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

      <section>
        <h2 className="font-bold mb-2">Signup Debug Check</h2>
        {e3 && <p className="text-red-500">Error: {e3.message}</p>}
        {signupCheck && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Trigger source</h3>
              <pre className="bg-gray-100 p-4 overflow-auto whitespace-pre-wrap">{signupCheck.trigger_source}</pre>
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">RLS enabled: {String(signupCheck.rls_enabled)}</h3>
              <pre className="bg-gray-100 p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(signupCheck.policies, null, 2)}</pre>
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Columns ({signupCheck.columns?.length})</h3>
              <pre className="bg-gray-100 p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(signupCheck.columns, null, 2)}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
