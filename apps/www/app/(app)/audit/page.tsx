import { getCollectionAudit } from '@/lib/actions/audit'
import { AuditClient } from './audit-client'

export default async function AuditPage() {
  const audit = await getCollectionAudit()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AuditClient audit={audit} />
    </div>
  )
}
