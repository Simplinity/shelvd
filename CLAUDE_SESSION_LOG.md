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

## EXTERNAL LINKS FEATURE — IN PROGRESS

### What's Done (uncommitted, local only)
- [x] Migration file: `supabase/migrations/006_external_links.sql`
  - `external_link_types` table (system defaults + user custom types)
  - `book_external_links` table (actual links per book)
  - RLS policies for both tables
  - 55 system link types seeded across 8 categories
- [x] TypeScript types updated in `database.types.ts`
- [x] Server actions: `lib/actions/external-links.ts`
  - `addCustomLinkType()` — add user custom link type
  - `deleteCustomLinkType()` — delete user custom link type
- [x] Settings > Configuration: `ExternalLinkTypesSection` component
  - Collapsible categories showing all 55 system types with favicons
  - "Add Custom Link Type" form (label + domain)
  - Delete custom types (system types are read-only)
  - Google Favicon API for automatic icons

### What's NOT Done Yet
- [ ] **Run migration** `006_external_links.sql` in Supabase SQL Editor
- [ ] **Commit + push** all external links code
- [ ] **Book detail page:** display external links with favicons, grouped by category
- [ ] **Book edit page:** add/edit/delete links with type dropdown + URL input

### 55 Default Link Types (8 categories)

**BIBLIOGRAPHIC & AUTHORITY (7):** WorldCat, VIAF, Wikidata, Wikipedia, ISNI, Open Library, KVK

**SHORT TITLE CATALOGS (9):** ISTC, GW, USTC, ESTC, STCN, STCV (🇧🇪), VD16, VD17, EDIT16

**NATIONAL & REGIONAL (12):** KBR (🇧🇪), KB (NL), BnF, SUDOC, CCFr, British Library, Jisc, DNB, BSB, SBN/ICCU, BNE, Library of Congress

**DIGITAL LIBRARIES (8):** Gallica, Europeana, Google Books, HathiTrust, Internet Archive, MDZ, CERL HPB, BHL

**PROVENANCE & SPECIALIZED (4):** CERL Thesaurus, MEI, data.bnf.fr, GND

**ANTIQUARIAN MARKETS (6):** AbeBooks, ZVAB, Biblio.com, viaLibri, Bookfinder, Catawiki

**AUCTION HOUSES & PRICING (5):** Rare Book Hub, Christie's, Sotheby's, Bonhams, Drouot

**COMMUNITY (2):** Goodreads, LibraryThing

**FREE-FORM (2):** Publisher Website, Other

### Architecture Notes
- Link types in database (not hardcoded) → configurable via Settings > Configuration
- System types: `is_system = true`, `user_id = NULL` — read-only for users
- User custom types: `is_system = false`, `user_id = auth.uid()` — per-user, deletable
- Favicons via Google API: `https://www.google.com/s2/favicons?domain=worldcat.org&sz=16`
- Fallback to generic link icon for custom URLs without domain
