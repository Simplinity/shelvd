# Shelvd

> **Last updated:** 2026-02-13 (performance optimizations, activity logging fixes)

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

### Rule 6: Database migrations
Use `npx supabase migration up --linked` to apply migrations. The project is already linked (`supabase/.temp/project-ref`). NEVER open Supabase Dashboard in the browser to run SQL manually — the CLI does it in one command.

### Rule 7: Always build locally before pushing
Run `cd apps/www && npx next build` before every `git push`. This catches type errors, missing imports, and stale generated types. Never push without a green build.

### Rule 8: Regenerate types after DB changes
After any migration, run: `npx supabase gen types typescript --linked 2>/dev/null > apps/www/lib/supabase/database.types.ts`. Redirect stderr to avoid CLI output leaking into the types file.

### Rule 9: Version bumps are a package deal
When bumping `APP_VERSION` in `changelog.ts`, ALWAYS also:
1. Bump `version` in root `package.json`
2. Bump `version` in `apps/www/package.json`
3. Create git tag: `git tag v0.X.0`
4. Push tag: `git push --tags`
All four must happen in the same commit. No exceptions.

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
| external_link_types | 64 | System defaults + user custom |
| user_active_link_types | — | Which link types each user has activated |
| book_external_links | — | External links per book |
| isbn_providers | 22 | Book lookup providers (21 active + Trove pending) |
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
condition_id, condition_notes, dust_jacket_condition_id
paper_type, edge_treatment, endpapers_type, text_block_condition
isbn_13, isbn_10, oclc_number, lccn, bisac_code, bisac_code_2, bisac_code_3
storage_location, shelf, shelf_section
cover_image_url
sales_price, price_currency
status, action_needed, internal_notes, catalog_entry
```

**Dropped columns (migrated to separate tables):**
- `acquired_from`, `acquired_date`, `acquired_price` → `provenance_entries` (migration 020/022)
- `estimated_value`, `lowest_price`, `highest_price`, `valuation_date` → `valuation_history` (migration 044/045)
- `provenance` (free text) → `provenance_entries` (migration 017)

### ISBN Providers (in DB)
| code | name | country | type |
|------|------|---------|------|
| open_library | Open Library | 🌍 | api |
| google_books | Google Books | 🌍 | api |
| loc | Library of Congress | 🇺🇸 | sru |
| bnf | BnF | 🇫🇷 | sru |
| dnb | DNB | 🇩🇪 | sru |
| k10plus | K10plus (GBV/SWB) | 🇩🇪 | sru |
| sudoc | SUDOC | 🇫🇷 | sru |
| unicat | Unicat | 🇧🇪 | sru |
| bne | Biblioteca Nacional de España | 🇪🇸 | sru |
| slsp | Swisscovery (SLSP) | 🇨🇭 | sru |
| bibsys | BIBSYS/Oria | 🇳🇴 | sru |
| onb | Österreichische Nationalbibliothek | 🇦🇹 | sru |
| library_hub | Library Hub Discover | 🇬🇧 | sru-mods |
| libris | LIBRIS | 🇸🇪 | xsearch |
| standaard | Standaard Boekhandel | 🇧🇪 | html |
| finna | Finna | 🇫🇮 | api |
| opac_sbn | OPAC SBN | 🇮🇹 | api |
| ndl | NDL (National Diet Library) | 🇯🇵 | api |
| trove | Trove / NLA | 🇦🇺 | api (⏸️ pending API key) |
| kb_nl | KB (Koninklijke Bibliotheek) | 🇳🇱 | sru (Dublin Core) |
| danbib | DanBib / bibliotek.dk | 🇩🇰 | api |

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
| 026 | admin_stats | Admin dashboard statistics functions |
| 027 | condition_history | Condition history table, RLS, indexes |
| 028 | public_stats | Public signup stats for landing page |
| 029 | update_public_stats | Refine public stats function |
| 030 | cover_image_url | Cover image URL column on books |
| 031 | admin_read_policies | Admin read-access RLS policies |
| 032 | admin_user_detail_rpc | Admin user detail RPC function |
| 033 | drop_admin_read_policies | Remove redundant admin RLS policies |
| 034 | activity_log | Activity log table, indexes, RLS |
| 035 | fix_rls_security | Tighten RLS policies |
| 036 | activity_log_pagination | Activity log pagination indexes |
| 037 | invite_codes | Invite codes + redemptions tables |
| 038 | invite_codes_rls | Invite codes RLS policies |
| 039 | user_profile_fields | Phone, company, website on user_profiles |
| 040 | tier_features | Tier system: tiers, features, limits tables |
| 041 | tier_admin_rls | Admin RLS for tier management |
| 042 | tier_limits_no_unlimited | Replace unlimited with real numbers |
| 043 | valuation_history | Valuation history table, RLS, indexes |
| 044 | migrate_valuation_fields | Migrate old price fields to valuation_history |
| 045 | drop_old_valuation_fields | Drop lowest_price, highest_price, estimated_value, valuation_date |
| 046 | add_bne_slsp_providers | Add Unicat (BE), BNE (ES), SLSP (CH) providers; remove old KBR |
| 047 | add_bibsys_onb_libraryhub_providers | Add BIBSYS (NO), ÖNB (AT), Library Hub (GB); add sru-mods type |
| 048 | add_finna_sbn_ndl_trove_kb_providers | Add Finna (FI), OPAC SBN (IT), NDL (JP), Trove (AU), KB NL; disable old kb |
| 049 | disable_trove_pending_apikey | Disable Trove until API key approved |
| 050 | add_danbib_provider | Add DanBib (DK) provider |
| 051 | add_cerl_hpb_provider | Add CERL HPB (EU) rare books provider |
| 052 | add_hathitrust_provider | Add HathiTrust (US) digital library provider |
| 053 | add_missing_external_link_types | Add 10 missing library catalogs to external link types |
| 054 | user_onboarding | Onboarding columns on user_profiles (user_type, interests, checklist, etc.) |
| 055 | fix_new_user_trigger | Fix auth trigger for new user profile creation |
| 056 | cleanup_orphan_users | Clean up orphaned auth users without profiles |
| 057–063 | debug_auth / deep_clean / restore | Series of auth debugging + cleanup migrations |
| 064 | check_collections_table | Verify collections table structure |
| 065 | fix_trigger_search_path | Fix `SET search_path = public` for auth triggers (critical signup bug) |
| 066 | value_summary_rpc | `get_value_summary()` RPC for fast collection value aggregation |
| 067 | fix_value_summary_rpc | Exclude `provenance_purchase` from latest valuation in value summary RPC |
| 068 | book_images_blob_columns | Add `blob_url`, `thumb_blob_url`, `image_type`, `user_id` to book_images; make `storage_path` nullable |

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

### Performance Optimizations
- **Book detail page:** 19 sequential queries → 1 book fetch + 1 `Promise.all` (19 parallel) + 2 chained. ~3 round-trips instead of ~16.
- **Collection value summary:** 5-10 sequential client queries → 1 server-side RPC (`get_value_summary`, migration 066). Handles filtering by collection/tag in SQL.
- **Collection counts:** N+1 sequential count queries → `Promise.all` parallel batch. Both in `collections-manager.tsx` and `getCollectionsWithCounts` server action.
- **Collection activity logging:** Fixed — `CollectionsManager` client component was bypassing server actions (dead code), so collection CRUD was never logged. Added `logActivity` calls directly to client component handlers.

### Currency & Valuation
- 29 ISO 4217 currencies in `lib/currencies.ts`, dropdown selects on add/edit forms
- `default_currency` in user_profiles (default EUR), configurable in Settings > Configuration
- Exchange rate conversion via frankfurter.app (ECB rates, daily cache), graceful fallback
- Stats page: all totals converted to user's display currency, "rates as of" date shown
- Per-book gain/loss on detail page: "Bought €X → Estimated €Y (+Z%)" with green/red styling
- Collection value summary bar on books list: total acquired / estimated / unrealized gain
- Value distribution histogram on stats dashboard by price range
- **Valuation history** (v0.15.0): `valuation_history` table tracks value over time per book
  - Sources: self_estimate, appraisal, auction_result, dealer_quote, insurance, market_research, provenance_purchase
  - Provenance auto-sync: provenance entries with `price_paid` auto-create valuation entries
  - Timeline display on detail page (matches provenance/condition history style)
  - Value trend chart (Recharts) when 2+ dated entries exist
  - CRUD editor on edit page with drag-to-reorder
  - Old flat fields (`lowest_price`, `highest_price`, `estimated_value`, `valuation_date`) dropped from books table
  - Stats, export, and PDF now read from valuation_history instead of books columns
  - Migrations: 043 (table), 044 (data migration), 045 (drop old columns)

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

### Book Lookup (22 providers, 19 countries)
- Multi-field search: title, author, publisher, year range, ISBN
- Results list with cover thumbnails, click for full details
- Load More pagination (SRU: 20/batch, OL: 50, Google: 40)
- 15s timeout on all SRU fetch requests
- Auto-creates external link from lookup source URL
- Shared SRU/MARCXML parser with factory pattern (MARC21 + UNIMARC)
- Custom MODS parser for Library Hub Discover (UK)
- Custom Dublin Core parser for KB Netherlands
- Custom RSS/DC parser for NDL Japan (OpenSearch)
- Custom JSON parsers for Finna (Finland) and OPAC SBN (Italy)
- Custom DKABM/Dublin Core parser for DanBib (Denmark, OpenSearch SOAP/XML)
- Custom MARCXML parser for CERL HPB (EU) with PICA indexes: provenance, printer, former owner, dimensions
- HathiTrust (US) REST JSON + MARC-XML: holding library info, digitised version links, LCCN/OCLC/DDC/LCC
- Provider-specific fixes: BnF CQL relations, SUDOC field 214, NSB/NSE cleanup, LoC keyword fallback
- Trove (Australia) pending API key approval

#### Provider Research — Completed
| # | Provider | Country | Status | Notes |
|---|----------|---------|--------|-------|
| 21 | CERL HPB | 🇪🇺 | ✅ DONE | Heritage of the Printed Book (6M+ records, 1455–1830). SRU at `sru.k10plus.de/hpb` — public, no auth. MARCXML parser with author life dates, printers, provenance, former owners, physical dimensions, binding notes. `pica.yop` for exact year search. |
| 22 | HathiTrust | 🇺🇸 | ✅ DONE | 13M+ digitised volumes from 200+ research libraries. REST JSON at `catalog.hathitrust.org/api/volumes/` — public, no auth. ISBN/OCLC/LCCN lookup with full MARC-XML parsing. Holding library info, digitised version links, LCCN/OCLC/DDC/LCC identifiers. |
| 23 | DanBib / bibliotek.dk | 🇩🇰 | ✅ DONE | 14M+ records, Danish union catalog. OpenSearch API (DKABM/Dublin Core XML). CQL search: `dkcclterm.is` (ISBN), `dkcclterm.ti` (title), `dkcclterm.fo` (author), `dkcclterm.år` (year). `term.type=bog` filter. Authors in "Last, First" via `oss:sort`. No auth. |

| — | Biblios.net | — | ❌ DEAD | LibLime project (2008–2009), defunct since PTFS acquisition 2010. |
| — | OpenAlex | — | ❌ WRONG FIT | Academic citation DB (DOI-centric, no ISBN). Not for book collectors. |

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
| Valuation History (8 steps) | ✅ Done |
| Collection Audit (5 steps) | ✅ Done |

### Todo — Core Product
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| 1 | Locale & number formatting | ✅ Done | — | Locale setting in user_profiles, shared `lib/format.ts` with formatInteger/formatDecimal/formatCurrency/formatDate, applied to all pages (detail, stats, books list, admin, duplicates, settings). Legacy date_format column dropped (migration 024). |
| 2 | ~~Admin button in header~~ | ~~High~~ | ~~Low~~ | ✅ Already existed — Shield icon, red styling, conditional on is_admin. |
| 3 | ~~Edit page collapsible sections~~ | ~~High~~ | ~~Medium~~ | ✅ Done — Accordion sections on both add + edit forms. Field count badges, expand/collapse all toggle. |
| 4 | Activity logging | ✅ Done | — | All 6 steps complete: activity_log table, 20 log points, admin live feed + /admin/activity viewer, user /activity page, recent feed on /stats, book detail timeline. See details below. |
| 5 | ~~Feedback & bug reporting~~ | ~~High~~ | ~~Medium~~ | ✅ Done — Two form types: Bug Report + Message. `feedback` table (migration 025), admin queue with filters/status/priority/bulk actions, email notifications to admins on new tickets (Resend via `ADMIN_NOTIFICATION_EMAILS` env var), admin response emails user directly, badge count, support nav link + footer link. |
| 6 | Image upload | Medium | High | **✅ All 3 phases complete (v0.24.0).** Fase 1: URL-only. Fase 2: Vercel Blob uploads, sharp WebP pipeline, upload UI, gallery, quota. Fase 3: drag reorder, camera capture, pinch-to-zoom lightbox. |
| 6b | Bulk Image Import | High | Medium | **Pre-launch.** Drop hundreds of photos named by catalog number (e.g. `0001_01.jpg`, `0042_1.png`). Shelvd matches to books, converts to WebP, uploads sequentially. Progress bar, mismatch report, duplicate protection. **Dealer only** — gated via `tier_features` + Settings toggle. Reuses existing upload API. See detail below. |
| 7 | ~~Sharing & Public Catalog~~ | — | — | Moved to post-launch. |
| 8a | Landing page (marketing website) | ✅ Done | — | Full redesign: hero, numbers strip, collectors/dealers sections, 12-feature showcase, 4 visual spotlights (search, provenance, enrich, condition), comparison grid, 3-tier pricing, CTA. Swiss design + humor. |
| 8b | Knowledge base / Help center | ✅ Done | — | Wiki at `/wiki` — 35 articles across 8 categories (Getting Started, Cataloging, Provenance & History, Search & Discovery, Data & Export, Settings, Glossary & Reference, For Dealers). 150+ term glossary, reference guides for 76 formats and 69 MARC roles. Same witty tone as blog and legal pages. |
| 8c | Privacy Policy (`/privacy`) | ✅ Done | — | GDPR-compliant privacy policy with literary wit. 11 sections, third-party table, GDPR rights, contact. Accessible to visitors and logged-in users. |
| 8d | Terms of Service (`/terms`) | ✅ Done | — | 14 sections with literary wit: agreement, data ownership, acceptable use, IP, liability, pricing, termination, governing law. Same visual style as privacy page. |
| 8e | About / Story (`/about`) | ✅ Done | — | Origin story with literary wit: the problem, the solution (28k books + broken spreadsheet), what we care about, what we are/aren't, the name. Pull quotes, highlight boxes, care items with icons. |
| 8f | Changelog (`/changelog`) | ✅ Done | — | 9 releases (0.1.0–0.9.0), data-driven from lib/changelog.ts, timeline design, color-coded change types, version badge in app header. |
| 8g | Roadmap (`/roadmap`) | ✅ Done | — | 3-lane board (Shipped/Building/Planned), data-driven from lib/roadmap.ts, 26 items with category badges, 2-col card grid, stats bar, witty descriptions. |
| 8h | Blog (`/blog`) | ✅ Done | — | 22 articles by Bruno van Branden. Data-driven from `content/blog/` + `lib/blog.ts`. Index page grouped by 6 thematic sections. Article pages with serif typography, font size control (A−/A/A+), JSON-LD BlogPosting schema, Open Graph, prev/next navigation. Swiss design, print-like reading experience. |
| 9 | Mobile responsiveness | High | High | **✅ Done (v0.23.0).** Website + app pages. Hamburger nav, card layouts, responsive grids, touch targets. |
| 10 | Collection Audit | ✅ Done | — | Per-user library health score at `/audit`. 10 checks (identifiers, contributors, cover, condition, publisher, year, provenance, valuation, language, location), health score 0–100%, expandable book lists with fix links, FeatureGate (Pro+), nav link, activity logging. See details below. |
| 11 | ~~Catalog Generator~~ | — | — | Moved to post-launch. |
| 12 | User Onboarding | ✅ Done | — | Welcome wizard (4 screens with humor), getting started checklist (4 base + 2 profile-driven), smart empty states (6 pages), returning user nudge, activity logging. See details below. |
| 14 | Tier System & Feature Gating | High | Medium | Three tiers: Collector (free), Collector Pro, Dealer. Database-driven feature flags — no hardcoded tier checks. Upgrade hints in UI. See details below. |
| 15 | Community | Post-launch | — | Moved to post-launch. Discord link in footer/wiki as interim solution. |
| 13 | Invite Codes | ✅ Done | — | Optional promo codes on signup for attribution + benefits. Tables: invite_codes + invite_code_redemptions. Signup form: optional code field with validation. Admin /admin/invite-codes: list, create, toggle, detail with per-code stats (users, books). Activity logging. Sidebar link. See details below. |

#### #4 Activity Logging — Detail

**What it is:** Every meaningful action in Shelvd gets recorded. Not for analytics — for context. The backbone for the admin live feed (A3), future audit trails, and eventually personal activity history per user.

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

**Current progress (Fase 1): ✅ COMPLETE**
- ✅ Step 1: Migration 030 — `cover_image_url` TEXT column on books table
- ✅ Step 2: Types + CRUD — database.types.ts, add form (type + initial state + insert), edit form (update payload)
- ✅ Step 3: URL input field on edit + add forms (in Physical Description section)
- ✅ Step 4: Cover display on book detail page (with ClickableImage lightbox)
- ✅ Step 5: Thumbnail in list view (6×9px cover next to title)
- ✅ Step 6: Cover in grid view (aspect-ratio 3:4 with fallback icon)
- ✅ Step 7: Auto-fill cover URL during enrichment (cover_url mapped in lookup)

**Infra done:**
- Vercel Blob store: `shelvd-images` in FRA1, linked to shelvd-www, `BLOB_READ_WRITE_TOKEN` in .env.local + production

#### #6b Bulk Image Import — Detail

**The pitch:** A dealer photographs 200 books at a desk session, names the files by catalog number, drops them all into Shelvd at once. Done in 20 minutes instead of 200 individual uploads.

**Access control:**
- Dealer tier only — not for Collector Pro
- Feature flag: `bulk_image_import` in `tier_features` table (enabled for `dealer`, disabled for all others)
- Settings toggle: user can enable/disable in Settings → Features (same pattern as existing feature toggles)
- Nav link only visible when feature is enabled

**Filename convention:**
- `{catalog_id}_{sequence}.{ext}` — e.g. `0001_01.jpg`, `0001_02.png`, `0042_1.heic`
- Separator: `_` or `-` both accepted
- Sequence: `01` or `1` both accepted (leading zero optional)
- Extension: any supported format (JPEG, PNG, WebP, HEIC, TIFF, BMP, GIF)
- First image per catalog_id (lowest sequence) auto-tagged as `cover`, rest as `detail`

**Flow:**
1. User navigates to `/books/import-images` (new page)
2. Drops files or clicks file picker — accepts hundreds of files
3. Client-side: parse filenames → extract catalog_id + sequence
4. Client-side: batch lookup `WHERE user_catalog_id IN (...)` → resolve to book_id
5. Preview table: filename | catalog_id | matched book title | status
6. Mismatches highlighted in red (unknown catalog_id, unparseable filename)
7. User clicks "Start Import" → sequential upload via existing `/api/images/upload`
8. Progress bar: "142 / 287 — 0042_02.jpg ✓"
9. Summary: X uploaded, Y skipped (mismatches), Z skipped (duplicates)

**Duplicate protection:** If a book already has an image with the same `original_filename`, skip it. Prevents re-importing on retry.

**Implementation steps:**

| # | Step | File(s) | What |
|---|------|---------|------|
| 6b.1 | Feature flag | Migration 069, seed `tier_features` | Add `bulk_image_import` feature, enabled for dealer tier only |
| 6b.2 | Settings toggle | Settings page | Add toggle for bulk_image_import in Features section |
| 6b.3 | Bulk import page | `app/(app)/books/import-images/page.tsx` | File picker, filename parser, catalog_id lookup, preview table, progress bar, summary |

**Performance:**
- 500 images × 3 sec/image = ~25 minutes total
- Each upload is a separate function invocation — no timeout risk
- Browser does the orchestration — if it closes, resume by re-dropping (duplicates auto-skipped)
- Vercel Pro: 40 hours compute/month, this uses ~0.4 hours

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

**The problem:** A new user arrives via a blogger's link. They see an empty page with "My Collection — 0 books" and a header with 7 navigation items. The add form has 76 formats, 45 cover types, 65 bindings. They don't know where to start. They either click around and give up, or add one book and never return.

**Target users:** Private collectors (decades of books, failed at Excel), professional dealers (inventory management), librarians/archivists (institutional cataloging), curious visitors (just clicked a link).

**Design principles:**
- Every screen has personality and humor
- Never more than one decision per screen
- Profile answers drive what comes next
- All detection is automatic (same queries as admin journey funnel)
- Dismissible but persistent — never blocking

---

**Component 1: Welcome Wizard (first login, one-time, 4 screens)**

**Screen 1 — "Who are you?"**
> *"Before we let you loose in the stacks, a few questions. We promise they're painless — unlike that time you found foxing on your first edition."*

- 🏠 Private collector — *"I hoard books and call it a library"*
- 📚 Professional dealer — *"I sell books and call it a career"*
- 🎓 Librarian / Archivist — *"I catalog books and call it a calling"*
- 👀 Just looking around — *"I clicked a link and here we are"*

Stored as `user_profiles.user_type`.

**Screen 2 — "How many books?"**
> *"No judgment. We've seen everything from 3 to 30,000."*

- A handful (under 50)
- A proper collection (50–500)
- A serious problem (500–5,000)
- We might need to talk (5,000+)

Stored as `user_profiles.collection_size_estimate`.

**Screen 3 — "How do you catalog now?"**
> *"Be honest. We've all been there."*

- 📊 Spreadsheet — *"Excel/Google Sheets. It works. Sort of."*
- 📝 Notebook — *"Pen, paper, and hope"*
- 🧠 My memory — *"I know exactly where everything is. Usually."*
- 📦 Another app — *"LibraryThing / Bookbuddy / CLZ / other"*
- 🫣 I don't — *"That's why I'm here"*

Stored as `user_profiles.current_system`.

**Screen 4 — "What matters most to you?" (pick up to 3)**
> *"This helps us show you the right things first."*

- Knowing what I own
- Tracking provenance & history
- Insurance & valuation
- Finding books in library catalogs
- Organizing by condition & rarity
- Selling online (WooCommerce, AbeBooks)
- Just keeping it tidy

Stored as `user_profiles.interests` (TEXT[]). Drives which extra checklist steps appear and which wiki articles are linked.

---

**Component 2: Getting Started Checklist (persistent, dismissible)**

Sticky panel on the library page. Appears after wizard completion. Disappears when all steps complete or user dismisses. Progress indicator: "3/5 complete".

**Base checklist (everyone gets these 4):**
- ☐ **Add your first book** — *"Type a title, or paste an ISBN. We'll do the rest."* → link to add form
- ☐ **Try Library Lookup** — *"22 libraries, 4 continents. Your book is probably in at least one."* → link to enrich
- ☐ **Set your condition** — *"Fine? Very Good? 'It survived my toddler'?"* → link to edit
- ☐ **Create a collection** — *"Library is your default. But maybe you want 'To Read', 'Signed Copies', or 'Books I Pretend I've Read'."* → link to collections

**Extra steps based on profile (max 2, so max 6 total):**
- Dealer → ☐ **Set up your business profile** — *"Company name, VAT, the boring stuff that makes you look professional."* → link to settings
- Provenance interest → ☐ **Add provenance to a book** — *"Where did it come from? Every book has a story."* → link to provenance
- Valuation interest → ☐ **Record a valuation** — *"What's it worth? More than you paid, hopefully."* → link to valuation
- Large collection (500+) → ☐ **Import via CSV** — *"Bring your spreadsheet. We won't judge the formatting."* → link to import

All detection automatic — same queries as admin journey funnel (book count, activity_log categories, collection count).

Tracked via `user_profiles.onboarding_checklist` JSONB.

---

**Component 3: Smart Empty States (permanent, 6 pages)**

Every empty page gets a personality instead of a blank table.

**Library (0 books):**
> *"Every great library started with a single book. Yours is waiting."*
> **[+ Add your first book]** — prominent center button

**Collections (only default Library):**
> *"You have your Library. Now give it chapters. Signed copies? First editions? Books you'll never lend out?"*
> **[+ Create collection]**

**Provenance (0 entries on a book):**
> *"Where has this book been? A London bookshop in 1923? Your grandmother's attic? The story starts here."*
> **[+ Add provenance]**

**Activity (0 entries):**
> *"Nothing here yet. Add a book and watch the timeline come to life."*

**Audit (0 books):**
> *"Can't audit what doesn't exist. Add some books first and we'll tell you what's missing."*

**Stats (0 books):**
> *"Numbers need data. Add a few books and we'll give you charts, trends, and the satisfaction of a well-organized collection."*

---

**Component 4: Returning User Nudge**

When user returns after 3+ days and checklist is not complete:
> *"Welcome back. You left off at [next uncompleted step]. Pick up where you left off?"*

Small toast notification. Not blocking. Disappears after 5 seconds or click. Only shows once per session. Tracked via `onboarding_dismissed_at` timestamp.

---

**Admin Component (A9): ✅ Already shipped in v0.21.0**

Per-user 6-step journey tracker on `/admin/users/[id]` + aggregated activation funnel on `/admin/stats`.

---

**Database changes (1 migration):**

```sql
ALTER TABLE user_profiles ADD COLUMN user_type TEXT;                    -- collector/dealer/librarian/explorer
ALTER TABLE user_profiles ADD COLUMN collection_size_estimate TEXT;     -- under_50/50_500/500_5000/5000_plus
ALTER TABLE user_profiles ADD COLUMN current_system TEXT;               -- spreadsheet/notebook/memory/other_app/nothing
ALTER TABLE user_profiles ADD COLUMN interests TEXT[] DEFAULT '{}';     -- max 3 selected interests
ALTER TABLE user_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN onboarding_checklist JSONB DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN onboarding_dismissed_at TIMESTAMPTZ;
```

---

**Delivery plan:**

| Step | Description | Effort |
|------|-------------|--------|
| 1 | Migration: add 7 onboarding columns to user_profiles | Low |
| 2 | Welcome Wizard component (4 screens, saves to profile) | Medium |
| 3 | Wizard gate: redirect to wizard on first login if user_type is null | Low |
| 4 | Getting Started Checklist component (auto-detection, profile-driven) | Medium |
| 5 | Checklist integration on library page (sticky panel) | Low |
| 6 | Smart empty states: Library (0 books) | Low |
| 7 | Smart empty states: Collections, Provenance, Activity, Audit, Stats | Low |
| 8 | Returning user nudge (toast, session-aware) | Low |
| 9 | Activity logging for onboarding events | Low |

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
| Book lookup (12 providers) | ✅ | ✅ | ✅ |
| Library Enrich | ✅ | ✅ | ✅ |
| CSV import/export | ✅ | ✅ | ✅ |
| Activity log | ✅ | ✅ | ✅ |
| External links | ✅ | ✅ | ✅ |
| Image upload (Vercel Blob) | ❌ | ✅ | ✅ |
| PDF inserts (catalog card/sheet) | ❌ | ✅ | ✅ |
| Public catalog / sharing | ❌ | ✅ | ✅ |
| Collection Audit | ❌ | ✅ | ✅ |
| Advanced statistics | ❌ | ✅ | ✅ |
| Bulk image import | ❌ | ❌ | ✅ |
| Catalog Generator (DOCX) | ❌ | ❌ | ✅ |
| Bulk operations | ❌ | ❌ | ✅ |
| Document storage (invoices, certs) | ❌ | ❌ | ✅ |
| Dealer directory | ❌ | ❌ | ✅ |
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

#### #9 Mobile Responsiveness — Detail ✅ COMPLETE (v0.23.0)

**Website/marketing pages: ✅ Done (v0.11.0)** — All public pages responsive.

**App pages: ✅ Done (v0.23.0)** — 23 steps, 23 commits. Desktop layout untouched.

**What was built:**
- Mobile navigation: hamburger menu + slide-out drawer with all nav links, collections with counts, user section (settings/support/wiki/admin), sign out pinned to bottom, auto-close on route change
- Books page: header stacks title + buttons, search bar icon-only buttons, selection bar wraps, value summary wraps, list view mobile card layout (cover + title + author), grid view already responsive
- Book detail: cover stacks above title, action buttons wrap
- Add/Edit forms: header buttons stack below title
- Settings: tabs scroll horizontally
- Admin: sidebar becomes horizontal scrollable bar on mobile, all tables overflow-x-auto
- Support: form picker stacks on mobile
- Touch targets: 44px minimum on nav links and key buttons
- Tested at 375px (iPhone SE) — no overflow issues

**Already responsive (no changes needed):** grid view, stats cards/charts, forms (grid-cols-2 on mobile), book detail fields, search form, settings form fields, audit cards, lookup form, activity table, onboarding wizard.

See `docs/mobile-plan.md` for full analysis.

#### #10 Collection Audit — Detail

**What it is:** A per-user data quality dashboard at `/audit`. Scans the user's entire library, calculates a health score, groups issues by category, and links each issue to a one-click fix (edit or enrich). Pro+ feature (gated via `collection_audit` in `tier_features`).

**Why it matters:** Collectors import hundreds of books from spreadsheets — many with missing ISBNs, no contributors, no conditions. They don't know what's incomplete until they browse book by book. The audit turns "I should clean up my data someday" into "14 books need a contributor — click here." Gamification drives data quality without nagging.

**No database migration needed.** All checks are read-only queries on existing tables (books, book_contributors, provenance_entries, valuation_history).

**10 Audit Checks:**

| # | Check | Query logic | Severity | One-click fix |
|---|-------|------------|----------|---------------|
| 1 | **No identifiers** | `isbn_10 IS NULL AND isbn_13 IS NULL AND oclc_number IS NULL AND lccn IS NULL` | 🔴 High | → Enrich (lookup by title) |
| 2 | **No contributors** | `NOT EXISTS (SELECT 1 FROM book_contributors WHERE book_id = b.id)` | 🔴 High | → Edit page |
| 3 | **No cover image** | `cover_image_url IS NULL` | 🟡 Medium | → Enrich |
| 4 | **No condition** | `condition_id IS NULL` | 🟡 Medium | → Edit page |
| 5 | **No publisher** | `publisher_name IS NULL AND publisher_id IS NULL` | 🟡 Medium | → Enrich |
| 6 | **No publication year** | `publication_year IS NULL` | 🟡 Medium | → Enrich |
| 7 | **No provenance** | `status IN ('in_collection','purchased') AND NOT EXISTS (provenance_entries)` | 🟢 Low | → Edit page (provenance) |
| 8 | **No valuation** | `NOT EXISTS (valuation_history)` | 🟢 Low | → Edit page (valuation) |
| 9 | **No language** | `language_id IS NULL` | 🟢 Low | → Edit page |
| 10 | **No location** | `storage_location IS NULL` | 🟢 Low | → Edit page |

**Health Score Calculation:**
- Each book scores 0–10 (one point per check passed)
- Overall score = (sum of all book scores / total books × 10) × 100%
- Example: 250 books, average 8.7 checks passed → **"87% complete"**
- Per-category score: e.g. "Identifiers: 92%" (= 8% of books have no identifier)

**UI Design (Swiss):**

**Top section — Health Score:**
- Large percentage number (e.g. "87%") with circular progress ring or horizontal bar
- Subtitle: "Your collection is 87% complete. 34 books need attention."
- Monochrome + red accent for issues. No colors besides black/white/red.

**Category cards — 2-column grid (5 rows):**
- Per card: check name, icon, "X books" count, severity dot (red/yellow/green)
- Cards with 0 issues: green checkmark, muted
- Click card → expands to show affected books (title + link to edit/enrich)
- Expandable list shows max 10 books with "Show all X →" link

**Action links per book:**
- "Enrich" → `/books/{id}/edit?enrich=true` (opens enrich panel)
- "Edit" → `/books/{id}/edit` (scrolls to relevant section if possible)

**Server-side approach:**
- `lib/actions/audit.ts` — `getCollectionAudit()` server action
- Single efficient query using conditional aggregation (COUNT + CASE WHEN) — NOT N+1
- Returns: `{ totalBooks, score, categories: [{ key, label, severity, count, books }] }`
- Book IDs limited to first 50 per category (pagination if needed later)

**Query strategy (4 queries via Promise.all, not N+1):**

Query 1 — book-level fields (one row per book with 7 boolean flags):
```sql
SELECT
  b.id, b.title,
  (b.isbn_10 IS NULL AND b.isbn_13 IS NULL AND b.oclc_number IS NULL AND b.lccn IS NULL) as no_identifiers,
  (b.cover_image_url IS NULL) as no_cover,
  (b.condition_id IS NULL) as no_condition,
  (b.publisher_name IS NULL AND b.publisher_id IS NULL) as no_publisher,
  (b.publication_year IS NULL) as no_year,
  (b.language_id IS NULL) as no_language,
  (b.storage_location IS NULL) as no_location
