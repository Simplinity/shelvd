# Claude Session Log

> **RULE: Updated every session. Read this first on connection loss to know where to resume.**

## Current State (2026-02-14)

**App version: v0.24.0.** 71 DB migrations applied. 22 lookup providers. All core features complete.

**Next tasks:** Pre-release polish (P10, P13, P22 remaining), Bulk Image Import (6b), Mollie integration (14.7).

---

## Session: 2026-02-14

### Pre-Release Polish Blitz (13 items) ✅
- **P4** OpenGraph + Twitter Cards: dynamic OG images (default, blog, wiki), edge-compatible data splits, per-page metadata
- **P5** Global error page (error.tsx + global-error.tsx, Swiss Design)
- **P6** Global 404 page — "Ex Libris Nobody" (bibliophile humor)
- **P7** Global loading state — pulsing red bar
- **P8** Toast system: Sonner installed, all 11 alert() calls replaced
- **P9** Save confirmation toast on book edit + add
- **P11** Unsaved changes indicator in browser tab (● prefix)
- **P14** Duplicate warning on add — debounced title check, red accent
- **P19** Skip-to-content accessibility link
- **P20** Alt text on cover images (book title instead of empty)
- **P21** JSON-LD structured data — homepage, blog, about + shelvd.app → shelvd.org URL fix
- **P24** Dynamic browser tab titles — 20 pages, book detail shows title
- **P25** Scroll-to-top button on books list
- Cancelled: P12 (keyboard shortcuts), P15 (already solved), P16 (overkill)
- Deferred: P10 (sort-aware prev/next), P13 (search highlighting), P17 (post-launch), P18 (→ V2)
- Docs: all statuses updated in project.md, duplicates S10/S11 cleaned up, V2 section added

### Grid View Sort Dropdown ✅
- 8 sort fields: Title, Author, Publisher, Year, Place, Status, Catalog ID, Date added
- Fix: DB-side sorting (was client-only, missed books in other batches)
- `SORT_FIELD_TO_DB_COLUMN` mapping, re-fetch on sort change
- Commits: `c3c32e2`, `1ad5df7`

### Database Performance ✅
- Migration 070: 5 sort indexes on books (publisher, place, year, catalog_id, created_at)
- Migration 071: 3 composite indexes (book_images, book_contributors, book_collections)
- Lazy loading images on list/grid views
- Commit: `11b5390`, `31c1a73`, `196afb5`

### SEO & Web Standards ✅
- Favicon + apple-touch-icon + web manifest (Swiss Red BookOpen)
- robots.txt (allow marketing, disallow app/admin/auth)
- sitemap.xml (65 pages: 8 static + 22 blog + 35 wiki)
- Commits: `6ed7ebb`, `49b29d7`

### Documentation ✅
- Trimmed project.md from 1460 → 586 lines
- Added 25 pre-release polish items (P1–P25) to project.md
- Removed completed plan docs: mobile-plan.md, image-upload-plan.md, improvement-analysis.md
- Stripe → Mollie references updated across 6 files

### Previous Session: 2026-02-13
- Catalog number search (global + advanced)
- Scroll position restore on back button
- Mollie profile setup + logo
- v0.24.0 changelog updates

---

## Version History
- v0.24.0 — Image upload (3 phases), catalog search, scroll restore
- v0.23.0 — Mobile responsiveness (23 steps)
- v0.22.0 — User onboarding, auth fixes, performance optimizations
- v0.21.0 — Admin system stats, wiki/knowledge base
- v0.20.0 — Wiki (35 articles), blog (22 articles)
- v0.15.0–v0.19.0 — Valuation history, collection audit, 12 lookup providers
- v0.13.0–v0.14.0 — Tier system, activity logging, invite codes
- v0.10.0–v0.12.0 — Condition history, feedback/support, cover images, PDF inserts
