# Shelvd

> **Last updated:** 2026-02-14 (v0.25.0 — catalog normalization, 13 languages, ISBD+Trade dual mode)

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
| conditions | 9 | As New, Fine, Near Fine, VG, Good, Fair, Poor (ABAA standard) |
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
| isbn_providers | 23 | Book lookup providers (22 active + Trove pending) |
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
status, action_needed, internal_notes, catalog_entry, catalog_entry_isbd
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
| cerl_hpb | CERL HPB (Heritage of the Printed Book) | 🇪🇺 | sru |
| hathitrust | HathiTrust Digital Library | 🇺🇸 | api |
| europeana | Europeana | 🇪🇺 | api |

#### Todo — New Providers
| code | name | country | type | notes |
|------|------|---------|------|-------|
| bnp | BNP / PORBASE | 🇵🇹 | sru | UNIMARC — same parser as BnF/SUDOC |
| bn_pl | Biblioteka Narodowa | 🇵🇱 | api | REST/JSON via data.bn.org.pl |
| bnl | BnL / bibnet.lu | 🇱🇺 | z3950 | Z39.50 + OAI-PMH, 90 Luxemburgse bibliotheken |
| cobiss | COBISS.net | 🇸🇮🇷🇸🇧🇦🇲🇰🇲🇪🇦🇱🇽🇰🇧🇬 | api | 9 landen in één provider (Balkan + Slovenië + Bulgarije) |

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
| 069–071 | sort + composite indexes | Sort indexes on books (publisher, place, year, catalog_id, created_at) + composite joins (book_images, book_contributors, book_collections) |
| 072 | catalog_entry_isbd | Add `catalog_entry_isbd` column to books for ISBD formal output |
| 073 | fix_condition_grades | Rename Mint→As New, Fine Plus→Near Fine, add Fair grade (ABAA standard) |
| 074 | add_google_books_provider | Add Google Books to isbn_providers (display_order 15), reorder LoC to 18 |

---

## Completed Features

### Core Features (all complete)
- Books list (list/grid views), add/edit/delete, bulk actions, selection mode
- Global search (5000+ books) + Advanced search (14 fields, AND/OR logic)
- Excel import/export (XLSX/CSV/JSON), selective export
- Statistics dashboard (key metrics, distributions, top 10s, value charts)
- Dual-mode Catalog Entry Generator: Trade (ILAB/ABA/SLAM) + ISBD (IFLA), 13 languages, 49 cover types, 76 formats, 69 MARC roles, 3887 BISAC codes
- Admin dashboard (stats, user management, announcement system, support queue, activity log, tiers)
- User settings (account, configuration, external links, book lookup providers)
- 54 external link types across 8 categories, per-user activation
- Duplicate detection (ISBN + title matching, grouped results, bulk delete)

### Multiple Collections
Library + Wishlist defaults, custom collections. Nav dropdown, bulk add/remove, detail page toggleable chips, Move to Library button.

### Custom Tags
Free-form colored tags per user. Autocomplete input, colored chips on detail page, clickable filter on books list.

### Book Detail Page
Full info, external links with favicons, collection chips, tag chips, Move to Library, Previous/Next navigation, image gallery with lightbox.

### Performance Optimizations
Book detail: 19 parallel queries via Promise.all. Value summary: server-side RPC. Collection counts: batched. DB indexes on all sort fields + composite joins.

### Currency & Valuation
29 currencies, exchange rates via frankfurter.app, per-book gain/loss, collection value summary bar, valuation history with timeline + trend chart.

### Enrich Mode
Field-by-field comparison (NEW/DIFFERENT/same), 19 enrichable fields, smart author comparison, no-ISBN fallback, "search other providers" link.

### Contributor Name Handling
"Last, First" standard. `lib/name-utils.ts` with parseName(), isSameAuthor(). Handles prefixes (van/de/von), single names, organizations.

