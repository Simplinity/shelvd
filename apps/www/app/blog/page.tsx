import { ArrowLeft, BookOpen, Clock, FileText } from 'lucide-react'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import {
  BLOG_ARTICLES,
  BLOG_STATS,
  CATEGORY_SECTIONS,
  type BlogArticle,
} from '@/lib/blog'

export const metadata = {
  title: 'Marginalia — The Shelvd Blog',
  description:
    'Essays on book collecting, cataloging, and the antiquarian trade. By Bruno van Branden.',
  openGraph: {
    title: 'Marginalia — The Shelvd Blog',
    description:
      'Essays on book collecting, cataloging, and the antiquarian trade. By Bruno van Branden.',
    type: 'website',
    url: 'https://shelvd.app/blog',
  },
}

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block"
    >
      <article className="py-6 border-b border-border/50 transition-colors group-hover:border-primary/30">
        <div className="flex items-start gap-6">
          {/* Article number */}
          <span className="font-mono text-sm text-primary/30 pt-1.5 w-8 shrink-0 text-right tabular-nums">
            {String(article.number).padStart(2, '0')}
          </span>

          <div className="flex-1 min-w-0">
            {/* Reading time */}
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {article.readingTime} min read
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-1.5">
              {article.title}
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {article.subtitle}
            </p>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Marginalia</h1>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
            Essays on book collecting, cataloging, and the antiquarian trade.
            Written for people who care about the difference between an octavo and a quarto
            — and for those who are about to find out why it matters.
          </p>

          {/* Stats bar */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {BLOG_STATS.totalArticles} articles
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {BLOG_STATS.totalReadingTime} min total reading
            </span>
            <span className="text-border">·</span>
            <span>{BLOG_STATS.totalWords.toLocaleString('en-US')} words</span>
          </div>
        </div>
      </section>

      {/* Articles grouped by section */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          {CATEGORY_SECTIONS.map((section) => {
            const sectionArticles = BLOG_ARTICLES.filter((a) =>
              section.categories.includes(a.category)
            )
            if (sectionArticles.length === 0) return null

            return (
              <div key={section.title} className="mb-12">
                {/* Section header */}
                <div className="mb-2 pt-8 first:pt-0">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-1">
                    {section.title}
                  </h2>
                  <div className="w-8 h-px bg-primary/30" />
                </div>

                {/* Articles */}
                <div>
                  {sectionArticles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="border border-border/50 p-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              These articles are part of an ongoing series. If you have a subject you'd like us to cover,
              or if you'd like to argue about condition grading, we're always listening.
            </p>
            <a
              href="mailto:hello@shelvd.app"
              className="text-sm font-medium text-primary hover:underline"
            >
              hello@shelvd.app
            </a>
          </div>
        </div>
      </section>

      <div className="mt-auto">
        <MarketingFooter />
      </div>
    </main>
  )
}
