'use client'

import { createContext, useContext } from 'react'

export interface TierData {
  tier: string
  features: string[]
  limits: Record<string, number>
}

const TierContext = createContext<TierData>({
  tier: 'collector',
  features: [],
  limits: {},
})

export const TierProvider = TierContext.Provider

/**
 * Check if the current user has a specific feature.
 */
export function useFeature(feature: string): boolean {
  const { features } = useContext(TierContext)
  return features.includes(feature)
}

/**
 * Get a specific limit for the current user.
 * Returns the numeric limit (0 = none).
 */
export function useTierLimit(limitKey: string): number {
  const { limits } = useContext(TierContext)
  return limits[limitKey] ?? 0
}

/**
 * Get the current user's effective tier.
 */
export function useTier(): string {
  const { tier } = useContext(TierContext)
  return tier
}

/**
 * Get all tier data at once.
 */
export function useTierData(): TierData {
  return useContext(TierContext)
}
