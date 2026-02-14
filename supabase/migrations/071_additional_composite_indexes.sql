-- Migration 071: Additional composite indexes for join-heavy queries
-- These tables are queried on every book detail page or collection view

-- book_images: detail page fetches images sorted by sort_order
CREATE INDEX IF NOT EXISTS idx_book_images_book_sort ON book_images(book_id, sort_order);

-- book_contributors: every book list/detail joins through this table
CREATE INDEX IF NOT EXISTS idx_book_contributors_composite ON book_contributors(book_id, contributor_id);

-- book_collections: collection page fetches all books in a collection
CREATE INDEX IF NOT EXISTS idx_book_collections_composite ON book_collections(collection_id, book_id);
