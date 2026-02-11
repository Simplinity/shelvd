'use client'

import { useState, useTransition } from 'react'
import { toggleTierFeature, addTierFeature, removeTierFeature, updateTierLimit } from '@/lib/actions/tiers'
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

  // Build lookup: tier+feature → enabled (true) or not present (false)
  const featureOn = new Set<string>()
  for (const f of features) {
    if (f.enabled) featureOn.add(`${f.tier}:${f.feature}`)
  }

  // Build lookup: does a row exist in DB?
  const featureExists = new Set<string>()
  for (const f of features) {
    featureExists.add(`${f.tier}:${f.feature}`)
  }

  // Build lookup: tier+limit_key → limit_value
  const limitMap = new Map<string, number>()
  for (const l of limits) {
    limitMap.set(`${l.tier}:${l.limit_key}`, Number(l.limit_value))
  }

  const LIMIT_ORDER = ['max_books', 'max_tags', 'storage_bytes', 'bandwidth_bytes_mo']
  const allLimitKeys = [...new Set(limits.map(l => l.limit_key))].sort((a, b) => {
    const ia = LIMIT_ORDER.indexOf(a)
    const ib = LIMIT_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  function handleToggle(tier: string, feature: string) {
    const key = `${tier}:${feature}`
    const isOn = featureOn.has(key)
    const exists = featureExists.has(key)
    const tierName = TIER_NAMES[tier]
    const featureName = FEATURE_LABELS[feature] || feature

    const action = isOn ? 'disable' : 'enable'
    if (!confirm(`${action === 'enable' ? 'Enable' : 'Disable'} "${featureName}" for all ${tierName} users?\n\nThis takes effect immediately.`)) return

    setLoadingCell(key)

    startTransition(async () => {
      if (isOn) {
        // On → Off: disable (or remove if it was added)
        const result = await toggleTierFeature(tier, feature, false)
        if (result.success) {
          setFeatures(prev => prev.map(f =>
            f.tier === tier && f.feature === feature ? { ...f, enabled: false } : f
          ))
        }
      } else if (exists) {
        // Off → On: re-enable existing row
        const result = await toggleTierFeature(tier, feature, true)
        if (result.success) {
          setFeatures(prev => prev.map(f =>
            f.tier === tier && f.feature === feature ? { ...f, enabled: true } : f
          ))
        }
      } else {
        // Not in DB → add as enabled
        const result = await addTierFeature(tier, feature)
        if (result.success) {
          setFeatures(prev => [...prev, { id: `${tier}-${feature}`, tier, feature, enabled: true }])
        }
      }
      setLoadingCell(null)
    })
  }

  function handleLimitEdit(tier: string, limitKey: string) {
    const key = `${tier}:${limitKey}`
    const current = limitMap.get(key) ?? 0
    const tierName = TIER_NAMES[tier]
    const input = prompt(
      `New value for "${limitKey.replace(/_/g, ' ')}" (${tierName}).\n\n` +
      `0 = none.\n` +
      `Current: ${formatLimit(limitKey, current)}\n\n` +
      `This affects all ${tierName} users immediately.`,
      String(current)
    )
    if (input === null) return

    const newValue = parseInt(input, 10)
    if (isNaN(newValue)) return
    if (newValue === current) return

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
                    const isOn = featureOn.has(key)
                    const loading = loadingCell === key

                    return (
                      <td key={tier} className="p-3 text-center">
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggle(tier, feature)}
                            className={`inline-flex items-center justify-center w-8 h-8 transition-colors ${
                              isOn
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-50 text-red-400 hover:bg-red-100'
                            }`}
                          >
                            {isOn ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
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
          Click to toggle. Changes require confirmation and take effect immediately for all users on that tier.
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
          Click a value to edit. Changes require confirmation and take effect immediately.
        </p>
      </section>
    </div>
  )
}
