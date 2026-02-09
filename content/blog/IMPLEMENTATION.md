# Feature 8h: Blog Page — Implementation Plan

## Status: COMPLETE

## Architecture

### Pages
1. `/blog` — Index page listing all 22 articles
2. `/blog/[slug]` — Individual article page

### Data Layer
- `lib/blog.ts` — Blog metadata array + markdown parsing utilities
- Articles stay as `.md` in `content/blog/` — parsed with `gray-matter` + `react-markdown` + `rehype-raw`

### SEO
- JSON-LD `BlogPosting` schema on every article (author, publisher, datePublished, headline, description, wordCount)
- JSON-LD `Blog` + `ItemList` on index
- Open Graph meta per article
- Canonical URLs
- Semantic HTML: `<article>`, `<header>`, `<time>`, `<nav>` breadcrumbs, proper heading hierarchy
- Next.js `generateMetadata()` per article
- Reading time from word count
- Internal linking: prev/next + index links

### Design (Swiss style, print-like reading)
- Serif body text (Georgia / Libre Baskerville)
- Max 65–70 chars per line (`max-w-prose` ~680px)
- Line-height 1.7–1.8
- Sans-serif headings (matching other marketing pages)
- Pull quotes: red left border, larger text
- Horizontal rules: thin, red
- No sidebar, no distractions — white, centred

### Font Size Control
- Three buttons (A−, A, A+), subtle floating position
- Three sizes: 16px / 18px (default) / 21px
- Body text only

### Index Page
- Article number (faded red, monospace)
- Title (large serif) + subtitle (italic)
- Category tag + reading time
- Grouped by 6 thematic sections
- Stats bar: "22 articles · ~X min total reading"

### Article Page
- Breadcrumb: Blog → Category → Title
- Title (serif h1) + subtitle + metadata line
- Font size control
- Markdown body
- Previous/Next navigation
- Copy link button

### Components
- Existing: MarketingHeader, MarketingFooter
- New: ArticleCard, FontSizeControl, ArticleNav

## Implementation Steps

| Step | Description | Status |
|------|-------------|--------|
| 1 | `lib/blog.ts` — metadata array + markdown parsing | ✅ Done |
| 2 | `/blog` index page | ✅ Done |
| 3 | `/blog/[slug]` article page | ✅ Done |
| 4 | SEO: generateMetadata + JSON-LD | ✅ Done (in step 3) |
| 5 | Font size control | ✅ Done (in step 3) |
| 6 | Header/footer links, final test | ✅ Done |

## Dependencies
- `gray-matter` (frontmatter parsing)
- `react-markdown` (markdown rendering)
- `rehype-raw` (HTML in markdown)
