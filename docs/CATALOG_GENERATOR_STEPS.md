# Catalog Generator Overhaul — Step Plan

> Each step = commit + push to Vercel. App must build after every step.

## Phase A: Translation infrastructure (new file)
- [x] **S1** — Create `catalog-translations.ts`: Language type (13), fixed labels (all 13 langs)
- [ ] **S2** — Add abbreviation tables (p./ff./vol./pl./ill. etc. × 13 langs)
- [ ] **S3** — Add contributor role phrases (20 roles × 13 langs)
- [ ] **S4** — Add cover type translations part 1 (softcover + hardcover + full leather/calf/vellum/morocco)
- [ ] **S5** — Add cover type translations part 2 (cloth/fabric + partial + limp bindings)
- [ ] **S6** — Add condition grade translations (9 grades × 13 langs)
- [ ] **S7** — Add provenance translations (evidence, association, transaction types)

## Phase B: Expand BookData + data flow
- [ ] **S8** — Add 15 missing fields to BookData type
- [ ] **S9** — Pass new fields from edit form → component
- [ ] **S10** — Pass new fields from add form → component

## Phase C: Refactor Trade mode
- [ ] **S11** — Import new translations, replace inline objects
- [ ] **S12** — Fix author formatting (CAPS surname)
- [ ] **S13** — Fix format position (before dims) + dimension display
- [ ] **S14** — Add new fields to Trade output (paper, edges, dedication, colophon, etc.)
- [ ] **S15** — Per-country format terms (in-8 for FR, S. for DE, etc.)

## Phase D: Build ISBD mode
- [ ] **S16** — generateISBDEntry: Areas 1–2 (title + SoR, edition)
- [ ] **S17** — ISBD Areas 4–5 (publication, physical)
- [ ] **S18** — ISBD Areas 6–7 (series, notes)
- [ ] **S19** — ISBD Area 8 (identifiers) + assemble full entry
- [ ] **S20** — Export + wire up ISBD function

## Phase E: UI overhaul
- [ ] **S21** — Expand language selector: 13 langs with flags
- [ ] **S22** — Add Trade/ISBD mode columns
- [ ] **S23** — Update onGenerate to accept mode + language
- [ ] **S24** — Wire Trade → catalog_entry, ISBD → catalog_entry_isbd
- [ ] **S25** — Add catalog_entry_isbd textarea to edit form
- [ ] **S26** — Same for add form

## Phase F: Cleanup
- [ ] **S27** — Remove old inline translations from generator
- [ ] **S28** — Final review, update migration log
