-- 054: User onboarding columns
-- Supports welcome wizard, getting started checklist, and returning user nudge.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_type TEXT;
  -- collector / dealer / librarian / explorer

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS collection_size_estimate TEXT;
  -- under_50 / 50_500 / 500_5000 / 5000_plus

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_system TEXT;
  -- spreadsheet / notebook / memory / other_app / nothing

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
  -- max 3 selected interests from wizard screen 4

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
  -- true when all checklist steps done or user dismisses

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_checklist JSONB DEFAULT '{}';
  -- tracks completed checklist items, e.g. {"first_book": true, "used_enrich": true}

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_dismissed_at TIMESTAMPTZ;
  -- when user dismissed the checklist / nudge
