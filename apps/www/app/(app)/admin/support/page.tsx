import { createClient } from '@/lib/supabase/server'
import { getAllFeedback } from '@/lib/actions/feedback'
import { AdminSupportClient } from './support-client'

export const metadata = { title: 'Admin — Support' }

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; priority?: string; ticket?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: feedback } = await getAllFeedback({
    type: params.type,
    status: params.status,
    priority: params.priority,
  })

  // Get user emails via RPC (same as admin page)
  let emailMap: Record<string, string> = {}
  try {
    const { data } = await supabase.rpc('get_users_for_admin')
    data?.forEach((u: any) => {
      emailMap[u.id] = u.email
    })
  } catch {}

  // Counts for filter badges
  const { data: allFeedback } = await getAllFeedback()
  const counts = {
    total: allFeedback?.length || 0,
    new: allFeedback?.filter((f: any) => f.status === 'new').length || 0,
    acknowledged: allFeedback?.filter((f: any) => f.status === 'acknowledged').length || 0,
    in_progress: allFeedback?.filter((f: any) => f.status === 'in_progress').length || 0,
    bug: allFeedback?.filter((f: any) => f.type === 'bug').length || 0,
    contact: allFeedback?.filter((f: any) => f.type === 'contact').length || 0,
    callback: allFeedback?.filter((f: any) => f.type === 'callback').length || 0,
  }

  return (
    <AdminSupportClient
      feedback={feedback || []}
      emailMap={emailMap}
      counts={counts}
      filters={params}
      initialTicketId={params.ticket}
    />
  )
}
