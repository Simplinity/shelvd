/**
 * Shelvd public roadmap data.
 * 
 * Organized into three lanes: shipped, building, planned.
 * Update this file as features move between lanes.
 */

export type RoadmapStatus = 'shipped' | 'building' | 'planned'
export type RoadmapCategory = 'cataloging' | 'search' | 'data' | 'provenance' | 'admin' | 'website' | 'platform' | 'growth' | 'marketplace'

export interface RoadmapItem {
  title: string
  description: string
  category: RoadmapCategory
  status: RoadmapStatus
  version?: string
}

export const categoryConfig: Record<RoadmapCategory, { label: string; color: string }> = {
  cataloging: { label: 'Cataloging', color: 'bg-emerald-100 text-emerald-700' },
  search: { label: 'Search', color: 'bg-blue-100 text-blue-700' },
  data: { label: 'Data', color: 'bg-violet-100 text-violet-700' },
  provenance: { label: 'Provenance', color: 'bg-amber-100 text-amber-700' },
  admin: { label: 'Admin', color: 'bg-slate-100 text-slate-700' },
  website: { label: 'Website', color: 'bg-rose-100 text-rose-700' },
  platform: { label: 'Platform', color: 'bg-cyan-100 text-cyan-700' },
  growth: { label: 'Growth', color: 'bg-orange-100 text-orange-700' },
  marketplace: { label: 'Marketplace', color: 'bg-fuchsia-100 text-fuchsia-700' },
}

