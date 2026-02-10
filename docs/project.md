# Shelvd

> **Last updated:** 2026-02-09

---

## Claude Instructions

### Rule 1: Check database schema first
BEFORE writing any query, ALWAYS check schema:
```bash
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -c "\d tablename"
```
NEVER guess column names. ALWAYS verify.

### Rule 2: Known column pitfalls
- `sales_price` (NOT sold_price)
- `isbn_13` / `isbn_10` (NOT isbn)
- `sold_date` DOES NOT EXIST
- `internal_notes` (NOT notes)
- `languages.name_en` (NOT name)
- `book_contributors.role_id` (NOT role)

### Rule 3: Supabase limits
- `.limit()` is UNRELIABLE — ALWAYS use `.range()` with pagination
- FK joins can fail silently — use separate queries + lookup Maps
- `.in()` has limits — batch in groups of 500 IDs

### Rule 4: Code changes
1. READ the file first
2. Use `str_replace` with EXACT old text
3. NEVER overwrite entire files without reading first

### Rule 5: Session log
Update `CLAUDE_SESSION_LOG.md` after every task.

---

## Project Overview

Shelvd is a SaaS webapp for serious book collectors — people who see books as valuable objects, not just text.

**Target:** First edition collectors, signed copies, private press, fine bindings, antiquarian books.

### Competitive Position

| Platform | Weakness | Shelvd's advantage |
|----------|----------|-------------------|
| CLZ Books | Outdated UX, ISBN-centric | Modern web-app, bibliographic depth |
| LibraryThing | Reader-focused | Focus on physical copy |
| Libib | Too basic | Professional cataloging |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + Tailwind CSS 4 + shadcn/ui |
| Database | Supabase (PostgreSQL) — EU Frankfurt |
| Hosting | Vercel |
| Design | Swiss Design (minimal, monochrome) |

### URLs

| Service | URL |
|---------|-----|
| Live site | https://shelvd.org / https://www.shelvd.org |
| Vercel preview | https://shelvd-www.vercel.app |
| GitHub | https://github.com/Simplinity/shelvd |
| Supabase | https://supabase.com/dashboard/project/euieagntkbhzkyzvnllx |

### Database Connection
```bash
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres"
```

### Supabase Pagination Pattern
```typescript
let allData: any[] = []
let offset = 0
while (true) {
  const { data: page } = await supabase
    .from('table')
    .select('*')
    .range(offset, offset + 999)
  if (!page || page.length === 0) break
  allData = [...allData, ...page]
  if (page.length < 1000) break
  offset += 1000
}
```

### Environment Variables
- `GOOGLE_BOOKS_API_KEY=AIzaSyBcxf0XwSI8DFg8MTpD1SZYN4Uj9oOwQBY`

---

## Database Schema

### Reference Tables (shared, read-only)
| Table | Records | Description |
|-------|---------|-------------|
| conditions | 9 | Fine, VG, Good, etc. |
| bindings | 65 | Binding types |
| book_formats | 76 | Folio, Quarto, Octavo, etc. |
| languages | 85 | ISO 639 language codes |
| contributor_roles | 69 | MARC relator codes |
| bisac_codes | 3,887 | Subject categories |

### User Data Tables (RLS per user)
| Table | Records | Description |
|-------|---------|-------------|
| books | ~5,054 | Book collection |
| book_contributors | ~5,152 | M:N books ↔ contributors |
| contributors | ~4,097 | Shared between users |
| user_stats | 1 | Cached statistics |
| external_link_types | 54 | System defaults + user custom |
| user_active_link_types | — | Which link types each user has activated |
| book_external_links | — | External links per book |
| isbn_providers | 9 | Book lookup providers |
| user_isbn_providers | — | Per-user provider preferences |
| collections | — | User collections (Library + Wishlist default, custom) |
| book_collections | — | M:N books ↔ collections |
| tags | — | User tags (name + color, unique per user) |
| book_tags | — | M:N books ↔ tags |
| provenance_entries | — | Ownership chain per book (position, owner, evidence, transaction, association) |
| provenance_sources | — | Supporting documentation per provenance entry |
| user_profiles | 1 | Settings: default_currency, locale, preferences |
| announcements | — | System banners (admin-managed, dismissible, expiry) |
| feedback | — | User feedback/bug reports (planned) |

