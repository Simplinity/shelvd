# Claude Session Log

## Current State (2026-02-07)

All features up to and including **Custom Tags** are **complete**. 9 lookup providers active. Collections: Library + Wishlist auto-created per user, nav dropdown, filtering, bulk actions, settings page. Tags: colored, autocomplete, filter by tag, clickable on detail page. Bug fixes: external link URLs, collection filtering, SRU provider source_url. Polish: toggleable collection chips, toast feedback, complete status definitions.

---

## Completed Features

### Core App
- ✅ Collection Management (CRUD, bulk delete, list/grid views)
- ✅ Global Search (5000+ books, client-side batch fetch, optimized for collection filtering)
- ✅ Advanced Search (14 fields, AND/OR)
- ✅ Import/Export (Excel template, CSV, JSON)
- ✅ Statistics Dashboard (metrics, charts, top 10s)
- ✅ Cataloging (ISBD 4 languages, 45+ cover types, 76 formats, 69 MARC roles, 3887 BISAC codes)
- ✅ Admin Dashboard (user management, stats bar)
- ✅ User Settings (account, config, external links, book lookup providers)
- ✅ External Links (54 system types across 8 categories, per-user activation, custom types)
- ✅ Duplicate Detection (server-side SQL, ISBN + title matching, grouped results, bulk delete)
- ✅ Multiple Collections (Library + Wishlist default, nav dropdown, filtering, bulk add/remove, settings page, migrations 011–012)
- ✅ Custom Tags (colored tags, create/search/autocomplete, filter by tag, clickable on detail page, migration 014)
- ✅ Currency & Valuation (29 currencies, ECB exchange rates, per-book gain/loss, value summary bar, value distribution chart)
- ✅ Enrich Mode (ISBN lookup + field search fallback, comparison panel, merge selected fields into edit form)

### Book Detail Page
- ✅ Full book info display with all cataloging fields
- ✅ External links with favicons, URLs shown, domain-only URLs rejected
- ✅ Collection chips (toggleable — click to add/remove from any collection, with toast feedback)
- ✅ Tags (colored chips, clickable to filter books list by tag)
- ✅ Move to Library button (one-click Wishlist → Library shortcut)
- ✅ Previous/Next navigation between books

### Book Lookup (9 active providers)
- ✅ Open Library — API (ISBN + field search + Works API fallback for descriptions)
- ✅ Google Books — API (`GOOGLE_BOOKS_API_KEY` env var, 1000 req/day)
- ✅ Library of Congress — SRU/MARC21 (keyword fallback for publisher search)
- ✅ BnF — SRU/UNIMARC (adj/all CQL relations, mxc: namespace)
- ✅ DNB — SRU/MARC21
- ✅ K10plus (GBV/SWB) — SRU/MARC21 (~200M holdings)
- ✅ SUDOC (France) — SRU/UNIMARC (field 214 for pub info, NSB/NSE cleanup)
- ✅ LIBRIS (Sweden) — Xsearch/MARC21
- ✅ Standaard Boekhandel — Autocomplete API + JSON-LD

### Skipped Providers (8)
- Amazon (4 variants) — PA-API deprecated April 2026, affiliate-only
- Fnac — Akamai WAF blocks all server-side
- Bol.com — Captcha/cookie wall blocks server-side
- Library Hub Discover — Cloudflare blocks SRU
- Casa del Libro — No API, client-side rendered
- IBS.it — No API, client-side rendered
- Mondadori Store — No API, client-side rendered
- WorldCat — All APIs require paid OCLC subscription, CloudFlare protected

### Lookup Features
- Multi-field search (title, author, publisher, year range, ISBN)
- Load More pagination (SRU: 20/batch, OL: 50, Google: 40)
- 15s timeout on all SRU requests
- Auto-creates external link from lookup source URL (all providers including SRU)
- Lookup button on book add page

---

## Next Priorities

