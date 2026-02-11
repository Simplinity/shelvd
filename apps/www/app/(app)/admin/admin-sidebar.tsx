'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Users, MessageSquare, BarChart3, Megaphone, ArrowLeft } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: Shield, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/support', label: 'Support', icon: MessageSquare, badgeKey: 'support' as const },
  { href: '/admin/stats', label: 'Stats', icon: BarChart3 },
]

export function AdminSidebar({ badges }: { badges: { support?: number } }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="border-r border-border bg-background flex flex-col h-full">
      {/* Nav items */}
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href, item.exact)
          const badge = item.badgeKey ? badges[item.badgeKey] : undefined
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-5 py-2.5 text-sm transition-colors relative
                ${active
                  ? 'text-foreground font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:bg-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="ml-auto hidden md:flex min-w-[20px] h-5 items-center justify-center bg-red-600 text-white text-[11px] font-bold px-1.5">
                  {badge}
                </span>
              )}
              {/* Mobile badge dot */}
              {badge !== undefined && badge > 0 && (
                <span className="md:hidden absolute top-1.5 right-3 w-2 h-2 bg-red-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Back to app */}
      <div className="border-t border-border p-4">
        <Link
          href="/books"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Back to App</span>
        </Link>
      </div>
    </aside>
  )
}
