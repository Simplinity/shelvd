-- Migration 044: Migrate existing flat valuation fields to valuation_history entries
-- Phase 1: copy data, keep old columns as read-only fallback

-- Migrate estimated_value → self_estimate entry
INSERT INTO valuation_history (book_id, position, valuation_date, value, currency, source, notes)
SELECT
  id,
  1,
  valuation_date,
  estimated_value,
  COALESCE(NULLIF(price_currency, ''), 'EUR'),
  'self_estimate',
  'Migrated from estimated_value field'
FROM books
WHERE estimated_value IS NOT NULL AND estimated_value > 0;

-- Migrate lowest_price → market_research entry (market low)
INSERT INTO valuation_history (book_id, position, valuation_date, value, currency, source, notes)
SELECT
  id,
  COALESCE((SELECT MAX(position) FROM valuation_history vh WHERE vh.book_id = books.id), 0) + 1,
  valuation_date,
  lowest_price,
  COALESCE(NULLIF(price_currency, ''), 'EUR'),
  'market_research',
  'Market low — migrated from lowest_price field'
FROM books
WHERE lowest_price IS NOT NULL AND lowest_price > 0;

-- Migrate highest_price → market_research entry (market high)
INSERT INTO valuation_history (book_id, position, valuation_date, value, currency, source, notes)
SELECT
  id,
  COALESCE((SELECT MAX(position) FROM valuation_history vh WHERE vh.book_id = books.id), 0) + 1,
  valuation_date,
  highest_price,
  COALESCE(NULLIF(price_currency, ''), 'EUR'),
  'market_research',
  'Market high — migrated from highest_price field'
FROM books
WHERE highest_price IS NOT NULL AND highest_price > 0;

-- Migrate provenance entries with price_paid → provenance_purchase entries
INSERT INTO valuation_history (book_id, position, valuation_date, value, currency, source, appraiser, provenance_entry_id, notes)
SELECT
  pe.book_id,
  COALESCE((SELECT MAX(position) FROM valuation_history vh WHERE vh.book_id = pe.book_id), 0) + 1,
  COALESCE(pe.date_from, pe.date_to),
  pe.price_paid,
  COALESCE(NULLIF(pe.price_currency, ''), 'EUR'),
  'provenance_purchase',
  pe.owner_name,
  pe.id,
  'Auto-created from provenance: ' || pe.transaction_type
FROM provenance_entries pe
WHERE pe.price_paid IS NOT NULL AND pe.price_paid > 0;
