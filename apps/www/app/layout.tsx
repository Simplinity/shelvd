import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://shelvd.org'),
  title: {
    default: 'Shelvd — Book Collection Management',
    template: '%s — Shelvd',
  },
  description: 'Professional collection management for antiquarian books, rare editions, and fine bindings. Catalog with bibliographic precision. Track provenance. Know your collection\'s value.',
  manifest: '/site.webmanifest',
  themeColor: '#D52B1E',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Shelvd',
    title: 'Shelvd — Book Collection Management',
    description: 'Professional collection management for antiquarian books, rare editions, and fine bindings.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shelvd — Book Collection Management',
    description: 'Professional collection management for antiquarian books, rare editions, and fine bindings.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
