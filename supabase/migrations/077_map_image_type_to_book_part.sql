-- 077: Map existing image_type values to book_part_id, relax image_type constraints
-- Only 6 images exist (all cover), 0 have book_part_id set

-- Step 1: Map existing image_type → book_part_id
UPDATE book_images SET book_part_id = (SELECT id FROM book_parts WHERE purpose = 'Front Cover' LIMIT 1)
  WHERE image_type = 'cover' AND book_part_id IS NULL;

UPDATE book_images SET book_part_id = (SELECT id FROM book_parts WHERE purpose = 'Spine' LIMIT 1)
  WHERE image_type = 'spine' AND book_part_id IS NULL;

UPDATE book_images SET book_part_id = (SELECT id FROM book_parts WHERE purpose = 'Back Cover' LIMIT 1)
  WHERE image_type = 'back' AND book_part_id IS NULL;

-- detail and page don't have a 1:1 mapping, leave book_part_id NULL
-- (users can label them later via the new dropdown)

-- Step 2: Drop CHECK constraint on image_type (no longer the primary type system)
ALTER TABLE book_images DROP CONSTRAINT IF EXISTS book_images_image_type_check;

-- Step 3: Allow NULL image_type (new uploads may only set book_part_id)
ALTER TABLE book_images ALTER COLUMN image_type DROP DEFAULT;
ALTER TABLE book_images ALTER COLUMN image_type SET DEFAULT NULL;
