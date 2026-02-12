import { BookOpen, ArrowLeft, Search, Rocket, History, Database, Settings, Library, Store, Clock, BookOpenCheck, PenLine } from 'lucide-react'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import {
  WIKI_ARTICLES,
  WIKI_CATEGORIES,
  WIKI_SECTIONS,
  WIKI_STATS,
  type WikiCategory,
} from '@/lib/wiki'

export const metadata = {
  title: 'Wiki — The Shelvd Knowledge Base',
  description: 'Everything you need to know about cataloging rare books with Shelvd. Tutorials, reference guides, glossaries, and more — written for collectors, by a collector.',
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'getting-started': Rocket,
  'cataloging': BookOpen,
  'provenance': History,
  'search': Search,
  'data': Database,
  'settings': Settings,
  'reference': Library,
  'dealers': Store,
  'coming-soon': Clock,
}

export default function WikiPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <BookOpenCheck className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Knowledge Base</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            The Shelvd Wiki
          </h1>
          <p className="text-muted-foreground italic text-lg max-w-2xl">
            Everything you need to know about cataloging books with Shelvd — written with the same 
            care we'd give a first edition, and considerably more humor than the average user manual.
          </p>
          <div className="w-16 h-1 bg-primary mt-8" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-8 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{WIKI_STATS.totalArticles}</strong> articles</span>
            <span><strong className="text-foreground">{WIKI_STATS.categories}</strong> categories</span>
            <span><strong className="text-foreground">{WIKI_STATS.comingSoonArticles}</strong> coming soon</span>
          </div>
        </div>
      </section>

      {/* Content — Category sections */}
      <article className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          {WIKI_SECTIONS.map((section) => {
            const articles = WIKI_ARTICLES.filter(a => section.categories.includes(a.category))
            if (articles.length === 0) return null
            const categoryKey = section.categories[0]
            const categoryMeta = WIKI_CATEGORIES[categoryKey]
            const Icon = CATEGORY_ICONS[categoryKey] || BookOpen

            return (
              <section key={categoryKey} className="mb-16" id={categoryKey}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6 ml-11">
                  {categoryMeta.description}
                </p>

                {/* Article list */}
                <div className="space-y-1 ml-11">
                  {articles.map((article) => {
                    const Wrapper = article.comingSoon ? 'div' : Link
                    const wrapperProps = article.comingSoon
                      ? { key: article.slug, className: 'flex items-start gap-4 p-3 -ml-3 opacity-50' }
                      : { key: article.slug, href: `/wiki/${article.slug}`, className: 'group flex items-start gap-4 p-3 -ml-3 hover:bg-muted/50 transition-colors' }
                    return (
                      <Wrapper {...(wrapperProps as any)}>
                        <span className="text-xs text-muted-foreground font-mono mt-1 w-6 text-right flex-shrink-0">
                          {String(article.number).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">
                            {article.title}
                            {article.comingSoon && (
                              <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 align-middle">
                                Coming Soon
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {article.subtitle}
                          </p>
                      </div>
                      </Wrapper>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </article>

      <MarketingFooter />
    </main>
  )
}
