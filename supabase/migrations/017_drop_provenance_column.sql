-- Drop legacy free-text provenance column (replaced by provenance_entries table)
ALTER TABLE books DROP COLUMN IF EXISTS provenance;
