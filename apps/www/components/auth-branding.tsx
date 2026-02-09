'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { PublicStats } from '@/lib/actions/public-stats'

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current || value === 0) return
    hasAnimated.current = true

    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <span ref={ref}>{display.toLocaleString()}</span>
}

function GridLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
      {/* Horizontal rules */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={`h${i}`} className="absolute left-0 right-0 h-px bg-current" style={{ top: `${(i + 1) * 5}%` }} />
      ))}
      {/* Vertical rules */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={`v${i}`} className="absolute top-0 bottom-0 w-px bg-current" style={{ left: `${(i + 1) * 8.33}%` }} />
      ))}
    </div>
  )
}

const QUOTES = [
  { text: 'A room without books is like a body without a soul.', author: 'Cicero' },
  { text: 'I have always imagined that Paradise will be a kind of library.', author: 'Jorge Luis Borges' },
  { text: 'Books are a uniquely portable magic.', author: 'Stephen King' },
  { text: 'A book is a dream that you hold in your hand.', author: 'Neil Gaiman' },
  { text: 'The only thing that you absolutely have to know, is the location of the library.', author: 'Albert Einstein' },
]

export function AuthBranding({ stats }: { stats: PublicStats }) {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)

  useEffect(() => {
    // Pick a random starting quote
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIndex(prev => (prev + 1) % QUOTES.length)
        setQuoteVisible(true)
      }, 600)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const quote = QUOTES[quoteIndex]

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-12 xl:p-16 2xl:p-20 relative overflow-hidden">
      <GridLines />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 relative z-10">
        <div className="w-11 h-11 bg-background flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight">Shelvd</span>
      </Link>

      {/* Center: Stats as giant Swiss typography */}
      <div className="relative z-10 -my-8">
        {/* Primary stat — hero number */}
        <div className="mb-12">
          <p className="text-[8rem] xl:text-[10rem] 2xl:text-[12rem] font-black leading-[0.85] tracking-tighter tabular-nums">
            <AnimatedNumber value={stats.totalBooks} duration={2400} />
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-0.5 bg-background/40" />
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-background/60">Books cataloged</p>
          </div>
        </div>

        {/* Secondary stats — Swiss grid row */}
        <div className="grid grid-cols-3 gap-8 xl:gap-12">
          <div>
            <p className="text-4xl xl:text-5xl font-bold tracking-tight tabular-nums leading-none">
              <AnimatedNumber value={stats.totalContributors} duration={1800} />
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50 mt-2">Contributors</p>
          </div>
          <div>
            <p className="text-4xl xl:text-5xl font-bold tracking-tight tabular-nums leading-none">
              <AnimatedNumber value={stats.totalImages} duration={2000} />
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50 mt-2">Images</p>
          </div>
          <div>
            <p className="text-4xl xl:text-5xl font-bold tracking-tight tabular-nums leading-none">
              <AnimatedNumber value={stats.totalCollections} duration={1600} />
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50 mt-2">Collections</p>
          </div>
        </div>
      </div>

      {/* Bottom: rotating quote */}
      <div className="relative z-10">
        <div className="border-t border-background/10 pt-6">
          <div className={`transition-all duration-500 ${quoteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <p className="text-sm leading-relaxed text-background/70 italic max-w-md">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-xs text-background/40 mt-2 font-medium tracking-wide">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
