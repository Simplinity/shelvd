'use client'

import { useEffect, useState } from 'react'
import { getChecklistSteps, type ChecklistStep } from '@/lib/actions/onboarding-checklist'
import { getNudgeData } from '@/lib/actions/onboarding'
import { X } from 'lucide-react'
import Link from 'next/link'

const SESSION_KEY = 'shelvd_nudge_shown'

export function ReturningUserNudge() {
  const [step, setStep] = useState<ChecklistStep | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem(SESSION_KEY)) return

    async function check() {
      try {
        // Check if there are incomplete steps
        const steps = await getChecklistSteps()
        if (!steps) return // completed or dismissed

        const nextStep = steps.find(s => !s.done)
        if (!nextStep) return // all done

        // Check if 3+ days since last activity
        const nudge = await getNudgeData()
        if (!nudge || nudge.daysSinceLastActivity < 3) return

        setStep(nextStep)
        setVisible(true)
        sessionStorage.setItem(SESSION_KEY, '1')

        // Auto-dismiss after 8 seconds
        setTimeout(() => setVisible(false), 8000)
      } catch {
        // Silently fail
      }
    }

    check()
  }, [])

  if (!visible || !step) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300">
      <div className="bg-background border border-border shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              Welcome back. You left off at{' '}
              <Link
                href={step.href}
                className="font-medium underline underline-offset-2 hover:text-foreground/80"
                onClick={() => setVisible(false)}
              >
                {step.label.toLowerCase()}
              </Link>
              . Pick up where you left off?
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
