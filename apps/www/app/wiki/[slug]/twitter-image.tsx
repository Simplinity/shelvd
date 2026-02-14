import { loadInterFonts, WikiOGLayout, createOGResponse } from '@/lib/og/layouts'
import { getWikiArticle, WIKI_CATEGORIES } from '@/lib/wiki-data'

export const runtime = 'edge'
export const alt = 'Shelvd Wiki Article'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function TwitterImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getWikiArticle(slug)

  if (!article) {
    const { DefaultOGLayout } = await import('@/lib/og/layouts')
    const fonts = await loadInterFonts()
    return createOGResponse(<DefaultOGLayout />, fonts)
  }

  const fonts = await loadInterFonts()
  const category = WIKI_CATEGORIES[article.category]?.label ?? 'Knowledge Base'

  return createOGResponse(
    <WikiOGLayout title={article.title} category={category} />,
    fonts
  )
}
