'use client'

import { useState, useEffect } from 'react'
import { X, Info, AlertTriangle, CheckCircle, Wrench } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'maintenance'
}

const typeConfig = {
  info: { bg: 'bg-blue-600', icon: Info },
  warning: { bg: 'bg-amber-500', icon: AlertTriangle },
  success: { bg: 'bg-green-600', icon: CheckCircle },
  maintenance: { bg: 'bg-gray-800', icon: Wrench },
}

export function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissed_announcements')
      if (stored) setDismissed(new Set(JSON.parse(stored)))
    } catch {}
  }, [])

  const dismiss = (id: string) => {
    const next = new Set(dismissed)
    next.add(id)
    setDismissed(next)
    try {
      localStorage.setItem('dismissed_announcements', JSON.stringify([...next]))
    } catch {}
  }

  const visible = announcements.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <>
      {visible.map(a => {
        const config = typeConfig[a.type] || typeConfig.info
        const Icon = config.icon
        return (
          <div key={a.id} className={`${config.bg} text-white`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <span className="font-semibold">{a.title}</span>
                {a.message && <span className="ml-1.5 opacity-90">— {a.message}</span>}
              </div>
              <button
                onClick={() => dismiss(a.id)}
                className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </>
  )
}
