'use client'

import { useState } from 'react'
import { resetOnboarding } from './actions'

export function ResetOnboardingButton({ userId, name }: { userId: string; name: string }) {
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    if (!confirm(`Reset onboarding for ${name}? They'll see the wizard again.`)) return
    setLoading(true)
    await resetOnboarding(userId)
    setLoading(false)
    window.location.reload()
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="text-xs px-2 py-1 border hover:bg-gray-100 disabled:opacity-50"
    >
      {loading ? '...' : 'Reset onboarding'}
    </button>
  )
}
