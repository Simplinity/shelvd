'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Users, MessageSquare, Activity, Ticket, BarChart3, Layers, ArrowLeft } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: Shield, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/support', label: 'Support', icon: MessageSquare, badgeKey: 'support' as const },
  { href: '/admin/invite-codes', label: 'Invite Codes', icon: Ticket },
  { href: '/admin/tiers', label: 'Tiers', icon: Layers },
  { href: '/admin/activity', label: 'Activity', icon: Activity },
  { href: '/admin/stats', label: 'Statistics', icon: BarChart3 },
]

export function AdminSidebar({ badges }: { badges: { support?: number } }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile: horizontal scrollable bar */}
      <nav className="md:hidden flex items-center gap-1 px-3 py-2 bg-red-50/60 border-b border-red-200/60 overflow-x-auto">
        <Link
          href="/books"
          className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-red-900/40 hover:text-red-900/70 flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href, item.exact)
          const badge = item.badgeKey ? badges[item.badgeKey] : undefined
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs flex-shrink-0 transition-colors ${
                active
                  ? 'bg-red-600 text-white font-medium'
                  : 'text-red-900/60 hover:text-red-900 hover:bg-red-100/60'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{item.label}</span>
              {badge !== undefined && badge > 0 && (
                <span className={`min-w-[18px] h-4 flex items-center justify-center text-[10px] font-bold px-1 ${
                  active ? 'bg-white/20 text-white' : 'bg-red-600 text-white'
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Desktop: vertical sidebar (unchanged) */}
      <aside className="hidden md:flex w-[200px] bg-red-50/60 border-r border-red-200/60 flex-col h-full">
        {/* Admin branding */}
        <div className="px-6 pt-6 pb-5 border-b border-red-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-red-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-900/70">Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href, item.exact)
            const badge = item.badgeKey ? badges[item.badgeKey] : undefined

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 text-[13px] transition-colors
                  ${active
                    ? 'bg-red-600 text-white font-medium'
                    : 'text-red-900/60 hover:text-red-900 hover:bg-red-100/60'
                  }
                `}
              >
                <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{item.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className={`ml-auto min-w-[20px] h-5 flex items-center justify-center text-[11px] font-bold px-1.5 ${
                    active ? 'bg-white/20 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Back to app */}
        <div className="px-6 py-4 border-t border-red-200/60">
          <Link
            href="/books"
            className="flex items-center gap-2 text-[12px] text-red-900/40 hover:text-red-900/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Back to Library</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