### Feedback & Support
Bug reports + messages. Admin queue with status workflow, priority, admin response (emails user). Badge count, email notifications via Resend.

### Book Lookup (23 providers, 19 countries)
Multi-field search, results with covers, Load More pagination. Shared SRU/MARCXML parser + custom parsers per provider. Auto-creates external link.

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

#### #4 Activity Logging
All 6 steps complete. Table: `activity_log` with 20+ log points, admin feed, user /activity page, book detail timeline.

#### #6 Image Upload
All 3 phases complete (v0.24.0). URL-only (free) + Vercel Blob uploads (paid). Sharp WebP pipeline, gallery, drag reorder, camera capture, pinch-to-zoom lightbox, quota tracking. Storage: Vercel Blob (FRA1). Cost: <1% of revenue even worst case.

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

#### #11 Catalog Generator
Post-launch. DOCX generation from selected books. Numbered entries, condition, provenance, pricing. Dealer + Pro. v1: single template. v2: multiple templates + drag-and-drop ordering. v3: PDF + branding.

#### #12 User Onboarding
All steps complete (v0.22.0). Welcome wizard (4 screens), getting started checklist (4 base + 2 profile-driven), smart empty states (6 pages), returning user nudge. DB: 7 onboarding columns on user_profiles.

#### #13 Invite Codes
All 5 steps complete. Optional promo codes on signup for attribution + benefits. Tables: `invite_codes` + `invite_code_redemptions`. Admin UI at /admin/invite-codes with per-code stats.

#### #14 Tier System & Feature Gating
Steps 1–6 complete. Three tiers: Collector (free), Collector Pro (€9.99/mo), Dealer (€49/mo). Database-driven feature flags via `tier_features` table — no hardcoded tier checks. `hasFeature()`/`useFeature()` hooks. FeatureGate/UpgradeHint/LimitGate UI components. Admin /admin/tiers for management.

**Feature matrix:** See tier_features table in DB. Key limits: Collector 500 books, Pro 5000 + 5GB images, Dealer 100K + 25GB images.

**⚠️ Remaining:** Step 7 — Mollie integration + upgrade flow. All upgrade links currently point to /#pricing as placeholder.

#### #9 Mobile Responsiveness
Complete (v0.23.0). 23 steps, hamburger nav, card layouts, responsive grids, touch targets. Desktop untouched.

#### #10 Collection Audit
All 5 steps complete. Per-user health score at /audit. 10 checks (identifiers, contributors, cover, condition, publisher, year, provenance, valuation, language, location). Pro+ feature.

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

#### S1 WooCommerce Integration
Post-launch. Sync books to WooCommerce as products via REST API v3. Field mapping, publish/unpublish, sync status tracking. Dealer only.

#### S2 Catawiki — Notes
Catawiki has no public API for lot submission. Options: (1) generate CSV/XML in Catawiki's bulk upload format, (2) investigate if they have a partner/dealer API. Most likely approach: export lot descriptions in their format, user uploads manually. Description generator can use Shelvd's rich book data to write compelling lot descriptions.

#### S3 AbeBooks — Notes
AbeBooks uses the HomeBase XML upload system for dealer inventory. Fixed schema: author, title, publisher, year, price, condition (standard ABE condition codes), description, binding, keywords, quantity. XML file uploaded via FTP or their web interface. Shelvd can generate the XML, user uploads it. ZVAB (German sister site) uses the same system.

#### B2 Valuation History
All 8 steps complete (v0.15.0). `valuation_history` table with 7 source types, provenance auto-sync, timeline display, value trend chart, CRUD editor. Old flat fields dropped.

### Post-Launch: All Items with Effort Estimates

| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| S10 | Sharing & Public Catalog | High | Public profile page, shareable collection links, embed widget. Privacy controls per collection. |
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

### V2 — Major Refactors & Internal Quality

| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| P18 | Stricter TypeScript types | High | Remove 69 `as any` casts. Proper Supabase query types, FormData interfaces, RPC types. Internal quality, zero user impact. |

