-- Migration 013: Convert wishlist status to in_collection
-- Wishlist is now a collection, not a status. Any books with status='wishlist'
-- should be moved to 'in_collection' and added to the Wishlist collection.

-- Step 1: Add books with status='wishlist' to their user's Wishlist collection (if not already there)
INSERT INTO book_collections (book_id, collection_id)
SELECT b.id, c.id
FROM books b
JOIN collections c ON c.user_id = b.user_id AND c.name = 'Wishlist' AND c.is_default = true
WHERE b.status = 'wishlist'
ON CONFLICT (book_id, collection_id) DO NOTHING;

-- Step 2: Update status to 'in_collection'
UPDATE books SET status = 'in_collection' WHERE status = 'wishlist';