| # | Feature | Status |
|---|---------|--------|
| 1 | Currency & Valuation (7 steps) | ✅ Done |
| 2 | Enrich mode (merge lookup fields on edit page) | ✅ Done |
| 3 | Image upload (covers, spine, damage) | 🔴 Todo |
| 4 | Sharing & Public Catalog | 🔴 Todo |
| 5 | Landing page + Knowledge base | 🔴 Todo |

### Under Consideration
- Insurance & valuation PDF reports
- Provenance tracking (previous owners, auction history)
- Price history field (auction results, dealer quotes, previous sale prices)

---

## Feature: Currency & Valuation

### Context
Books table has price/currency data on ~5000 books (99.98% EUR, 1 USD). Five duplicate unused columns exist. Stats page hardcodes EUR. Currency inputs are freetext. No conversion, no per-book gain/loss display.

### Current DB columns (price-related)
| Column | Type | Data Count | Notes |
|--------|------|------------|-------|
| acquired_price | numeric(10,2) | 4895 | What was paid |
| acquired_currency | varchar(3) | 4896 | 99.98% EUR, 1 USD |
| lowest_price | numeric(10,2) | 1636 | Market low |
| highest_price | numeric(10,2) | 4687 | Market high |
| estimated_value | numeric(10,2) | 2595 | Current estimated value |
| sales_price | numeric(10,2) | 1338 | Selling price |
| price_currency | varchar(3) | 5048 | Valuation currency |
| purchase_currency | text | 0 | **UNUSED — drop** |
| price_lowest | numeric(10,2) | 0 | **UNUSED — drop** |
| price_highest | numeric(10,2) | 0 | **UNUSED — drop** |
| price_sales | numeric(10,2) | 0 | **UNUSED — drop** |
| price_estimated | numeric(10,2) | 0 | **UNUSED — drop** |

### Plan (7 steps)

| # | Step | Description | Status |
|---|------|-------------|--------|
| 1 | Clean up duplicate DB columns | Migration 015: drop 5 unused columns (purchase_currency, price_lowest, price_highest, price_sales, price_estimated). Zero data loss. Detail page fallbacks cleaned up. | ✅ Done (`3068ed0`) |
| 2 | Currency dropdowns | New `currencies.ts` with 29 ISO 4217 currencies. Freetext inputs replaced with select dropdowns on add + edit forms. | ✅ Done (`40e7d58`) |
| 3 | Home currency in user settings | `default_currency` already in user_profiles. Unified settings dropdown to shared 29-currency list. Stats page now reads user's currency instead of hardcoded EUR. | ✅ Done (`5f8b21e`) |
| 4 | Exchange rate conversion on stats page | Stats API fetches ECB rates from frankfurter.app, converts all prices to display currency. Rates date shown on stats page. Graceful fallback if unavailable. | ✅ Done (`106b554`) |
| 5 | Per-book gain/loss on detail page | Detail page shows "Bought €X → Estimated €Y (+Z%)" with green/red styling when both acquired_price and estimated_value are set. | ✅ Already done |
| 6 | Collection value summary on books list | Summary bar above book list: total acquired / total estimated / unrealized gain for current view (all, collection, or tag). | ✅ Already done |
| 7 | Value distribution chart on stats | Histogram by value range in stats dashboard (calculated in stats API with convert()). | ✅ Already done |

---

## Feature: Enrich Mode (2026-02-08)

### What was done
Enrich mode lets users fill missing fields on existing books by searching ISBN lookup providers.

### Subtask 1–3: EnrichPanel component with search, comparison, and merge (`333cb32`)
- New `components/enrich-panel.tsx` — self-contained component
- "Enrich" button on edit page (below header, above form)
- Clicks triggers `lookupIsbn()` with book's ISBN-13/10
- Comparison panel shows field-by-field diff:
  - 🟢 NEW (green badge) — book field empty, provider has value → pre-checked
  - 🟡 DIFFERENT (amber badge) — both have values that differ → unchecked
  - Same values → hidden (nothing to enrich)
