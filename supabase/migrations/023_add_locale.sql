-- Add locale column to user_profiles
-- Replaces the date_format column with a proper locale that drives date, number, and currency formatting
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-GB';

-- Migrate existing date_format preferences to closest locale
UPDATE user_profiles SET locale = CASE
  WHEN date_format = 'MM/DD/YYYY' THEN 'en-US'
  WHEN date_format = 'DD.MM.YYYY' THEN 'de-DE'
  WHEN date_format = 'YYYY-MM-DD' THEN 'sv-SE'
  ELSE 'en-GB'  -- DD/MM/YYYY and default
END
WHERE locale IS NULL OR locale = 'en-GB';