FROM books b WHERE b.user_id = $1
```

Query 2–4 — related table checks (books without contributors / provenance / valuations):
```sql
SELECT b.id FROM books b WHERE b.user_id = $1
  AND NOT EXISTS (SELECT 1 FROM book_contributors bc WHERE bc.book_id = b.id)
```
(Similar for provenance_entries and valuation_history)

**Tier gating:**
- Page wrapped in `FeatureGate feature="collection_audit"`
- Collector tier: sees UpgradeHint ("Collection Audit — available on Collector Pro")
- Already configured in `tier_features` table + `tier-config.ts`

**Navigation:**
- New nav item in `layout.tsx` sidebar: "Audit" between Stats and Activity
- Icon: ClipboardCheck (lucide)

**Activity logging:**
- `logActivity('audit.viewed')` on page load

**Delivery plan:**

| Step | Description | Effort | Status |
|------|-------------|--------|--------|
| 1 | Server action: `getCollectionAudit()` in `lib/actions/audit.ts` | Medium | ✅ Done |
| 2 | Audit page: `/audit` with health score + category cards | Medium | ✅ Done |
| 3 | Expandable book lists per category with fix links | Low-Medium | ✅ Done (merged into step 2) |
| 4 | Nav link + activity logging + FeatureGate | Low | ✅ Done |
| 5 | Docs + session log + roadmap.ts update | Low | ✅ Done |

### Todo — Admin Section Enhancements
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| A1 | System stats dashboard | ✅ Done | — | Full stats dashboard at `/admin/stats`: 8 key metrics (users, books, avg/user, completeness, books 7d/30d, active users 7d/30d), growth chart with cumulative running totals (books + signups by month), feature adoption bars (collections, provenance, tags, links), user activation funnel (signup → 1+ → 10+ → 100+ → 1000+ books), data health (7 checks: ISBN, condition, publisher, cover, year, language, contributors — sorted worst-first), tier distribution, books-per-user table with % of total. |
| A2 | ~~Feedback/bug queue~~ | ~~High~~ | ~~Medium~~ | ✅ Done — Admin support queue at `/admin/support` with full workflow. Part of #5. |
| ~~A3~~ | ~~Activity log viewer + live feed~~ | ~~High~~ | ~~Medium~~ | ✅ Done. Steps 4–5 of #4. Live feed on dashboard (15 recent entries) + full /admin/activity page with table, category filters, search, pagination. Sidebar link added. |
| ~~A4~~ | ~~User management~~ | ~~Medium~~ | ~~Medium~~ | ✅ Done. Detail page (/admin/users/[id]): avatar, stats, collections, recent books, support history, admin notes, status/membership/admin actions, send email. List: sortable columns (user/books/joined/last active), heat indicators, clickable rows. Full profile display: name, company, phone, website, address, VAT, locale, currency, invite code attribution + benefit expiry. |
| A5 | ~~Announcement system~~ | ~~Low~~ | ~~Low~~ | ✅ Done — Colored banners (info/warning/success/maintenance), admin create/toggle/delete, dismissible by users, optional expiry. |
| A6 | Platform health score & checks | ✅ Done | — | Data Health on `/admin/stats`: 7 checks (ISBN, condition, publisher, cover, year, language, contributors) with completion bars sorted worst-first. Needs Attention alerts on `/admin` dashboard. Per-user Collection Audit at `/audit` with 10 checks and health score. Remaining: orphaned records, inconsistenties, duplicate publishers → post-launch. |
| ~~A7~~ | ~~Admin sidebar navigation~~ | ~~High~~ | ~~Low~~ | ✅ Done. Persistent sidebar: Overview, Users, Support (badge), Stats. Active state with left border accent. Sticky, icon-only on mobile. 'Back to App' link. Dashboard simplified with 'Needs Attention' alerts section. |
| A9 | User onboarding funnel (admin view) | ✅ Done | — | Per-user 6-step journey tracker on user detail page (signed up → first book → 10+ books → used enrich → created collections → added provenance). Aggregated activation funnel on `/admin/stats` (signup → 1+ → 10+ → 100+ → 1000+ books with conversion %). |

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

#### B2 Valuation History — Detail

**What it is:** A timeline of value assessments for each book, tracking how its market value changes over time. Works alongside provenance (who owned it) and condition history (physical state) to give a complete picture of a book's life.

**Why it matters:** The current Valuation section on book edit has 6 flat fields (lowest_price, highest_price, estimated_value, sales_price, price_currency, valuation_date). These represent a single snapshot — every new appraisal overwrites the previous one. A rare book might be appraised at purchase, revalued after restoration, estimated for insurance, then sold at auction. All of those data points are valuable, especially for insurance claims and provenance research.

**Key insight — provenance entries with prices ARE valuation events:**
Provenance entries already have `price_paid` + `price_currency`. When someone records "bought at Christie's for £2,500 in 2019", that's both a provenance event AND a valuation data point. These must flow into the valuation timeline automatically.

**Database schema:**

```sql
CREATE TABLE valuation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 1,
  valuation_date TEXT,
  value NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  source TEXT NOT NULL DEFAULT 'self_estimate'
    CHECK (source IN (
      'self_estimate',      -- owner's own guess
      'appraisal',          -- professional appraiser
      'auction_result',     -- actual auction hammer price
      'dealer_quote',       -- dealer offered/quoted this
      'insurance',          -- insurance valuation
      'market_research',    -- based on comparable sales
      'provenance_purchase' -- auto-created from provenance entry
    )),
  appraiser TEXT,           -- who did the valuation (person, firm, auction house)
  provenance_entry_id UUID REFERENCES provenance_entries(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Provenance ↔ Valuation auto-sync:**

| Provenance event | → Valuation entry |
|-----------------|--------------------|
| `price_paid` | `value` |
| `price_currency` | `currency` |
| `date_from` or `date_to` | `valuation_date` |
| `transaction_type` (purchase/auction/dealer) | `source` = `provenance_purchase` |
| `owner_name` | `appraiser` |
| `provenance_entry.id` | `provenance_entry_id` (FK for backlink) |

Behavior:
- **Save provenance entry with price** → auto-insert valuation entry (source = `provenance_purchase`)
- **Update price on provenance** → auto-update linked valuation entry
- **Delete provenance entry** → cascade-delete linked valuation entry (FK ON DELETE CASCADE)
- **Manual valuation entries** (appraisals, insurance) → `provenance_entry_id` = NULL, stand alone
- Provenance-linked entries shown in timeline with a link icon / "from provenance" badge

**What happens to current flat fields:**

| Current field | Migration plan |
|--------------|----------------|
| `estimated_value` | Migrated as a `self_estimate` valuation entry. Then: auto-populated from latest valuation entry. Eventually drop column. |
| `lowest_price` | Migrated as `market_research` entry with note "market low". Then drop. |
| `highest_price` | Migrated as `market_research` entry with note "market high". Then drop. |
| `sales_price` | **Keep as-is** — this is a transaction fact ("I sold it for X"), not a valuation. Could later move to a "sold" status on the book. |
| `price_currency` | Each valuation entry has its own currency. Keep on books for sales_price. |
| `valuation_date` | Each entry has its own date. Drop after migration. |

Migration strategy: **Phase 1** keeps the old fields read-only as fallback. **Phase 2** (after confirming data integrity) drops them.

**UI on book detail page:**
- Valuation timeline (same pattern as condition history): chronological entries with date, value, source badge, appraiser
- Value trend chart: simple line chart showing value over time (Recharts)
- Current estimated value: pulled from latest entry, shown prominently
- Provenance-linked entries: link icon that scrolls to the provenance entry

**UI on book edit page:**
- Replace current 6-field grid with timeline CRUD (same as condition history)
- Drag-to-reorder, add/edit/delete entries
- Source dropdown, appraiser field, date, value, currency, notes
- Provenance-linked entries: read-only in valuation timeline, editable from provenance section

**Delivery plan:**

| Step | Description | Effort |
|------|-------------|--------|
| 1 | Migration 043: `valuation_history` table + RLS + indexes | ✅ Done |
| 2 | Migration 044: migrate existing flat fields to valuation entries | ✅ Done |
| 3 | Provenance auto-sync in book edit save | ✅ Done |
| 4 | Book detail: ValuationTimeline component | ✅ Done |
| 5 | Book edit: ValuationHistoryEditor (replaces old 6-field grid) | ✅ Done |
| 6 | Book detail: value trend chart (Recharts) | ✅ Done |
| 7 | Activity logging for valuation changes | ✅ Done |
| 8 | Clean up: drop old flat fields from books table (migration 045) | ✅ Done |

### Post-Launch: All Items with Effort Estimates

| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| P1 | Sharing & Public Catalog | High | Public profile page, shareable collection links, embed widget. Privacy controls per collection. |
| S1 | WooCommerce Integration | Medium | Sync books to WooCommerce as products. Field mapping, publish/unpublish, sync status tracking. Dealer only. See detail above. |
| S2 | Catawiki Integration | High | No public API — CSV/XML export in Catawiki bulk upload format. Lot description generator. Dealer only. |
| S3 | AbeBooks/ZVAB Integration | Medium-High | HomeBase XML feed for dealer inventory. Fixed schema export, FTP or manual upload. Dealer only. |
| S4 | Catalog Generator (DOCX) | Medium | Professional DOCX catalogs from selected books. Numbered entries, condition, provenance, pricing. Dealer + Pro. |
| S5 | Insurance & Valuation Reports | Medium | Timestamped PDF reports: book list with photos, values, total collection value. Valuation history (B2) is done, this adds the export. |
| S6 | Dealer Directory | Medium | Business profiles for dealers. Collectors browse by region, period, subject. Dealer only. |
| S7 | Admin Impersonation | Low | "View as user" mode for debugging. See their books, collections, settings. Big red banner. |
| S12 | Images in PDF Inserts | Low | Add book images (cover + additional photos) to catalog sheet PDFs (A4/A5/A6). NOT on the catalog card (too small). Cover image at top, additional images in a grid below. Uses `book_images.blob_url` with `pdf-lib` image embedding. |
| S8 | Community | Low | Discord link as interim. In-app forum only if community outgrows it. |
| S9 | Data Cleanup Tools | Low-Medium | Orphaned records, inconsistencies, duplicate publishers. Admin-only. Build when scale demands it. |
| S10 | Sharing & Public Catalog | High | Public profile page, shareable collection links, embed widget. Privacy controls per collection. |
| S11 | Catalog Generator (DOCX) | Medium-High | Professional DOCX catalogs from selected books. Numbered entries, condition, provenance, pricing. Dealer + Pro. |

---

## Launch Plan & Production Safety

> Decided 2026-02-13. See `docs/staging.md` for full implementation guide.

**Phase 1: Pre-launch (now)**
- Finish remaining 2 features on `main` as before: Bulk Image Import (Dealer only) + Stripe integration + upgrade flow
- Test everything yourself — you are the only user, `main` is your staging
- Pre-migration backup script active (see `scripts/pre-migration-backup.sh`)

**Phase 2: Launch**
- Go live, first real users come in

**Phase 3: Immediately after launch (~1 hour setup)**
- `pg_dump` of production → staging Supabase project
- Create staging Vercel project (`staging.shelvd.org`)
- Enable branch protection on `main` (no direct pushes)
- From this point: feature branches → staging test → merge to `main` → production

**Standing rules (effective immediately):**
- Database migrations are always additive: `ADD COLUMN` only. `DROP COLUMN`, `RENAME`, `ALTER TYPE` = two releases.
- Pre-migration backup before every migration (automated via `scripts/migrate.sh`)
- Vercel instant rollback is the emergency brake for code issues

---

### Recently Completed
- ~~Image upload (Fase 2+3)~~ → v0.24.0: Vercel Blob + sharp WebP pipeline, upload UI, gallery, drag reorder, camera capture, pinch-to-zoom lightbox, quota tracking
- ~~Mobile responsiveness~~ → v0.23.0: Hamburger nav, card layouts, responsive grids, touch targets. 23 steps, desktop untouched.
- ~~Valuation bug fix~~ → v0.23.0: provenance_purchase excluded from value summaries (RPC, stats, PDF, export). Stats batching fix for 5000+ books.
- ~~Performance optimizations~~ → Book detail parallelization, value summary RPC, collection count batching
- ~~User onboarding~~ → v0.22.0: Welcome wizard, getting started checklist, smart empty states, returning user nudge
- ~~Collection activity logging~~ → Fixed client component bypassing server actions
- ~~Valuation history~~ → v0.15.0: Valuation timeline, value trend chart, provenance auto-sync, CRUD editor


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
│   │   ├── (app)/books/          # Collection pages + lookup + detail + edit
│   │   ├── (app)/stats/          # Statistics dashboard
│   │   ├── (app)/activity/       # User activity log
│   │   ├── (app)/audit/          # Collection audit (health score)
│   │   ├── (app)/support/        # User support page
│   │   ├── (app)/settings/       # User settings + collections + tags
│   │   ├── (app)/admin/          # Admin dashboard + users + activity + support + tiers
│   │   ├── (auth)/               # Login/register
│   │   ├── (marketing)/          # Landing, about, blog, wiki, changelog, roadmap, legal
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
│   │   ├── condition-history-timeline.tsx # Condition history timeline
│   │   ├── valuation-timeline.tsx # Valuation history timeline + trend chart
│   │   ├── book-timeline.tsx     # Activity timeline on book detail
│   │   ├── recent-activity-feed.tsx # Compact activity feed (stats page)
│   │   ├── feature-gate.tsx      # FeatureGate, LimitGate, UpgradeHint
│   │   ├── onboarding/           # Welcome wizard, checklist, empty states, nudge
│   │   ├── delete-book-button.tsx
│   │   └── (support/callback/contact forms inline in support-client.tsx)
│   └── lib/
│       ├── supabase/             # DB client + types
│       ├── actions/              # Server actions (collections, feedback, activity-log, audit, onboarding, etc.)
│       ├── email.ts              # Resend email notifications
│       ├── constants.ts          # BookStatus (14), conditions, roles, etc.
│       ├── currencies.ts         # 29 ISO 4217 currencies for dropdowns
│       ├── name-utils.ts         # Contributor name parsing (Last, First)
│       ├── tier.ts               # hasFeature(), getTierLimits() server-side
│       ├── format.ts             # formatInteger, formatCurrency, formatDate
│       ├── changelog.ts          # APP_VERSION + CHANGELOG array
│       ├── roadmap.ts            # Roadmap data for /roadmap page
│       ├── blog.ts               # Blog metadata + article registry
│       └── isbn-providers/       # Book lookup providers (22)
│           ├── index.ts          # Provider registry
│           ├── types.ts          # Shared types
│           ├── open-library.ts
│           ├── google-books.ts
│           ├── sru-provider.ts   # SRU factory (MARC21 + UNIMARC)
│           ├── sru-libraries.ts  # LoC, BnF, DNB, K10plus, SUDOC, Unicat, BNE, SLSP, BIBSYS, ÖNB
│           ├── library-hub.ts    # Library Hub Discover (MODS parser)
│           ├── libris.ts         # LIBRIS Xsearch
│           ├── standaard-boekhandel.ts
│           ├── finna.ts          # Finna (Finland, REST JSON)
│           ├── opac-sbn.ts       # OPAC SBN (Italy, JSON)
│           ├── ndl.ts            # NDL Japan (OpenSearch RSS/DC)
│           ├── trove.ts          # Trove/NLA (Australia, REST JSON)
│           ├── kb-netherlands.ts # KB Netherlands (SRU Dublin Core)
│           ├── danbib.ts         # DanBib (Denmark, OpenSearch DKABM/DC)
│           ├── cerl-hpb.ts       # CERL HPB (EU, SRU MARCXML, rare books)
│           └── hathitrust.ts     # HathiTrust (US, REST JSON + MARC-XML)
├── content/blog/                  # 22 blog articles (.md, by Bruno van Branden)
├── supabase/migrations/          # 001-068 (see Migrations table above)
└── docs/                          # project.md, CLAUDE_SESSION_LOG.md, CLAUDE_STARTUP_PROMPT.md, book-reference.md
```


