import { getAdminStats } from '@/lib/actions/admin-stats'
import { StatsClient } from './stats-client'

export const metadata = { title: 'Admin — Stats' }

export default async function AdminStatsPage() {
  const stats = await getAdminStats()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Statistics</h1>

      <StatsClient stats={stats} />
    </div>
  )
}