- 19 enrichable fields: title, subtitle, publisher, year, place, pages, pagination, ISBN-13/10, LCCN, OCLC, DDC, LCC, edition, series, series_number, description, subjects, notes
- Authors shown as info-only row (not auto-merged into contributors)
- "Select all new" shortcut, per-field checkboxes
- "Apply N fields" merges into form state → sets isDirty → user reviews & saves
- Success message after apply

### Subtask 4: No-ISBN fallback (`a8f61db`)
- When book has no ISBN, "Enrich (search)" button opens mini search form
- Title + first author pre-filled from book data
- Provider picker (only field-search-capable providers)
- Search results list, click to load details → comparison panel
- Refactored into state machine: idle → search → results → compare
- `authorName` prop passed from edit form (first Author contributor, or first any contributor)

### Subtask 6: Contributor name handling ("Last, First" standard)

Providers return "First Last" (e.g., "J.R.R. Tolkien") but the catalog standard is "Last, First" (e.g., "Tolkien, J.R.R."). This causes false "different" flags in enrich, and new contributors from lookup are saved in wrong format.

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| 6a | Name parser utility | `lib/name-utils.ts` — parseName(), isSameAuthor(), toCatalogFormat(), normalizeNameForComparison(). Handles prefixes (van/de/von), orgs, single names. | ✅ Done (`0596914`) |
| 6b | Fix enrich: smart author comparison + auto-merge | Uses isSameAuthor() to skip known authors. New authors shown in "Last, First" format, checkable, auto-added as contributors on Apply. | ✅ Done (`0dacee5`) |
| 6c | Fix add form: parse lookup authors | toCatalogFormat() on lookup load, parseName() on save (all fields), isSameAuthor() for existing matching | ✅ Done (`a0cb557`) |
| 6d | Fix edit form + manual entry | parseName() on save, isSameAuthor() matching, placeholder "Last, First (e.g. Tolkien, J.R.R.)" on both forms | ✅ Done (`86131cc`) |
| 6e | Backfill existing bad data | One-time script to fix contributors saved as "First Last" from past lookups | 🔴 Todo |
| 6f | Docs | Update session log, project.md, startup prompt | 🔴 Todo |

### Subtask 5: Multi-provider search (`80ba28c`)
- "Search other providers" link shown after comparison or empty results
- Switches to field search form with title/author pre-filled, provider picker
- User can try any field-search-capable provider
- Works for both ISBN-based and search-based enrichment flows

---

## Bug Fixes & Cleanup (2026-02-07)

### Bug: External link URL missing from lookup
**Problem:** Books added via SRU-based lookup providers (KBR, BnF, DNB, etc.) saved the link type but not the URL.
**Root cause:** SRU provider's `getDetails()` method returned `{ success, data, provider }` but omitted `source_url`. Other providers (Google, Open Library, Standaard) all returned it correctly.
**Fix:** Added `source_url` construction in `sru-provider.ts` `getDetails()` using `config.sourceUrlPattern` + ISBN. (`460fa08`)

### Bug: External link URLs not visible on detail page
**Problem:** Detail page rendered links as `<a href={link.url}>typeLabel</a>` — if URL existed it wasn't shown as text, and broken links (empty URL) were clickable dead links.
**Fix:** Show URL text alongside type label. Links without URL show "(no URL)" as plain text instead of broken link. (`a87c525`)

### Cleanup Summary