### Books — Key Fields
```
title, subtitle, original_title, series
publisher_name, publication_place, publication_year (VARCHAR for "MCMLXXIX [1979]")
edition, impression, issue_state
cover_type, binding_id, format_id, has_dust_jacket, is_signed
condition_id, condition_notes
paper_type, edge_treatment, endpapers_type, text_block_condition
isbn_13, isbn_10, oclc_number, lccn, bisac_code
storage_location, shelf
acquired_from, acquired_date, acquired_price
estimated_value, sales_price
status, action_needed, internal_notes
```

### ISBN Providers (in DB)
| code | name | type |
|------|------|------|
| open_library | Open Library | api |
| google_books | Google Books | api |
| loc | Library of Congress | sru |
| bnf | BnF | sru |
| dnb | DNB | sru |
| k10plus | K10plus (GBV/SWB) | sru |
| sudoc | SUDOC (France) | sru |
| libris | LIBRIS (Sweden) | xsearch |
| standaard | Standaard Boekhandel | html |

### Migrations (supabase/migrations/)
| # | File | Description |
|---|------|-------------|
| 001 | reference_tables | Conditions, bindings, formats, languages |
| 002 | contributors | Contributor roles (69 MARC relator codes) |
| 003 | user_data | Books, contributors, book_contributors, user_stats |
| 004 | physical_description_fields | Additional physical description columns |
| 005 | user_profiles_admin | User profiles, admin role |
| 006 | external_links | External link types, user activation, book links |
| 007 | user_active_link_types | Per-user link type activation |
| 008 | books_updated_at_trigger | Auto-update updated_at on books |
| 009 | duplicate_detection_functions | Server-side duplicate detection SQL |
| 010 | isbn_providers | ISBN providers table + seed |
| 011 | collections | Collections + book_collections, Library seed, trigger |
| 012 | wishlist_collection | Wishlist auto-create, is_default column |
| 013 | remove_wishlist_status | Convert wishlist-status books to in_collection |
| 014 | tags | RLS policies for tags + book_tags |
| 015 | drop_unused_price_columns | Drop 5 unused price columns |
| 016 | provenance | provenance_entries + provenance_sources tables |
| 017 | drop_provenance_column | Remove old free-text provenance field |
| 018 | expand_owner_types | Additional owner types for provenance |
| 019 | expand_association_types | Additional association types for provenance |
| 020 | migrate_acquisition_to_provenance | Move acquisition data into provenance chain |
| 021 | announcements | Announcements table (admin banners) |
| 022 | drop_acquired_columns | Remove redundant acquired_from/date columns |
| 023 | add_locale | Add locale to user_profiles |
| 024 | drop_date_format | Remove legacy date_format column |
| 025 | feedback | Feedback & support table, RLS, indexes, trigger |

---

## Completed Features

### Collection Management
- Books list (list/grid views), add/edit/delete, bulk delete with selection
- Contributors management (shared table, privacy via RLS)

### Search
- Global search (5000+ books, client-side batch fetch)
- Advanced search (14 fields, AND/OR logic)
- Recent searches (localStorage), sortable columns

### Import/Export
- Excel import with template, Excel/CSV/JSON export, selective export

### Statistics Dashboard
- Key metrics (total, value, profit/loss)
- Status & condition distribution, top 10 lists, acquisitions by year

### Cataloging
- ISBD Catalog Entry Generator (4 languages: EN, NL, FR, DE)
- 45+ cover types, 76 book formats, 69 contributor roles (MARC), 3887 BISAC codes

