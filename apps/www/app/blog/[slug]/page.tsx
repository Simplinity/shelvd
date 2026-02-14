import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import {
  BLOG_ARTICLES,
  BLOG_AUTHOR,
  getArticleBySlug,
  getAdjacentArticles,
  getArticleContent,
} from '@/lib/blog'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { ArticleBody } from './article-body'

// Generate all article pages at build time
export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    slug: article.slug,
  }))
}

// Dynamic metadata per article
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}

  return {
    title: `${article.title} — Shelvd Blog`,
    description: article.subtitle,
    authors: [{ name: BLOG_AUTHOR }],
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: 'article',
      publishedTime: article.date,
      authors: [BLOG_AUTHOR],
      url: `/blog/${article.slug}`,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const { prev, next } = getAdjacentArticles(slug)

  // Parse markdown to HTML server-side
  const markdown = getArticleContent(article.filename)
  const result = await remark().use(remarkHtml, { sanitize: false }).process(markdown)
  const contentHtml = result.toString()

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.subtitle,
    author: {
      '@type': 'Person',
      name: BLOG_AUTHOR,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Shelvd',
      url: 'https://shelvd.org',
    },
    datePublished: article.date,
    wordCount: article.wordCount,
    url: `https://shelvd.org/blog/${article.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://shelvd.org/blog/${article.slug}`,
    },
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article header */}
      <header className="px-6 pt-16 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li className="text-border">/</li>
              <li className="text-foreground">
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

      {/* Article body */}
      <ArticleBody
        contentHtml={contentHtml}
        author={BLOG_AUTHOR}
        date={article.date}
        readingTime={article.readingTime}
      />

      {/* Previous / Next navigation */}
      <nav aria-label="Article navigation" className="px-6 py-12 border-t border-border/50">
        <div className="max-w-2xl mx-auto flex items-stretch gap-4">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
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
              href={`/blog/${next.slug}`}
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

      {/* Back to blog */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            href="/blog"
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
