// Wiki / Knowledge Base metadata — edge-compatible (no fs/path)
// Filesystem operations live in wiki.ts

export type WikiCategory =
  | 'getting-started'
  | 'cataloging'
  | 'provenance'
  | 'search'
  | 'data'
  | 'settings'
  | 'reference'
  | 'dealers'

export const WIKI_CATEGORIES: Record<WikiCategory, { label: string; description: string; icon: string }> = {
  'getting-started': { label: 'Getting Started', description: 'From zero to cataloged in five articles', icon: 'Rocket' },
  'cataloging':      { label: 'Cataloging', description: 'Every field, explained with unreasonable thoroughness', icon: 'BookOpen' },
  'provenance':      { label: 'Provenance & History', description: 'Who owned it, what happened to it, what it\'s worth', icon: 'History' },
  'search':          { label: 'Search & Discovery', description: 'Finding books in your library and the world\'s', icon: 'Search' },
  'data':            { label: 'Data & Export', description: 'Getting data in, out, and occasionally into shape', icon: 'Database' },
  'settings':        { label: 'Settings & Account', description: 'Configuring Shelvd to your peculiar specifications', icon: 'Settings' },
  'reference':       { label: 'Glossary & Reference', description: 'The encyclopedic bit', icon: 'Library' },
  'dealers':         { label: 'For Dealers', description: 'Tools for people who sell what we hoard', icon: 'Store' },
}

export const WIKI_SECTIONS: { title: string; categories: WikiCategory[] }[] = [
  { title: 'Getting Started', categories: ['getting-started'] },
  { title: 'Cataloging', categories: ['cataloging'] },
  { title: 'Provenance & History', categories: ['provenance'] },
  { title: 'Search & Discovery', categories: ['search'] },
  { title: 'Data & Export', categories: ['data'] },
  { title: 'Settings & Account', categories: ['settings'] },
  { title: 'Glossary & Reference', categories: ['reference'] },
  { title: 'For Dealers', categories: ['dealers'] },
]

export interface WikiArticle {
  number: number
  slug: string
  filename: string
  title: string
  subtitle: string
  category: WikiCategory
  relatedBlog?: string[]
  relatedWiki?: string[]
}

