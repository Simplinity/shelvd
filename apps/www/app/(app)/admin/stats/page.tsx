import { getAdminStats } from '@/lib/actions/admin-stats'
import { BarChart3, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { StatsClient } from './stats-client'

export default async function AdminStatsPage() {
  const stats = await getAdminStats()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <BarChart3 className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">System Statistics</h1>
      </div>

      <StatsClient stats={stats} />
    </div>
  )
}
