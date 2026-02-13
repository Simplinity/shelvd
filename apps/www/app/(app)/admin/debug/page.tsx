import { createClient } from '@/lib/supabase/server'
import { ResetOnboardingButton } from './reset-button'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, display_name, user_type, onboarding_completed, is_admin')

  return (
    <div className="p-8 font-mono text-sm max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Debug: Auth State</h1>

      <section>
        <h2 className="font-bold mb-4">user_profiles ({profiles?.length ?? 0})</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Display</th>
              <th>User Type</th>
              <th>Onboarded</th>
              <th>Admin</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map(p => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.display_name}</td>
                <td>{p.user_type ?? '—'}</td>
                <td>{p.onboarding_completed ? '✅' : '❌'}</td>
                <td>{p.is_admin ? '✅' : '—'}</td>
                <td>
                  <ResetOnboardingButton userId={p.id} name={p.display_name ?? 'user'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
