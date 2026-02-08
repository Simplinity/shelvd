-- Migration 020: Migrate acquisition data into provenance "self" entries
-- For every book with acquisition data, create a provenance entry with owner_type='self'
-- Only creates entries for books that don't already have a 'self' provenance entry

INSERT INTO provenance_entries (
  book_id, position, owner_name, owner_type,
  date_from, transaction_type, transaction_detail,
  price_paid, price_currency, notes
)
SELECT
  b.id,
  COALESCE((SELECT MAX(pe.position) FROM provenance_entries pe WHERE pe.book_id = b.id), 0) + 1,
  'Current owner',
  'self',
  b.acquired_date,
  'purchase',
  b.acquired_from,
  b.acquired_price,
  b.acquired_currency,
  b.acquired_notes
FROM books b
WHERE (b.acquired_from IS NOT NULL
    OR b.acquired_date IS NOT NULL
    OR b.acquired_price IS NOT NULL
    OR b.acquired_notes IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM provenance_entries pe
    WHERE pe.book_id = b.id AND pe.owner_type = 'self'
  );
