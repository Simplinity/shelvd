-- Add catalog_entry_isbd column for ISBD formal catalog entries
-- Alongside existing catalog_entry (trade mode), this stores the ISBD-formatted version

ALTER TABLE books ADD COLUMN IF NOT EXISTS catalog_entry_isbd text;

COMMENT ON COLUMN books.catalog_entry_isbd IS 'ISBD formal catalog entry (IFLA standard). Separate from catalog_entry which holds trade catalog format.';
