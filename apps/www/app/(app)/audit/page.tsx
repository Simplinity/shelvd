import { getCollectionAudit } from '@/lib/actions/audit'
import { logActivity } from '@/lib/actions/activity-log'
import { createClient } from '@/lib/supabase/server'
import { AuditClient } from './audit-client'

export const metadata = { title: 'Collection Audit' }

export default async function AuditPage() {
  const audit = await getCollectionAudit()

  // Log activity (fire-and-forget)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    logActivity({
      userId: user.id,
      action: 'audit.viewed',
      category: 'audit',
      metadata: { score: audit.score, totalBooks: audit.totalBooks, totalIssues: audit.totalIssues },
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AuditClient audit={audit} />
    </div>
  )
}
