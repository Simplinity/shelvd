# Catalog Norm Compliance — Migration Log

## Steps

- [x] **Step 1** — DB migration: add `catalog_entry_isbd` column to books ✅
- [x] **Step 2** — DB migration: fix conditions (Mint→As New, Fine Plus→Near Fine, add Fair) ✅
- [x] **Step 3** — Cover type dropdown: expand with ~38 missing types (edit form) ✅
- [x] **Step 4** — Cover type dropdown: same expansion in add form ✅
- [x] **Step 5** — Add `signature_details` text field to edit form ✅
- [x] **Step 6** — Add `signature_details` text field to add form ✅
- [x] **Step 7** — Update seed files to match migrations (done in step 2) ✅
- [x] **Step 8** — Update database.types.ts to reflect new column ✅

## Progress

- **Step 1** completed — `072_catalog_entry_isbd.sql` committed
- **Step 2** completed — `073_fix_condition_grades.sql` + seed updated
- **Step 3** completed — 49 cover types with optgroups in edit form
- **Step 4** completed — same in add form
- **Step 5** completed — signature_details textarea in edit form (conditional on is_signed)
- **Step 6** completed — same in add form
- **Step 7** completed — seed files were already updated as part of step 2
- **Step 8** completed — `catalog_entry_isbd` added to Row, Insert, Update in database.types.ts

## Phase C: Generator Refactoring

- [x] **S1–S10** — Translation file (590 lines), 13 languages, all label/abbreviation/role/cover/condition/provenance tables
- [x] **S11** — Full rewrite of catalog-entry-generator.tsx: two modes (Trade + ISBD), 13 languages, correct conventions
- [x] **S12** — Edit form: new onGenerate signature, catalog_entry_isbd textarea + save handler
- [x] **S13** — Add form: same updates (type, initial state, save, onGenerate, ISBD textarea)
- [x] **S14** — Detail page: shows both Trade and ISBD entries with sub-headers
