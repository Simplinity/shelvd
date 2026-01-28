import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shelvd — Book Collection Management',
  description: 'Professional book collection management for serious collectors | shelvd.org',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