export const ROADMAP: RoadmapItem[] = [
  // ═══════════════════════════════
  // SHIPPED
  // ═══════════════════════════════
  {
    title: 'Bibliographic Cataloging',
    description: '76 formats, 45 cover types, 65 bindings, BISAC subjects, pagination, collation. Everything Excel couldn\'t handle.',
    category: 'cataloging',
    status: 'shipped',
    version: '0.1.0',
  },
  {
    title: 'ISBD Catalog Entries',
    description: 'Professional catalog entries generated in four languages. Your auction house will be impressed.',
    category: 'cataloging',
    status: 'shipped',
    version: '0.2.0',
  },
  {
    title: 'Contributors & MARC Roles',
    description: '69 contributor roles with smart name parsing. Because "author" is just the beginning.',
    category: 'cataloging',
    status: 'shipped',
    version: '0.2.0',
  },
  {
    title: 'Advanced Search',
    description: '14 searchable fields, query-by-example, global search, empty field search. Find the needle in your organized haystack.',
    category: 'search',
    status: 'shipped',
    version: '0.2.0',
  },
  {
    title: 'Import & Export',
    description: 'Excel import with smart mapping. Export to Excel, CSV, JSON anytime. Your data is yours. We keep saying this.',
    category: 'data',
    status: 'shipped',
    version: '0.3.0',
  },
  {
    title: 'Statistics Dashboard',
    description: 'Five tiers of charts and metrics. Total value, condition distribution, acquisition trends. More charts than a stockbroker\'s office.',
    category: 'data',
    status: 'shipped',
    version: '0.4.0',
  },
  {
    title: 'Admin & User Settings',
    description: 'Profile, preferences, date formats, items per page. Also: admin dashboard with user management.',
    category: 'admin',
    status: 'shipped',
    version: '0.5.0',
  },
  {
    title: 'External Links',
    description: 'Configurable link types per user, auto-fill URLs, open-in-new-tab. Connect your books to the world.',
    category: 'cataloging',
    status: 'shipped',
    version: '0.5.0',
  },
  {
    title: 'Library Lookup (9+ providers)',
    description: 'Library of Congress, BnF, DNB, K10plus, SUDOC, LIBRIS, Open Library, Google Books. One search, nine libraries.',
    category: 'data',
    status: 'shipped',
    version: '0.6.0',
  },
  {
    title: 'Duplicate Detection',
    description: 'Fuzzy matching with adjustable threshold. Find the books you accidentally cataloged twice at 3 AM.',
    category: 'search',
    status: 'shipped',
    version: '0.6.0',
  },
  {
    title: 'Collections & Tags',
    description: 'Multiple collections, colored tags, bulk actions. Organize by theme, room, project, or whim.',
    category: 'cataloging',
    status: 'shipped',
    version: '0.7.0',
  },
  {
    title: 'Provenance Tracking',
    description: 'Visual timelines with 10 owner types, 14 association types, evidence sources. The whole story, beautifully told.',
    category: 'provenance',
    status: 'shipped',
    version: '0.8.0',
  },
  {
    title: 'Enrich Mode',
    description: 'Search libraries and merge data field-by-field. Green for new, amber for different. A diff tool for bibliographers.',
    category: 'data',
    status: 'shipped',
    version: '0.8.0',
  },
  {
    title: 'Currency & Valuation',
    description: 'Multi-currency with live ECB rates, profit/loss tracking, home currency setting. Know what your collection is worth.',
    category: 'data',
    status: 'shipped',
    version: '0.8.0',
  },
  {
    title: 'Marketing Website',
    description: 'Landing page, Privacy Policy, Terms of Service, About, Changelog, Roadmap. All with Swiss design and questionable humor.',
    category: 'website',
    status: 'shipped',
    version: '0.9.0',
  },
  {
    title: 'Announcements',
    description: 'System-wide and targeted banners. Dismissible. For when we have something to say and can\'t wait for you to check the changelog.',
    category: 'admin',
    status: 'shipped',
    version: '0.9.0',
  },
  {
    title: 'Locale & Number Formatting',
    description: 'Single locale setting drives number format (1,234.56 vs 1.234,56) and date display. Because Belgium alone has three official languages.',
    category: 'platform',
    status: 'shipped',
    version: '0.9.0',
  },
  {
    title: 'Feedback & Bug Reporting',
    description: 'Bug reports, contact requests, callback requests — with admin queue, email alerts, and status tracking. Because "it doesn\'t work" is not a bug report.',
    category: 'platform',
    status: 'shipped',
    version: '0.9.0',
  },
  {
    title: 'Marginalia Blog',
    description: '22 articles on condition grading, ISBD, provenance, ISBN history, book formats. Authority content for collectors and excellent procrastination material.',
    category: 'website',
    status: 'shipped',
    version: '0.9.0',
  },
  {
    title: 'Admin System Stats',
    description: 'Growth charts, feature adoption, user activation funnel, data health. Dashboards for knowing what\'s actually happening on the platform.',
    category: 'admin',
    status: 'shipped',
    version: '0.10.0',
  },
  {
    title: 'Condition History',
    description: 'The physical life of a book: restorations, rebindings, repairs, damage events, assessments. Timeline with CRUD and auto-prompt on condition changes.',
    category: 'cataloging',
    status: 'shipped',
    version: '0.10.0',
  },
  {
    title: 'Printable PDF Inserts',
    description: 'Vintage 3\u00D75\" catalog cards with red vertical line, Courier typewriter font, and AACR layout. Full catalog sheets in Swiss typography across 6 paper sizes. Two formats, one button.',
    category: 'cataloging',
    status: 'shipped',
    version: '0.11.0',
  },

  // ═══════════════════════════════
  // PLANNED
  // ═══════════════════════════════

  // Core Product
  {
    title: 'Activity Logging & Live Feed',
    description: 'Every meaningful action recorded: book edits with JSON diffs, enrichments with source attribution, imports with summaries, admin actions with context. 20 log points across the platform. Personal /activity page with filters and pagination. Recent activity feed on /stats. Per-book timeline on detail pages. Admin live feed on dashboard + full /admin/activity viewer. The provenance of your provenance.',
    category: 'platform',
    status: 'shipped',
  },
  {
    title: 'Image Upload (Phase 2)',
    description: 'Direct file uploads via Vercel Blob: spine shots, damage photos, multiple images per book. Drag-and-drop, thumbnails, gallery view. Phase 1 (cover URLs) shipped in 0.12.0.',
    category: 'cataloging',
    status: 'planned',
  },
  {
    title: 'Cover Images',
    description: 'Paste a URL or let Enrich find one. Covers on detail pages, list thumbnails, grid cards. Click to view full-size in a lightbox. Phase 1 of image upload.',
    category: 'cataloging',
    status: 'shipped',
    version: '0.12.0',
  },
  {
    title: 'Enrich Everywhere',
    description: 'Enrich on add form, one-click from detail page, auto-trigger via URL parameter. Lookup promoted to main navigation. Data enrichment is now a first-class citizen.',
    category: 'data',
    status: 'shipped',
    version: '0.12.0',
  },
  {
    title: 'Sticky Navigation',
    description: 'Header stays fixed while scrolling. Always one click away from your collection, lookup, or search.',
    category: 'platform',
    status: 'shipped',
    version: '0.12.0',
  },
  {
    title: 'Sharing & Public Catalog',
    description: 'Public profile pages, shareable collection links, embed widgets. Show off your collection without inviting people over.',
    category: 'platform',
    status: 'planned',
  },
  {
    title: 'Mobile Responsiveness',
    description: 'Full mobile audit: hamburger nav, touch targets, single-column forms. Currently the app assumes you own a desk. Not everyone does.',
    category: 'platform',
    status: 'planned',
  },
  {
    title: 'Knowledge Base',
    description: 'Getting started guide, FAQ, feature documentation. For people who read manuals. We respect you.',
    category: 'website',
    status: 'planned',
  },

  // User Onboarding
  {
    title: 'User Onboarding',
    description: 'Five components across three phases. Welcome wizard ("How do you collect?" — collector, dealer, librarian, explorer — personalized first step based on collection size). Smart empty states that teach instead of dead-ending. Getting Started checklist (6 steps showcasing core value: add a book, try Library Lookup, create a collection, add provenance, export). Contextual first-visit hints on key screens. Optional demo book — a fully cataloged entry showing what a complete bibliographic record looks like. Because a collector who sees a book with full provenance wants that for their own library.',
    category: 'platform',
    status: 'planned',
  },

  // Book Data Features
  {
    title: 'Insurance & Valuation Reports',
    description: 'Generate timestamped PDF reports for insurance: book list with photos, estimated values, total collection value. Export per collection or full library.',
    category: 'data',
    status: 'planned',
  },
  {
    title: 'Valuation History',
    description: 'Track market value over time without ownership changes. Appraisals, auction estimates, dealer quotes. A price chart for every book.',
    category: 'data',
    status: 'planned',
  },
  // Dealer & Marketplace
  {
    title: 'Dealer Directory & Messaging',
    description: 'Dealers register with a business profile. Collectors browse the directory, send wishlists or collections with a message. Connecting buyers and sellers, the old-fashioned way.',
    category: 'marketplace',
    status: 'planned',
  },

  // Admin
  {
    title: 'User Management & Detail Pages',
    description: 'Full user profiles with stats, collections, recent books, support history. Admin notes, status actions, direct email. Sortable list with heat indicators.',
    category: 'admin',
    status: 'shipped',
    version: '0.12.0',
  },
  {
    title: 'Admin Sidebar Navigation',
    description: 'Persistent sidebar with icon navigation across all admin pages. Badges for actionable items. No more "Back to Dashboard" ping-pong. Compact on mobile.',
    category: 'admin',
    status: 'shipped',
    version: '0.12.0',
  },
  {
    title: 'Weekly Admin Digest',
    description: 'Automated email every Monday: new signups, books added, open tickets, health delta, most active users. Platform pulse without opening the dashboard.',
    category: 'admin',
    status: 'planned',
  },
  {
    title: 'User Onboarding Funnel (Admin View)',
    description: 'Visual 6-step journey tracker on each user detail page: signed up → first book → 10 books → used enrich → collections → rich metadata. Aggregated funnel on admin dashboard showing conversion at each step. Identifies friction points at a glance.',
    category: 'admin',
    status: 'planned',
  },
  // Tier System & Feature Gating
  {
    title: 'Tier System & Feature Gating',
    description: 'Three tiers: Collector (free), Collector Pro, Dealer. Database-driven feature flags — no hardcoded tier checks in code. Reassigning a feature from one tier to another is a database update, not a deployment. Upgrade hints in UI: locked features are visible but gated. Foundation for Stripe integration.',
    category: 'platform',
    status: 'planned',
  },

  // Invite Codes
  {
    title: 'Invite Codes',
    description: 'Optional promo codes on signup for attribution and benefits. Hand a blogger a unique code, print one on a bookfair flyer, track which channels convert. Codes can grant trial days or lifetime free tier. Admin dashboard shows per-code stats: redemptions, active users, books added. Marketing without measurement is guesswork.',
    category: 'platform',
    status: 'shipped',
  },

  {
    title: 'Admin Impersonation',
    description: '"View as user" mode for debugging. See exactly what a user sees — their books, collections, settings. With a big red banner so you don\'t forget whose life you\'re living.',
    category: 'admin',
    status: 'planned',
  },
  {
    title: 'Platform Health Score & Checks',
    description: 'One glance: a health bar on the dashboard showing missing ISBNs, covers, conditions. Click through to orphaned records, inconsistencies, duplicate publishers. The janitor\'s dashboard with a report card.',
    category: 'admin',
    status: 'planned',
  },
  {
    title: 'Collection Audit',
    description: 'Your library, scored. Missing contributors, books without identifiers, provenance gaps, incomplete fields — all surfaced with one-click fixes. "Your collection is 87% complete. These 14 books need attention."',
    category: 'cataloging',
    status: 'planned',
  },
  {
    title: 'Catalog Generator',
    description: 'Select books, generate a professional DOCX catalog. Numbered entries with author, title, year, condition, provenance, optional pricing. Image placeholders ready for your photos. Editable in Word — we build the skeleton, you make it yours. For dealers, auction houses, and collectors who take their library seriously.',
    category: 'cataloging',
    status: 'planned',
  },
]
