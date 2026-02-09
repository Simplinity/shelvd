/**
 * Shelvd version and changelog data.
 * 
 * Update APP_VERSION when tagging a new release.
 * Add new entries to the TOP of the CHANGELOG array.
 */

export const APP_VERSION = '0.10.0'

export type ChangeType = 'added' | 'improved' | 'fixed' | 'removed'

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
    version: '0.10.0',
    date: '2026-02-09',
    title: 'Admin Intelligence & Navigation',
    description: 'The update where Shelvd learned to look at itself in the mirror. And navigate properly.',
    changes: [
      { type: 'added', text: 'Feedback & Support system — bug reports, contact requests, callback requests with admin queue, priority levels, status workflow, admin notes and responses' },
      { type: 'added', text: 'Email notifications — admin users receive email alerts on new support submissions via Resend integration' },
      { type: 'added', text: 'Admin system stats dashboard — growth charts, feature adoption rates, user activation funnel, data health metrics, books per user breakdown' },
      { type: 'added', text: 'Marginalia blog — 22 articles on ISBN history, ISBD standards, condition grading, provenance, book formats, and other things you didn\'t know you needed to know' },
      { type: 'added', text: 'Public roadmap page — planned features first, shipped features as proof of execution, with new Growth and Marketplace categories' },
      { type: 'added', text: 'User menu dropdown — Settings, Support, Marginalia, Roadmap, Changelog, Admin, and Sign Out behind a clean user icon' },
      { type: 'improved', text: 'Header redesign — core navigation left-aligned, user menu pushed right, no more overflow with 10+ nav items' },
      { type: 'improved', text: 'Marketing pages now accessible when logged in — blog, roadmap, changelog, about all reachable from the app' },
      { type: 'improved', text: 'Marketing header detects auth state — shows "Go to Collection" for logged-in users instead of Sign In / Get Started' },
      { type: 'improved', text: 'Admin quick links restyled as proper cards matching the dashboard design' },
      { type: 'added', text: '7 new database RPC functions for admin analytics (bypassing RLS for platform-wide statistics)' },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-02-08',
    title: 'The Website',
    description: 'Shelvd now has a public face. And opinions.',
    changes: [
      { type: 'added', text: 'Complete landing page redesign: hero, 12-feature showcase, 4 visual spotlights, 3-tier pricing, Swiss design with tongue-in-cheek humor' },
      { type: 'added', text: 'Privacy Policy page — GDPR-compliant, 11 sections, written by a human (you can tell because it contains jokes)' },
      { type: 'added', text: 'Terms of Service page — 14 sections of readable legal text, which may constitute a minor miracle' },
      { type: 'added', text: 'About page — the origin story, featuring a broken spreadsheet and 28,000 books' },
      { type: 'added', text: 'Changelog page — you\'re reading it' },
      { type: 'added', text: 'Shared marketing header with Info dropdown, shared footer with 4-column layout' },
      { type: 'added', text: 'Announcement system — dismissible banners for system-wide and targeted messages' },
      { type: 'added', text: 'Collapsible form sections on add/edit pages — because nobody needs to see all 76 formats at once' },
      { type: 'added', text: 'Locale & number formatting — single locale setting (en-US, nl-BE, de-DE, fr-FR, etc.) drives number and date display across all pages' },
      { type: 'added', text: 'App versioning system' },
      { type: 'removed', text: 'Legacy date_format column (superseded by locale)' },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-02-08',
    title: 'Enrich, Provenance & Valuation',
    description: 'The update that turned Shelvd from a catalog into a proper bibliographic tool.',
    changes: [
      { type: 'added', text: 'Enrich Mode — search library databases and merge new data field-by-field: green for new, amber for different, you decide what stays' },
      { type: 'added', text: 'Provenance tracking — visual timeline with 10 owner types, 14 association types, evidence sources, acquisition records' },
      { type: 'added', text: 'Currency & valuation system — home currency setting, multi-currency support, live ECB exchange rates, P/L tracking' },
      { type: 'added', text: 'Smart contributor name handling — auto-parse "First Last" to "Last, First" format across all forms' },
      { type: 'added', text: 'Provenance integrated into ISBD catalog entry generator' },
      { type: 'added', text: 'Provenance import/export via structured entries in Excel/CSV' },
      { type: 'removed', text: 'Legacy free-text provenance field (migrated to structured entries)' },
      { type: 'removed', text: 'Acquisition section (migrated into provenance "self" entries)' },
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
      { type: 'added', text: 'Bulk collection actions — add to / remove from collection in selection bar' },
      { type: 'added', text: 'Collection filtering on books list with fast paginated count' },
      { type: 'added', text: 'Toggleable collection chips on book detail page with toast feedback' },
      { type: 'added', text: '"Move to Library" one-click button on book detail (for Wishlist → Library)' },
      { type: 'added', text: 'Tags management page in settings' },
      { type: 'improved', text: 'All 14 book statuses now with proper labels and colors' },
      { type: 'improved', text: 'Full-width layout (max-w-7xl) on all pages' },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-02-05',
    title: 'Library Lookup',
    description: 'Nine libraries, one search box. Your local rare book dealer doesn\'t stand a chance.',
    changes: [
      { type: 'added', text: 'Library lookup: Library of Congress, BnF, DNB, K10plus, SUDOC, LIBRIS, Open Library, Google Books — and more coming' },
      { type: 'added', text: 'SRU/Z39.50 protocol support for academic library systems' },
      { type: 'added', text: 'Multi-field search: title, author, publisher, year, ISBN — across all providers simultaneously' },
      { type: 'added', text: 'Duplicate detection page with fuzzy matching and adjustable threshold' },
      { type: 'added', text: 'Auto-create external links from lookup source URLs' },
      { type: 'added', text: '"Draft" status for books pending review' },
      { type: 'added', text: 'Lookup button on add book page' },
      { type: 'improved', text: 'Provider evaluation: tested and documented all 15+ candidates' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-02-03',
    title: 'Admin & Settings',
    description: 'The boring infrastructure that makes everything else possible.',
    changes: [
      { type: 'added', text: 'Admin dashboard with user management and book counts' },
      { type: 'added', text: 'User settings: profile, password, preferences, address, subscription, delete account' },
      { type: 'added', text: 'External links system — configurable link types per user, auto-fill URLs, open-in-new-tab' },
      { type: 'added', text: 'Date format preference (applied across all pages)' },
      { type: 'added', text: 'Items per page: separate settings for list view (up to 500) and grid view (up to 100)' },
      { type: 'improved', text: 'Merged admin dashboard and user management into single page' },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-02-01',
    title: 'Statistics Dashboard',
    description: 'More charts than a stockbroker\'s office. All of them about books.',
    changes: [
      { type: 'added', text: 'Five-tier statistics dashboard: key metrics, status & condition, content & origin, physical & storage, time & growth' },
      { type: 'added', text: 'Stats caching in user_stats table with manual refresh' },
      { type: 'added', text: 'Export selected books only (not just "export all")' },
      { type: 'added', text: 'First landing page with features list and early access offer' },
      { type: 'improved', text: 'Stats page: removed icons, added 8 new metrics' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-01-31',
    title: 'Import & Export',
    description: 'Your data is yours. We mean it.',
    changes: [
      { type: 'added', text: 'Excel import with smart field mapping and validation' },
      { type: 'added', text: 'Multi-format export: Excel, CSV, JSON — one click each' },
      { type: 'added', text: 'Swiss Design header with navigation' },
      { type: 'added', text: 'Extended physical description fields' },
      { type: 'added', text: 'Import button in books page header' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-01-30',
    title: 'Search & Edit',
    description: 'Finding your books is now almost as satisfying as buying them.',
    changes: [
      { type: 'added', text: 'Global search bar with instant client-side filtering' },
      { type: 'added', text: 'Query-by-example search (FileMaker-style) with all fields' },
      { type: 'added', text: 'Empty field search with = and != syntax' },
      { type: 'added', text: 'Recent searches with result counts' },
      { type: 'added', text: 'Contributor editing with 69 MARC roles' },
      { type: 'added', text: 'Manual book entry page (/books/add)' },
      { type: 'added', text: 'Sortable table columns' },
      { type: 'added', text: 'Bulk delete with checkbox selection' },
      { type: 'added', text: 'ISBD catalog entry generator in 4 languages (EN/FR/DE/NL)' },
      { type: 'added', text: 'Book format dropdown with 76 historical formats' },
      { type: 'added', text: 'BISAC subject codes with searchable dropdown' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-01-28',
    title: 'Foundation',
    description: 'The one where we stopped using Excel.',
    changes: [
      { type: 'added', text: 'Supabase database with full book schema' },
      { type: 'added', text: 'Authentication flow with Swiss Design' },
      { type: 'added', text: 'Books listing with list and grid views' },
      { type: 'added', text: 'Book detail page with all fields' },
      { type: 'added', text: 'Book edit page with autocomplete dropdowns' },
      { type: 'added', text: 'Previous/next navigation on book detail' },
      { type: 'added', text: 'FileMaker data import' },
    ],
  },
]
