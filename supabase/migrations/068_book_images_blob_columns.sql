-- Migration 068: Prepare book_images for Vercel Blob uploads
--
-- The book_images table exists (migration 003) but was designed for Supabase Storage.
-- It has 0 rows. We add columns for Vercel Blob URLs, image type, and direct user_id.
-- storage_path becomes nullable since new images use blob_url instead.

-- New columns
ALTER TABLE book_images ADD COLUMN IF NOT EXISTS blob_url TEXT;
ALTER TABLE book_images ADD COLUMN IF NOT EXISTS thumb_blob_url TEXT;
ALTER TABLE book_images ADD COLUMN IF NOT EXISTS image_type TEXT DEFAULT 'cover'
  CHECK (image_type IN ('cover', 'spine', 'back', 'detail', 'page'));
ALTER TABLE book_images ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Make storage_path nullable (was NOT NULL for Supabase Storage, unused)
ALTER TABLE book_images ALTER COLUMN storage_path DROP NOT NULL;

-- Direct user_id policy (faster than subquery through books)
CREATE POLICY "Users can insert own images" ON book_images
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own images" ON book_images
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own images" ON book_images
  FOR DELETE USING (user_id = auth.uid());

-- Index for quota queries (SUM file_size_bytes per user)
CREATE INDEX IF NOT EXISTS idx_book_images_user_id ON book_images(user_id);