### Admin Dashboard
- Stats bar (users, books, signups), user management (search, filter, suspend/ban/delete)
- Announcement system: admin creates banners (info/warning/success/maintenance) with optional expiry, users see colored banner above header, dismissible via X button

### User Settings
- Account: profile, security, address, subscription, danger zone
- Configuration: currency, date format, items per page
- External Links: activate/deactivate types, add custom types
- Book Lookup: enable/disable providers

### External Links
- 54 system link types across 8 categories (bibliographic, catalogs, digital libraries, etc.)
- Per-user activation (all active by default), custom types
- Add/edit/delete on book forms, auto-fill URL, open-in-new-tab, favicons on detail page

### Duplicate Detection
- Server-side SQL (ISBN-13, ISBN-10, exact title matching)
- Grouped results with collapse/expand, select all per group, bulk delete

### Multiple Collections
- Library + Wishlist auto-created per user (non-deletable defaults)
- Custom collections: create, rename, delete, reorder
- Nav dropdown for switching collections
- Books list filter by collection (`?collection=<id>`), optimized fetch (only collection books)
- Add/edit forms: collection multi-select checkboxes
- Bulk actions: add to / remove from collection
- Settings: `/settings/collections` page with book counts
- Detail page: toggleable collection chips with toast feedback
- Move to Library button (one-click Wishlist → Library)
- Migrations: 011 (tables + seed), 012 (Wishlist default), 013 (remove wishlist status)

### Custom Tags
- Free-form colored tags per user (`tags` + `book_tags` tables with RLS)
- TagInput component: type to search existing, create new on Enter/comma, autocomplete dropdown
- Colored tag chips on book detail page, clickable to filter books list
- Books list: `?tag=<id>` filter with indicator + clear button
- Works combined with collection filter (intersection)
- Migration: 014 (RLS policies)

### Book Detail Page
- Full book info with all cataloging fields
- External links with favicons and visible URLs
- Toggleable collection chips (click to add/remove, toast feedback)
- Colored tag chips (clickable to filter)
- Move to Library button (Wishlist → Library one-click)
- Previous/Next navigation

### Currency & Valuation
- 29 ISO 4217 currencies in `lib/currencies.ts`, dropdown selects on add/edit forms
- `default_currency` in user_profiles (default EUR), configurable in Settings > Configuration
- Exchange rate conversion via frankfurter.app (ECB rates, daily cache), graceful fallback
- Stats page: all totals converted to user's display currency, "rates as of" date shown
- Per-book gain/loss on detail page: "Bought €X → Estimated €Y (+Z%)" with green/red styling
- Collection value summary bar on books list: total acquired / estimated / unrealized gain
- Value distribution histogram on stats dashboard by price range

### Enrich Mode
- "Enrich" button in edit page header bar (next to Cancel/Save)
- Field-by-field comparison: NEW (green, pre-checked) / DIFFERENT (amber, unchecked) / same (hidden)
- 19 enrichable fields (title, subtitle, publisher, year, identifiers, description, etc.)
- Smart author comparison: detects "Tolkien, J.R.R." = "J.R.R. Tolkien" (skips matches, shows only truly new)
- New authors auto-merge into contributors on Apply (in "Last, First" catalog format)
- No-ISBN fallback: mini search form with title/author pre-filled, provider picker
- "Search other providers" link to try different sources
- Apply merges selected fields into form, user reviews and saves normally

### Contributor Name Handling
- Standard format: "Last, First" (e.g., "Tolkien, J.R.R.")
- `lib/name-utils.ts`: parseName(), isSameAuthor(), toCatalogFormat(), normalizeNameForComparison()
- Handles family prefixes (van/de/von/etc.), single names, organizations
- Lookup authors auto-converted to "Last, First" on both add and edit forms
- On save: parseName() populates canonical_name, sort_name, display_name, family_name, given_names, type
- Existing contributor matching uses isSameAuthor() fallback (format-independent)
- Placeholder on contributor inputs: "Last, First (e.g. Tolkien, J.R.R.)"

