# Claude Session Log

## COMPLETED FEATURES

### Admin Dashboard ✅
- `/admin` — stats bar + user management table on single page
- Book counts via `get_book_counts_for_admin()` RPC (bypasses RLS)
- Admin nav link (red, only visible to admin users)
- User delete via `admin_delete_user()` SECURITY DEFINER (no service_role key needed)

### User Settings ✅
- `/settings` — two tabs: Account + Configuration
- **Account tab:** Profile, Security (password), Address, Subscription (read-only), Danger Zone (delete account)
- **Configuration tab:** Currency, Date Format, Items Per Page (list/grid split)

### Database functions
- `is_admin()` — SECURITY DEFINER, used by RLS policies
- `get_users_for_admin()` — returns auth.users data
- `get_book_counts_for_admin()` — book counts per user (bypasses RLS)
- `get_total_books_for_admin()` — total books count (bypasses RLS)
- `admin_delete_user(target_user_id)` — cascade delete user + auth.users

### Latest Git Commits
- `713a4b4` — admin nav link, delete route via RPC, project.md update
- `7c8e3f4` — items_per_page split into list/grid
- `fbff10c` — configuration tab (currency, date format, items per page)

---

## EXTERNAL LINKS FEATURE — ✅ COMPLETE

### Database (migrations 006-008)
- `external_link_types` — 55 system types + user custom types
- `user_active_link_types` — which types each user has activated
- `book_external_links` — actual links per book
- `update_updated_at_column()` trigger on books table

### Settings > External Links Tab
- Collapsible categories with activate/deactivate toggles per type
- "Activate all" / "Deactivate all" per category
- All types active by default for new users (lazy initialization)
- Add custom link types (auto-activated)
- Delete custom types
- Google Favicon API for icons

### Book Add/Edit Pages
- External Links section with unlimited links
- Dropdown shows only user's active link types
- Auto-fill URL with `https://{domain}/` when selecting type
- URL updates when changing type (if no path added yet)
- Open-in-new-tab button to search external site

### Book Detail Page
- Display links with favicons
- Links open in new tab
- Dates formatted per user preference

### 55 Built-in Link Types (8 categories)
Bibliographic & Authority (7), Short Title Catalogs (9), National & Regional (12), Digital Libraries (8), Provenance & Specialized (4), Antiquarian Markets (6), Auction Houses & Pricing (5), Community (2), Free-form (2)

### Key Commits
- `65e9772` — external links as third settings tab, migration 006
- `10eb6c7` — activate/deactivate toggles, migration 007
- `3db11d5` — all active by default for new users
- `9daaad5` — books updated_at trigger, migration 008
- `2f6bafa` — date formatting per user preference
- `fc2cc98` — auto-fill URL with domain
- `4eed856` — open-in-new-tab button

---

## DUPLICATE DETECTION — ✅ COMPLETE

### Database (migration 009)
- `find_isbn13_duplicates()` — groups books by ISBN-13
- `find_isbn10_duplicates()` — groups books by ISBN-10
- `find_title_duplicates()` — groups books by exact title (normalized)
- `find_fuzzy_title_duplicates()` — placeholder for pg_trgm

### UI: `/books/duplicates`
- Instant server-side scan (SQL functions)
- Grouped results: ISBN-13 > ISBN-10 > Exact Title
- Collapse/expand groups
- Select all/deselect all per group
- Checkbox per book
- Bulk delete selected
- View book in new tab
- Access via "Duplicates" button in books toolbar

### Key Commits
- `da069f4` — initial duplicate detection page
- `ef01ca1` — server-side SQL functions for instant scan

---

## ISBN LOOKUP — IN PROGRESS

### Database (migration 010) ✅
- `isbn_providers` — system providers (api/sru/html)
- `user_isbn_providers` — user activation + priority
- `get_user_isbn_providers()` — function to get user's active providers
- 20 providers seeded: Open Library, WorldCat, DNB, BnF, LoC, BL, KB, KBR, bol.com, Amazon variants, etc.

