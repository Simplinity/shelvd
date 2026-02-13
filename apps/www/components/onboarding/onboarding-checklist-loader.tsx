'use client'

import { useState, useEffect } from 'react'
import { getChecklistSteps } from '@/lib/actions/onboarding-checklist'
import { OnboardingChecklist } from './onboarding-checklist'
import type { ChecklistStep } from '@/lib/actions/onboarding-checklist'

export function OnboardingChecklistLoader() {
  const [steps, setSteps] = useState<ChecklistStep[] | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getChecklistSteps().then(result => {
      setSteps(result)
      setLoaded(true)
    })
  }, [])

  if (!loaded || !steps || steps.length === 0) return null

  return (
    <div className="mb-6">
      <OnboardingChecklist steps={steps} />
    </div>
  )
}
