-- 064: Debug — check if collections table exists, if not recreate it

-- Check if collections exists and create if not
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure the default collection trigger exists
CREATE OR REPLACE FUNCTION create_default_collection()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO collections (user_id, name, is_default, sort_order)
  VALUES (NEW.id, 'Library', true, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (DROP IF EXISTS + CREATE)
DROP TRIGGER IF EXISTS on_auth_user_created_collection ON auth.users;
CREATE TRIGGER on_auth_user_created_collection
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_collection();

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policies exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'collections'::regclass AND polname = 'Users manage own collections') THEN
    CREATE POLICY "Users manage own collections" ON collections FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;
