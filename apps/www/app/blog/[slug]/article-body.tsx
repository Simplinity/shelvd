'use client'

import { useState } from 'react'
import { Minus, Plus, Type } from 'lucide-react'

const FONT_SIZES = [
  { label: 'S', size: '1rem', lineHeight: '1.75' },      // 16px
  { label: 'M', size: '1.125rem', lineHeight: '1.8' },   // 18px — default
  { label: 'L', size: '1.3125rem', lineHeight: '1.85' }, // 21px
]

export function ArticleBody({ contentHtml }: { contentHtml: string }) {
  const [sizeIndex, setSizeIndex] = useState(1) // default: M

  return (
    <article className="px-6 pb-16">
      <div className="max-w-2xl mx-auto relative">
        {/* Font size control */}
        <div className="flex items-center justify-end gap-1 mb-8 sticky top-4 z-10">
          <div className="flex items-center gap-0.5 bg-background/90 backdrop-blur-sm border border-border/50 px-2 py-1">
            <Type className="w-3 h-3 text-muted-foreground mr-1" />
            <button
              onClick={() => setSizeIndex(Math.max(0, sizeIndex - 1))}
              disabled={sizeIndex === 0}
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              aria-label="Decrease font size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono text-muted-foreground w-4 text-center">
              {FONT_SIZES[sizeIndex].label}
            </span>
            <button
              onClick={() => setSizeIndex(Math.min(FONT_SIZES.length - 1, sizeIndex + 1))}
              disabled={sizeIndex === FONT_SIZES.length - 1}
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              aria-label="Increase font size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Rendered article content */}
        <div
          className="article-prose"
          style={{
            fontSize: FONT_SIZES[sizeIndex].size,
            lineHeight: FONT_SIZES[sizeIndex].lineHeight,
          }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </article>
  )
}
