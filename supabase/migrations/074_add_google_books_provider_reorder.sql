-- Add Google Books to isbn_providers and reorder top 3:
-- 1. Open Library (10)
-- 2. Google Books (15) — NEW
-- 3. Library of Congress (18) — was 30

INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order)
VALUES ('google_books', 'Google Books', NULL, 'api', 'https://www.googleapis.com/books/v1', 15)
ON CONFLICT (code) DO NOTHING;

-- Move Library of Congress to position 3 (after Google Books, before WorldCat at 20)
UPDATE isbn_providers SET display_order = 18 WHERE code = 'loc';
