'use client'

import { useEffect, useState } from 'react'

const QUOTES = [
  { text: 'I have always imagined that Paradise will be a kind of library.', author: 'Jorge Luis Borges' },
  { text: 'The only thing that you absolutely have to know, is the location of the library.', author: 'Albert Einstein' },
  { text: 'A room without books is like a body without a soul.', author: 'Cicero' },
  { text: 'If you have a garden and a library, you have everything you need.', author: 'Cicero' },
  { text: 'There is no friend as loyal as a book.', author: 'Ernest Hemingway' },
  { text: 'In the case of good books, the point is not to see how many of them you can get through, but rather how many can get through to you.', author: 'Mortimer J. Adler' },
  { text: 'The world was made for the man who doesn\u2019t read to tell the man who does what to do.', author: 'Umberto Eco' },
  { text: 'We read to know we are not alone.', author: 'C.S. Lewis' },
  { text: 'A great book should leave you with many experiences, and slightly exhausted at the end.', author: 'William Styron' },
  { text: 'Reading is an act of civilization; it\u2019s one of the greatest acts of civilization because it takes the free raw material of the mind and builds castles of possibilities.', author: 'Ben Okri' },
]

export function AuthQuote() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setIndex(Math.floor(Math.random() * QUOTES.length))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(prev => (prev + 1) % QUOTES.length)
        setVisible(true)
      }, 600)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const quote = QUOTES[index]

  return (
    <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
      <p className="text-sm leading-relaxed text-muted-foreground italic max-w-md">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-xs text-muted-foreground/60 mt-2 font-medium tracking-wide">
        — {quote.author}
      </p>
    </div>
  )
}
