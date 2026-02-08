-- Migration 022: Drop legacy acquisition columns
-- All data migrated to provenance_entries (migration 020), all code references removed.

ALTER TABLE books DROP COLUMN IF EXISTS acquired_from;
ALTER TABLE books DROP COLUMN IF EXISTS acquired_date;
ALTER TABLE books DROP COLUMN IF EXISTS acquired_price;
ALTER TABLE books DROP COLUMN IF EXISTS acquired_currency;
ALTER TABLE books DROP COLUMN IF EXISTS acquired_notes;
