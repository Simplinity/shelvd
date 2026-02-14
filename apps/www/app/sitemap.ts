import type { MetadataRoute } from 'next'
import { BLOG_ARTICLES } from '@/lib/blog'
import { WIKI_ARTICLES } from '@/lib/wiki'

const BASE_URL = 'https://shelvd.org'

export default function sitemap(): MetadataRoute.Sitemap {
  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/wiki`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/changelog`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/roadmap`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Blog articles
  const blogPages: MetadataRoute.Sitemap = BLOG_ARTICLES.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Wiki articles
  const wikiPages: MetadataRoute.Sitemap = WIKI_ARTICLES.map((article) => ({
    url: `${BASE_URL}/wiki/${article.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...blogPages, ...wikiPages]
}
