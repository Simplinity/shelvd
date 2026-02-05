# Claude Session Log

## SESSION 2025-02-05

### Book Lookup — ISBN Bug Fixes ✅
- Fixed `number_of_pages` mapping (handle both number and string types)
- ISBN fallback: if lookup ISBN is 13/10 digits and not in API response, use it
- Mapped all remaining Open Library fields to BookData + form:
  - `publication_place`, `pagination_description`, `lccn`, `oclc_number`, `ddc`, `lcc`
  - `subjects` → `topic`, `notes` → `bibliography`, `language`
- Lookup preview now shows all extra fields
- Works API fallback: fetches description from Works level when edition has none
- Auto-creates external link from lookup source URL (matched by domain to link type)
- Commits: `63ec942`, `a994626`, `8728680`

### Book Lookup — Multi-Field Search ✅
- Redesigned `/books/lookup` page: provider dropdown + 5 search fields (title, author, publisher, year range, ISBN)
- Open Library: `searchByFields()` via Search API (`/search.json`) — returns list of results
- Open Library: `getDetails()` via Edition API (`/books/{key}.json`) — full data for selected result
- Results list view with cover thumbnails, click to view full details
- ISBN-only search still uses fast direct ISBN lookup path
- New types: `SearchParams`, `SearchResultItem`, `SearchResults`
- New server actions: `lookupByFields()`, `lookupDetails()`
- Provider interface extended with optional `searchByFields()` and `getDetails()` methods
- Commit: `d49bec6`

### Database Changes
- Removed `bol_be` from `isbn_providers` (same as NL)
- Added `google_books` to `isbn_providers` (API, googleapis.com)

### Google Books Provider ✅
- ISBN lookup, field search (`intitle:`, `inauthor:`, `inpublisher:`, `isbn:`), detail fetch by volume ID
- Auto external link via `books.google.com` domain match
- Commit: `3e95ee5`

### SRU Providers ✅
- Shared SRU/MARCXML parser (`sru-provider.ts`) with factory pattern
- MARC21 parser: title (245), authors (100/700), publisher (260/264), ISBN (020), pages (300), LCCN (010), OCLC (035), DDC (082), LCC (050), subjects (650), notes (500), description (520), language (041/008), edition (250), series (490)
- UNIMARC parser (BnF): title (200), authors (700/701), publisher (210), ISBN (010), pages (215), language (101), edition (205), series (225), description (330), subjects (606), notes (300)
- Per-library CQL index configuration
- Record caching for detail retrieval from search results
- Libraries: LoC, BnF, DNB
- Commit: `b1ea7aa`

### Provider Expansion ✅
- Added K10plus (GBV/SWB): `sru.k10plus.de`, MARC21, pica-indexes, ~200M holdings
- Added SUDOC (France): `sudoc.abes.fr/cbs/sru/`, UNIMARC, 15M records from 3000+ academic libraries
- Added LIBRIS (Sweden): Xsearch API (`libris.kb.se/xsearch`), MARC21, 7M records
- Replaced dead British Library (`explore.bl.uk`) with Library Hub Discover (JISC): `discover.libraryhub.jisc.ac.uk/sru-api`, covers 100+ UK libraries incl. BL
- Removed non-functional KBR (Z39.50 only, no SRU) and KB NL (Dublin Core, ISBN unreliable)
- Added `xsearch` provider type to DB constraint and TypeScript types
- Renamed settings tab "ISBN Lookup" → "Book Lookup" (`isbn-lookup` → `book-lookup`)
- Updated all references (settings page, settings form, lookup form link)

### TODO — Provider Implementation
- [ ] WorldCat (API) — Priority 1
- [ ] AbeBooks (HTML scraper) — Priority 3
- [ ] Enrich mode on book edit page (merge-scherm)

---

## COMPLETED FEATURES (prior sessions)

- ✅ Collection Management (CRUD, bulk delete, list/grid views)
- ✅ Search (global + advanced 14 fields)
- ✅ Import/Export (Excel, CSV, JSON)
- ✅ Statistics Dashboard
- ✅ Cataloging (ISBD, 45+ cover types, 76 formats, 69 roles, BISAC)
- ✅ Admin Dashboard (user management, stats)
- ✅ User Settings (account, config, external links, ISBN lookup providers)
- ✅ External Links (55 types, per-user activation)
- ✅ Duplicate Detection (server-side SQL, grouped results, bulk delete)
- ✅ Book Lookup — 10 providers: Open Library, Google Books, Bol.com, LoC, BnF, DNB, K10plus, SUDOC, LIBRIS, Library Hub (UK)
