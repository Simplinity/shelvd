'use client'

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
 * Can be used standalone or as the default fallback in FeatureGate.
 */
export function UpgradeHint({ feature }: { feature: string }) {
  const minTier = FEATURE_MIN_TIER[feature]
  const tierName = minTier ? TIER_NAMES[minTier] : 'Collector Pro'
  const tierPrice = minTier ? TIER_PRICES[minTier] : '€9.99/mo'
  const featureLabel = FEATURE_LABELS[feature] || feature

  return (
    <div className="border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 bg-muted rounded-full mb-3">
        <Lock className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="font-semibold text-sm mb-1">{featureLabel}</p>
      <p className="text-xs text-muted-foreground mb-4">
        Available on <span className="font-semibold text-foreground">{tierName}</span> ({tierPrice})
      </p>
      <Link
        href="/settings#membership"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
      >
        Upgrade <ArrowRight className="ml-1 w-3 h-3" />
      </Link>
    </div>
  )
}

/**
 * Inline upgrade hint — smaller, for use inside buttons or rows.
 * Shows a lock icon + tier name on click.
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
 * Shows a warning or blocks action when limit is reached.
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

  // Under limit — show children
  if (currentCount < limit) return <>{children}</>

  // At or over limit
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
  return (
    <div className="border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center">
      <p className="font-semibold text-sm mb-1">
        Limit reached
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        You've used {currentCount} of {limit.toLocaleString()} {limitKey === 'max_books' ? 'books' : limitKey === 'max_tags' ? 'tags' : 'items'}.
        Upgrade to add more.
      </p>
      <Link
        href="/settings#membership"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
      >
        Upgrade <ArrowRight className="ml-1 w-3 h-3" />
      </Link>
    </div>
  )
}
