-- Migration 070: Add indexes for all sort fields on books table
-- Existing: idx_books_user, idx_books_user_status, idx_books_user_title
-- Adding: publisher, place, year, catalog_id, created_at
-- All prefixed with user_id because RLS filters on it

CREATE INDEX IF NOT EXISTS idx_books_user_publisher ON books(user_id, publisher_name);
CREATE INDEX IF NOT EXISTS idx_books_user_place ON books(user_id, publication_place);
CREATE INDEX IF NOT EXISTS idx_books_user_year ON books(user_id, publication_year);
CREATE INDEX IF NOT EXISTS idx_books_user_catalog ON books(user_id, user_catalog_id);
CREATE INDEX IF NOT EXISTS idx_books_user_created ON books(user_id, created_at);
