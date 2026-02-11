# Claude Session Log

> **RULE: This log is updated in real-time during every session. Each subtask is written here BEFORE committing code. Status: ⏳ doing / ✅ done / ❌ blocked. On connection loss, the next session reads this log first to know exactly where to resume. Every commit includes a log update. No exceptions.**

## Current State (2026-02-11)

**App version: v0.13.0.** All core features, marketing site, feedback system, PDF print inserts, cover images, activity logging, and invite codes complete. 9 lookup providers active. 37 DB migrations applied. Marketing site: Landing, Privacy, Terms, About, Changelog, Roadmap, Marginalia (blog) — all live.

**Current task: #14 Tier System & Feature Gating — documentation only (planning)**
- ✅ Docs: project.md feature #14 entry + full detail section (tiers, feature table, distribution matrix, 7-step plan), roadmap.ts (planned)

**Previous task: User profile expansion ✅**
- ✅ Step 1: Migration 039 — add phone, company_name, website to user_profiles
- ✅ Step 2: Admin user detail — show all profile data (always visible, — for empty)
- ✅ Step 3: Settings form + server action — add phone, company_name, website to Profile section

**Session work (v0.13.0 — 2026-02-11):**
- **#4 Activity Logging — ALL 6 STEPS COMPLETE ✅**
  - Step 1: Foundation — `activity_log` table, 5 indices, RLS, SECURITY DEFINER RPCs, `logActivity()` utility
  - Step 2: Book instrumentation — book.created, book.updated (JSON diff of 12 fields), book.deleted, import.completed
  - Step 3: Full platform instrumentation — collections (5 actions), account (3 actions), admin (7 actions). 20 logActivity() calls total
  - Step 4: Admin live feed on dashboard — compact chronological feed, relative timestamps, category color dots, 15 recent entries
  - Step 5: Admin `/admin/activity` log viewer — full table, category filter tabs, entity search, pagination (50/page), sidebar link
  - Step 6: User-facing — `/activity` page (personal history, filters, pagination), recent feed on `/stats` (last 10, clickable book links), book detail timeline ("Last modified" + expandable history per book)
  - A3 Activity log viewer: ✅ Done (steps 4-5)
- **RLS Security Fix**
  - Migration 035: re-enabled RLS on `languages`, `publishers`, `contributor_aliases` (flagged by Supabase security advisor)
  - Ensured policies exist for all 3 tables
- **#13 Invite Codes — ALL 5 STEPS COMPLETE ✅**
  - Step 1: Migration 037 — `invite_codes` + `invite_code_redemptions` tables, `redeem_invite_code()` RPC, admin RPCs, RLS
  - Step 2: Signup form — optional code field with validation, benefits applied on redemption
  - Step 3: Admin `/admin/invite-codes` — list, create, toggle active/inactive
  - Step 4: Code detail page — redemption list with user status + book counts
  - Step 5: Activity logging (2 actions) + sidebar link + docs
  - Codes are optional (signup stays open), for attribution + benefits only, no gated access