### Settings > ISBN Lookup Tab ✅
- Provider list grouped by type (API, Library, Bookstores)
- Toggle activation per provider
- Country flags and external links

### Status Value ✅
- `draft` status already exists in book-add-form.tsx

### Provider Architecture ✅
- `/lib/isbn-providers/types.ts` — BookData, ProviderResult, IsbnProvider interfaces
- `/lib/isbn-providers/index.ts` — Registry + orchestrator (searchIsbn, searchProvider)
- `/lib/isbn-providers/open-library.ts` — Open Library API provider
- `/lib/isbn-providers/bol-nl.ts` — Bol.com HTML parser

### Server Actions ✅
- `/lib/actions/isbn-lookup.ts` — lookupIsbn(), lookupIsbnWithProvider(), getActiveProviders()

### Lookup Page ✅
- `/books/lookup/page.tsx` — loads user's active providers
- `/books/lookup/lookup-form.tsx` — ISBN input, search progress, result preview, add to collection

### Book Add Form Integration ✅
- Loads lookup data from sessionStorage
- Sets status to 'draft' for lookup results
- Maps title, subtitle, publisher, year, pages, ISBN, series, edition, description
- Adds authors as contributors with 'Author' role
- Shows amber banner: "Pre-filled from ISBN lookup via {provider}"

### Implemented Providers
- ✅ Open Library (API)
- ✅ Bol.com (HTML parser)
- ⏳ 18 more providers in database, not yet implemented

### Books Toolbar ✅
- "ISBN Lookup" button added between Duplicates and Add Book
- Uses ScanBarcode icon from lucide-react

### TODO:
- [ ] Implement more providers as needed

---

## BUG FIX SESSION — IN PROGRESS

### Issue: ISBN Lookup missing data (2024-02-05)
Tested with ISBN `9780297790914` (A History of the Jews)

**Open Library returns (confirmed via curl):**
- `number_of_pages`: 643 ✅
- `isbn_10`: ["0297790919"] ✅
- `publish_date`: "1987" ✅
- `publishers`: ["Weidenfeld and Nicolson", ...] ✅
- `publish_places`: ["London"] ✅
- `pagination`: "x, 643 p. ;" ✅
- `lccn`: "87203317" ✅
- `oclc_numbers`: ["17620426"] ✅
- `dewey_decimal_class`: ["909/.04924"] ✅
- `lc_classifications`: ["DS117 .J54 1987b", "DS117"] ✅
- `subjects`: ["Jews -- History."] ✅
- `notes`: bibliography info ✅
- `languages`: [{"key": "/languages/eng"}] ✅
- `covers`: [9362335] ✅

**Problems found:**
1. `number_of_pages` not being saved to form
2. ISBN-13 (the one used for lookup) not being saved
3. Many extra fields available but not mapped:
   - publication_place
   - lccn
   - oclc_number
   - ddc (dewey)
   - lcc (library of congress classification)
   - subjects/topic
   - notes/bibliography

### Fixes applied (commit 63ec942):
- [x] Fix pages mapping — handle both number and string types
- [x] ISBN fallback — if lookup ISBN is 13/10 digits and not in response, use it
- [x] Map publication_place from `publish_places[0]`
- [x] Map pagination_description from `pagination`
- [x] Map lccn, oclc_number, ddc, lcc from classification fields
- [x] Map subjects array
- [x] Map notes (bibliography/index info)
- [x] Map language from `/languages/eng` → `eng`
- [x] book-add-form.tsx: forward all new fields to form (publication_place, pagination_description, lccn, oclc_number, ddc, lcc, subjects→topic, notes→bibliography)
- [x] lookup-form.tsx: preview shows all new fields (place, pagination, LCCN, OCLC, DDC, LCC, subjects)