---

## Pre-Release Polish

Must-do improvements before launch. Low effort, low risk.

### SEO & Web Standards
| # | Item | Status |
|---|------|--------|
| P1 | Favicon + apple-touch-icon + web manifest | ✅ Done |
| P2 | robots.txt (allow marketing, disallow app/admin/auth) | ✅ Done |
| P3 | sitemap.xml (8 static + 22 blog + 35 wiki = 65 pages) | ✅ Done |
| P4 | OpenGraph / Twitter Card metadata + OG image | ✅ Done |

### Error Handling & Resilience
| # | Item | Status |
|---|------|--------|
| P5 | Global error page (app/error.tsx) | ✅ Done |
| P6 | Global 404 page (app/not-found.tsx) | ✅ Done |
| P7 | Global loading state (app/(app)/loading.tsx) | ✅ Done |
| P8 | Replace 12+ alert() calls with toast notification system | ✅ Done |

### UX Polish
| # | Item | Status |
|---|------|--------|
| P9 | Save confirmation toast after book edit | ✅ Done |
| P10 | Prev/Next navigation follows active sort order | Todo |
| P11 | Unsaved changes indicator in browser tab title | ✅ Done |
| ~~P12~~ | ~~Keyboard shortcuts~~ | Cancelled — niet nodig voor doelgroep |
| P13 | Search term highlighting in results | Todo |

### Data Quality
| # | Item | Status |
|---|------|--------|
| P14 | Duplicate warning on add (debounced title check) | ✅ Done |
| ~~P15~~ | ~~"Recently added/edited" quick filter~~ | Cancelled — Date added sort dekt het al |
| ~~P16~~ | ~~"Add →" nudge links on empty fields~~ | Cancelled |

### Technical
| # | Item | Status |
|---|------|--------|
| P17 | Split books/page.tsx (2300+ lines) into focused components | Post-launch |
| P18 | Stricter TypeScript types for Supabase queries (remove `any`) | → V2 |

### Accessibility
| # | Item | Status |
|---|------|--------|
| P19 | Skip-to-content link | ✅ Done |
| P20 | Alt text on cover images (book title instead of empty) | ✅ Done |

### Marketing & Growth
| # | Item | Status |
|---|------|--------|
| P21 | JSON-LD structured data on marketing pages | ✅ Done |
| P22 | Newsletter email capture (Mailchimp form embed) | Todo |
| P23 | "Share with a friend" button (uses existing invite codes) | Post-launch |

### Minor Polish
| # | Item | Status |
|---|------|--------|
| P24 | Dynamic browser tab titles (book count, book title, page name) | ✅ Done |
| P25 | Scroll-to-top button on long book lists | ✅ Done |

---

## Launch Plan & Production Safety

> Decided 2026-02-13. See `docs/staging.md` for full implementation guide.

**Phase 1: Pre-launch (now)**
- Finish remaining 2 features on `main`: Bulk Image Import (Dealer only) + Mollie integration + upgrade flow
- Pre-release polish (see above): P4–P25
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
│       ├── catalog-translations.ts # 590 lines: labels, roles, covers, conditions in 13 languages
│       ├── field-help-texts.ts   # 68 field tooltips (antiquarian trade perspective)
│       ├── blog.ts               # Blog metadata + article registry
│       └── isbn-providers/       # Book lookup providers (26)
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
│           ├── hathitrust.ts     # HathiTrust (US, REST JSON + MARC-XML)
│           └── europeana.ts      # Europeana (EU, REST JSON, 200M+ records)
├── content/blog/                  # 22 blog articles (.md, by Bruno van Branden)
├── supabase/migrations/          # 001-074 (see Migrations table above)
└── docs/                          # project.md, CLAUDE_SESSION_LOG.md, CATALOG_ENTRY_SPEC.md, book-reference.md
```


