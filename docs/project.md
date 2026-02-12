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
| 4 | Activity logging | ✅ Done | — | All 6 steps complete: activity_log table, 20 log points, admin live feed + /admin/activity viewer, user /activity page, recent feed on /stats, book detail timeline. See details below. |
| 5 | ~~Feedback & bug reporting~~ | ~~High~~ | ~~Medium~~ | ✅ Done — Two form types: Bug Report + Message. `feedback` table (migration 025), admin queue with filters/status/priority/bulk actions, email notifications to admins on new tickets (Resend via `ADMIN_NOTIFICATION_EMAILS` env var), admin response emails user directly, badge count, support nav link + footer link. |
| 6 | Image upload | Medium | High | **Fase 1 complete ✅ (URL-only).** Fase 2 pending (Blob uploads). Cover images, spine, damage photos. Vercel Blob Storage. See details below. |
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
| 12 | User Onboarding | High | Medium | Welcome wizard, smart empty states, getting started checklist, contextual hints, demo book. Three phases. See details below. |
| 14 | Tier System & Feature Gating | High | Medium | Three tiers: Collector (free), Collector Pro, Dealer. Database-driven feature flags — no hardcoded tier checks. Upgrade hints in UI. See details below. |
| 15 | Community | Medium | Medium-High | Community forum/discussion space for collectors and dealers. Collector tier support channel (best effort). Knowledge sharing, book identification help, trade discussions. Scope TBD. |
| 13 | Invite Codes | ✅ Done | — | Optional promo codes on signup for attribution + benefits. Tables: invite_codes + invite_code_redemptions. Signup form: optional code field with validation. Admin /admin/invite-codes: list, create, toggle, detail with per-code stats (users, books). Activity logging. Sidebar link. See details below. |

#### #4 Activity Logging — Detail

**What it is:** Every meaningful action in Shelvd gets recorded. Not for analytics — for context. The backbone for the admin live feed (A3), weekly digest (A8), future audit trails, and eventually personal activity history per user.

**Table: `activity_log`**

```sql
CREATE TABLE activity_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,        -- 'book.created', 'book.updated', 'collection.renamed'
  category    TEXT NOT NULL,        -- 'book', 'collection', 'provenance', 'account', 'admin'
  entity_type TEXT,                 -- 'book', 'collection', 'provenance_entry', 'user_profile'
  entity_id   UUID,
  entity_label TEXT,               -- Human-readable: "Gutenberg Bible (1455)" (avoids joins)
  metadata    JSONB DEFAULT '{}',  -- Diff, source, old/new values
  source      TEXT DEFAULT 'app'   -- 'app', 'import', 'api', 'admin', 'system'
);
```

Indices on (user_id, created_at DESC), (action, created_at DESC), (entity_type, entity_id), (created_at DESC).

**Actions logged:**
- Books: created (manual/import/lookup), updated (JSON diff of changed fields), deleted, enriched (source + fields updated), status changed, cover uploaded/removed
- Collections: created/renamed/deleted, book added/removed
- Provenance: entry added/updated/removed, source added
- Contributors & tags: added/removed (with role)
- Account: signup, profile updated, settings changed
- Admin: user status changed, membership changed, admin note added, announcement created/toggled/deleted, ticket status changed

**Approach:** Server actions (not database triggers). Each existing server action gets a `logActivity()` call. Full control over labeling, metadata, and source context.

**Metadata examples:**
- Book updated: `{"changes": {"condition": {"old": "good", "new": "fine"}, "price": {"old": null, "new": "250.00"}}}`
- Book enriched: `{"source": "loc", "fields_updated": ["publisher", "year", "pages", "isbn"]}`
- Import: `{"filename": "bibliotheek-2024.csv", "books_imported": 347, "books_skipped": 12}`
- Admin status change: `{"target_user_id": "abc", "old_status": "active", "new_status": "suspended"}`

**6-step delivery (each step = separate PR, wait for approval):**

