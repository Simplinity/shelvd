-- Migration 069: Add cover_thumb_url to books
-- Used in list/grid views for smaller thumbnails (8-25KB vs 150-400KB full)
-- Auto-set by upload/delete API routes alongside cover_image_url

ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_thumb_url TEXT;
