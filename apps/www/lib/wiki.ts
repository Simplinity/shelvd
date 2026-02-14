// Wiki / Knowledge Base — full module (includes filesystem operations)
// For edge-compatible imports (OG images), use wiki-data.ts directly

import fs from 'fs'
import path from 'path'

// Re-export everything from the edge-safe data module
export * from './wiki-data'

// Filesystem-dependent function (Node.js only, not edge-compatible)
export function getWikiContent(filename: string): string {
  const filePath = path.join(process.cwd(), 'content', 'wiki', filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  // Strip the H1 title line (already rendered by the page template)
  const lines = raw.split('\n')
  const startIndex = lines[0]?.startsWith('# ') ? 1 : 0
  return lines.slice(startIndex).join('\n').trim()
}
