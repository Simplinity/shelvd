'use client'

import { useState } from 'react'
import { Minus, Plus, Type, Clock } from 'lucide-react'

const FONT_SIZES = [
  { label: 'S', size: '1rem', lineHeight: '1.75' },      // 16px
  { label: 'M', size: '1.125rem', lineHeight: '1.8' },   // 18px — default
  { label: 'L', size: '1.3125rem', lineHeight: '1.85' }, // 21px
]

interface ArticleBodyProps {
  contentHtml: string
  author: string
  date: string
  readingTime: number
}

export function ArticleBody({ contentHtml, author, date, readingTime }: ArticleBodyProps) {
  const [sizeIndex, setSizeIndex] = useState(1) // default: M

  return (
    <>
      {/* Metadata line with font size control */}
      <div className="px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4 text-sm text-muted-foreground font-mono pb-8 border-b border-border/50">
          <span>By {author}</span>
          <span className="text-border">·</span>
          <time dateTime={date}>
            {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime} min read
          </span>

          {/* Font size control */}
          <div className="flex items-center gap-0 ml-auto">
            <button
              onClick={() => setSizeIndex(Math.max(0, sizeIndex - 1))}
              disabled={sizeIndex === 0}
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              aria-label="Decrease font size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <Type className="w-3.5 h-3.5 text-muted-foreground mx-0.5" />
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
      </div>

      {/* Rendered article content */}
      <article className="px-6 pb-16 pt-8">
        <div className="max-w-2xl mx-auto">
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
    </>
  )
}
