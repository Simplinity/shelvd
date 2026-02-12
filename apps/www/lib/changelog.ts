/**
 * Shelvd version and changelog data.
 * 
 * Update APP_VERSION when tagging a new release.
 * Add new entries to the TOP of the CHANGELOG array.
 */

export const APP_VERSION = '0.19.0'

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
    version: '0.19.0',
    date: '2026-02-12',
    title: 'Rare Books & Scandinavian Libraries',
    description: 'CERL HPB opens up 6 million records of European printed books from 1455–1830, with provenance, printer, and binding data. DanBib adds 14 million records from the Danish union catalog.',
    changes: [
      { type: 'added', text: 'CERL HPB (EU) — Heritage of the Printed Book. 6M+ records of European rare books (1455–1830) via SRU/MARCXML. Rich metadata: author life dates, printers, provenance, former owners, physical dimensions, and binding notes' },
      { type: 'added', text: 'DanBib / bibliotek.dk (Denmark) — 14M+ records from the Danish union catalog via OpenSearch API. Custom DKABM/Dublin Core parser with CQL search, book-type filtering, and full edition detail' },
      { type: 'improved', text: 'Book Lookup now spans 21 providers across 19 countries and 4 continents' },
    ],
  },
  {
    version: '0.18.0',
    date: '2026-02-12',
    title: 'Global Library Expansion',
    description: 'Five new library catalogs across four continents. From Helsinki to Tokyo, from Rome to Canberra — your books can now be enriched from twenty sources across eighteen countries.',
    changes: [
      { type: 'added', text: 'Finna (Finland) — REST JSON API aggregating 460+ Finnish archives, libraries, and museums. No authentication, CC0 licensed metadata' },
      { type: 'added', text: 'OPAC SBN (Italy) — the Italian union catalog covering 6,300+ libraries with 17 million bibliographic records' },
      { type: 'added', text: 'NDL (Japan) — National Diet Library, the largest library in Japan. First Asian coverage via OpenSearch API' },
      { type: 'added', text: 'Trove (Australia) — National Library of Australia discovery service. First Oceania coverage (pending API key approval)' },
      { type: 'added', text: 'KB Netherlands — Koninklijke Bibliotheek with a new Dublin Core XML parser. Complements Standaard Boekhandel for Dutch coverage' },
      { type: 'improved', text: 'Book Lookup now spans 20 providers across 18 countries and 4 continents: Europe, North America, Asia, and Oceania' },
    ],
  },
  {
    version: '0.17.0',
    date: '2026-02-12',
    title: 'Nordic & British Libraries',
    description: 'Three more national library catalogs, including a custom MODS parser for the UK. Fifteen providers, thirteen countries.',
    changes: [
      { type: 'added', text: 'BIBSYS/Oria (Norway) — Norwegian academic and research libraries via Alma SRU' },
      { type: 'added', text: 'ÖNB (Austria) — Österreichische Nationalbibliothek, the Austrian national library catalog' },
      { type: 'added', text: 'Library Hub Discover (UK) — aggregates 100+ British academic and research libraries. Custom MODS XML parser built for this provider' },
      { type: 'improved', text: 'Book Lookup expanded to 15 providers across 13 countries' },
    ],
  },
  {
    version: '0.16.0',
    date: '2026-02-12',
    title: 'European Library Expansion',
    description: 'Three new library providers and a collection health dashboard. Your books now get enriched from twelve sources across ten countries.',
    changes: [
      { type: 'added', text: 'Unicat (Belgium) — the Belgian union catalog covering KBR, university libraries, and three major library networks. 19.5 million records' },
      { type: 'added', text: 'BNE (Spain) — Biblioteca Nacional de España, the Spanish national library catalog' },
      { type: 'added', text: 'Swisscovery (Switzerland) — SLSP network covering 500+ Swiss academic and research libraries' },
      { type: 'added', text: 'Collection Audit — a per-user health score at /audit with 10 completeness checks, expandable book lists, and one-click fix links. Available on Collector Pro and Dealer tiers' },
      { type: 'improved', text: 'Book Lookup now covers 12 providers across 10 countries: US, France, Germany, Belgium, Spain, Switzerland, Sweden, and three global sources' },
    ],
  },
  {
    version: '0.15.0',
    date: '2026-02-12',
    title: 'Valuation History',
    description: 'Every book now has a price memory. Track appraisals, auction results, dealer quotes, and market research over time — and see the trend.',
    changes: [
      { type: 'added', text: 'Valuation history timeline on every book detail page — see how value changed over time, with source and appraiser for each entry' },
      { type: 'added', text: 'Value trend chart — a line chart appears automatically when a book has two or more dated valuations' },
      { type: 'added', text: 'Seven valuation sources: self estimate, professional appraisal, auction result, dealer quote, insurance valuation, market research, and provenance purchase' },
      { type: 'added', text: 'Provenance auto-sync — when a provenance entry has a price, a matching valuation entry is created automatically. Edit one, the other follows' },
      { type: 'added', text: 'Full CRUD editor for valuations on the edit page — add, edit, delete, reorder. Provenance-linked entries are read-only with a clear explanation' },
      { type: 'improved', text: 'Collection value and stats now calculated from valuation history instead of a single flat field — more accurate, more complete' },
      { type: 'improved', text: 'PDF catalog sheets and Excel exports now pull pricing data from valuation history' },
      { type: 'improved', text: 'Old pricing fields (lowest price, highest price, estimated value, valuation date) removed from the edit form and dropped from the database. Less clutter, same data' },
    ],
  },
  {
    version: '0.14.0',
    date: '2026-02-11',
    title: 'Membership Tiers',
    description: 'Three tiers, transparent pricing, and the infrastructure to grow. Early Access users still get everything for free.',
    changes: [
      { type: 'added', text: 'Three membership tiers: Collector (free), Collector Pro (€9.99/mo), and Dealer (€49/mo) — each with their own features, storage limits, and support level' },
      { type: 'added', text: 'Pricing page showing exactly what each tier includes, with a prominent Early Access banner for the first 100 users' },
      { type: 'added', text: 'Profile settings now show your current tier and lifetime status' },
      { type: 'added', text: 'Phone, company name, and website fields added to your profile' },
      { type: 'added', text: 'Admin can change any user\'s tier directly from the user detail page — Collector, Collector Pro, or Dealer with one click' },
      { type: 'improved', text: 'Early Access benefit clarified everywhere: first 100 users get lifetime Collector Pro' },
      { type: 'improved', text: 'Tier limits are now real numbers instead of "unlimited" — Dealer gets 100,000 books and 1,000 tags. Easier to reason about, no surprises' },
      { type: 'improved', text: 'Feature toggles and limit changes now require confirmation before saving — no more accidental changes affecting all users' },
      { type: 'fixed', text: 'Logo in the header now links to the website instead of duplicating the Collection link' },
    ],
  },
  {
    version: '0.13.0',
    date: '2026-02-11',
    title: 'Activity Feed & Invite Codes',
    description: 'Your collection now has a memory. Every book added, every edit, every enrichment — tracked and browsable. Plus: invite codes for sharing Shelvd with the world.',
    changes: [
      { type: 'added', text: 'Activity feed — see everything you\'ve done: edits, enrichments, imports, collection changes. Available in the main navigation and on your stats page' },
      { type: 'added', text: 'Book timeline — every book shows its own change history: when you added it, what changed, when you enriched it' },
      { type: 'added', text: 'Invite codes — shareable promo codes for bloggers, bookfairs, and friends. Codes can grant trial days or lifetime Collector Pro' },
      { type: 'improved', text: 'Profile pages now show more detail across the platform' },
      { type: 'fixed', text: 'Security improvements to data access policies' },
    ],
  },
  {
    version: '0.12.0',
    date: '2026-02-11',
    title: 'Cover Images & Enrich Everywhere',
    description: 'Your books finally have faces. Cover images from Google Books and Open Library, plus Enrich now works everywhere — not just the edit form.',
    changes: [
      { type: 'added', text: 'Cover images — found automatically via Enrich, or paste your own URL. Shown on detail pages, list thumbnails, and grid cards' },
      { type: 'added', text: 'Click any cover to view it full-size' },
      { type: 'added', text: 'Enrich now available when adding a new book and directly from any book\'s detail page' },
      { type: 'added', text: 'Lookup moved to the header — search for books from anywhere in the app' },
      { type: 'improved', text: 'Covers follow through the entire flow: search → select → add to library. No more disappearing images' },
      { type: 'improved', text: 'Navigation stays visible while scrolling' },
    ],
  },
  {
    version: '0.11.0',
    date: '2026-02-09',
    title: 'Print Inserts & Polish',
    description: 'Your digital collection meets paper. Print vintage catalog cards and professional catalog sheets for any book.',
    changes: [
      { type: 'added', text: 'Printable PDF inserts — generate a vintage 3×5" catalog card or a full catalog sheet from any book\'s detail page' },
      { type: 'added', text: 'Catalog card with authentic library aesthetic: red line, typewriter font, punch hole. Decorative and clean versions included' },
      { type: 'added', text: 'Catalog sheet available in 6 paper sizes (A4 through US Half Letter) with Swiss typography' },
      { type: 'added', text: 'Live stats and literary quotes on login and signup pages' },
      { type: 'improved', text: 'Form sections reordered to match how collectors actually think about their books' },
      { type: 'improved', text: 'Support simplified to two forms: Bug Report and Message' },
      { type: 'fixed', text: 'Support email notifications now deliver reliably' },
    ],
  },
  {
    version: '0.10.0',
    date: '2026-02-09',
    title: 'Support, Blog & Navigation',
    description: 'Report bugs, read 22 articles about book collecting, and find everything through a proper user menu.',
    changes: [
      { type: 'added', text: 'Feedback & Support — report bugs or send a message directly from the app, with status tracking' },
      { type: 'added', text: 'Marginalia blog — 22 articles on ISBN history, condition grading, provenance, book formats, and more' },
      { type: 'added', text: 'Public roadmap — see what\'s shipped, in progress, and planned' },
      { type: 'added', text: 'User menu with quick access to Settings, Support, Blog, Roadmap, and Changelog' },
      { type: 'improved', text: 'Cleaner header and navigation throughout the app' },
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
