// Blog metadata and utilities
// Data-driven like changelog.ts and roadmap.ts
// Articles are .md files in /content/blog/

import fs from 'fs'
import path from 'path'

export type BlogCategory =
  | 'collecting'
  | 'materials'
  | 'bindings'
  | 'marks'
  | 'value'
  | 'market'
  | 'personal'

export const BLOG_CATEGORIES: Record<BlogCategory, { label: string; description: string }> = {
  collecting: { label: 'Collecting', description: 'What you have and how to know it' },
  materials: { label: 'Materials', description: 'What books are made of and what happens to them' },
  bindings: { label: 'Bindings & Coverings', description: 'What covers books and what humans do to them' },
  marks: { label: 'Marks & Provenance', description: 'Who owned it and how they left their trace' },
  value: { label: 'Value & Condition', description: 'What makes a book worth what it\'s worth' },
  market: { label: 'The Market', description: 'Fairs, auctions, and the business of buying' },
  personal: { label: 'Personal', description: 'Essays from the collection' },
}

export const CATEGORY_SECTIONS: { title: string; categories: BlogCategory[] }[] = [
  { title: 'Know Your Collection', categories: ['collecting'] },
  { title: 'Materials & Degradation', categories: ['materials'] },
  { title: 'Bindings & Coverings', categories: ['bindings'] },
  { title: 'Marks, Ownership & Provenance', categories: ['marks'] },
  { title: 'Value, Condition & Restoration', categories: ['value'] },
  { title: 'The Market', categories: ['market'] },
  { title: 'From the Collection', categories: ['personal'] },
]

