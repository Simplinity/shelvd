# Claude Session Log

> **RULE: Updated every session. Read this first on connection loss to know where to resume.**

## Current State (2026-02-14)

**App version: v0.25.0.** 74 DB migrations applied. 23 lookup providers. All core features complete.

**Next tasks:** Bulk Image Import (6b), Mollie integration (14.7), remaining polish (P10, P13, P22).

---

## Session: 2026-02-14 (afternoon) — v0.25.0 "The Cataloger's Standard"

### Catalog Normalization (complete)
Full rewrite of the catalog entry system from 4-language single-mode to 13-language dual-mode.

**Spec:** `/docs/CATALOG_ENTRY_SPEC.md` — 1097-line reference document covering ISBD formal mode, Trade per-country conventions, all 13 languages, database field mapping, translation tables.

**DB migrations:**
- 072: `catalog_entry_isbd` column on books
- 073: condition grades corrected (Mint→As New, Fine Plus→Near Fine, Fair added)
- 074: Google Books added to isbn_providers (display_order 15), LoC reordered to 18

**Code changes:**
- `lib/catalog-translations.ts` — 590-line translation file (labels, roles, covers, conditions, evidence, associations, enclosures × 13 languages)
- `components/catalog-entry-generator.tsx` — complete rewrite: `generateTradeEntry()` + `generateISBDEntry()`, 13×2 modal with flags + trade associations
- Edit form: new onGenerate signature, ISBD textarea, save handler updated
- Add form: same updates (type, initial state, save, onGenerate, ISBD textarea)
- Detail page: shows both Trade/ISBD entries with sub-headers
- PDF types: `catalog_entry_isbd` in BookPdfData
- PDF route: passes ISBD field from DB to generator
- PDF catalog-sheet: "Trade Catalog Entry" + "ISBD Catalog Entry" sections
- Cover type dropdown: 11→49 options with 8 optgroups (both forms)
- Signature details textarea: conditional on is_signed (both forms)

### Field Help Texts Rewrite
`lib/field-help-texts.ts` — all 68 tooltips rewritten from antiquarian book trade perspective. Examples from the trade, standard terminology, ABAA/ILAB conventions.

### Loading Indicator
Replaced pulsing bar with BookOpen icon (opacity 0.2→1 + scale 0.9×→1.1×, 1.2s).

### Commits
- 3a1cc9e: S11-S14 generator + forms
- 564b324: Loading icon
- 23505f5: Provider reordering
- 163dcf3: Field help texts
- d8eae12: ISBD in PDF inserts
- (pending): v0.25.0 version bump + docs

### Session: 2026-02-14 (morning) — v0.24.0 final
- Pre-release polish blitz (P4–P25): OG images, error pages, toasts, accessibility, JSON-LD
- Grid view sort dropdown (8 fields, DB-side sorting)
- Database performance (5 sort + 3 composite indexes, lazy loading)
- SEO foundation (favicon, robots.txt, sitemap 65 pages)

---

## Version History
- v0.25.0 — Catalog normalization: 2 modes (Trade+ISBD), 13 languages, 49 cover types, ABAA conditions, 68 field tooltips, PDF inserts updated
- v0.24.0 — Image upload (3 phases), catalog search, scroll restore, pre-release polish, SEO
- v0.23.0 — Mobile responsiveness (23 steps)
- v0.22.0 — User onboarding, auth fixes, performance optimizations
- v0.21.0 — Admin system stats, wiki/knowledge base
- v0.20.0 — Wiki (35 articles), blog (22 articles)
- v0.15.0–v0.19.0 — Valuation history, collection audit, 12 lookup providers
- v0.13.0–v0.14.0 — Tier system, activity logging, invite codes
- v0.10.0–v0.12.0 — Condition history, feedback/support, cover images, PDF inserts
