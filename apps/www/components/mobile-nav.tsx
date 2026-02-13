'use client'

import { useState } from 'react'
import { Menu, X, BookOpen } from 'lucide-react'
import { APP_VERSION } from '@/lib/changelog'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-600 hover:text-black transition-colors"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">Shelvd</span>
            <span className="text-[9px] text-muted-foreground font-mono mt-1">v{APP_VERSION}</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-gray-600 hover:text-black transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content placeholder */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground">Navigation links coming next</p>
        </div>
      </div>
    </div>
  )
}
