import { getAdminStats } from '@/lib/actions/admin-stats'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { StatsClient } from './stats-client'

export default async function AdminStatsPage() {
  const stats = await getAdminStats()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">System Statistics</h1>
      </div>

      <StatsClient stats={stats} />
    </div>
  )
}
