-- 075: Deduplicate book_parts (138→46) and add "Other" matter group
-- Safety: book_images.book_part_id has 0 references, no FK conflicts

-- Step 1: Remove duplicates (keep smallest id per unique combo)
DELETE FROM book_parts a
USING book_parts b
WHERE a.id > b.id
  AND a.matter = b.matter
  AND a.purpose = b.purpose
  AND a.sort_order = b.sort_order;

-- Step 2: Add "Other" matter group
INSERT INTO book_parts (matter, purpose, sort_order) VALUES
  ('Other', 'Damage detail', 47),
  ('Other', 'Loose insert', 48),
  ('Other', 'Overview', 49),
  ('Other', 'Slipcase / Box', 50),
  ('Other', 'Provenance evidence', 51);
