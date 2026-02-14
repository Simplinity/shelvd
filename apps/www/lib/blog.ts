// Blog utilities — full version with markdown reading (server-side only)
// For edge-compatible imports (OG images), use blog-data.ts instead

import fs from 'fs'
import path from 'path'

// Re-export everything from the edge-compatible data module
export * from './blog-data'

// Utility: read article markdown content (server-side only — requires fs)
export function getArticleContent(filename: string): string {
  // Try monorepo root first (local dev), then workspace root (Vercel)
  const candidates = [
    path.join(process.cwd(), 'content', 'blog', filename),
    path.join(process.cwd(), '..', '..', 'content', 'blog', filename),
  ]
  const filePath = candidates.find(p => fs.existsSync(p))
  if (!filePath) throw new Error(`Article not found: ${filename}`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  // Strip the title, subtitle, author, and first --- (already in metadata)
  const lines = raw.split('\n')
  const hrIndex = lines.findIndex((line, i) => i > 0 && line.trim() === '---')
  if (hrIndex !== -1) {
    return lines.slice(hrIndex + 1).join('\n').trim()
  }
  return raw
}
