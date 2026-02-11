import { createClient } from '@/lib/supabase/server'
import { getCodeRedemptions } from '@/lib/actions/invite-codes'
import Link from 'next/link'
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import { CodeDetailClient } from './code-detail-client'

export default async function InviteCodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch code
  const { data: code, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !code) return notFound()

  // Fetch redemptions
  const { data: redemptions } = await getCodeRedemptions(id)

  // Stats
  const totalBooks = redemptions.reduce((sum, r) => sum + (r.book_count || 0), 0)
  const activeUsers = redemptions.filter(r => r.user_status === 'active').length

  const signupUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shelvd.org'}/signup?code=${code.code}`

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/admin/invite-codes"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3 h-3" />
        All Invite Codes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-mono">{code.code}</h1>
          {code.label && <p className="text-sm text-muted-foreground mt-1">{code.label}</p>}
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${
          code.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {code.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-8">
        <Stat label="Redemptions" value={code.times_used} max={code.max_uses} />
        <Stat label="Active Users" value={activeUsers} />
        <Stat label="Total Books" value={totalBooks} />
        <Stat
          label="Benefit"
          text={
            code.benefit_type === 'lifetime_free' ? 'Lifetime free' :
            code.benefit_type === 'trial_days' ? `${code.benefit_days}d trial` :
            'None'
          }
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border p-4 space-y-3">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">Details</h3>
          <Detail label="Source Type" value={code.source_type} />
          <Detail label="Source Name" value={code.source_name || '—'} />
          <Detail label="Created" value={new Date(code.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
          {code.expires_at && (
            <Detail label="Expires" value={new Date(code.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
          )}
        </div>

        <div className="border p-4 space-y-3">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">Signup Link</h3>
          <CodeDetailClient signupUrl={signupUrl} />
          <p className="text-xs text-muted-foreground">Share this link with the source. The code will be pre-filled on the signup form.</p>
        </div>
      </div>

      {/* Redemptions */}
      <div>
        <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
          Redemptions ({redemptions.length})
        </h3>

        {redemptions.length > 0 ? (
          <div className="border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">User</th>
                  <th className="text-left px-3 py-2 font-medium">Redeemed</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium w-20">Books</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {redemptions.map(r => (
                  <tr key={r.user_id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2 text-xs font-medium">{r.user_email}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                      {new Date(r.redeemed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 ${
                        r.user_status === 'active' ? 'bg-green-100 text-green-800' :
                        r.user_status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {r.user_status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs tabular-nums font-medium">{r.book_count}</td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/users/${r.user_id}`}>
                        <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No one has used this code yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, max, text }: { label: string; value?: number; max?: number | null; text?: string }) {
  return (
    <div className="bg-background p-5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      {text ? (
        <p className="text-lg font-light">{text}</p>
      ) : (
        <p className="text-3xl font-light tabular-nums">
          {value}
          {max != null && <span className="text-sm text-muted-foreground"> / {max}</span>}
        </p>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