export interface BlogArticle {
  number: number
  slug: string
  filename: string
  title: string
  subtitle: string
  category: BlogCategory
  date: string // ISO date string
  wordCount: number
  readingTime: number // minutes
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    number: 1,
    slug: 'bookshelf-lying',
    filename: '01-bookshelf-lying.md',
    title: 'Why Your Bookshelf Is Lying to You',
    subtitle: 'On the uncomfortable gap between what you think you own and what you actually own — and why the uncataloged collection is a fiction you tell yourself.',
    category: 'collecting',
    date: '2026-02-09',
    wordCount: 1523,
    readingTime: 6,
  },
  {
    number: 2,
    slug: 'isbn-invented-1970',
    filename: '02-isbn-invented-1970.md',
    title: 'The ISBN Was Invented in 1970. Your Books Don\'t Care.',
    subtitle: 'On the quiet tyranny of a thirteen-digit number, and the four centuries of bibliographic civilisation it cheerfully ignores.',
    category: 'collecting',
    date: '2026-02-09',
    wordCount: 1157,
    readingTime: 5,
  },
  {
    number: 3,
    slug: 'what-is-isbd',
    filename: '03-what-is-isbd.md',
    title: 'What Is ISBD and Why Should You Care?',
    subtitle: 'The international standard that describes your books better than you do — and why learning to read it will make you a sharper collector.',
    category: 'collecting',
    date: '2026-02-09',
    wordCount: 1423,
    readingTime: 6,
  },
  {
    number: 4,
    slug: 'book-formats',
    filename: '04-book-formats.md',
    title: 'Octavo, Quarto, Folio: A Field Guide to Book Sizes Nobody Asked For',
    subtitle: 'How the folding of a single sheet of paper determined the shape of Western literature — and why "large octavo" is not the same as "small quarto," no matter what your shelf suggests.',
    category: 'collecting',
    date: '2026-02-09',
    wordCount: 1898,
    readingTime: 8,
  },
  {
    number: 5,
    slug: 'paper-material-history',
    filename: '05-paper-material-history.md',
    title: 'Paper: A Material History in Five Chapters',
    subtitle: 'From Chinese mulberry bark to modern acid-free stock — five turning points that changed what books are made of, how they age, and which ones will survive.',
    category: 'materials',
    date: '2026-02-09',
    wordCount: 2148,
    readingTime: 9,
  },
  {
    number: 6,
    slug: 'why-old-books-smell',
    filename: '06-why-old-books-smell.md',
    title: 'Why Old Books Smell Like That',
    subtitle: 'The chemistry of bibliosmy — vanilla, almond, grass — and what your nose is actually detecting when you open a book from 1890.',
    category: 'materials',
    date: '2026-02-09',
    wordCount: 1530,
    readingTime: 6,
  },
  {
    number: 7,
    slug: 'foxing-browning-toning',
    filename: '07-foxing-browning-toning.md',
    title: 'Foxing, Browning, Toning: A Spotter\'s Guide to Book Diseases',
    subtitle: 'The science and vocabulary of paper degradation, for collectors who want to describe what\'s happening to their books without sounding like they\'re guessing.',
    category: 'materials',
    date: '2026-02-09',
    wordCount: 1906,
    readingTime: 8,
  },
  {
    number: 8,
    slug: 'bindings-field-guide',
    filename: '08-bindings-field-guide.md',
    title: 'Vellum, Calf, Morocco, Cloth: A Field Guide to Book Bindings',
    subtitle: 'The materials that cover books, from medieval to modern — how to identify them, why they fail, and what they tell you about the book inside.',
    category: 'bindings',
    date: '2026-02-09',
    wordCount: 1808,
    readingTime: 7,
  },
  {
    number: 9,
    slug: 'dust-jacket-problem',
    filename: '09-dust-jacket-problem.md',
    title: 'The Dust Jacket Problem',
    subtitle: 'How a disposable wrapper became the most valuable part of the book, and what that tells us about collecting, scarcity, and the human talent for fetishising the ephemeral.',
    category: 'bindings',
    date: '2026-02-09',
    wordCount: 1833,
    readingTime: 7,
  },
  {
    number: 10,
    slug: 'price-stickers',
    filename: '10-price-stickers.md',
    title: 'A Brief History of Ruining Books with Price Stickers',
    subtitle: 'On adhesive, its victims, and the quiet rage of every collector who has ever tried to remove a label from a dust jacket with a hairdryer and a prayer.',
    category: 'bindings',
    date: '2026-02-09',
    wordCount: 1656,
    readingTime: 7,
  },
  {
    number: 11,
    slug: 'the-colophon',
    filename: '11-the-colophon.md',
    title: 'The Colophon: Reading the Page Nobody Reads',
    subtitle: 'That little block of text at the back of early printed books that tells you who printed it, where, when, and sometimes why — and how to decode it.',
    category: 'marks',
    date: '2026-02-09',
    wordCount: 1463,
    readingTime: 6,
  },
  {
    number: 12,
    slug: 'ex-libris',
    filename: '12-ex-libris.md',
    title: 'Ex Libris: A Short History of Marking Books as Yours',
    subtitle: 'From medieval chain marks through armorial bookplates to rubber stamps and Dymo labels — the 600-year history of humans writing their names in books.',
    category: 'marks',
    date: '2026-02-09',
    wordCount: 2174,
    readingTime: 9,
  },
  {
    number: 13,
    slug: 'provenance',
    filename: '13-provenance.md',
    title: 'Provenance: Or, Who Had This Book Before You',
    subtitle: 'Why the chain of ownership is often more interesting than the text, and how to read the evidence that books leave behind.',
    category: 'marks',
    date: '2026-02-09',
    wordCount: 1902,
    readingTime: 8,
  },
  {
    number: 14,
    slug: 'first-edition-first-printing',
    filename: '14-first-edition-first-printing.md',
    title: 'First Edition, First Printing, First State: A Glossary of Expensive Distinctions',
    subtitle: 'The terminology that separates a reading copy from a retirement fund — and why collectors argue about half-title pages with the intensity of medieval theologians.',
    category: 'value',
    date: '2026-02-09',
    wordCount: 2146,
    readingTime: 9,
  },
  {
    number: 15,
    slug: 'condition-scale',
    filename: '15-condition-scale.md',
    title: 'The Bookseller\'s Condition Scale Is a Work of Fiction',
    subtitle: 'Fine, Near Fine, Very Good, Good — a guided tour through the grading system that the entire trade uses and nobody agrees on.',
    category: 'value',
    date: '2026-02-09',
    wordCount: 1923,
    readingTime: 8,
  },
  {
    number: 16,
    slug: 'rebinding',
    filename: '16-rebinding.md',
    title: 'Rebinding Is Not a Dirty Word',
    subtitle: 'When rebinding saves a book and when it destroys its value — the ethics and economics of putting a seventeenth-century text block in a nineteenth-century binding.',
    category: 'value',
    date: '2026-02-09',
    wordCount: 1998,
    readingTime: 8,
  },
  {
    number: 17,
    slug: 'private-press',
    filename: '17-private-press.md',
    title: 'The Private Press and Why It Matters',
    subtitle: 'Kelmscott, Doves, Ashendene, Cranach, De Zilverdistel — the tradition of printing books as objects of beauty rather than commerce.',
    category: 'value',
    date: '2026-02-09',
    wordCount: 1860,
    readingTime: 7,
  },
  {
    number: 18,
    slug: 'book-fair-survival',
    filename: '18-book-fair-survival.md',
    title: 'The Book Fair Survival Guide',
    subtitle: 'How to navigate a rare book fair without losing your wallet, your composure, or an argument about points of issue. You will fail at least one of these.',
    category: 'market',
    date: '2026-02-09',
    wordCount: 2123,
    readingTime: 8,
  },
  {
    number: 19,
    slug: 'auction-room',
    filename: '19-auction-room.md',
    title: 'The Auction Room: A Beginner\'s Guide to Not Panicking',
    subtitle: 'How book auctions actually work — estimates, reserves, buyer\'s premium, paddle bidding — and the unwritten rules that nobody explains until you\'ve broken them.',
    category: 'market',
    date: '2026-02-09',
    wordCount: 1998,
    readingTime: 8,
  },
  {
    number: 20,
    slug: 'cataloging-for-insurance',
    filename: '20-cataloging-for-insurance.md',
    title: 'Cataloging Your Library for Insurance (Before You Need To)',
    subtitle: 'What your insurer actually needs, how to document condition, and why your phone camera is now a conservation tool.',
    category: 'market',
    date: '2026-02-09',
    wordCount: 1994,
    readingTime: 8,
  },
  {
    number: 21,
    slug: '28000-books',
    filename: '21-28000-books.md',
    title: 'I Own 28,000 Books. Here\'s What I\'ve Learned.',
    subtitle: 'Not about collecting philosophy, but about logistics: shelving, insurance, moving, and the look on the removal man\'s face.',
    category: 'personal',
    date: '2026-02-09',
    wordCount: 2058,
    readingTime: 8,
  },
  {
    number: 22,
    slug: 'cataloging-on-a-sunday',
    filename: '22-cataloging-on-a-sunday.md',
    title: 'Cataloging on a Sunday: A Confession',
    subtitle: 'The ritualistic, slightly obsessive pleasure of spending a quiet afternoon entering bibliographic data. A love letter to the hobby nobody admits to enjoying.',
    category: 'personal',
    date: '2026-02-09',
    wordCount: 1722,
    readingTime: 7,
  },
]

