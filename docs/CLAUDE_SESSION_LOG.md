# Claude Session Log

> **RULE: Updated every subtask. Read this first on reconnect.**

## Current State
- **Version:** v0.25.0
- **Migrations:** 076 applied
- **Rollback tag:** `v0.25.0-pre-image-labels`
- **Current task:** Image labeling via book_parts

---

## Image Labeling — Subtask Tracker

### Push 1: Dedup + Other groep (migration 075) ✅
- [x] 1.1 Write migration 075 SQL file
- [x] 1.2 Apply: DELETE 92 duplicates, INSERT 5 Other items
- [x] 1.3 Verified: 51 rows, 51 unique, 5 Other
- [x] 1.4 Registered migration 075
- [x] 1.5 Commit + push

### Push 2: Description tooltips (migration 076) ✅
- [x] 2.1-2.6 Wrote all 51 descriptions (antiquarian perspective)
- [x] 2.7 Applied: 51× UPDATE 1, verified 0 empty
- [x] 2.8 Commit + push

### Push 3: Backend — book_part_id replaces image_type ✅
- [x] 3.1 Read upload API, delete handler, edit form, detail page, gallery component
- [x] 3.2 Upload API: accepts book_part_id, validates against book_parts, derives image_type for backwards compat
- [x] 3.3 Cover auto-sync: still uses derived image_type='cover' (safe, no breaking change)
- [x] 3.4 Image queries: edit form + detail page join book_parts(purpose, matter, description)
- [x] 3.4b Gallery grid + edit form thumbnails: show purpose label with image_type fallback
- [x] 3.5 TypeScript clean
- [x] 3.6 Commit + push → Vercel

### Push 4: Frontend — dropdown + labels
- [ ] 4.1 Read image-upload-zone.tsx, edit form, detail page
- [ ] 4.2 Fetch book_parts data
- [ ] 4.3 Upload zone: grouped select per matter
- [ ] 4.4 Image grid: purpose label + description tooltip
- [ ] 4.5 Detail page: purpose label
- [ ] 4.6 Fallback for unlabeled images
- [ ] 4.7 TypeScript check
- [ ] 4.8 Commit + push → Vercel

### Push 5: Data migration + cleanup
- [ ] 5.1 Migration 077: map image_type → book_part_id
- [ ] 5.2 Migration 077: make image_type nullable
- [ ] 5.3 Apply + verify
- [ ] 5.4 Regen database.types.ts
- [ ] 5.5 TypeScript check
- [ ] 5.6 Commit + push → Vercel

---

## Previous sessions
- v0.25.0 — Catalog normalization, dual-mode generator, 13 languages, UX splits
- v0.24.0 — Image upload, catalog search, pre-release polish