| # | Item | Commit | Details |
|---|------|--------|---------|
| 1 | Remove "Wishlist" book status | `eb84a94` | Wishlist is now a collection, not a status. Removed from add/edit forms and constants.ts. Migration 013 converts any existing wishlist-status books to in_collection and adds them to Wishlist collection. |
| 2 | Fix external links with no URL | `833d64c` | Deleted 1 orphan link (VIAF domain-only). Add/edit forms now reject domain-only URLs (`/^https?://[^/]+/?$/`). |
| 3 | Optimize global search + collection | `63d6f5e` | When searching within a collection, fetch only that collection's book IDs first, then fetch those books (batched at 200). Previously fetched ALL 5000+ books then filtered client-side. |
| 4 | Collection chips toggleable | `a3a057d` | Book detail page shows ALL user collections as chips. Filled = member, outline = not member. Click to toggle. Replaces static read-only chips. |
| 5 | Toast feedback on chip toggle | `e6841d6` | Shows "Added to Library" / "Removed from Wishlist" etc. below chips for 2.5s after toggle. |
| 6 | Complete BOOK_STATUSES | `5e289a7` | constants.ts now has all 14 statuses with labels and colors: draft, in_collection, lent, borrowed, double, to_sell, on_sale, reserved, sold, ordered, lost, donated, destroyed, unknown. |

---

## Feature: Custom Tags (2026-02-07)