export const WIKI_ARTICLES: WikiArticle[] = [
  // ── I. GETTING STARTED ──────────────────────────────────────────────
  { number: 1, slug: 'your-first-book', filename: 'your-first-book.md', title: 'Your First Book (And Why It\'s Already Wrong)', subtitle: 'Adding a book manually, what fields matter, what to skip — and why perfection is the enemy of a cataloged shelf.', category: 'getting-started', relatedWiki: ['the-title-page', 'condition-grading', 'identifiers'] },
  { number: 2, slug: 'library-lookup', filename: 'library-lookup.md', title: 'Library Lookup: Let the World\'s Libraries Do Your Typing', subtitle: 'How to search 22 providers across 19 countries, pick a source, and import metadata without lifting a pen.', category: 'getting-started', relatedWiki: ['the-22-providers', 'enriching-a-record', 'configuring-providers'], relatedBlog: ['isbn-invented-1970'] },
  { number: 3, slug: 'collections-and-tags', filename: 'collections-and-tags.md', title: 'Collections, Tags, and the Illusion of Order', subtitle: 'Library vs Wishlist, custom collections, colored tags, and the deeply human need to put things in boxes.', category: 'getting-started', relatedWiki: ['searching-your-library'] },
  { number: 4, slug: 'enriching-a-record', filename: 'enriching-a-record.md', title: 'Enrich Mode: Stealing Metadata, Politely', subtitle: 'How to pull in missing fields from library catalogs, compare differences, and merge data without losing what you already have.', category: 'getting-started', relatedWiki: ['library-lookup', 'the-22-providers'] },
  { number: 5, slug: 'importing-your-spreadsheet', filename: 'importing-your-spreadsheet.md', title: 'From Spreadsheet to Civilization', subtitle: 'Excel import, template download, column mapping, and the emotional journey from rows to records.', category: 'getting-started', relatedWiki: ['import-export'] },

  // ── II. CATALOGING ──────────────────────────────────────────────────
  { number: 6, slug: 'the-title-page', filename: 'the-title-page.md', title: 'The Title Page Is the Only Page That Matters', subtitle: 'Why we catalog from the title page, not the cover or spine — and how to record title, subtitle, and series correctly.', category: 'cataloging', relatedBlog: ['what-is-isbd'], relatedWiki: ['the-isbd-entry'] },
  { number: 7, slug: 'contributors', filename: 'contributors.md', title: 'Authors, Editors, Translators, and 66 Other Ways to Be Involved', subtitle: '69 MARC relator codes, the "Last, First" format, and why getting names right is harder than it sounds.', category: 'cataloging', relatedWiki: ['marc-roles'] },
  { number: 8, slug: 'editions-and-impressions', filename: 'editions-and-impressions.md', title: 'First Edition, Third Impression, Second State: Now You\'re Confused', subtitle: 'Edition, impression, issue, and state — four words that mean different things and cost different amounts of money.', category: 'cataloging', relatedBlog: ['first-edition-glossary'] },
  { number: 9, slug: 'physical-description', filename: 'physical-description.md', title: 'Measuring Your Books (Without Being Weird About It)', subtitle: 'Height, width, depth, weight, pagination, format, and the ancient art of counting pages in Roman numerals.', category: 'cataloging', relatedBlog: ['book-formats'], relatedWiki: ['book-formats-reference'] },
  { number: 10, slug: 'bindings-and-covers', filename: 'bindings-and-covers.md', title: '49 Ways to Dress a Book', subtitle: 'Every cover type in Shelvd, from full calf to paper wrappers — what they are, how to identify them, and why they matter.', category: 'cataloging', relatedBlog: ['vellum-calf-morocco'], relatedWiki: ['binding-styles'] },
  { number: 11, slug: 'paper-and-edges', filename: 'paper-and-edges.md', title: 'Paper Types, Edge Treatments, and Other Things Your Friends Don\'t Want to Hear About', subtitle: 'Laid, wove, vellum, India, Bible — plus gilt, marbled, deckle, and sprinkled edges. You\'re welcome.', category: 'cataloging', relatedBlog: ['paper-material-history'] },
  { number: 12, slug: 'condition-grading', filename: 'condition-grading.md', title: 'Fine, Near Fine, and the Lies We Tell Ourselves', subtitle: 'The standard grading scale, how to write honest condition notes, and why "good" doesn\'t mean good.', category: 'cataloging', relatedBlog: ['bookseller-condition-scale'], relatedWiki: ['condition-terms'] },
  { number: 13, slug: 'identifiers', filename: 'identifiers.md', title: 'ISBN, OCLC, LCCN, DDC, LCC, UDC: An Alphabet Soup That Actually Matters', subtitle: 'The complete guide to book identifiers — history, structure, where to find them, how they flow into Shelvd, and why they matter for every collector.', category: 'cataloging', relatedBlog: ['isbn-invented-1970'] },
  { number: 14, slug: 'the-isbd-entry', filename: 'the-isbd-entry.md', title: 'ISBD: The Catalog Entry Nobody Writes by Hand Anymore', subtitle: 'The complete guide to ISBD catalog entries — every area, every punctuation rule, worked examples, and how Shelvd generates them in thirteen languages.', category: 'cataloging', relatedBlog: ['what-is-isbd'], relatedWiki: ['the-title-page'] },
  { number: 15, slug: 'bisac-codes', filename: 'bisac-codes.md', title: '3,887 Ways to Categorize a Book (And Still Get It Wrong)', subtitle: 'BISAC subject headings — primary, secondary, tertiary — and the quiet futility of putting books in exactly one box.', category: 'cataloging' },
  { number: 16, slug: 'image-labeling', filename: 'image-labeling.md', title: 'Photographing Your Books: 51 Ways to Label an Image', subtitle: 'The image upload system — 51 book part labels across six groups, what to photograph for sales vs. insurance, and why the title page matters more than the cover.', category: 'cataloging', relatedWiki: ['cataloging-for-dealers', 'physical-description', 'condition-grading'] },

  // ── III. PROVENANCE & HISTORY ────────────────────────────────────────
  { number: 17, slug: 'provenance-tracking', filename: 'provenance-tracking.md', title: 'Who Had This Book Before You (And Why That Matters)', subtitle: 'The provenance chain in Shelvd: owner types, evidence types, associations, and the detective work of book history.', category: 'provenance', relatedBlog: ['provenance-who-had-this-book', 'ex-libris-history'] },
  { number: 18, slug: 'condition-history', filename: 'condition-history.md', title: 'A Medical Record for Books', subtitle: 'Tracking condition over time — logging changes, dating observations, and building a health record your book deserves.', category: 'provenance', relatedWiki: ['condition-grading'] },
  { number: 19, slug: 'valuation-history', filename: 'valuation-history.md', title: 'What\'s It Worth? A History of Guessing', subtitle: 'Seven valuation sources, trend tracking over time, provenance auto-sync, and the art of estimating value without a crystal ball.', category: 'provenance', relatedBlog: ['first-edition-glossary'] },
  { number: 20, slug: 'external-links', filename: 'external-links.md', title: '64 Doors to the Outside World', subtitle: 'External link types across eight categories — from WorldCat to Christie\'s — and how to connect your books to the wider bibliographic universe.', category: 'provenance', relatedWiki: ['configuring-links'] },

  // ── IV. SEARCH & DISCOVERY ──────────────────────────────────────────
  { number: 21, slug: 'searching-your-library', filename: 'searching-your-library.md', title: 'Finding That One Book You Know You Own', subtitle: 'Global search, advanced search with 14 fields and AND/OR logic, filters, sorting, and the eternal quest for that one Elzevir.', category: 'search', relatedWiki: ['collections-and-tags'] },
  { number: 22, slug: 'duplicate-detection', filename: 'duplicate-detection.md', title: 'The Awkward Conversation: You Own This Twice', subtitle: 'How duplicate detection works, what it matches on, bulk cleanup, and the uncomfortable truth about your purchasing habits.', category: 'search' },
  { number: 23, slug: 'the-22-providers', filename: 'the-22-providers.md', title: 'A Grand Tour of 22 Libraries in 19 Countries', subtitle: 'Every lookup provider in Shelvd — what it holds, what it\'s good at, its quirks, and when to reach for it.', category: 'search', relatedWiki: ['library-lookup', 'configuring-providers'] },

  // ── V. DATA & EXPORT ────────────────────────────────────────────────
  { number: 24, slug: 'import-export', filename: 'import-export.md', title: 'Getting Data In and Out Without Losing Your Mind', subtitle: 'Excel import with template, CSV/JSON/Excel export, what goes in each format, and what doesn\'t.', category: 'data', relatedWiki: ['importing-your-spreadsheet'] },
  { number: 25, slug: 'statistics', filename: 'statistics.md', title: 'Numbers About Your Books (the Other Kind of Value)', subtitle: 'The statistics dashboard: key metrics, distributions, top lists, and what the numbers reveal about your collecting habits.', category: 'data' },
  { number: 26, slug: 'collection-audit', filename: 'collection-audit.md', title: 'The Audit: A Gentle Reckoning', subtitle: 'Ten health checks, a score out of 100, expandable fix lists, and the motivational guilt trip your catalog needs.', category: 'data', relatedWiki: ['your-first-book'] },

  // ── VI. SETTINGS & ACCOUNT ──────────────────────────────────────────
  { number: 27, slug: 'settings-guide', filename: 'settings-guide.md', title: 'Everything in Settings, Explained', subtitle: 'Profile, security, locale, currency, display preferences — every toggle and dropdown, demystified.', category: 'settings' },
  { number: 28, slug: 'configuring-providers', filename: 'configuring-providers.md', title: 'Choosing Your Libraries', subtitle: 'Enable, disable, and reorder your lookup providers — because not every library is relevant to every collection.', category: 'settings', relatedWiki: ['the-22-providers', 'library-lookup'] },
  { number: 29, slug: 'configuring-links', filename: 'configuring-links.md', title: 'Choosing Your External Links', subtitle: 'Activate, deactivate, and create custom link types — 64 system types across eight categories, plus your own.', category: 'settings', relatedWiki: ['external-links'] },

  // ── VII. GLOSSARY & REFERENCE ────────────────────────────────────────
  { number: 30, slug: 'glossary', filename: 'glossary.md', title: 'A Glossary for People Who Collect Books and Arguments', subtitle: '150+ terms from the world of rare books, antiquarian trade, and bibliographic description — defined with unreasonable precision and occasional humor.', category: 'reference' },
  { number: 31, slug: 'condition-terms', filename: 'condition-terms.md', title: 'A Visual Guide to Foxing, Toning, and Everything Brown', subtitle: 'The vocabulary of paper degradation and book damage — what each term means, what causes it, and how to describe it without crying.', category: 'reference', relatedBlog: ['foxing-browning-toning'], relatedWiki: ['condition-grading'] },
  { number: 32, slug: 'binding-styles', filename: 'binding-styles.md', title: 'From Chain Stitch to Perfect Binding: A Timeline', subtitle: 'Historical binding techniques from the medieval scriptorium to the modern paperback — identification tips included.', category: 'reference', relatedBlog: ['vellum-calf-morocco'], relatedWiki: ['bindings-and-covers'] },
  { number: 33, slug: 'book-formats-reference', filename: 'book-formats-reference.md', title: 'The 76 Formats (And Why "Large Octavo" Is Not "Small Quarto")', subtitle: 'Every bibliographic format in Shelvd with dimensions, abbreviations, and historical context — from broadsheet to 128mo.', category: 'reference', relatedBlog: ['book-formats'], relatedWiki: ['physical-description'] },
  { number: 34, slug: 'marc-roles', filename: 'marc-roles.md', title: 'The 69 MARC Relator Codes, Decoded', subtitle: 'Every contributor role in Shelvd — from "author" to "woodcutter" — with definitions and guidance on when to use each one.', category: 'reference', relatedWiki: ['contributors'] },

  // ── VIII. FOR DEALERS ────────────────────────────────────────────────
  { number: 35, slug: 'cataloging-for-dealers', filename: 'cataloging-for-dealers.md', title: 'Cataloging to Sell: What Buyers Actually Look For', subtitle: 'Professional cataloging standards for the trade — which fields matter, what condition notes to write, and how to describe a book so someone buys it.', category: 'dealers', relatedBlog: ['bookseller-condition-scale', 'book-fair-survival'], relatedWiki: ['condition-grading', 'the-isbd-entry', 'trade-catalog-conventions'] },
  { number: 36, slug: 'trade-catalog-conventions', filename: 'trade-catalog-conventions.md', title: 'Trade Catalogs: How 13 Countries Describe the Same Book', subtitle: 'SLAM, VDA, NVvA, ABAA, and ten other national conventions — format terms, binding vocabulary, condition grades, and why a French "in-8" is a British "8vo".', category: 'dealers', relatedWiki: ['cataloging-for-dealers', 'the-isbd-entry', 'condition-grading', 'bindings-and-covers'] },
  { number: 37, slug: 'pdf-catalog-sheets', filename: 'pdf-catalog-sheets.md', title: 'The Catalog Sheet: One Page Per Book', subtitle: 'PDF generation in six paper sizes — what\'s included, how to customize it, and when to hand one to a prospective buyer.', category: 'dealers' },
]

// ── Utility functions (edge-safe) ──────────────────────────────────────────────

export function getWikiArticle(slug: string): WikiArticle | undefined {
  return WIKI_ARTICLES.find(a => a.slug === slug)
}

export function getWikiArticlesByCategory(category: WikiCategory): WikiArticle[] {
  return WIKI_ARTICLES.filter(a => a.category === category)
}

export function getRelatedArticles(article: WikiArticle): WikiArticle[] {
  if (!article.relatedWiki) return []
  return article.relatedWiki
    .map(slug => WIKI_ARTICLES.find(a => a.slug === slug))
    .filter((a): a is WikiArticle => a !== undefined)
}

export const WIKI_STATS = {
  totalArticles: WIKI_ARTICLES.length,
  categories: Object.keys(WIKI_CATEGORIES).length,
}
