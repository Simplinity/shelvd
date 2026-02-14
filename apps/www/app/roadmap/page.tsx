import { ArrowLeft, Map, CheckCircle2, Compass } from 'lucide-react'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { ROADMAP, categoryConfig } from '@/lib/roadmap'
import type { Metadata } from 'next'
import type { RoadmapStatus } from '@/lib/roadmap'

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'Where we\'ve been, where we are, and where we\'re going. A public record of ambition.',
  openGraph: {
    title: 'Roadmap — Shelvd',
    description: 'Where we\'ve been, where we are, and where we\'re going. A public record of ambition.',
    url: '/roadmap',
  },
}

const laneConfig: Record<RoadmapStatus, { 
  title: string; subtitle: string; icon: typeof CheckCircle2; accent: string; cardBorder: string 
}> = {
  shipped: { 
    title: 'Shipped', 
    subtitle: 'Built, tested, and in your hands.',
    icon: CheckCircle2,
    accent: 'text-emerald-600',
    cardBorder: 'border-l-emerald-500',
  },
  building: { 
    title: 'Building', 
    subtitle: 'Currently being argued about.',
    icon: CheckCircle2,
    accent: 'text-amber-600',
    cardBorder: 'border-l-amber-500',
  },
  planned: { 
    title: 'Planned', 
    subtitle: 'On the list. Genuinely.',
    icon: Compass,
    accent: 'text-blue-600',
    cardBorder: 'border-l-blue-500',
  },
}

export default function RoadmapPage() {
  const shipped = ROADMAP.filter(i => i.status === 'shipped')
  const building = ROADMAP.filter(i => i.status === 'building')
  const planned = ROADMAP.filter(i => i.status === 'planned')

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Roadmap</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Where we&apos;re going
          </h1>
          <p className="text-muted-foreground italic text-lg max-w-2xl">
            A public record of what we&apos;ve built, what we&apos;re building, and what we plan to build next. 
            No vague promises, no &ldquo;Q3 2027&rdquo; timelines, no features that exist only in a pitch deck.
          </p>
          <div className="w-16 h-1 bg-primary mt-8" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-6">
            <StatBadge count={shipped.length} label="shipped" color="text-emerald-600" />
            {building.length > 0 && (
              <StatBadge count={building.length} label="building" color="text-amber-600" />
            )}
            <StatBadge count={planned.length} label="planned" color="text-blue-600" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>·</span>
              <span>Updated {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Planned — show first, it's what people care about */}
      <article className="px-6 pb-24">
        <div className="max-w-5xl mx-auto space-y-20">
          <RoadmapLane status="planned" items={planned} />
          {building.length > 0 && (
            <RoadmapLane status="building" items={building} />
          )}
          <RoadmapLane status="shipped" items={shipped} />
        </div>

        {/* Closing */}
        <div className="max-w-5xl mx-auto mt-20 pt-8 border-t">
          <div className="max-w-2xl">
            <h3 className="font-bold mb-2">Missing something?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This roadmap is shaped by what collectors actually need — which is to say, by the problems 
              we encounter while cataloging our own books. If you have a feature request, a complaint, 
              or a strong opinion about metadata standards, we&apos;d love to hear it via our{' '}
              <Link href="/support" className="text-primary hover:underline">support page</Link>.
              We read everything. It&apos;s a compulsion.
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic mt-8">
            This roadmap represents our current intentions, not contractual obligations. 
            Features may shift in priority based on user feedback, technical constraints, 
            or the discovery that something is harder than we thought. Which happens more often than we&apos;d like.
          </p>
        </div>
      </article>

      <MarketingFooter />
    </main>
  )
}

/* ═══════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════ */

function StatBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-2xl font-bold font-mono ${color}`}>{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function RoadmapLane({ status, items }: { status: RoadmapStatus; items: typeof ROADMAP }) {
  const config = laneConfig[status]
  const Icon = config.icon

  return (
    <section>
      {/* Lane header */}
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${config.accent}`} />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{config.title}</h2>
        <span className="text-sm text-muted-foreground font-mono">({items.length})</span>
      </div>
      <p className="text-sm text-muted-foreground italic mb-8 ml-8">{config.subtitle}</p>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => {
          const cat = categoryConfig[item.category]
          return (
            <div 
              key={item.title} 
              className={`p-5 bg-background border border-l-4 ${config.cardBorder} hover:bg-muted/20 transition-colors`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-sm leading-snug">{item.title}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex-shrink-0 ${cat.color}`}>
                  {cat.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              {item.version && (
                <p className="text-[11px] text-muted-foreground/60 font-mono mt-3">
                  Shipped in {item.version}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
