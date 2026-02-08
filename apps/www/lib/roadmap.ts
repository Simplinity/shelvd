/**
 * Shelvd public roadmap data.
 * 
 * Organized into three lanes: shipped, building, planned.
 * Update this file as features move between lanes.
 */

export type RoadmapStatus = 'shipped' | 'building' | 'planned'
export type RoadmapCategory = 'cataloging' | 'search' | 'data' | 'provenance' | 'admin' | 'website' | 'platform'

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
}

export const ROADMAP: RoadmapItem[] = [
  // ═══ SHIPPED ═══
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

  // ═══ BUILDING ═══
  {
    title: 'Locale & Number Formatting',
    description: 'Single locale setting drives number format (1,234.56 vs 1.234,56) and date display. Because Belgium alone has three official languages.',
    category: 'platform',
    status: 'building',
  },

  // ═══ PLANNED ═══
  {
    title: 'Image Upload',
    description: 'Cover photos, spine shots, damage documentation. A gallery for every book. Your insurance company will thank you.',
    category: 'cataloging',
    status: 'planned',
  },
  {
    title: 'Activity Logging',
    description: 'Who changed what, when, and why. JSON diffs for every edit. The provenance of your provenance.',
    category: 'admin',
    status: 'planned',
  },
  {
    title: 'Feedback & Bug Reporting',
    description: 'In-app feedback form with auto-attached browser info. Because "it doesn\'t work" is not a bug report.',
    category: 'platform',
    status: 'planned',
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
  {
    title: 'Blog',
    description: 'Articles on condition grading, ISBD, provenance, book formats. Authority content for collectors and excellent procrastination material.',
    category: 'website',
    status: 'planned',
  },
  {
    title: 'Admin System Stats',
    description: 'Total books, users, storage, growth trends. Dashboards for the person running this one-person operation.',
    category: 'admin',
    status: 'planned',
  },
  {
    title: 'Data Health Checks',
    description: 'Orphaned records, missing required fields, import error log. Hygiene for your database, because not all messes are on the shelves.',
    category: 'admin',
    status: 'planned',
  },
]
