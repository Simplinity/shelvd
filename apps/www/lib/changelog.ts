/**
 * Shelvd version and changelog data.
 * 
 * Update APP_VERSION when tagging a new release.
 * Add new entries to the TOP of the CHANGELOG array.
 */

export const APP_VERSION = '0.12.0'

export type ChangeType = 'added' | 'improved' | 'fixed'

export interface ChangeEntry {
  type: ChangeType
  text: string
}

export interface ChangelogRelease {
  version: string
  date: string
  title: string
  description: string
  changes: ChangeEntry[]
}

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '0.12.0',
    date: '2026-02-11',
    title: 'Cover Images & Enrich Everywhere',
    description: 'The update where your books finally got their portraits. Also: Enrich escaped from the edit form and is now everywhere it should be.',
    changes: [
      { type: 'added', text: 'Cover images — paste a URL or let Enrich find one from Google Books or Open Library. Displayed on detail pages, list view thumbnails, and grid view cards' },
      { type: 'added', text: 'Image lightbox — click any cover image to view it full-size in a dark overlay. Works on detail page, lookup, and enrich views' },
      { type: 'added', text: 'Enrich on Add form — no longer limited to editing existing books. Enrich data from external sources while adding a new book' },
      { type: 'added', text: 'Enrich button on book detail page — one click takes you to edit mode with Enrich auto-triggered. No more hunting through collapsed sections' },
      { type: 'added', text: 'Lookup in header navigation — always accessible from anywhere in the app, not buried on the books list page' },
      { type: 'improved', text: 'Cover images auto-fill through the entire lookup flow: search → select → detail → Add to Library. No covers lost in transit' },
      { type: 'improved', text: 'Sticky header — navigation stays visible while scrolling. Because scrolling back to the top is so 2024' },
      { type: 'improved', text: 'Cover preview shown prominently at top of add and edit forms, not hidden inside a collapsed section' },
      { type: 'fixed', text: 'Lookup returning zero results showed a blank page instead of "No results found" message' },
      { type: 'fixed', text: 'OpenLibrary cover images were lost when navigating from search results to detail view' },
    ],
  },
  {
    version: '0.11.0',
    date: '2026-02-09',
    title: 'Print Inserts & Polish',
    description: 'The update where your screen collection meets paper. Because some things deserve to exist in both worlds.',
    changes: [
      { type: 'added', text: 'Printable PDF book inserts — generate catalog cards and full catalog sheets directly from any book\'s detail page' },
      { type: 'added', text: 'Vintage catalog card (3\u00D75\u201D) — authentic library aesthetic with red vertical line, Courier typewriter font, AACR indentation, cutter numbers, and punch hole. Two pages per PDF: decorative version for display, clean version for printing on real card stock' },
      { type: 'added', text: 'Full catalog sheet — complete book record in Swiss typography across 6 paper sizes: A4, A5, A6, US Letter, US Legal, US Half Letter. Red accent bar, inline field pairs, empty fields omitted' },
      { type: 'added', text: 'Live stats on auth pages — books cataloged, contributors tracked, and publishers cataloged, fetched from the database in real time' },
      { type: 'added', text: 'Literary quotes on auth pages — rotating quotes from Borges, Cicero, Eco, Hemingway, and others' },
      { type: 'improved', text: 'Form sections reordered by logical collector workflow: Identity \u2192 Bibliographic \u2192 Physical \u2192 History \u2192 Classification \u2192 Collection Management \u2192 Supplementary' },
      { type: 'improved', text: 'Catalog sheet layout: no decorative lines, inline field pairs that follow content naturally instead of fixed columns, section headers in red small caps' },
      { type: 'added', text: 'Admin support responses now email the user directly — branded HTML email with your response and the original message quoted, plus a link to their tickets' },
      { type: 'fixed', text: 'Support ticket email notifications were silently failing — non-admin users couldn\'t call the admin RPC to look up emails. Now uses environment variable instead' },
      { type: 'fixed', text: 'Email sends were not awaited in serverless functions — the function terminated before Resend could deliver. Classic.' },
      { type: 'improved', text: 'Support forms simplified from three types (Bug/Contact/Callback) to two: Bug Report and Message. No more phone numbers, timezones, or urgency selectors — this is a book catalog, not an enterprise helpdesk' },
    ],
  },
  {
    version: '0.10.0',
    date: '2026-02-09',
    title: 'Admin Intelligence & Navigation',
    description: 'The update where Shelvd learned to look at itself in the mirror. And navigate properly.',
    changes: [
      { type: 'added', text: 'Feedback & Support — submit bug reports, contact requests, and callback requests directly from the app, with status tracking so you know we\'re on it' },
      { type: 'added', text: 'Email notifications — admins are alerted immediately when you submit a support request' },
      { type: 'added', text: 'Admin stats dashboard — growth charts, feature adoption rates, user activation funnel, data health metrics' },
      { type: 'added', text: 'Marginalia blog — 22 articles on ISBN history, ISBD standards, condition grading, provenance, book formats, and other things you didn\'t know you needed to know' },
      { type: 'added', text: 'Public roadmap — see what\'s planned, what\'s being built, and what\'s shipped, with new Growth and Marketplace categories' },
      { type: 'added', text: 'User menu — Settings, Support, Marginalia, Roadmap, Changelog, and Admin now tucked behind a clean dropdown icon' },
      { type: 'improved', text: 'Header redesign — cleaner layout, no more cramped navigation' },
      { type: 'improved', text: 'Blog, roadmap, changelog, and about pages now accessible when logged in — no more logging out to read your own blog' },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-02-08',
    title: 'The Website',
    description: 'Shelvd now has a public face. And opinions.',
    changes: [
      { type: 'added', text: 'Landing page — hero, 12-feature showcase, 4 visual spotlights, 3-tier pricing, and more personality than most enterprise software' },
      { type: 'added', text: 'Privacy Policy — GDPR-compliant, 11 sections, written by a human (you can tell because it contains jokes)' },
      { type: 'added', text: 'Terms of Service — 14 sections of readable legal text, which may constitute a minor miracle' },
      { type: 'added', text: 'About page — the origin story, featuring a broken spreadsheet and 28,000 books' },
      { type: 'added', text: 'Changelog — you\'re reading it' },
      { type: 'added', text: 'Announcement banners — dismissible messages for updates, maintenance, and news' },
      { type: 'added', text: 'Collapsible form sections — because nobody needs to see all 76 formats at once' },
      { type: 'added', text: 'Locale & number formatting — pick your locale (en-US, nl-BE, de-DE, fr-FR, etc.) and all numbers and dates adjust automatically' },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-02-08',
    title: 'Enrich, Provenance & Valuation',
    description: 'The update that turned Shelvd from a catalog into a proper bibliographic tool.',
    changes: [
      { type: 'added', text: 'Enrich Mode — search library databases and merge new data field-by-field: green for new, amber for different, you decide what stays' },
      { type: 'added', text: 'Provenance tracking — visual timeline with 10 owner types, 14 association types, evidence sources, and acquisition records' },
      { type: 'added', text: 'Currency & valuation — home currency setting, multi-currency support, live ECB exchange rates, profit/loss tracking per book' },
      { type: 'added', text: 'Provenance in ISBD entries — your catalog entries now include the ownership chain' },
      { type: 'added', text: 'Provenance import/export — bring your provenance data in and out via Excel/CSV' },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-02-07',
    title: 'Collections & Tags',
    description: 'Organize your books the way your brain works, not the way a database does.',
    changes: [
      { type: 'added', text: 'Multiple collections — Library, Wishlist, and unlimited custom collections with drag-to-reorder' },
      { type: 'added', text: 'Custom colored tags — create, rename, recolor, and filter by tag' },
      { type: 'added', text: 'Bulk collection actions — add to or remove from any collection in one click' },
      { type: 'added', text: 'Collection chips on book detail — toggle collections directly from any book page' },
      { type: 'added', text: '"Move to Library" — one-click button for promoting books from Wishlist' },
      { type: 'added', text: 'Tags management in settings' },
      { type: 'improved', text: 'All 14 book statuses now with proper labels and colors' },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-02-05',
    title: 'Library Lookup',
    description: 'Nine libraries, one search box. Your local rare book dealer doesn\'t stand a chance.',
    changes: [
      { type: 'added', text: 'Library lookup — Library of Congress, BnF, DNB, K10plus, SUDOC, LIBRIS, Open Library, Google Books, and more coming' },
      { type: 'added', text: 'Multi-field search — title, author, publisher, year, ISBN across all providers simultaneously' },
      { type: 'added', text: 'Duplicate detection — fuzzy matching with adjustable threshold to find books you cataloged twice at 3 AM' },
      { type: 'added', text: 'External links from lookup — source URLs automatically saved to your book record' },
      { type: 'added', text: 'Draft status — for books pending review before entering your collection' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-02-03',
    title: 'Admin & Settings',
    description: 'The boring infrastructure that makes everything else possible.',
    changes: [
      { type: 'added', text: 'Admin dashboard — user management, book counts, platform overview' },
      { type: 'added', text: 'User settings — profile, password, preferences, address, subscription management, delete account' },
      { type: 'added', text: 'External links — configurable link types per user with auto-fill URLs (WorldCat, OpenLibrary, Google Books, etc.)' },
      { type: 'added', text: 'Items per page — separate settings for list view (up to 500) and grid view (up to 100)' },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-02-01',
    title: 'Statistics Dashboard',
    description: 'More charts than a stockbroker\'s office. All of them about books.',
    changes: [
      { type: 'added', text: 'Statistics dashboard — key metrics, status & condition breakdown, content & origin, physical & storage, time & growth charts' },
      { type: 'added', text: 'Export selected books — choose which books to include in your export, not just "all or nothing"' },
      { type: 'added', text: 'Landing page with features list and early access offer' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-01-31',
    title: 'Import & Export',
    description: 'Your data is yours. We mean it.',
    changes: [
      { type: 'added', text: 'Excel import — smart field mapping, validation, and error handling for bulk uploads' },
      { type: 'added', text: 'Multi-format export — Excel, CSV, JSON, one click each' },
      { type: 'added', text: 'Swiss Design header with navigation' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-01-30',
    title: 'Search & Edit',
    description: 'Finding your books is now almost as satisfying as buying them.',
    changes: [
      { type: 'added', text: 'Global search — instant filtering across your entire collection as you type' },
      { type: 'added', text: 'Advanced search — 14 fields with query-by-example, empty field search, and recent search history' },
      { type: 'added', text: 'Contributors — add and edit with 69 MARC roles (author, illustrator, translator, binder, cartographer…)' },
      { type: 'added', text: 'Manual book entry — full add page with all fields' },
      { type: 'added', text: 'Sortable columns and bulk delete with checkbox selection' },
      { type: 'added', text: 'ISBD catalog entries — professional entries generated in 4 languages (EN/FR/DE/NL)' },
      { type: 'added', text: '76 historical book formats and BISAC subject codes with searchable dropdowns' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-01-28',
    title: 'Foundation',
    description: 'The one where we stopped using Excel.',
    changes: [
      { type: 'added', text: 'Authentication — sign up, sign in, password reset' },
      { type: 'added', text: 'Books listing — list and grid views with pagination' },
      { type: 'added', text: 'Book detail page — every field visible at a glance' },
      { type: 'added', text: 'Book editing — inline edit with autocomplete dropdowns' },
      { type: 'added', text: 'Previous/next navigation between books' },
    ],
  },
]
