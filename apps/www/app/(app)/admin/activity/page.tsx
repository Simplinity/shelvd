import { getActivityPageForAdmin } from '@/lib/actions/activity-log'
import { ActivityLogClient } from './activity-log-client'

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const perPage = 50
  const category = params.category || undefined
  const search = params.search || undefined

  const { data, total } = await getActivityPageForAdmin({
    limit: perPage,
    offset: (page - 1) * perPage,
    category,
    search,
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Activity Log</h1>
      <ActivityLogClient
        entries={data}
        total={total}
        page={page}
        perPage={perPage}
        currentCategory={category || ''}
        currentSearch={search || ''}
      />
    </div>
  )
}
