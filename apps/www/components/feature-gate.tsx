'use client'

// TODO: All upgrade links point to /#pricing as placeholder.
// Wire to Stripe checkout when payments are implemented.

import { useFeature, useTierLimit } from '@/lib/hooks/use-tier'
import { FEATURE_MIN_TIER, TIER_NAMES, TIER_PRICES, FEATURE_LABELS } from '@/lib/tier-config'
import { Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Wraps a feature that may be locked based on the user's tier.
 * If locked: shows children with an overlay + upgrade hint.
 * If unlocked: renders children normally.
 */
export function FeatureGate({
  feature,
  children,
  fallback,
}: {
  feature: string
  children: ReactNode
  /** Optional custom fallback. If not provided, uses default UpgradeHint. */
  fallback?: ReactNode
}) {
  const hasAccess = useFeature(feature)

  if (hasAccess) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return <UpgradeHint feature={feature} />
}

/**
 * Shows an upgrade prompt for a locked feature.
 */
export function UpgradeHint({ feature }: { feature: string }) {
  const minTier = FEATURE_MIN_TIER[feature]
  const tierName = minTier ? TIER_NAMES[minTier] : 'Collector Pro'
  const tierPrice = minTier ? TIER_PRICES[minTier] : '€9.99/mo'
  const featureLabel = FEATURE_LABELS[feature] || feature

  return (
    <div className="border border-border p-6 text-center">
      <Lock className="w-4 h-4 text-muted-foreground mx-auto mb-3" />
      <p className="font-semibold text-sm mb-1">{featureLabel}</p>
      <p className="text-xs text-muted-foreground mb-4">
        Available on {tierName} ({tierPrice})
      </p>
      <Link
        href="/#pricing"
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:underline"
      >
        View plans <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

/**
 * Inline upgrade hint — smaller, for use inside buttons or rows.
 */
export function UpgradeHintInline({
  feature,
  onClick,
}: {
  feature: string
  onClick?: () => void
}) {
  const minTier = FEATURE_MIN_TIER[feature]
  const tierName = minTier ? TIER_NAMES[minTier] : 'Collector Pro'

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title={`Available on ${tierName}`}
    >
      <Lock className="w-3 h-3" />
      <span>{tierName}</span>
    </button>
  )
}

/**
 * Limit gate — checks if user is at or near a numeric limit.
 */
export function LimitGate({
  limitKey,
  currentCount,
  children,
}: {
  limitKey: string
  currentCount: number
  children: ReactNode
}) {
  const limit = useTierLimit(limitKey)

  if (currentCount < limit) return <>{children}</>

  return <LimitReached limitKey={limitKey} limit={limit} currentCount={currentCount} />
}

/**
 * Shown when a user has hit their tier limit.
 */
export function LimitReached({
  limitKey,
  limit,
  currentCount,
}: {
  limitKey: string
  limit: number
  currentCount: number
}) {
  const label = limitKey === 'max_books' ? 'books' : limitKey === 'max_tags' ? 'tags' : 'items'

  return (
    <div className="border border-border p-5 text-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Limit reached</p>
      <p className="text-sm">
        <span className="font-semibold">{currentCount.toLocaleString()}</span>
        <span className="text-muted-foreground"> of </span>
        <span className="font-semibold">{limit.toLocaleString()}</span>
        <span className="text-muted-foreground"> {label}</span>
      </p>
      <Link
        href="/#pricing"
        className="inline-flex items-center gap-1 mt-3 text-xs font-semibold uppercase tracking-wide hover:underline"
      >
        View plans <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