| Step | What | Effort | Status |
|------|------|--------|--------|
| 1 | Foundation: `activity_log` table + indices + RLS + `logActivity()` utility | Low | ✅ Done |
| 2 | Book instrumentation: createBook, updateBook, deleteBook, enrichBook, status changes, import | Medium | ✅ Done |
| 3 | Rest instrumentation: collections, provenance, contributors, tags, account, admin actions | Medium | ✅ Done |
| 4 | Admin live feed on dashboard (A3 partial): RPC + compact chronological feed component | Low | ✅ Done |
| 5 | Admin log viewer page (A3 complete): /admin/activity, full table, filters, pagination, sidebar link | Medium | ✅ Done |
| 6 | User-facing activity: /activity page, recent activity on /stats, book detail timeline | Low-Medium | ✅ Done |

Recommended order: 1 → 2 → 4 → 3 → 5 → 6 (get visible results on dashboard early, then complete instrumentation, then user-facing).

**Step 6 detail — user-facing activity (3 parts):**

**6a: `/activity` page** — Personal activity history. Full table (timestamp, action, entity, source), category filter tabs, entity search, pagination. Same style as admin viewer but simpler (no user column). Uses RLS-scoped direct query (no new RPC needed).

**6b: Recent activity on `/stats`** — Compact feed (last 10 actions) at bottom of stats page. Uses same ActivityFeed component from admin dashboard. "View all →" link to /activity.

**6c: Book detail timeline** — On book detail page: "Last modified X ago" + expandable mini-timeline showing all changes to that specific book. Actions: added, edited (with changed field names), enriched (with source), imported, status changed.

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

**Current progress (Fase 1):**
- ✅ Step 1: Migration 030 — `cover_image_url` TEXT column on books table
- ✅ Step 2: Types + CRUD — database.types.ts, add form (type + initial state + insert), edit form (update payload)
- ⏳ Step 3: Add URL input field to edit + add forms
- Step 4: Display cover on book detail page
- Step 5: Thumbnail in list view
- Step 6: Cover in grid view
- Step 7: Auto-fill cover URL during enrichment (`cover_url` already in BookData type, needs ENRICHABLE_FIELDS entry)

**Infra done:**
- Vercel Blob store: `shelvd-images` in FRA1, linked to shelvd-www, `BLOB_READ_WRITE_TOKEN` in .env.local + production

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

#### #12 User Onboarding — Detail

**The problem:** A new user arrives at Shelvd. They see an empty page with "My Collection — 0 books" and a header with 7 navigation items. The add form has 76 formats, 45 cover types, 65 bindings. They don't know where to start. They either click around and give up, or add one book and never return.

**Target users:** Private collectors (decades of books, failed at Excel), dealers/booksellers (inventory management), librarians/archivists (institutional cataloging), explorers (just curious).

