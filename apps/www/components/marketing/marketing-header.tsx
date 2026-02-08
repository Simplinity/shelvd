'use client'

import { BookOpen, ChevronDown, Shield, FileText, User, Newspaper, Map, PenLine } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const infoPages = [
  { href: '/privacy', label: 'Privacy Policy', icon: Shield, description: 'How we handle your data' },
  { href: '/terms', label: 'Terms of Service', icon: FileText, description: 'The fine print' },
  { href: '/about', label: 'About Shelvd', icon: User, description: 'The story behind the shelves' },
  { href: '/changelog', label: 'Changelog', icon: Newspaper, description: 'What we\'ve been building' },
  { href: '/roadmap', label: 'Roadmap', icon: Map, description: 'Where we\'re headed', comingSoon: true },
  { href: '/blog', label: 'Blog', icon: PenLine, description: 'Notes on books & collecting', comingSoon: true },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <header className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-9 h-9 bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight uppercase">Shelvd</span>
        </Link>
      </div>
      <nav className="flex items-center gap-1 sm:gap-4">
        {/* Info Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Info
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Panel */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-background border shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                {infoPages.map((page) => {
                  const Icon = page.icon
                  if (page.comingSoon) {
                    return (
                      <div
                        key={page.href}
                        className="flex items-start gap-3 p-3 opacity-40 cursor-default"
                      >
                        <div className="w-8 h-8 bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{page.label}</p>
                          <p className="text-[11px] text-muted-foreground">{page.description}</p>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{page.label}</p>
                        <p className="text-[11px] text-muted-foreground">{page.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <div className="border-t px-4 py-2.5 bg-muted/20">
                <p className="text-[10px] text-muted-foreground text-center">
                  More pages coming soon
                </p>
              </div>
            </div>
          )}
        </div>

        <Link 
          href="/login" 
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
        <Button asChild size="sm">
          <Link href="/signup">
            Get Started
          </Link>
        </Button>
      </nav>
    </header>
  )
}
