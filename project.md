# Shelvd

> **Last updated:** 2026-02-07

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
| Multiple Collections per user | ✅ Done |
| Custom Tags | ✅ Done |

### Todo — Core Product
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| 1 | Locale & number formatting | High | Medium | Single locale setting (en-US, nl-BE, de-DE) drives number format (1,234.56 vs 1.234,56) and date display. Storage stays canonical. Extends existing date format setting. |
| 2 | Admin button in header | High | Low | Gear/shield icon in header, conditionally shown for admin users. |
| 3 | Edit page collapsible sections | High | Medium | Accordion-style sections with filled-field count badges. Default: first open, rest collapsed. "Expand all" toggle. |
| 4 | Activity logging | High | Medium-High | `user_activity_log` table: user_id, action, entity_type, entity_id, details (JSON diff), timestamp. Admin filterable log viewer. |
| 5 | Feedback & bug reporting | High | Medium | Feedback form (bug/feature/question), `feedback` table with status tracking, auto-attach browser info. Admin queue. |
| 6 | Image upload | Medium | High | Cover images, spine, damage photos. Supabase Storage. Gallery on detail page. |
| 7 | Sharing & Public Catalog | Medium | High | Public profile page, shareable collection links, embed widget. |
| 8 | Landing page + Knowledge base | Medium | Medium | Marketing landing page, getting started guide, FAQ, feature docs. |

### Todo — Admin Section Enhancements
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| A1 | System stats dashboard | High | Medium | Total books, users, storage usage, activity trends, growth charts. |
| A2 | Feedback/bug queue | High | Medium | Review submitted feedback, change status, respond. |
| A3 | Activity log viewer | High | Medium | Filterable by user, action type, date range, entity. |
| A4 | User management improvements | Medium | Medium | Invite codes, approve registrations, user details view. |
| A5 | Announcement system | Low | Low | Post banner/message to all users. |
| A6 | Data health checks | Low | Medium | Orphaned records, missing required fields, import error log. |

### Under Consideration (Future)
- Insurance & valuation PDF reports
- Price history field (auction results, dealer quotes, previous sale prices)
- Condition history (restorations, reports)
- Dealer & contact management
- Sales platform integration (WooCommerce, Catawiki, AbeBooks)
- PDF catalog export
- Templates system
- Stats page: migrate acquired_price reads to provenance data
- Drop legacy acquired_* DB columns

---

## Design Decisions

**Status colors (Swiss Design):**
`on_sale` red solid, `to_sell` red light, `reserved` red outline, `lost/destroyed` black solid, `in_collection` gray

**Publication Year:** VARCHAR(100) for "MCMLXXIX [1979]", "(circa 1960)"

**Form elements:** All inputs/selects/textareas same height, consistent padding (`px-3 py-2 text-sm`)

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
│   │   ├── collection-chips.tsx  # Toggleable collection chips (detail page)
│   │   ├── collection-nav.tsx    # Nav dropdown for collections
│   │   ├── move-to-library-button.tsx # One-click Wishlist → Library
│   │   ├── tag-input.tsx         # Tag autocomplete/create input
│   │   ├── enrich-panel.tsx      # ISBN/field search enrichment panel
│   │   ├── provenance-editor.tsx  # Repeatable card UI for provenance chain
│   │   ├── provenance-timeline.tsx # Vertical timeline display (detail page)
│   │   └── delete-book-button.tsx
│   └── lib/
│       ├── supabase/             # DB client + types
│       ├── actions/              # Server actions (collections, etc.)
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
├── supabase/migrations/          # 001-020
└── project.md
```

---

## Pricing Model (proposal)

| Tier | Price | Books | Features |
|------|-------|-------|----------|
| Free | €0 | 100 | Basic |
| Collector | €7/mo | 5,000 | + Templates, Export |
| Scholar | €15/mo | Unlimited | + ISBD, API |
| Dealer | €29/mo | Unlimited | + Multi-user |
