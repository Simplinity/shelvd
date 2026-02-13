import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  const supabase = await createClient()
  
  let authUsers = null
  let profiles = null
  let signupCheck = null
  let errors: string[] = []

  try {
    const r1 = await supabase.from('user_profiles').select('id, display_name, user_type, onboarding_completed, is_admin')
    if (r1.error) errors.push('profiles: ' + r1.error.message)
    else profiles = r1.data
  } catch (e: unknown) {
    errors.push('profiles crash: ' + String(e))
  }

  try {
    const r2 = await supabase.rpc('debug_auth_users' as never)
    if ((r2 as { error: { message: string } | null }).error) errors.push('auth_users: ' + ((r2 as { error: { message: string } }).error?.message ?? 'unknown'))
    else authUsers = (r2 as { data: unknown }).data
  } catch (e: unknown) {
    errors.push('auth_users crash: ' + String(e))
  }

  try {
    const r3 = await supabase.rpc('debug_signup_check' as never)
    if ((r3 as { error: { message: string } | null }).error) errors.push('signup_check: ' + ((r3 as { error: { message: string } }).error?.message ?? 'unknown'))
    else signupCheck = (r3 as { data: unknown }).data
  } catch (e: unknown) {
    errors.push('signup_check crash: ' + String(e))
  }

  return (
    <div className="p-8 font-mono text-sm max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Debug: Auth State</h1>
      
      {errors.length > 0 && (
        <section>
          <h2 className="font-bold mb-2 text-red-600">Errors</h2>
          {errors.map((e, i) => <p key={i} className="text-red-500">{e}</p>)}
        </section>
      )}

      <section>
        <h2 className="font-bold mb-2">auth.users</h2>
        <pre className="bg-gray-100 p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(authUsers, null, 2)}</pre>
      </section>

      <section>
        <h2 className="font-bold mb-2">user_profiles</h2>
        <pre className="bg-gray-100 p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(profiles, null, 2)}</pre>
      </section>

      <section>
        <h2 className="font-bold mb-2">Signup Check</h2>
        <pre className="bg-gray-100 p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(signupCheck, null, 2)}</pre>
      </section>
    </div>
  )
}
