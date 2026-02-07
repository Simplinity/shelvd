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

### Next Priorities
| # | Feature | Status |
|---|---------|--------|
| — | Enrich mode (merge lookup fields on edit page) | 🔴 Todo |
| — | Image upload (covers, spine, damage) | 🔴 Todo |
| — | Sharing & Public Catalog | 🔴 Todo |
| — | Currency & Valuation | 🔴 Todo |
| — | Landing page + Knowledge base | 🔴 Todo |
| — | Multiple Collections per user | ✅ Done |
| — | Custom Tags | ✅ Done |

### Under Consideration
- Insurance & valuation PDF reports
- Provenance tracking (previous owners, auction history)
- Condition history (restorations, reports)
- Dealer & contact management
- Sales platform integration (WooCommerce, Catawiki, AbeBooks)
- PDF catalog export
- Templates system

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
│   │   └── delete-book-button.tsx
│   └── lib/
│       ├── supabase/             # DB client + types
│       ├── actions/              # Server actions (collections, etc.)
│       ├── constants.ts          # BookStatus (14), conditions, roles, etc.
│       └── isbn-providers/       # Book lookup providers
│           ├── index.ts          # Provider registry
│           ├── types.ts          # Shared types
│           ├── open-library.ts
│           ├── google-books.ts
│           ├── sru-provider.ts   # SRU factory (MARC21 + UNIMARC)
│           ├── sru-libraries.ts  # LoC, BnF, DNB, K10plus, SUDOC configs
│           ├── libris.ts         # LIBRIS Xsearch
│           └── standaard-boekhandel.ts
├── supabase/migrations/          # 001-014
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
