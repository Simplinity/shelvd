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
| 1 | Enrich mode (merge lookup fields on edit page) | 🔴 Todo |
| 2 | Image upload (covers, spine, damage) | 🔴 Todo |
| 3 | Sharing & Public Catalog | 🔴 Todo |
| 4 | Currency & Valuation | 🔴 Todo |
| 5 | Landing page + Knowledge base | 🔴 Todo |

### Under Consideration
- Insurance & valuation PDF reports
- Provenance tracking (previous owners, auction history)

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

---

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| CollectionChips | `components/collection-chips.tsx` | Toggleable collection membership on book detail page with toast |
| CollectionNav | `components/collection-nav.tsx` | Nav dropdown for switching collections |
| MoveToLibraryButton | `components/move-to-library-button.tsx` | One-click Wishlist → Library |
| TagInput | `components/tag-input.tsx` | Tag autocomplete/create input for add/edit forms |
| DeleteBookButton | `components/delete-book-button.tsx` | Book deletion with confirmation |

---

## Key Commits (recent)

| Hash | Description |
|------|-------------|
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
