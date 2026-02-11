'use client'

import { TierProvider, type TierData } from '@/lib/hooks/use-tier'
import type { ReactNode } from 'react'

export function TierProviderWrapper({ 
  tierData, 
  children 
}: { 
  tierData: TierData
  children: ReactNode 
}) {
  return (
    <TierProvider value={tierData}>
      {children}
    </TierProvider>
  )
}
