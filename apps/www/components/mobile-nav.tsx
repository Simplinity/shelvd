'use client'

import { useState } from 'react'
import { Menu, X, BookOpen, Plus, Upload, Search, ScanBarcode, BarChart3, Clock, ClipboardCheck, Settings, MessageSquare, Shield, LogOut, BookOpenCheck } from 'lucide-react'
import { APP_VERSION } from '@/lib/changelog'
import Link from 'next/link'

import { logout } from '@/lib/actions/auth'
import type { CollectionWithCount } from '@/lib/actions/collections'
import { Library, FolderOpen } from 'lucide-react'

export function MobileNav({ email, isAdmin, collections, totalBookCount }: {
  email: string
  isAdmin: boolean
  collections: CollectionWithCount[]
  totalBookCount: number
}) {
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
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col transform transition-transform duration-200 ease-in-out ${
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

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">

        {/* Nav links */}
        <nav className="px-2 py-3 space-y-0.5 border-b border-border">
          <Link
            href="/books"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-3 text-sm font-medium text-gray-900 hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <Library className="w-4 h-4" strokeWidth={1.75} />
              All Books
            </span>
            <span className="text-xs text-muted-foreground">{totalBookCount}</span>
          </Link>
          {collections.map(col => (
            <Link
              key={col.id}
              href={`/books?collection=${col.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-3 pl-10 text-sm text-gray-600 hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
                {col.name}
              </span>
              <span className="text-xs text-muted-foreground">{col.count}</span>
            </Link>
          ))}
          <MobileNavLink href="/books/add" icon={Plus} label="Add Book" onClick={() => setOpen(false)} />
          <MobileNavLink href="/books/import" icon={Upload} label="Import" onClick={() => setOpen(false)} />
          <MobileNavLink href="/books/search" icon={Search} label="Search" onClick={() => setOpen(false)} />
          <MobileNavLink href="/books/lookup" icon={ScanBarcode} label="Lookup" onClick={() => setOpen(false)} />
          <MobileNavLink href="/stats" icon={BarChart3} label="Stats" onClick={() => setOpen(false)} />
          <MobileNavLink href="/audit" icon={ClipboardCheck} label="Audit" onClick={() => setOpen(false)} />
          <MobileNavLink href="/activity" icon={Clock} label="Activity" onClick={() => setOpen(false)} />
        </nav>

        {/* User section */}
        <div className="px-2 py-3 space-y-0.5 border-b border-border">
          <MobileNavLink href="/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
          <MobileNavLink href="/support" icon={MessageSquare} label="Support" onClick={() => setOpen(false)} />
          <MobileNavLink href="/wiki" icon={BookOpenCheck} label="Wiki" onClick={() => setOpen(false)} />
          {isAdmin && (
            <MobileNavLink href="/admin" icon={Shield} label="Admin" onClick={() => setOpen(false)} />
          )}
        </div>

        </div>{/* end scrollable */}

        {/* Sign out + email — pinned to bottom */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground truncate mb-2">{email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-3 text-sm text-gray-600 hover:bg-muted/50 hover:text-black transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function MobileNavLink({ href, icon: Icon, label, onClick }: {
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-muted/50 hover:text-black transition-colors"
    >
      <Icon className="w-4 h-4" strokeWidth={1.75} />
      {label}
    </Link>
  )
}
