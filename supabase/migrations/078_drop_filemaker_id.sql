-- 078: Drop filemaker_id column (legacy FileMaker import reference, unused in app)
-- user_catalog_id remains as the user-facing catalog reference
ALTER TABLE books DROP COLUMN IF EXISTS filemaker_id;
