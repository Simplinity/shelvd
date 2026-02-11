'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Users, MessageSquare, BarChart3, ArrowLeft } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: Shield, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/support', label: 'Support', icon: MessageSquare, badgeKey: 'support' as const },
  { href: '/admin/stats', label: 'Statistics', icon: BarChart3 },
]

export function AdminSidebar({ badges }: { badges: { support?: number } }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-[200px] border-r border-border bg-background flex flex-col h-full">
      {/* Admin branding */}
      <div className="px-6 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-foreground flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-background" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">Admin</span>
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
                flex items-center gap-3 px-3 py-2 text-[13px] transition-colors relative
                ${active
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {badge !== undefined && badge > 0 && (
                <span className={`ml-auto min-w-[20px] h-5 flex items-center justify-center text-[11px] font-bold px-1.5 ${
                  active ? 'bg-red-500 text-white' : 'bg-red-600 text-white'
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Back to app */}
      <div className="px-6 py-4 border-t border-border">
        <Link
          href="/books"
          className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </Link>
      </div>
    </aside>
  )
}
