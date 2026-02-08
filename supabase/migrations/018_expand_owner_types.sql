-- Expand owner_type CHECK constraint to include new types
ALTER TABLE provenance_entries DROP CONSTRAINT IF EXISTS provenance_entries_owner_type_check;
ALTER TABLE provenance_entries ADD CONSTRAINT provenance_entries_owner_type_check
  CHECK (owner_type IN ('person', 'institution', 'library', 'monastery', 'dealer', 'auction_house', 'publisher', 'estate', 'unknown', 'self'));