// Computed stats
export const BLOG_STATS = {
  totalArticles: BLOG_ARTICLES.length,
  totalWords: BLOG_ARTICLES.reduce((sum, a) => sum + a.wordCount, 0),
  totalReadingTime: BLOG_ARTICLES.reduce((sum, a) => sum + a.readingTime, 0),
}

// Utility: get article by slug
export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug)
}

// Utility: get previous and next articles
export function getAdjacentArticles(slug: string): { prev: BlogArticle | null; next: BlogArticle | null } {
  const index = BLOG_ARTICLES.findIndex((a) => a.slug === slug)
  return {
    prev: index > 0 ? BLOG_ARTICLES[index - 1] : null,
    next: index < BLOG_ARTICLES.length - 1 ? BLOG_ARTICLES[index + 1] : null,
  }
}

// Utility: get articles by category
export function getArticlesByCategory(category: BlogCategory): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.category === category)
}

// Utility: read article markdown content (server-side only)
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
  // Find the first --- and return everything after it
  const lines = raw.split('\n')
  const hrIndex = lines.findIndex((line, i) => i > 0 && line.trim() === '---')
  if (hrIndex !== -1) {
    return lines.slice(hrIndex + 1).join('\n').trim()
  }
  return raw
}

// Author constant
export const BLOG_AUTHOR = 'Bruno van Branden'
