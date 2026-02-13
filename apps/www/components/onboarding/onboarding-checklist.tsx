'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, CheckCircle2, Circle } from 'lucide-react'
import { dismissOnboarding } from '@/lib/actions/onboarding'
import type { ChecklistStep } from '@/lib/actions/onboarding-checklist'

interface Props {
  steps: ChecklistStep[]
}

export function OnboardingChecklist({ steps }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [dismissing, setDismissing] = useState(false)

  if (dismissed) return null

  const completed = steps.filter(s => s.done).length
  const total = steps.length
  const allDone = completed === total
  const pct = Math.round((completed / total) * 100)

  async function handleDismiss() {
    setDismissing(true)
    await dismissOnboarding()
    setDismissed(true)
  }

  return (
    <div className="border border-border bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Getting Started</h3>
          <span className="text-xs font-mono text-muted-foreground">{completed}/{total}</span>
        </div>
        <button
          onClick={handleDismiss}
          disabled={dismissing}
          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          title="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted/40">
        <div
          className={`h-full transition-all duration-500 ${allDone ? 'bg-green-600' : 'bg-foreground'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="divide-y divide-border">
        {steps.map(step => (
          <Link
            key={step.key}
            href={step.href}
            className={`flex items-start gap-3 px-4 py-3 transition-colors ${
              step.done
                ? 'opacity-50'
                : 'hover:bg-muted/30'
            }`}
          >
            {step.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm ${step.done ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                {step.label}
              </p>
              {!step.done && (
                <p className="text-xs text-muted-foreground italic mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* All done message */}
      {allDone && (
        <div className="px-4 py-3 border-t border-border bg-green-50">
          <p className="text-xs text-green-700 font-medium">
            All done! You're ready to catalog. 🎉
          </p>
          <button
            onClick={handleDismiss}
            className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
          >
            Hide this checklist
          </button>
        </div>
      )}
    </div>
  )
}
