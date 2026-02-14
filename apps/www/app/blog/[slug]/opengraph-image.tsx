import { loadInterFonts, BlogOGLayout, createOGResponse } from '@/lib/og/layouts'
import { getArticleBySlug, BLOG_AUTHOR } from '@/lib/blog-data'

export const runtime = 'edge'
export const alt = 'Shelvd Blog Article'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    // Fallback to default layout
    const { DefaultOGLayout } = await import('@/lib/og/layouts')
    const fonts = await loadInterFonts()
    return createOGResponse(<DefaultOGLayout />, fonts)
  }

  const fonts = await loadInterFonts()
  const date = new Date(article.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return createOGResponse(
    <BlogOGLayout title={article.title} author={BLOG_AUTHOR} date={date} />,
    fonts
  )
}
