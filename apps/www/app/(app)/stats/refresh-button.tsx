'use client'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RefreshStatsButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stats/calculate', { method: 'POST' })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Calculating...' : 'Refresh Stats'}
    </button>
  )
}
