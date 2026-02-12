'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Settings, MessageSquare, Shield, LogOut, ChevronDown, User, PenLine, Map, Newspaper } from 'lucide-react'
import { logout } from '@/lib/actions/auth'

interface UserMenuProps {
  email: string
  isAdmin: boolean
}

export function UserMenu({ email, isAdmin }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-gray-500 hover:text-black transition-colors group"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <User className="w-4 h-4" strokeWidth={1.75} />
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border shadow-lg z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium truncate">{email}</p>
          </div>

          {/* App items */}
          <div className="py-1">
            <MenuLink href="/settings" icon={<Settings className="w-3.5 h-3.5" />} onClick={() => setOpen(false)}>
              Settings
            </MenuLink>
            <MenuLink href="/support" icon={<MessageSquare className="w-3.5 h-3.5" />} onClick={() => setOpen(false)}>
              Support
            </MenuLink>
          </div>

          {/* Info pages */}
          <div className="border-t py-1">
            <MenuLink href="/blog" icon={<PenLine className="w-3.5 h-3.5" />} onClick={() => setOpen(false)}>
              Blog
            </MenuLink>
            <MenuLink href="/roadmap" icon={<Map className="w-3.5 h-3.5" />} onClick={() => setOpen(false)}>
              Roadmap
            </MenuLink>
            <MenuLink href="/changelog" icon={<Newspaper className="w-3.5 h-3.5" />} onClick={() => setOpen(false)}>
              Changelog
            </MenuLink>
          </div>

          {/* Admin */}
          {isAdmin && (
            <div className="border-t py-1">
              <MenuLink href="/admin" icon={<Shield className="w-3.5 h-3.5" />} onClick={() => setOpen(false)} accent>
                Admin
              </MenuLink>
            </div>
          )}

          {/* Sign out */}
          <div className="border-t">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-muted/50 hover:text-black transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({ href, icon, children, onClick, accent }: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        accent
          ? 'text-red-600 hover:bg-red-50 hover:text-red-800'
          : 'text-gray-600 hover:bg-muted/50 hover:text-black'
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}
