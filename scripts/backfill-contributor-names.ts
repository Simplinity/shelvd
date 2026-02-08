/**
 * One-time backfill: fix 7 contributors with missing/wrong name fields.
 * 
 * ALREADY EXECUTED on 2026-02-08.
 * 
 * Fixed:
 * - "Joop Verstraten" → "Verstraten, Joop" (lookup artifact)
 * - "P. G. Wodehouse" → "Wodehouse, P. G." (lookup artifact)
 * - "Paul Bede Johnson" → "Johnson, Paul Bede" (lookup artifact)
 * - ", Éa" (×2) → "Éa" (FileMaker import artifact)
 * - ", J. M. Gantois" (×2) → "Gantois, J. M." (FileMaker import artifact)
 * 
 * All contributors now have proper canonical_name, sort_name, display_name,
 * family_name, and given_names fields.
 */
