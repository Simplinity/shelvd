'use client'

import { useState, useTransition } from 'react'
import { toggleTierFeature, updateTierLimit } from '@/lib/actions/tiers'
import { TIER_NAMES, FEATURE_LABELS } from '@/lib/tier-config'
import { Check, X, Loader2 } from 'lucide-react'

const TIERS = ['collector', 'collector_pro', 'dealer'] as const

interface Feature {
  id: string
  tier: string
  feature: string
  enabled: boolean
}

interface Limit {
  id: string
  tier: string
  limit_key: string
  limit_value: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0'
  if (bytes < 0) return 'Unlimited'
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return `${gb} GB`
  const mb = bytes / (1024 * 1024)
  return `${mb} MB`
}

function formatLimit(key: string, value: number): string {
  if (value === -1) return '∞'
  if (key === 'storage_bytes' || key === 'bandwidth_bytes_mo') return formatBytes(value)
  return value.toLocaleString()
}

export function TiersClient({
  initialFeatures,
  initialLimits,
}: {
  initialFeatures: Feature[]
  initialLimits: Limit[]
}) {
  const [features, setFeatures] = useState(initialFeatures)
  const [limits, setLimits] = useState(initialLimits)
  const [loadingCell, setLoadingCell] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Get all unique feature slugs, sorted
  const allFeatures = [...new Set(features.map(f => f.feature))].sort()

  // Build lookup: tier+feature → enabled
  const featureMap = new Map<string, boolean>()
  for (const f of features) {
    featureMap.set(`${f.tier}:${f.feature}`, f.enabled)
  }

  // Build lookup: tier+limit_key → limit_value
  const limitMap = new Map<string, number>()
  for (const l of limits) {
    limitMap.set(`${l.tier}:${l.limit_key}`, Number(l.limit_value))
  }

  const allLimitKeys = [...new Set(limits.map(l => l.limit_key))].sort()

  function handleToggle(tier: string, feature: string) {
    const key = `${tier}:${feature}`
    const current = featureMap.get(key)
    if (current === undefined) return // feature not assigned to this tier

    const newEnabled = !current
    setLoadingCell(key)

    startTransition(async () => {
      const result = await toggleTierFeature(tier, feature, newEnabled)
      if (result.success) {
        setFeatures(prev =>
          prev.map(f =>
            f.tier === tier && f.feature === feature
              ? { ...f, enabled: newEnabled }
              : f
          )
        )
      }
      setLoadingCell(null)
    })
  }

  function handleLimitEdit(tier: string, limitKey: string) {
    const key = `${tier}:${limitKey}`
    const current = limitMap.get(key) ?? 0
    const input = prompt(`New value for ${limitKey} (${TIER_NAMES[tier]}).\n-1 = unlimited, 0 = none.\nCurrent: ${formatLimit(limitKey, current)}`, String(current))
    if (input === null) return

    const newValue = parseInt(input, 10)
    if (isNaN(newValue)) return

    setLoadingCell(`limit:${key}`)
    startTransition(async () => {
      const result = await updateTierLimit(tier, limitKey, newValue)
      if (result.success) {
        setLimits(prev =>
          prev.map(l =>
            l.tier === tier && l.limit_key === limitKey
              ? { ...l, limit_value: newValue }
              : l
          )
        )
      }
      setLoadingCell(null)
    })
  }

  return (
    <div className="space-y-10">
      {/* Feature Matrix */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Feature Matrix</h2>
        <div className="border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold min-w-[200px]">Feature</th>
                {TIERS.map(tier => (
                  <th key={tier} className="text-center p-3 font-semibold min-w-[140px]">
                    {TIER_NAMES[tier]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map(feature => (
                <tr key={feature} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <span className="font-medium">{FEATURE_LABELS[feature] || feature}</span>
                    <span className="block text-[11px] text-muted-foreground font-mono">{feature}</span>
                  </td>
                  {TIERS.map(tier => {
                    const key = `${tier}:${feature}`
                    const exists = featureMap.has(key)
                    const enabled = featureMap.get(key) ?? false
                    const loading = loadingCell === key

                    return (
                      <td key={tier} className="p-3 text-center">
                        {!exists ? (
                          <span className="text-muted-foreground/30">—</span>
                        ) : loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggle(tier, feature)}
                            className={`inline-flex items-center justify-center w-8 h-8 transition-colors ${
                              enabled
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-50 text-red-400 hover:bg-red-100'
                            }`}
                          >
                            {enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click a cell to toggle. <span className="text-green-700">✓</span> = enabled, <span className="text-red-400">✕</span> = disabled, — = not assigned to tier.
        </p>
      </section>

      {/* Limits */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Tier Limits</h2>
        <div className="border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold min-w-[200px]">Limit</th>
                {TIERS.map(tier => (
                  <th key={tier} className="text-center p-3 font-semibold min-w-[140px]">
                    {TIER_NAMES[tier]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allLimitKeys.map(limitKey => (
                <tr key={limitKey} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <span className="font-medium capitalize">{limitKey.replace(/_/g, ' ')}</span>
                    <span className="block text-[11px] text-muted-foreground font-mono">{limitKey}</span>
                  </td>
                  {TIERS.map(tier => {
                    const key = `${tier}:${limitKey}`
                    const value = limitMap.get(key) ?? 0
                    const loading = loadingCell === `limit:${key}`

                    return (
                      <td key={tier} className="p-3 text-center">
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleLimitEdit(tier, limitKey)}
                            className="text-sm font-mono hover:bg-muted px-2 py-1 transition-colors tabular-nums"
                            title="Click to edit"
                          >
                            {formatLimit(limitKey, value)}
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click a value to edit. Use -1 for unlimited, 0 for none.
        </p>
      </section>
    </div>
  )
}
