import { ArrowLeft, History, Plus, Sparkles, Wrench, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { CHANGELOG, APP_VERSION } from '@/lib/changelog'
import type { ChangeType } from '@/lib/changelog'

export const metadata = {
  title: 'Changelog — Shelvd',
  description: 'What we\'ve been building. A log of every version, feature, and fix — with commentary.',
}

const typeConfig: Record<ChangeType, { label: string; color: string; icon: typeof Plus }> = {
  added: { label: 'Added', color: 'text-green-700 bg-green-100', icon: Plus },
  improved: { label: 'Improved', color: 'text-blue-700 bg-blue-100', icon: Sparkles },
  fixed: { label: 'Fixed', color: 'text-amber-700 bg-amber-100', icon: Wrench },
  removed: { label: 'Removed', color: 'text-red-700 bg-red-100', icon: Trash2 },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Changelog</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            What we&apos;ve been building
          </h1>
          <p className="text-muted-foreground italic text-lg">
            A meticulous record of every feature, fix, and questionable design decision. 
            Because if we track provenance for your books, we should track it for our code too.
          </p>
          <div className="w-16 h-1 bg-primary mt-8" />
        </div>
      </section>

      {/* Current version badge */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-muted/30 border">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Current version</span>
            <span className="font-mono font-bold text-primary">{APP_VERSION}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{CHANGELOG.length} releases in 12 days</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">325 commits</span>
          </div>
        </div>
      </section>

      {/* Releases */}
      <article className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border hidden md:block" />

            {CHANGELOG.map((release, i) => {
              const isCurrent = release.version === APP_VERSION
              const isFirst = i === 0

              return (
                <div key={release.version} className="relative mb-16 last:mb-0">
                  {/* Timeline dot */}
                  <div className={`absolute left-[16px] w-[15px] h-[15px] border-2 hidden md:block ${
                    isCurrent 
                      ? 'bg-primary border-primary' 
                      : 'bg-background border-muted-foreground/30'
                  }`} style={{ top: '6px' }} />

                  <div className="md:pl-16">
                    {/* Version header */}
                    <div className="flex flex-wrap items-baseline gap-3 mb-1">
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-mono">
                        {release.version}
                      </h2>
                      {isCurrent && isFirst && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5">
                          Latest
                        </span>
                      )}
                    </div>

                    {/* Title & meta */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold">{release.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <time className="text-xs text-muted-foreground font-mono">{formatDate(release.date)}</time>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{release.changes.length} changes</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground italic mb-6">{release.description}</p>

                    {/* Changes */}
                    <div className="space-y-2">
                      {release.changes.map((change, j) => {
                        const config = typeConfig[change.type]
                        return (
                          <div key={j} className="flex items-start gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex-shrink-0 mt-0.5 ${config.color}`}>
                              {config.label}
                            </span>
                            <p className="text-sm leading-relaxed">{change.text}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Origin story */}
          <div className="mt-16 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              Version 0.0.0 was an Excel spreadsheet. It broke on a Sunday afternoon 
              somewhere around row 2,300. The rest is history.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Want to know the full story?{' '}
              <Link href="/about" className="text-primary hover:underline">Read the About page</Link>.
            </p>
          </div>

        </div>
      </article>

      <MarketingFooter />
    </main>
  )
}