### Feedback & Support
- Three form types: Bug Report (severity, steps), Contact Request (category), Callback Request (phone, time, urgency)
- Auto-captures browser info (UA, screen, URL, app version) as JSONB
- User support page (`/support`) with "My Submissions" tab, status chips, admin response display
- Admin queue (`/admin/support`): filterable by type/status/priority, expandable detail panels
- Status workflow: new → acknowledged → in_progress → resolved / closed / spam
- Priority management: none/low/medium/high/critical with color dots
- Admin notes (internal), admin response (visible to user), bulk actions
- Badge count on admin Support Queue link (red, shows new submissions)
- Email notifications to admin users via Resend on new submissions
- Support link in app nav + marketing footer
- Migration 025: `feedback` table with RLS, indexes, trigger

### Book Lookup (9 providers)
- Multi-field search: title, author, publisher, year range, ISBN
- Results list with cover thumbnails, click for full details
- Load More pagination (SRU: 20/batch, OL: 50, Google: 40)
- 15s timeout on all SRU fetch requests
- Auto-creates external link from lookup source URL
- Shared SRU/MARCXML parser with factory pattern (MARC21 + UNIMARC)
- Provider-specific fixes: BnF CQL relations, SUDOC field 214, NSB/NSE cleanup, LoC keyword fallback

---

## Roadmap

### Completed
| Feature | Status |
|---------|--------|
| Currency & Valuation (7 steps) | ✅ Done |
| Enrich mode (merge lookup fields on edit page) | ✅ Done |
| Contributor name handling ("Last, First" standard) | ✅ Done |
| Provenance tracking (ownership chain, evidence, associations) | ✅ Done |
| Acquisition → Provenance migration | ✅ Done |
| Edit/Add page collapsible sections | ✅ Done |
| Announcement system (admin banners) | ✅ Done |
| Multiple Collections per user | ✅ Done |
| Custom Tags | ✅ Done |
| Feedback & Support + Admin queue | ✅ Done |

### Todo — Core Product
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| 1 | Locale & number formatting | ✅ Done | — | Locale setting in user_profiles, shared `lib/format.ts` with formatInteger/formatDecimal/formatCurrency/formatDate, applied to all pages (detail, stats, books list, admin, duplicates, settings). Legacy date_format column dropped (migration 024). |
| 2 | ~~Admin button in header~~ | ~~High~~ | ~~Low~~ | ✅ Already existed — Shield icon, red styling, conditional on is_admin. |
| 3 | ~~Edit page collapsible sections~~ | ~~High~~ | ~~Medium~~ | ✅ Done — Accordion sections on both add + edit forms. Field count badges, expand/collapse all toggle. |
| 4 | Activity logging | High | Medium-High | `user_activity_log` table: user_id, action, entity_type, entity_id, details (JSON diff), timestamp. Admin filterable log viewer. |
| 5 | ~~Feedback & bug reporting~~ | ~~High~~ | ~~Medium~~ | ✅ Done — Two form types: Bug Report + Message. `feedback` table (migration 025), admin queue with filters/status/priority/bulk actions, email notifications to admins on new tickets (Resend via `ADMIN_NOTIFICATION_EMAILS` env var), admin response emails user directly, badge count, support nav link + footer link. |
| 6 | Image upload | Medium | High | Cover images, spine, damage photos. Vercel Blob Storage. See details below. |
| 7 | Sharing & Public Catalog | Medium | High | Public profile page, shareable collection links, embed widget. |
| 8a | Landing page (marketing website) | ✅ Done | — | Full redesign: hero, numbers strip, collectors/dealers sections, 12-feature showcase, 4 visual spotlights (search, provenance, enrich, condition), comparison grid, 3-tier pricing, CTA. Swiss design + humor. |
| 8b | Knowledge base / Help center | Medium | Medium | Getting started guide, FAQ, feature documentation, tips. |
| 8c | Privacy Policy (`/privacy`) | ✅ Done | — | GDPR-compliant privacy policy with literary wit. 11 sections, third-party table, GDPR rights, contact. Accessible to visitors and logged-in users. |
| 8d | Terms of Service (`/terms`) | ✅ Done | — | 14 sections with literary wit: agreement, data ownership, acceptable use, IP, liability, pricing, termination, governing law. Same visual style as privacy page. |
| 8e | About / Story (`/about`) | ✅ Done | — | Origin story with literary wit: the problem, the solution (28k books + broken spreadsheet), what we care about, what we are/aren't, the name. Pull quotes, highlight boxes, care items with icons. |
| 8f | Changelog (`/changelog`) | ✅ Done | — | 9 releases (0.1.0–0.9.0), data-driven from lib/changelog.ts, timeline design, color-coded change types, version badge in app header. |
| 8g | Roadmap (`/roadmap`) | ✅ Done | — | 3-lane board (Shipped/Building/Planned), data-driven from lib/roadmap.ts, 26 items with category badges, 2-col card grid, stats bar, witty descriptions. |
| 8h | Blog (`/blog`) | ✅ Done | — | 22 articles by Bruno van Branden. Data-driven from `content/blog/` + `lib/blog.ts`. Index page grouped by 6 thematic sections. Article pages with serif typography, font size control (A−/A/A+), JSON-LD BlogPosting schema, Open Graph, prev/next navigation. Swiss design, print-like reading experience. |
| 9 | Mobile responsiveness | High | High | **Website pages: ✅ Done.** App pages: not yet. See details below. |
| 10 | Collection Audit | Medium | Medium | Per-user library health score. Missing contributors, books without identifiers, provenance gaps, incomplete fields — surfaced with one-click fixes. "Your collection is 87% complete. These 14 books need attention." Gamification that drives data quality. |
| 11 | Catalog Generator | Medium | Medium-High | Generate professional DOCX book catalogs from selected books. For dealers, auction houses, and serious collectors. See details below. |

