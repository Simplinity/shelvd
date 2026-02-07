# Claude Session Log

## Current State (2026-02-07)

All features up to and including Book Lookup are **complete**. 9 providers active, all 17 candidates evaluated.

---

## Completed Features

### Core App
- ✅ Collection Management (CRUD, bulk delete, list/grid views)
- ✅ Global Search (5000+ books, client-side batch fetch)
- ✅ Advanced Search (14 fields, AND/OR)
- ✅ Import/Export (Excel template, CSV, JSON)
- ✅ Statistics Dashboard (metrics, charts, top 10s)
- ✅ Cataloging (ISBD 4 languages, 45+ cover types, 76 formats, 69 MARC roles, 3887 BISAC codes)
- ✅ Admin Dashboard (user management, stats bar)
- ✅ User Settings (account, config, external links, book lookup providers)
- ✅ External Links (54 system types across 8 categories, per-user activation, custom types)
- ✅ Duplicate Detection (server-side SQL, ISBN + title matching, grouped results, bulk delete)

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
- Auto-creates external link from lookup source URL
- Lookup button on book add page

---

## Next Priorities

| # | Feature | Status |
|---|---------|--------|
| 8 | Sharing & Public Catalog | 🔴 Todo |
| 9 | Currency & Valuation | 🔴 Todo |
| — | Enrich mode (merge fields from lookup on edit page) | 🔴 Todo |
| — | Multiple Collections per user (Wishlist = a collection) | 🔴 Todo |
| — | Custom Tags | 🔴 Todo |
| — | Image upload | 🔴 Todo |

---

## In Progress: Multiple Collections per User

### Plan
1. Migration 011: create `collections` + `book_collections` tables with RLS
2. Migration 011: auto-create "Library" for existing users, assign all books
3. Migration 011: trigger to auto-create "Library" on new user signup
4. Server actions: CRUD for collections, add/remove books
5. Nav: collection switcher dropdown under "Collection"
6. Books list: filter by collection via query param
7. Book form: multi-select for collections on add/edit
8. Bulk actions: add to / remove from collection
9. Settings/manage page: rename, delete, reorder collections

### Step Log

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1 | Create migration 011_collections.sql | ✅ Done | Tables + RLS + seed + trigger. 2 users got Library, 5052 books assigned |
| 2 | Create server actions for collections | ✅ Done | 10 actions: get, getWithCounts, create, update, delete, reorder, getBookCollections, setBookCollections, addBooksToCollection, removeBooksFromCollection |
| 3 | Collection switcher dropdown in nav | ✅ Done | CollectionNav component + layout.tsx updated. Shows All Books + per-collection + Manage link |
| 3a | Fix TypeScript build error | ⏳ Starting | Supabase types don't know collections table, need explicit typing |

---

## Key Commits (recent)

| Hash | Description |
|------|-------------|
| `74383ff` | Complete provider evaluation (all 17 done) |
| `70fc220` | Standaard Boekhandel provider |
| `1ea8608` | Remove Bol.com + Library Hub |
| `dbcb0d2` | Google Books API key, disable Library Hub |
| `6163c93` | Load More pagination all providers |
| `b1ea7aa` | SRU providers (LoC, BnF, DNB) |
| `d49bec6` | Multi-field search |
