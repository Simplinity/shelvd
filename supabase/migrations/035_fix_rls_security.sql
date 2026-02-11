-- Fix RLS on tables flagged by Supabase security advisor
-- These tables had ENABLE ROW LEVEL SECURITY in their original migrations
-- but RLS is not active in production. Re-enabling + ensuring policies exist.

-- 1. languages (migration 001)
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
-- Policy already exists from 001, but ensure it's there
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'languages' AND policyname = 'Public read for languages') THEN
    CREATE POLICY "Public read for languages" ON languages FOR SELECT USING (true);
  END IF;
END $$;

-- 2. publishers (migration 002)
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'publishers' AND policyname = 'Public read for publishers') THEN
    CREATE POLICY "Public read for publishers" ON publishers FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'publishers' AND policyname = 'Authenticated users can insert publishers') THEN
    CREATE POLICY "Authenticated users can insert publishers" ON publishers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 3. contributor_aliases (migration 002)
ALTER TABLE contributor_aliases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contributor_aliases' AND policyname = 'Public read for contributor_aliases') THEN
    CREATE POLICY "Public read for contributor_aliases" ON contributor_aliases FOR SELECT USING (true);
  END IF;
END $$;