**Inspiration:** Notion (beautiful empty states — every blank page is an invitation, not a dead end). Linear (onboarding wizard — 4 screens, no optional fields, no distractions). Duolingo (progress without pressure — streaks and bars that feel like your project, not their assignment). Stripe (persistent checklist in sidebar — stays until done, ignorable but present). Superhuman (show don't tell — 1:1 demo of how good it can be). We can't do 1:1 calls, but we can show a perfectly cataloged demo book.

**Component 1: Welcome Wizard (first login, one-time)**

Three screens, not a tour or tooltips:

- **Screen 1 — "How do you collect?"** — Radio selection: Private collector / Dealer / Librarian / Just exploring. Stored as `user_profiles.user_type`. Drives the rest of onboarding.
- **Screen 2 — "How big is your collection?"** — Under 50 / 50–500 / 500–5,000 / 5,000+. Determines whether we suggest manual add or import.
- **Screen 3 — "Your first step"** — Personalized: small collection → add form (essentials only). Large collection → import with template. Dealer → add form with status/value prominent. Explorer → read-only demo book.

**Component 2: Smart Empty States (permanent)**

Every empty page becomes a learning opportunity:

- **Empty collection:** "Your library starts here" with three paths: add manually, import Excel/CSV, look up by ISBN. Each with icon and one-line description.
- **Empty stats:** "Add at least 5 books to unlock statistics. You're at 2/5."
- **Empty search:** "Nothing to search yet. Add your first books and come back."
- **Empty collections:** "Create your first collection to organize by room, theme, or project."

**Component 3: Getting Started Checklist (persistent, dismissible)**

Compact block on the collection page. Progress bar (4/6). Checklist items, each a link to the action:

1. Create your account ✓
2. Add your first book
3. Try Library Lookup (ISBN enrichment) — the "aha moment"
4. Create a collection
5. Add provenance to a book — "this is what spreadsheets can't do"
6. Export your catalog — "your data is yours"

Dismissible via ×. Disappears when all complete. Items chosen to showcase Shelvd's core value propositions.

**Component 4: Contextual First-Visit Hints**

Subtle inline tips that appear once per feature, tracked via `user_profiles.seen_hints` (JSON array):

- **Add form:** "Tip: Only Title is required. Start simple — you can always enrich later via Library Lookup."
- **Enrich panel:** "Tip: Enter an ISBN and click Search. We'll find bibliographic data from 9 international libraries."
- **Provenance editor:** "Tip: Who owned this book before you? Add owners, bookplates, inscriptions. Build the story."
- **Collections:** "Tip: Create collections for different parts of your library — by room, theme, or 'to sell'."

**Component 5: Demo Book (optional, via wizard)**

"Want to see an example first?" → Seed a fully cataloged demo book in their account: all contributors with MARC roles, provenance chain, condition history, tags, external links. Shows how good a complete entry looks. Deletable.

**Admin Component (A9): Funnel Tracker**

On user detail page: horizontal 6-step progress bar. Green checks for completed, open circles for pending. Shows where each user is in their journey.

Aggregated on admin dashboard: funnel visualization showing conversion at each step. "80% stop at step 2" = add form is the problem. "Nobody uses Enrich" = feature not discoverable enough.

Funnel steps:
1. Signed up — `user_profiles.created_at` exists
2. First book — `books` count ≥ 1
3. 10 books — `books` count ≥ 10
4. Used enrich — books with ISBN source or enrichment marker
5. Organized — `collections` (non-default) count ≥ 1
6. Rich metadata — has tags + contributors + provenance entries

**Database changes:**
- `user_profiles.user_type` TEXT (collector/dealer/librarian/explorer)
- `user_profiles.collection_size_estimate` TEXT (under_50/50_500/500_5000/5000_plus)
- `user_profiles.onboarding_completed` BOOLEAN DEFAULT false
- `user_profiles.onboarding_checklist` JSONB (tracks completed items)
- `user_profiles.seen_hints` JSONB DEFAULT '[]' (tracks dismissed hints)

**Phased delivery:**

- **Phase 1 (quick wins):** Smart empty states + first-visit hints + admin funnel tracker. No migration needed for empty states. One migration for `seen_hints`.
- **Phase 2 (the wizard):** Welcome wizard + getting started checklist + demo book. Migration for `user_type`, `collection_size_estimate`, `onboarding_completed`, `onboarding_checklist`.
- **Phase 3 (personalization):** Feature highlights per user type. Engagement emails ("You haven't added a book in 2 weeks"). Collection completeness score on user's own stats page.

#### #13 Invite Codes — Detail

**What it is:** Optional promo codes that users can enter during signup. Registration stays open to everyone — codes are never required. When someone uses a code, two things happen: (1) attribution is recorded (which blogger/event/campaign brought this user), and (2) benefits are applied automatically (free trial days, lifetime Collector Pro, etc.).

**Why it matters:** Marketing without measurement is guesswork. Invite codes let you hand a blogger a unique code, print one on a bookfair flyer, or tweet one to followers — and know exactly which channel converted. The benefits attached to each code are the incentive for users to actually enter it.

**Use cases:**
- Book blogger outreach: "Share code JANEREADS with your audience — they get 3 months free"
- Bookfair / events: QR code on a card with SHELVD-FIRSTEDITION, track signups per event
- Early adopter perks: EARLYBIRD code grants lifetime Collector Pro
- Social media campaigns: unique code per platform (SHELVD-TWITTER, SHELVD-INSTA)
- Personal referral: give a collector friend a code with 30 days free

**Tables:**

`invite_codes`:
| Column | Type | Purpose |
|--------|------|--------|
| id | UUID | PK |
| code | TEXT UNIQUE | The code itself, case-insensitive (stored uppercase) |
| label | TEXT | Human description: "Jane's Book Blog - Feb 2026" |
| source_type | TEXT | Category: `blogger`, `event`, `social`, `personal`, `campaign` |
| source_name | TEXT | Specific source: "janereads.com", "London Antiquarian Bookfair" |
| benefit_type | TEXT | `trial_days`, `lifetime_free`, `none` |
| benefit_days | INT | Days of free premium (only for trial_days) |
| max_uses | INT | NULL = unlimited |
| times_used | INT | Counter, incremented on redemption |
| is_active | BOOLEAN | Admin can deactivate |
| expires_at | TIMESTAMPTZ | Optional expiry date |
| created_by | UUID | Admin who created it |
| created_at | TIMESTAMPTZ | |

`invite_code_redemptions`:
| Column | Type | Purpose |
|--------|------|--------|
| id | UUID | PK |
| code_id | UUID | FK to invite_codes |
| user_id | UUID | FK to auth.users |
| redeemed_at | TIMESTAMPTZ | When they signed up |

**Signup flow change:**
- Add optional "Invite code" field below email/password on signup form
- Validate code on submit: exists, active, not expired, not maxed out
- On valid code: create user, record redemption, apply benefits (set `benefit_expires_at` or `is_lifetime_free` on user_profiles), increment counter
- On invalid/empty code: sign up normally, no error (codes are never required)

**Admin UI (`/admin/invite-codes`):**
- List all codes: code, label, source, type, uses/max, status, created
- Create new code form: code (auto-generate or manual), label, source type/name, benefit, max uses, expiry
- Toggle active/inactive
- Click into code detail: list of users who redeemed, when, their current status (active? how many books?)
- Stats per code: total redemptions, active users, total books added by those users

**Delivery plan:**

| Step | Description | Effort |
|------|-------------|--------|
| 1 | Migration: `invite_codes` + `invite_code_redemptions` tables, RLS, indices | ✅ Done |
| 2 | Signup form: optional code field + validation + redemption logic | ✅ Done |
| 3 | Admin `/admin/invite-codes` list + create + toggle | ✅ Done |
| 4 | Admin code detail page: redemption list + per-code stats | ✅ Done |
| 5 | Admin sidebar link + activity logging for code events | ✅ Done |

#### #14 Tier System & Feature Gating — Detail

**What it is:** A database-driven system that controls which features are available to which users, based on their subscription tier. No feature checks are hardcoded in the codebase — everything is driven by a `tier_features` table.

**Why it matters:** Without this, every feature is available to everyone forever. That's fine for early access, but before monetization (Stripe), we need the infrastructure to gate features. More importantly: the system must be flexible enough that moving a feature from one tier to another is a database update, not a code deployment.

**Tier names:**

| Tier | Internal slug | Price | Target |
|------|---------------|-------|--------|
| Collector | `collector` | Free | Private collectors, hobbyists, explorers. The full cataloging experience. |
| Collector Pro | `collector_pro` | €9.99/mo | Serious collectors who want image uploads, public sharing, advanced exports. |
| Dealer | `dealer` | €49/mo | Professional dealers, auction houses. Business features, bulk operations, dedicated support. |

Current `membership_tier` values in DB (`free`, `pro`) migrated to `collector`, `collector_pro` (migration 040).

**Architecture — feature flags, not tier checks:**

```
# BAD (hardcoded):
if user.tier === 'dealer' { show catalog generator }

# GOOD (feature-driven):
if hasFeature(user, 'catalog_generator') { show it }
```

`tier_features` table:
| Column | Type | Purpose |
|--------|------|--------|
| id | UUID | PK |
| tier | TEXT | `collector`, `collector_pro`, `dealer` |
| feature | TEXT | Feature slug: `image_upload`, `catalog_generator`, `public_sharing`, etc. |
| enabled | BOOLEAN | Whether this tier has this feature |

`hasFeature(userId, feature)` utility:
1. Get user's tier from `user_profiles.membership_tier`
2. Check `is_lifetime_free` — if true, treat as Collector Pro tier (NOT Dealer)
3. Check `benefit_expires_at` — if active trial, treat as that tier
4. Look up `tier_features` for their tier + requested feature
5. Return boolean

**UI gating principle:** Gated features are **visible but locked**, never hidden. A Collector sees the Catalog Generator button, but clicking it shows: "Available on Collector Pro — Upgrade". This drives upgrades better than hiding features.

**Feature distribution (finalized 2026-02-11):**

**Tier overview:**

| | Collector (free) | Collector Pro (€9.99/mo) | Dealer (€49/mo) |
|--|-----------------|--------------------------|------------------|
| Books | 500 | 5,000 | 100,000 |
| Tags | 20 | 1,000 | 1,000 |
| Image storage | — (URL refs only) | 5 GB | 25 GB |
| Image bandwidth | — | 25 GB/mo | 250 GB/mo |
| Support | Community / best effort | Standard (ticket, no SLA) | Priority (24h SLA office hours) + 30 min onboarding call |

All limits are concrete numbers (no "unlimited"). Configurable via admin UI at /admin/tiers.

**Feature matrix:**

| Feature | Collector | Pro | Dealer |
|---------|-----------|-----|--------|
| Full cataloging (all fields) | ✅ | ✅ | ✅ |
| Collections | ✅ | ✅ | ✅ |
| Provenance tracking | ✅ | ✅ | ✅ |
| Condition tracking | ✅ | ✅ | ✅ |
| Book lookup (9 providers) | ✅ | ✅ | ✅ |
| Library Enrich | ✅ | ✅ | ✅ |
| CSV import/export | ✅ | ✅ | ✅ |
| Activity log | ✅ | ✅ | ✅ |
| External links | ✅ | ✅ | ✅ |
| Image upload (Vercel Blob) | ❌ | ✅ | ✅ |
| PDF inserts (catalog card/sheet) | ❌ | ✅ | ✅ |
| Public catalog / sharing | ❌ | ✅ | ✅ |
| Collection Audit | ❌ | ✅ | ✅ |
| Advanced statistics | ❌ | ✅ | ✅ |
| Catalog Generator (DOCX) | ❌ | ❌ | ✅ |
| Bulk operations | ❌ | ❌ | ✅ |
| Document storage (invoices, certs) | ❌ | ❌ | ✅ |
| Dealer directory listing | ❌ | ❌ | ✅ |
| Insurance/valuation reports | ❌ | ❌ | ✅ |

**Cost analysis (worst case — all limits fully used):**

| Tier | Storage cost | Bandwidth cost | Total cost | Revenue | Marge |
|------|-------------|----------------|-----------|---------|-------|
| Collector | $0 | $0 | $0 | $0 | ∞ |
| Collector Pro | $0.115 | $1.25 | $1.365/mo | €9.99 | ~86% |
| Dealer | $0.575 | $12.50 | $13.075/mo | €49 | ~73% |

Realistic margins: Pro ~97%, Dealer ~95% (average users won't hit limits).

**Infrastructure safeguards (to implement):**
- Bandwidth quota enforcement per tier (soft limit → warning, hard limit → CDN-cache-only fallback)
- Hotlink protection (prevent external sites from embedding Blob images and consuming bandwidth)

*The whole point of the feature flags system is that this distribution can be adjusted without code changes — one row in `tier_features`, no deployment needed.*

**Reassigning features later:** Change one row in `tier_features`. No migration, no deployment. Example: "Make Catalog Generator available to Pro" → `INSERT INTO tier_features (tier, feature, enabled) VALUES ('collector_pro', 'catalog_generator', true)`. Done.

**Delivery plan:**

| Step | Description | Effort |
|------|-------------|--------|
| 1 | Migration 040: `tier_features` + `tier_limits` tables, seed data, rename membership_tier values | ✅ Done |
| 2 | `hasFeature()` server + `useFeature()`/`useTierLimit()`/`useTier()` client hooks + TierProvider | ✅ Done |
| 3 | ~~Migration: rename membership_tier values~~ | ✅ Done (merged into step 1) |
| 4 | UI gating: FeatureGate, UpgradeHint, LimitGate components + tier display names | ✅ Done |
| 5 | Landing page + pricing: update tier names, feature lists | ✅ Done |
| 6 | Admin: /admin/tiers — feature matrix (on/off toggles with confirmation) + limits editor (click to edit). Migration 041 for admin RLS | ✅ Done |
| 6b | Admin: user detail — tier selector (Collector/Pro/Dealer buttons) with activity logging | ✅ Done |
| 6c | Migration 042: replace unlimited (-1) with concrete maximums. All limits are real numbers, no edge cases | ✅ Done |
| 7 | Stripe integration + upgrade flow (separate feature, depends on this) | High |

**⚠️ Temporary:** All upgrade links (FeatureGate, LimitGate, UpgradeHint, pricing page CTAs) currently point to `/#pricing` as placeholder. Must be wired to Stripe checkout when payments are implemented. Tier changes should happen automatically on payment success via Stripe webhooks.

Steps 1–6 complete (42 migrations). Step 7 is a separate feature that plugs into this system.

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
| ~~A3~~ | ~~Activity log viewer + live feed~~ | ~~High~~ | ~~Medium~~ | ✅ Done. Steps 4–5 of #4. Live feed on dashboard (15 recent entries) + full /admin/activity page with table, category filters, search, pagination. Sidebar link added. |
| ~~A4~~ | ~~User management~~ | ~~Medium~~ | ~~Medium~~ | ✅ Done. Detail page (/admin/users/[id]): avatar, stats, collections, recent books, support history, admin notes, status/membership/admin actions, send email. List: sortable columns (user/books/joined/last active), heat indicators, clickable rows. Full profile display: name, company, phone, website, address, VAT, locale, currency, invite code attribution + benefit expiry. |
| A5 | ~~Announcement system~~ | ~~Low~~ | ~~Low~~ | ✅ Done — Colored banners (info/warning/success/maintenance), admin create/toggle/delete, dismissible by users, optional expiry. |
| A6 | Platform health score & checks | Medium | Medium | Health bar on dashboard (missing ISBNs, covers, conditions at a glance). Click through to orphaned records, inconsistencies, duplicate publishers. |
| ~~A7~~ | ~~Admin sidebar navigation~~ | ~~High~~ | ~~Low~~ | ✅ Done. Persistent sidebar: Overview, Users, Support (badge), Stats. Active state with left border accent. Sticky, icon-only on mobile. 'Back to App' link. Dashboard simplified with 'Needs Attention' alerts section. |
| A8 | Weekly admin digest | Medium | Medium | Automated Monday email via Resend + Vercel Cron: signups, books added, open tickets, health delta, most active users. |
| A9 | User onboarding funnel (admin view) | Medium | Low | Visual journey tracker on user detail page: 6 steps from signup to power user. Aggregated funnel on dashboard. See #12 for the user-facing onboarding. |

### Planned — Post-Launch: Sales Integrations (Dealer only)

| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| S1 | WooCommerce integration | Medium | Sync boeken naar WooCommerce webshop als producten. Dealer only. |
| S2 | Catawiki integration | High | Veiling-upload vanuit Shelvd. Geen publieke API — CSV/XML export in Catawiki-formaat. Dealer only. |
| S3 | AbeBooks integration | Medium-High | XML feed voor AbeBooks/ZVAB dealer inventory. Legacy HomeBase-compatibel protocol. Dealer only. |

#### S1 WooCommerce Integration — Detail

**What it does:** Dealer selects books in Shelvd → publishes them as products in their WooCommerce webshop. Price, description, photos, condition — everything synced from Shelvd.

**WooCommerce REST API v3:**
- Mature, well-documented: `https://woocommerce.github.io/woocommerce-rest-api-docs/`
- Auth: consumer key + consumer secret (user generates in WooCommerce → Settings → REST API)
- HTTPS required, keys sent via query params or Basic Auth header
- Rate limits: depends on hosting, typically 100+ req/min

**Book → WC Product mapping:**

| Shelvd field | WC Product field | Notes |
|-------------|-----------------|-------|
| title | name | |
| catalog_entry or generated description | description | Rich text, can include condition + provenance |
| purchase_price | regular_price | |
| selling_price (if added) | sale_price | Optional |
| cover_image_url | images[0].src | Multiple images when image upload is live |
| user_catalog_id | sku | Unique product identifier |
| condition.name | attributes["Condition"] | Custom attribute |
| binding | attributes["Binding"] | Custom attribute |
| language.name | attributes["Language"] | Custom attribute |
| isbn_13 | meta_data["isbn"] | For search/SEO |
| contributors | meta_data["author"] | Formatted string |

**API calls involved:**
- `POST /wp-json/wc/v3/products` — create product
- `PUT /wp-json/wc/v3/products/{id}` — update existing
- `DELETE /wp-json/wc/v3/products/{id}` — remove from shop
- `POST /wp-json/wc/v3/products/batch` — bulk create/update/delete (up to 100)

**Implementation scope:**
1. **Settings UI:** WooCommerce shop URL + API keys opslaan per user (encrypted in DB)
2. **Field mapping config:** welke Shelvd-velden → welke WC-velden (sensible defaults, customizable)
3. **Publish flow:** per-boek "Publish to shop" button + bulk publish from selection
4. **Sync status:** per-boek tracking (published/unpublished/synced/error, last sync timestamp, WC product ID)
5. **Auto-sync option:** update WC product when book is edited in Shelvd (optional toggle)
6. **Unpublish/delete:** remove from shop without deleting from Shelvd
7. **Error handling:** shop offline, auth expired, product deleted externally, duplicate SKU

**DB changes:** `woocommerce_connections` table (user_id, shop_url, consumer_key_encrypted, consumer_secret_encrypted) + `book_wc_sync` table (book_id, connection_id, wc_product_id, status, last_synced_at, last_error).

**Security:** API keys stored encrypted. All API calls server-side (never expose keys to browser). Connection test endpoint to verify credentials before saving.

#### S2 Catawiki — Notes
Catawiki has no public API for lot submission. Options: (1) generate CSV/XML in Catawiki's bulk upload format, (2) investigate if they have a partner/dealer API. Most likely approach: export lot descriptions in their format, user uploads manually. Description generator can use Shelvd's rich book data to write compelling lot descriptions.

#### S3 AbeBooks — Notes
AbeBooks uses the HomeBase XML upload system for dealer inventory. Fixed schema: author, title, publisher, year, price, condition (standard ABE condition codes), description, binding, keywords, quantity. XML file uploaded via FTP or their web interface. Shelvd can generate the XML, user uploads it. ZVAB (German sister site) uses the same system.

### Under Consideration (Future)
- Insurance & valuation PDF reports
- Price history field (auction results, dealer quotes, previous sale prices)
- Dealer & contact management
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