### What was done
1. **Migration 014** (`014_tags.sql`): Added RLS policies to existing `tags` + `book_tags` tables
2. **TagInput component** (`components/tag-input.tsx`): Type to search existing tags, create new ones on Enter/comma, colored chips with color dot, autocomplete dropdown with "Create new" option
3. **Add form**: Tags section with TagInput — creates tags in DB on the fly, saves to book_tags on submit
4. **Edit form**: Loads existing book tags, same TagInput, saves via delete-all + re-insert
5. **Detail page**: Colored tag chips (using tag's `color` field) that link to `/books?tag=<id>`
6. **Books list**: Tag filter indicator with tag name + Clear button. Page title shows "Tag: <name>" when filtering. Works combined with collection filter (intersection).

### Database
- `tags` table: id, user_id, name, color (default #6b7280), created_at. Unique on (user_id, name).
- `book_tags` table: id, book_id, tag_id, created_at. Unique on (book_id, tag_id).
- RLS: Users can only manage their own tags and book_tags.

### Commit
`d31dbfe` — Custom Tags: RLS, colored input, clickable detail chips, filter indicator

---

## Feature: Multiple Collections (completed earlier)

### What was done
1. Migration 011: `collections` + `book_collections` tables with RLS, auto-seed Library for existing users
2. Migration 012: Auto-create Wishlist (is_default=true, non-deletable) for existing + new users
3. Server actions: 10 actions (get, getWithCounts, create, update, delete, reorder, getBookCollections, setBookCollections, addBooksToCollection, removeBooksFromCollection)
4. Nav: CollectionNav dropdown (All Books + per-collection + Manage link)
5. Books list: `?collection=` filter, paginated fetch, count
6. Add/edit forms: Collection multi-select checkboxes
7. Bulk actions: Add to Collection dropdown + Remove from Collection
8. Settings: `/settings/collections` — create, rename, delete, reorder, book counts
9. Detail page: Toggleable collection chips + Move to Library button

---

## Feature: Move to Library Button (2026-02-07)

### What was done
- Client component `components/move-to-library-button.tsx`
- Shows on book detail page when book is in Wishlist but NOT in Library
- One-click: adds to Library + removes from Wishlist simultaneously
- Green "Moved to Library" confirmation on success
- Commit: `4e82566`

---

## Feature: Collection Filtering Fix (2026-02-07)

### What was done
- Fixed URL length limit crash with large collections (5000+ books) when using `.in()` with all IDs
- Implemented paginated fetching for DEFAULT MODE (no search, no filters)
- Added fast count query for collection filtering (avoids fetching all book data just to count)
- Fixed undefined `collectionBookIds` references in global search and advanced filter modes
- Commit: `5c714de`

---

## Database Migrations

| # | File | Description |
|---|------|-------------|
| 001 | 001_reference_tables.sql | Conditions, bindings, formats, languages |
| 002 | 002_contributor_roles.sql | 69 MARC relator codes |
| 003 | 003_user_data.sql | Books, contributors, book_contributors, user_stats |
| 004 | 004_bisac_codes.sql | 3887 BISAC subject codes |
| 005 | 005_user_profiles_admin.sql | User profiles, admin role |
| 006 | 006_external_links.sql | External link types, user activation, book links |
| 007 | 007_isbn_providers.sql | ISBN providers table + seed |
| 008 | 008_user_isbn_providers.sql | Per-user provider preferences |
| 009 | 009_tags.sql | Tags + book_tags tables |
| 010 | 010_publisher_to_name.sql | Publisher field rename |
| 011 | 011_collections.sql | Collections + book_collections, Library seed, trigger |
| 012 | 012_default_wishlist.sql | Wishlist auto-create, is_default column, trigger update |
| 013 | 013_remove_wishlist_status.sql | Convert wishlist status books to in_collection |
| 014 | 014_tags.sql | RLS policies for tags + book_tags |
| 015 | 015_drop_unused_price_columns.sql | Drop 5 unused price columns (zero data) |

---

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| CollectionChips | `components/collection-chips.tsx` | Toggleable collection membership on book detail page with toast |
| CollectionNav | `components/collection-nav.tsx` | Nav dropdown for switching collections |
| MoveToLibraryButton | `components/move-to-library-button.tsx` | One-click Wishlist → Library |
| TagInput | `components/tag-input.tsx` | Tag autocomplete/create input for add/edit forms |
| EnrichPanel | `components/enrich-panel.tsx` | ISBN/field search enrichment with comparison panel |
| DeleteBookButton | `components/delete-book-button.tsx` | Book deletion with confirmation |

---

## Key Commits (recent)

| Hash | Description |
|------|-------------|
| `106b554` | Currency step 4: exchange rate conversion in stats calculation |
| `5f8b21e` | Currency step 3: home currency in settings, stats page uses it |
| `40e7d58` | Currency step 2: currency select dropdowns on add/edit forms |
| `3068ed0` | Currency step 1: drop 5 unused price columns, clean up detail page |
| `605f14f` | Settings/tags page: create, rename, recolor, delete tags |
| `8936d60` | Consistent max-w-7xl on all pages |
| `607ed0e` | Full page width on book pages (add, edit, detail, lookup) |
| `18c757d` | Update docs: Custom Tags complete |
| `d31dbfe` | Custom Tags: RLS, colored input, clickable detail chips, filter indicator |
| `5e289a7` | Complete BOOK_STATUSES (all 14 statuses) |
| `e6841d6` | Toast feedback on collection chip toggle |
| `a3a057d` | Collection chips toggleable on book detail |
| `63d6f5e` | Optimize global search within collection |
| `833d64c` | Fix external links with no URL |
| `eb84a94` | Remove Wishlist status from UI |
| `a87c525` | Show external link URLs on detail page |
| `460fa08` | Fix SRU provider source_url in getDetails |
| `4e82566` | Move to Library button on book detail |
| `5c714de` | Fix collection filtering URL overflow |
| `3443c66` | Make Wishlist non-deletable (is_default=true) |
| `a3c5fc2` | Default Wishlist collection (migration 012 + trigger) |
| `ebfda18` | Collections tab in settings nav, fix All Books count |
| `ec8f3a0` | Settings/collections page: create, rename, delete, reorder |
| `8e5e442` | Bulk collection actions in selection bar |
| `555d289` | Collection multi-select on edit form |
| `1c4008f` | Database types fix for collections |
| `fe05060` | TypeScript type fix for collections |
| `0a72286` | Navigation dropdown for collections |
| `d414c8d` | Server actions for collections |
| `78992dd` | Database migration 011: collections + book_collections |
| `74383ff` | Complete provider evaluation (all 17 done) |
| `70fc220` | Standaard Boekhandel provider |
| `1ea8608` | Remove Bol.com + Library Hub |
| `dbcb0d2` | Google Books API key, disable Library Hub |
| `6163c93` | Load More pagination all providers |
| `b1ea7aa` | SRU providers (LoC, BnF, DNB) |
| `d49bec6` | Multi-field search |
