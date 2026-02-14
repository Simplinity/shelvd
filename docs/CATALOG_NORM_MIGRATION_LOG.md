# Catalog Norm Compliance — Migration Log

> **Status: COMPLETE** — All phases done, committed, pushed. v0.25.0.

## Phase A: Database & Reference Data (migrations 072–074)
- [x] 072: `catalog_entry_isbd` column on books
- [x] 073: Condition grades corrected to ABAA standard (Mint→As New, Fine Plus→Near Fine, Fair added)
- [x] 074: Google Books added to isbn_providers, LoC reordered

## Phase B: Forms & UI (S1–S10)
- [x] Translation file: `catalog-translations.ts` (590 lines, 13 languages)
- [x] Cover type dropdown: 11→49 types with optgroups (both forms)
- [x] Signature details textarea, conditional on is_signed (both forms)
- [x] All 19 DB fields wired into forms
- [x] `database.types.ts` regenerated

## Phase C: Generator & Display (S11–S14)
- [x] `catalog-entry-generator.tsx` complete rewrite: Trade + ISBD modes, 13 languages
- [x] Edit form: new onGenerate signature, ISBD textarea, save handler
- [x] Add form: same updates
- [x] Detail page: Trade/ISBD sub-headers
- [x] PDF types + route + sheet renderer: both entries

## Phase D: Documentation
- [x] `CATALOG_ENTRY_SPEC.md` — 1097-line reference (spec, conventions, translations)
- [x] `field-help-texts.ts` — 68 tooltips rewritten from antiquarian perspective
- [x] Changelog, roadmap, project.md updated

## Reference
Full specification: `/docs/CATALOG_ENTRY_SPEC.md`
