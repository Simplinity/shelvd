-- Drop the old date_format column (superseded by locale)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS date_format;
