import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/blog',
          '/blog/*',
          '/wiki',
          '/wiki/*',
          '/changelog',
          '/roadmap',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/books',
          '/books/*',
          '/settings',
          '/settings/*',
          '/admin',
          '/admin/*',
          '/stats',
          '/activity',
          '/audit',
          '/support',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://shelvd.org/sitemap.xml',
  }
}