#### #6 Image Upload — Detail

**Two-tier approach:**

**Gratis tier: URL-referenties only (€0 kosten)**
- Store only a URL as text in `books.cover_image_url`
- During enrichment (OpenLibrary, Google Books), offer to save the cover URL
- User can also paste a URL manually on the edit form
- Display via `<img src={url}>`, placeholder on broken URL
- No storage, no bandwidth, no cost

**Betaald tier: Vercel Blob uploads**
- Real file uploads (cover, spine, damage, binding, pages)
- Three versions generated server-side with `sharp`: thumbnail (200px, ~20KB WebP), medium (600px, ~80KB WebP), original (as-is)
- Gallery component on detail page
- Quota tracking per user + enforcement
- Upload button only visible for Pro/Dealer accounts

**Storage: Vercel Blob** (not Supabase Storage, not Cloudflare R2)
- Native `@vercel/blob` SDK — one npm install + one env var, zero config
- Built-in CDN caching (~70% hit rate = most views served from cache)
- S3-backed, 99.999999999% durability
- Pricing: $0.023/GB storage + $0.05/GB transfer

**Why Vercel Blob over alternatives:**

| | Vercel Blob | Cloudflare R2 | Supabase Storage |
|---|---|---|---|
| Opslag/GB/mo | $0.023 | $0.015 | $0.021 |
| Bandbreedte/GB | $0.050 | GRATIS | $0.090 💀 |
| Gratis opslag | 1 GB | 10 GB | 1 GB |
| Integratie | Native SDK | Aparte account + API | Supabase client |
| CDN cache | Automatisch | Zelf configureren | Geen |

R2 is goedkoper, maar vereist aparte Cloudflare account, CORS config, custom CDN proxy. Vercel Blob is zero-config en de kosten zijn verwaarloosbaar vs revenue. Wisselen naar R2 is pas zinvol boven 1.000+ actieve betalende gebruikers.

**Tier limieten & kostanalyse:**