**Previous session work (v0.12.0 + v0.11.0):**
- **Printable PDF book inserts — COMPLETE**
  - Vintage catalog card (3×5"): authentic 1930s-50s library aesthetic
    - Courier typewriter font, red vertical line at first indentation, ruled lines, card border, punch hole
    - AACR standard layout: call number (DDC/LCC + cutter), author, title paragraph, imprint, collation, notes, tracings, storage location
    - Two-page PDF: page 1 decorative (cream bg, border, ruled lines) for display, page 2 clean (text only, white bg) for printing on real card stock
    - Files: `lib/pdf/catalog-card.ts`, `lib/pdf/types.ts`
  - Full catalog sheet: complete book record in Swiss typography
    - 6 paper sizes: A4, A5, A6, US Letter, US Legal, US Half Letter
    - Red accent bar at top, red section headers in small caps, no decorative lines
    - Inline field pairs (second field follows first with 20pt gap, wraps if needed)
    - All sections: Publication & Edition, Physical, Condition, Condition History, Provenance, Identifiers, Storage & Valuation, Notes, Catalog Entry, References
    - Empty fields/sections omitted automatically
    - Adaptive typography per paper size
    - File: `lib/pdf/catalog-sheet.ts`
  - API route: `/api/books/[id]/pdf` with type (catalog-card/catalog-sheet) and size params
  - UI: BookPdfButton dropdown on book detail page ("Print Insert" with paper size options)
  - File: `components/book-pdf-button.tsx`
  - Dependency: `pdf-lib` (TypeScript-native PDF generation)
  - Key challenge: StandardFonts only support WinAnsiEncoding — built `safeText()` to convert all Unicode to Latin-1
- **Auth page improvements**
  - Live stats from database (books, contributors, publishers)
  - Rotating literary quotes (Borges, Cicero, Eco, Hemingway, etc.)
- **Form UX**: sections reordered by collector workflow (Identity → Bibliographic → Physical → History → Classification → Collection Management → Supplementary)
- **Feedback & email fixes**
  - Admin response to user now sends branded HTML email (new `sendAdminResponseEmail()` in `lib/email.ts`)
  - Feedback notification fix: was calling `get_users_for_admin` RPC as non-admin user → silent failure. Now uses `ADMIN_NOTIFICATION_EMAILS` env var
  - Email sends now `await`ed — serverless function was terminating before Resend could deliver
  - Added logging throughout email pipeline for Vercel debugging
  - New env var: `ADMIN_NOTIFICATION_EMAILS=bruno@simplinity.co` on Vercel
- **Support forms simplified**: removed Callback type entirely (phone, timezone, urgency), renamed Contact → Message, 3-col → 2-col grid, removed preferred response dropdown. Database untouched, old records still display. Minus 108 lines.
- **Blog**: font size control simplified from `[T] [−] [M] [+]` to `[−] T [+]`
- **Roadmap**: split "Data Health Checks" into two features:
  - Platform Health Checks (admin) — orphaned records, cross-user inconsistencies
  - Collection Audit (user-facing) — per-user library health score with one-click fixes
- **Catalog Generator** — new planned feature #11 in roadmap + project.md (full spec)
- **Support forms simplified** — removed Callback type, renamed Contact → Message, 2-col grid
- **Auth pages** — added "← Back to website" link
- **Mobile audit (website/marketing pages)**:
  - Header: Info dropdown responsive width, "Sign In" hidden on xs
  - Changelog: version badge flex-wrap, simplified content
  - Blog article: metadata stacks vertically on mobile (author / date / time each on own line)
  - All other pages already mobile-ready: responsive grids (md:/sm: breakpoints), prose max-w containers, responsive text sizes
  - **Result: all website/marketing pages are now mobile-ready ✅**
- **Image Upload (#6) — Fase 1 COMPLETE ✅**
  - Vercel Blob store created: `shelvd-images` in FRA1 (Frankfurt), linked to shelvd-www project
  - `BLOB_READ_WRITE_TOKEN` set in `.env.local` + auto-injected in production
  - `@vercel/blob` SDK installed
  - Full spec written in project.md (two-tier approach, cost analysis, DB schema, phasing)
  - Step 1 ✅: Migration 030 — `cover_image_url` TEXT column on books table
  - Step 2 ✅: Types + CRUD — database.types.ts, add form (type + initial state + insert), edit form (update payload)
  - Step 3 ✅: URL input field on edit + add forms (with live thumbnail preview)
  - Step 4 ✅: Cover image on book detail page (left of title, responsive)
  - Step 5 ✅: Thumbnail in list view (24×36px next to title, placeholder when empty)
  - Step 6 ✅: Cover in grid view (fills card, fallback to BookOpen icon)
  - Step 7 ✅: Auto-fill cover URL during enrichment (ENRICHABLE_FIELDS + cover_url)
  - Extra fixes:
    - Lookup→Add: cover_url from sessionStorage now mapped to cover_image_url
    - Lookup detail: cover_url preserved from search results (fallback when editions API lacks covers)
    - Cover preview shown prominently at top of add + edit forms (not hidden in collapsed section)
    - "✓ Cover found" label in lookup detail view
    - Clickable covers with lightbox overlay (detail page, lookup, enrich)
- **Lookup/Enrich UX reorganisation**
  - Lookup moved to header nav (between Search and Stats)
  - Book detail page: Lookup button → Enrich button (links to `/edit?enrich=true`, auto-triggers)
  - Add form: Lookup link → full Enrich panel (button + dropdown, same as edit form)
  - Books list page: Lookup button removed (now in nav)
- **Bug fix: Lookup no results**
  - "No results found" message now shows even when API returns 0 results without error
- **Sticky header** — app header now stays fixed at top while scrolling (`sticky top-0 z-40`)
- **Version bump to v0.12.0** — changelog, roadmap, project.md all updated

**Previous session (v0.10.0):**
- Admin system stats dashboard (A1)
- Feedback & Support system (all 6 steps)
- Header redesign with user menu dropdown
- Resend email integration
- Blog / Marginalia: 22 articles
- Docs reorganized

---

## Feature Backlog — TODO

### Core Product
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| ~~4~~ | ~~Activity logging~~ | ~~High~~ | ~~Medium-High~~ | ✅ Done (2026-02-11). See Completed. |
| 6 | Image upload | Medium | High | Cover images, spine, damage photos. Supabase Storage. Gallery on detail page. |
| 7 | Sharing & Public Catalog | Medium | High | Public profile page, shareable collection links, embed widget. |
| 8b | Knowledge base (`/help`) | Medium | Medium | Getting started guide, FAQ, feature docs, tips. Last marketing page. |
| 9 | Mobile responsiveness | High | High | Hamburger nav, touch targets, single-column forms, responsive cards/charts. Desktop-only in practice today. |
| 10 | Collection Audit | Medium | Medium | Per-user library health score. Missing contributors, books without identifiers, provenance gaps, incomplete fields — surfaced with one-click fixes. Gamification that drives data quality and return visits. |
| 11 | Catalog Generator | Medium | Medium-High | Select books → generate professional DOCX catalog. Numbered entries (Lot N / #N), author/title/year/condition/provenance/price, image placeholders, title page, TOC, colophon. Editable in Word. For dealers, auction houses, serious collectors. Phased: v1 one template + basic config, v2 multiple templates + drag-drop ordering, v3 PDF + custom branding. |

### Growth & Marketing
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| ~~G1/13~~ | ~~Invite codes~~ | ~~High~~ | ~~Medium~~ | ✅ Done (2026-02-11). See Completed. |

### Admin Enhancements
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| ~~A1~~ | ~~System stats dashboard~~ | ~~High~~ | ~~Medium~~ | ~~DONE — /admin/stats with metrics, distributions, growth charts~~ |
| ~~A3~~ | ~~Activity log viewer~~ | ~~High~~ | ~~Medium~~ | ✅ Done (2026-02-11). See Completed. |
| ~~A4~~ | ~~User management~~ | ~~Low~~ | ~~Medium~~ | ✅ Done (2026-02-11). See Completed. |
| A5 | Admin impersonation | Medium | Medium | "View as user" button in admin user table. Admin temporarily sees the platform as that user — their books, collections, settings, everything. Essential for debugging reported issues. Banner at top showing impersonation mode + "Exit" button. Supabase approach: admin session stores target user_id, RLS queries use that instead of auth user. Audit logged. |
| A6 | Platform health checks | Low | Medium | Orphaned records, cross-user inconsistencies, import errors, duplicate publishers. Admin-only platform hygiene dashboard. |

### Completed
| # | Feature | Date |
|---|---------|------|
| A1 | System stats dashboard | 2026-02-09 |
| 5 + A2 | Feedback & Support + Admin queue | 2026-02-09 |
| B3 | Condition history (timeline + CRUD + auto-prompt) | 2026-02-09 |
| UX1 | Edit page UX/UI overhaul | 2026-02-09 |
| PDF | Printable PDF inserts (catalog card + catalog sheet) | 2026-02-09 |
| AUTH | Auth page live stats + literary quotes | 2026-02-09 |
| A4 | User management: detail page, sortable list, admin email | 2026-02-11 |
| 4 | Activity logging: 6 steps, 20 log points, admin feed + viewer, user /activity + /stats feed + book timeline | 2026-02-11 |
| A3 | Activity log viewer: admin live feed on dashboard + /admin/activity with filters/pagination | 2026-02-11 |
| 13 | Invite codes: optional promo codes, attribution + benefits, admin management + detail pages | 2026-02-11 |
| SEC | RLS security fix: re-enabled on languages, publishers, contributor_aliases | 2026-02-11 |

### Book Data Features
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| B1 | Insurance & valuation PDF reports | Medium | Medium | Generate PDF reports for insurance: book list with photos, estimated values, total collection value. Timestamped, signed, official-looking. Export per collection or full library. |
| B2 | Valuation history | Medium | Medium | Separate from provenance. Track market value over time without ownership changes: appraisals, auction estimates, dealer quotes. `valuation_history` table: book_id, date, value, currency, source (appraisal/auction_result/dealer_quote/self_estimate), appraiser, notes. Chart on book detail showing value trend over time. |
| B3 | Condition history | Medium | Medium | Physical life of the book, separate from provenance (who owned it). `condition_history` table: book_id, date, event_type (restoration/rebinding/repair/damage/cleaning/deacidification/assessment), description, performed_by (restorer/workshop), cost, currency, before_condition_id, after_condition_id, notes. Chronological log on book detail. Current `condition_id` always reflects latest state. |

### Dealer & Marketplace
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| D1 | Dealer directory & messaging | Medium | High | Two-tier system. **Dealer account (paid tier):** dealers register with business profile (name, type, location, phone, email, website, description, specialties). Visible in public dealer directory. **Regular users:** browse dealer directory, view dealer profiles, send a message to any dealer with their wishlist or any collection attached. Dealers receive messages in their account + email notification. DB: `dealer_profiles` table linked to user account, `dealer_messages` table (from_user, to_dealer, subject, message, attached_collection_id, attached_wishlist). No CRM, no transaction history, no ratings — keep it simple. |

### Under Consideration
- Sales platform integration (WooCommerce, Catawiki, AbeBooks)
- PDF catalog export
- Templates system
