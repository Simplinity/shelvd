-- Add cover image URL column to books table (free tier image support)
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMENT ON COLUMN books.cover_image_url IS 'External URL to book cover image (free tier). Can be set manually or auto-filled during enrichment.';
