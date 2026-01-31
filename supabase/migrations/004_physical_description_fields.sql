-- Migration: Add physical description fields for serious book collectors
-- Date: 2025-01-31
-- Priority 1 feature

-- Paper Type (16 values)
-- wove, laid, rag, wood_pulp, acid_free, vellum, parchment, japan, india, 
-- handmade, machine_made, coated, uncoated, calendered, rice, tapa
ALTER TABLE books ADD COLUMN IF NOT EXISTS paper_type VARCHAR(50);

-- Edge Treatment (18 values)
-- untrimmed, uncut, rough_cut, trimmed, gilt_all, gilt_top, gilt_fore, silver,
-- gauffered, painted, fore_edge_painting, sprinkled, stained, marbled, deckle,
-- red_edges, blue_edges, yellow_edges
ALTER TABLE books ADD COLUMN IF NOT EXISTS edge_treatment VARCHAR(50);

-- Endpapers Type (16 values)
-- plain_white, plain_colored, marbled, combed_marbled, paste_paper, printed,
-- illustrated, maps, photographic, decorative, self_ends, cloth, leather, silk, vellum, none
ALTER TABLE books ADD COLUMN IF NOT EXISTS endpapers_type VARCHAR(50);

-- Text Block Condition (11 values)
-- tight, solid, sound, tender, shaken, loose, detached, broken, recased, rebacked, rebound
ALTER TABLE books ADD COLUMN IF NOT EXISTS text_block_condition VARCHAR(50);

-- Dedication Text - transcription of inscription/dedication
ALTER TABLE books ADD COLUMN IF NOT EXISTS dedication_text TEXT;

-- Colophon Text - transcription of colophon
ALTER TABLE books ADD COLUMN IF NOT EXISTS colophon_text TEXT;

-- Note: valuation_date already exists in the schema
