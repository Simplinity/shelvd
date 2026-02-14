import { getTierFeatures, getTierLimits } from '@/lib/actions/tiers'
import { TiersClient } from './tiers-client'

export const metadata = { title: 'Admin — Tiers' }

export default async function TiersPage() {
  const [featuresRes, limitsRes] = await Promise.all([
    getTierFeatures(),
    getTierLimits(),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Tier Management</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Control which features are available on each tier. Changes take effect immediately.
      </p>
      <TiersClient
        initialFeatures={featuresRes.data}
        initialLimits={limitsRes.data}
      />
    </div>
  )
}
