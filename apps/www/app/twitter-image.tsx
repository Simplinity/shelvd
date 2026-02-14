import { loadInterFonts, DefaultOGLayout, createOGResponse } from '@/lib/og/layouts'

export const runtime = 'edge'
export const alt = 'Shelvd — Professional book collection management'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function TwitterImage() {
  const fonts = await loadInterFonts()
  return createOGResponse(<DefaultOGLayout />, fonts)
}