| Tier | Limiet | Opslag/user/mo | Transfer/user/mo | Totaal/user/mo | Revenue | Marge |
|---|---|---|---|---|---|---|
| Gratis | 0 (URL only) | $0 | $0 | $0 | €0 | — |
| Pro €9.99/mo | 1 GB | $0.023 | $0.011 | $0.034 | €9.99 | 99.7% |
| Dealer €49/mo | 25 GB | $0.575 | $0.075 | $0.650 | €49 | 98.7% |

Transfer aanname: ~225MB effectief per Pro user/mo, ~1.5GB per Dealer/mo (na 70% cache hit rate).

**Worst case scenario (alles vol + heavy usage):**

| Scenario | Opslag | Transfer | Kosten/mo | Revenue/mo | Marge |
|---|---|---|---|---|---|
| 500 Pro × 1GB vol | 500 GB | 112 GB | $17 | €4.995 | 99.7% |
| 200 Dealer × 25GB vol | 5 TB | 300 GB | $130 | €9.800 | 98.7% |
| **Samen** | **5.5 TB** | **412 GB** | **~$147** | **€14.795** | **99.0%** |

**Conclusie:** zelfs worst case kost het <1% van de omzet. Image upload is pure winst.

**Database schema:**
```
-- Gratis tier: kolom op books tabel
books.cover_image_url  TEXT  -- externe URL

-- Betaald tier: aparte tabel
book_images (
  id              UUID PRIMARY KEY,
  book_id         UUID REFERENCES books,
  user_id         UUID REFERENCES auth.users,
  type            TEXT,  -- 'cover', 'spine', 'damage', 'page', 'binding'
  storage_key     TEXT,  -- Vercel Blob key
  thumbnail_key   TEXT,
  medium_key      TEXT,
  original_name   TEXT,
  size_bytes      INTEGER,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
)
```

**Fasering:**
- **Fase 1:** URL-only (gratis tier). `cover_image_url` kolom, tonen op detail + lijst, auto-invullen tijdens enrichment. Nul kosten, nul infra.
- **Fase 2:** Vercel Blob uploads (betaald tier). Upload UI, sharp pipeline, gallery component, quota tracking, paywall check.
- **Fase 3:** Polish. Foto volgorde drag-and-drop, bulk upload, camera capture op mobile, image zoom/lightbox.

#### #11 Catalog Generator — Detail

**The pitch:** A dealer who can assemble their catalog inside Shelvd instead of manually in Word comes back every week. This is lock-in through value, not walls.

**Why DOCX:** Word is the standard in the antiquarian trade. DOCX is editable — the dealer adds their own photos, adjusts descriptions, drops in a logo. We deliver the skeleton, they finish it. That’s the right boundary.

