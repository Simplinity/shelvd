import { ArrowLeft, ArrowRight, BookOpenCheck, PenLine } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import {
  WIKI_ARTICLES,
  WIKI_CATEGORIES,
  getWikiArticle,
  getWikiContent,
  getRelatedArticles,
  getWikiArticlesByCategory,
} from '@/lib/wiki'
import { BLOG_ARTICLES } from '@/lib/blog'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { ArticleBody } from '@/app/blog/[slug]/article-body'

// Generate all wiki pages at build time
export function generateStaticParams() {
  return WIKI_ARTICLES.filter(a => !a.comingSoon).map((article) => ({
    slug: article.slug,
  }))
}

// Dynamic metadata per article
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getWikiArticle(slug)
  if (!article) return {}

  return {
    title: `${article.title} — Shelvd Wiki`,
    description: article.subtitle,
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: 'article',
      url: `https://shelvd.app/wiki/${article.slug}`,
    },
  }
}

export default async function WikiArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getWikiArticle(slug)
  if (!article || article.comingSoon) notFound()

  const categoryMeta = WIKI_CATEGORIES[article.category]
  const categoryArticles = getWikiArticlesByCategory(article.category)
  const relatedArticles = getRelatedArticles(article)

  // Related blog articles
  const relatedBlogArticles = (article.relatedBlog || [])
    .map(slug => BLOG_ARTICLES.find(a => a.slug === slug))
    .filter((a): a is (typeof BLOG_ARTICLES)[number] => a !== undefined)

  // Previous / next within same category
  const categoryIndex = categoryArticles.findIndex(a => a.slug === article.slug)
  const prev = categoryIndex > 0 ? categoryArticles[categoryIndex - 1] : null
  const next = categoryIndex < categoryArticles.length - 1 ? categoryArticles[categoryIndex + 1] : null

  // Parse markdown
  const markdown = getWikiContent(article.filename)
  const result = await remark().use(remarkHtml, { sanitize: false }).process(markdown)
  const contentHtml = result.toString()

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* Article header */}
      <header className="px-6 pt-16 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/wiki" className="hover:text-foreground transition-colors">
                  Wiki
                </Link>
              </li>
              <li className="text-border">/</li>
              <li>
                <Link href={`/wiki#${article.category}`} className="hover:text-foreground transition-colors">
                  {categoryMeta.label}
                </Link>
              </li>
              <li className="text-border">/</li>
              <li className="text-foreground truncate max-w-[200px]">
                {article.title}
              </li>
            </ol>
          </nav>

          {/* Article number + title */}
          <div className="mb-6">
            <span className="font-mono text-sm text-primary/30 block mb-2">
              {String(article.number).padStart(2, '0')}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight text-foreground">
              {article.title}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed italic mb-8">
            {article.subtitle}
          </p>
        </div>
      </header>

      {/* Article body — reuses blog ArticleBody component */}
      <ArticleBody
        contentHtml={contentHtml}
        date="2026-02-12"
        readingTime={Math.ceil(contentHtml.split(/\s+/).length / 200)}
      />

      {/* Related wiki articles */}
      {relatedArticles.length > 0 && (
        <section className="px-6 py-8 border-t border-border/50">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-4">
              Related articles
            </h3>
            <div className="space-y-2">
              {relatedArticles.map((r) => (
                <Link
                  key={r.slug}
                  href={`/wiki/${r.slug}`}
                  className="group flex items-center gap-3 p-2 -ml-2 hover:bg-muted/50 transition-colors"
                >
                  <BookOpenCheck className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  <span className="text-sm group-hover:text-primary transition-colors">{r.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related blog articles */}
      {relatedBlogArticles.length > 0 && (
        <section className="px-6 py-8 border-t border-border/50">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-4">
              From the blog
            </h3>
            <div className="space-y-2">
              {relatedBlogArticles.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex items-center gap-3 p-2 -ml-2 hover:bg-muted/50 transition-colors"
                >
                  <PenLine className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  <span className="text-sm group-hover:text-primary transition-colors">{r.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Previous / Next navigation (within category) */}
      <nav aria-label="Article navigation" className="px-6 py-12 border-t border-border/50">
        <div className="max-w-2xl mx-auto flex items-stretch gap-4">
          {prev ? (
            <Link
              href={`/wiki/${prev.slug}`}
              className="flex-1 group p-4 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <ArrowLeft className="w-3 h-3" />
                Previous
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {next ? (
            <Link
              href={`/wiki/${next.slug}`}
              className="flex-1 group p-4 border border-border/50 hover:border-primary/30 transition-colors text-right"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-2">
                Next
                <ArrowRight className="w-3 h-3" />
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {next.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </nav>

      {/* Back to wiki */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            href="/wiki"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All articles
          </Link>
        </div>
      </section>

      <div className="mt-auto">
        <MarketingFooter />
      </div>
    </main>
  )
}