**What gets generated:**
- Title page (dealer/collector name, catalog title, date, optional subtitle)
- Table of contents (auto-generated from entries)
- Per book: numbered entry (Lot 1, Lot 2… or #1, #2…) with author, title, year, publisher, edition, physical description, condition (with notes), provenance summary, description/annotation, price (optional)
- Empty image placeholder per entry (so dealer can drag-drop their own photos in Word)
- Colophon / contact page at the end

**Selection & ordering UI (the hard part):**
- Checkbox selection in books list view, or dedicated “Catalog” concept (named set of books)
- Drag-and-drop reordering of selected books
- Choose which fields to include (toggle: show price, show provenance, show condition, etc.)
- Preview of entry count + estimated pages

**Configuration options:**
- Catalog title + optional intro text
- Numbering style: Lot N / #N / none
- Show/hide pricing
- Currency for prices
- Template selection (v2+)

**Phased delivery:**
- **v1:** Select books → generate clean DOCX. One template (Swiss typography), fixed field order. Image placeholders. Basic config (title, pricing on/off).
- **v2:** Multiple templates (auction style, dealer price list, minimal collector). Drag-and-drop ordering. Custom field selection.
- **v3:** PDF variant (pixel-perfect, non-editable). Custom branding (logo upload, color scheme). Batch generation for recurring catalogs.

**Technical approach:**
- DOCX generation via existing docx skill (python-docx or similar)
- Data already in database — just query + format
- Main effort is the selection/ordering UI, not the generation itself

#### #9 Mobile Responsiveness — Detail

**Website/marketing pages: ✅ AUDITED & MOBILE-READY (v0.11.0)**
All public pages (landing, about, blog, changelog, roadmap, privacy, terms, auth) are mobile-ready. Responsive grids (`md:`/`sm:` breakpoints), max-width prose containers, responsive text sizes. Fixes applied: header dropdown width on xs, "Sign In" hidden on xs, changelog badge flex-wrap, blog article metadata stacks vertically on mobile (author / date / reading time each on own line).

**App pages: NOT yet mobile-ready.** Currently the app is desktop-only in practice. Key issues:

**Critical (app is unusable on mobile without these):**
- **No mobile navigation**: entire `<nav>` is `hidden md:flex` — below 768px users see only logo + sign out. Need hamburger menu / slide-out drawer with all nav items.
- **No touch-friendly interactions**: buttons, links, form elements not sized for touch targets (minimum 44x44px recommended).

**Major (functional but poor UX):**
- **Add/Edit forms**: 12+ sections with `lg:grid-cols-4` grids create extremely long scroll. Need single-column layouts, possibly step-by-step wizard on mobile.
- **Provenance editor**: complex nested cards with source grids don't fit narrow screens. Needs stacked layout.
- **Books list (list view)**: likely horizontal overflow with many columns. Need card-based mobile list or fewer visible columns.
- **Advanced search**: 14-field grid needs single-column stacking.
- **Admin page**: user management table will overflow. Needs card view or horizontal scroll container.
- **Stats dashboard**: chart widths may not adapt. Need responsive chart containers.

**Minor (polish):**
- **Detail page**: `grid-cols-2 md:grid-cols-4` works OK but field labels/values get cramped on very small screens.
- **Settings pages**: sidebar navigation may need tab-style mobile layout.
- **Import form**: preview table needs horizontal scroll or card layout.
- **Modals/dialogs**: may not be properly sized for mobile viewports.

**Implementation approach:**
1. Mobile nav (hamburger + drawer) — unblocks everything
2. Touch target audit (buttons, links, inputs ≥ 44px)
3. Forms: single-column stacking below `sm:` breakpoint
4. Books list: mobile card view
5. Tables: horizontal scroll wrappers or card alternatives
6. Test on 375px (iPhone SE) and 390px (iPhone 14) widths |

### Todo — Admin Section Enhancements
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| A1 | System stats dashboard | High | Medium | Total books, users, storage usage, activity trends, growth charts. |
| A2 | ~~Feedback/bug queue~~ | ~~High~~ | ~~Medium~~ | ✅ Done — Admin support queue at `/admin/support` with full workflow. Part of #5. |
| A3 | Activity log viewer | High | Medium | Filterable by user, action type, date range, entity. |
| A4 | User management improvements | Medium | Medium | Invite codes, approve registrations, user details view. |
| A5 | ~~Announcement system~~ | ~~Low~~ | ~~Low~~ | ✅ Done — Colored banners (info/warning/success/maintenance), admin create/toggle/delete, dismissible by users, optional expiry. |
| A6 | Platform health checks | Low | Medium | Orphaned records, cross-user inconsistencies, import error log, duplicate publishers. The janitor's dashboard for 10,000 collections. |

### Under Consideration (Future)
- Insurance & valuation PDF reports
- Price history field (auction results, dealer quotes, previous sale prices)
- Dealer & contact management
- Sales platform integration (WooCommerce, Catawiki, AbeBooks)
- Templates system

### Recently Completed
- ~~PDF catalog export~~ → v0.11.0: Printable PDF inserts (catalog card + catalog sheet)
- ~~Condition history~~ → v0.10.0: Condition history timeline + CRUD + auto-prompt


---

## Design Decisions

**Status colors (Swiss Design):**
`on_sale` red solid, `to_sell` red light, `reserved` red outline, `lost/destroyed` black solid, `in_collection` gray

**Publication Year:** VARCHAR(100) for "MCMLXXIX [1979]", "(circa 1960)"

**Form elements:** All inputs/selects/textareas same height, consistent padding (`px-3 py-2 text-sm`)

---

## Sync Rules

**Roadmap:** The public `/roadmap` page is data-driven from `apps/www/lib/roadmap.ts`. Any feature added, moved between lanes (shipped/building/planned), or removed in this document MUST also be reflected in `lib/roadmap.ts` so the website stays in sync.

**Changelog & Versioning:** The public `/changelog` page and the version badge in the app header are driven from `apps/www/lib/changelog.ts` (`APP_VERSION` + `CHANGELOG` array). Any new release MUST: (1) add an entry to `CHANGELOG`, (2) bump `APP_VERSION`, (3) bump version in both root and `apps/www` `package.json`, (4) create a git tag.

**Documentation:** After completing any feature, update all three docs: `project.md`, `CLAUDE_SESSION_LOG.md`, `CLAUDE_STARTUP_PROMPT.md`.

---

## File Structure

```
shelvd/
├── apps/www/
│   ├── app/
│   │   ├── (app)/books/          # Collection pages + lookup
│   │   ├── (app)/stats/          # Statistics
│   │   ├── (app)/settings/       # User settings + collections
│   │   ├── (app)/admin/          # Admin dashboard
│   │   ├── (auth)/               # Login/register
│   │   └── api/                  # API routes
│   ├── components/
│   │   ├── announcement-banner.tsx # Dismissible colored banners (layout)
│   │   ├── collection-chips.tsx  # Toggleable collection chips (detail page)
│   │   ├── collection-nav.tsx    # Nav dropdown for collections
│   │   ├── move-to-library-button.tsx # One-click Wishlist → Library
│   │   ├── tag-input.tsx         # Tag autocomplete/create input
│   │   ├── enrich-panel.tsx      # ISBN/field search enrichment panel
│   │   ├── provenance-editor.tsx  # Repeatable card UI for provenance chain
│   │   ├── provenance-timeline.tsx # Vertical timeline display (detail page)
│   │   ├── delete-book-button.tsx
│   │   └── (support/callback/contact forms inline in support-client.tsx)
│   └── lib/
│       ├── supabase/             # DB client + types
│       ├── actions/              # Server actions (collections, feedback, etc.)
│       ├── email.ts              # Resend email notifications
│       ├── constants.ts          # BookStatus (14), conditions, roles, etc.
│       ├── currencies.ts         # 29 ISO 4217 currencies for dropdowns
│       ├── name-utils.ts         # Contributor name parsing (Last, First)
│       └── isbn-providers/       # Book lookup providers
│           ├── index.ts          # Provider registry
│           ├── types.ts          # Shared types
│           ├── open-library.ts
│           ├── google-books.ts
│           ├── sru-provider.ts   # SRU factory (MARC21 + UNIMARC)
│           ├── sru-libraries.ts  # LoC, BnF, DNB, K10plus, SUDOC configs
│           ├── libris.ts         # LIBRIS Xsearch
│           └── standaard-boekhandel.ts
├── content/blog/                  # 22 blog articles (.md, by Bruno van Branden)
├── supabase/migrations/          # 001-025 (see Migrations table above)
└── docs/                          # project.md, CLAUDE_SESSION_LOG.md, CLAUDE_STARTUP_PROMPT.md, book-reference.md
```

---

## Pricing Model (proposal)

| Tier | Price | Books | Features |
|------|-------|-------|----------|
| Free | €0 | 100 | Basic |
| Collector | €7/mo | 5,000 | + Templates, Export |
| Scholar | €15/mo | Unlimited | + ISBD, API |
| Dealer | €29/mo | Unlimited | + Multi-user |
