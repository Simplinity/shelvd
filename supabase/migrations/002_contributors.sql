-- Migration: 002_contributors
-- Description: Contributor authority records (globally shared)
-- Contributors are like Wikipedia - everyone reads, authenticated users can add

-- ============================================
-- CONTRIBUTORS (Authority Records)
-- ============================================
CREATE TABLE contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type
  type VARCHAR(20) NOT NULL DEFAULT 'person',  -- 'person', 'organization', 'conference'
  
  -- Names
  canonical_name VARCHAR(255) NOT NULL,  -- "Goethe, Johann Wolfgang von"
  sort_name VARCHAR(255) NOT NULL,       -- "Goethe Johann Wolfgang von"
  display_name VARCHAR(255),             -- "Johann Wolfgang von Goethe"
  
  -- Person fields
  given_names VARCHAR(100),
  family_name VARCHAR(100),
  name_prefix VARCHAR(50),    -- "von", "de", "van der"
  name_suffix VARCHAR(50),    -- "Jr.", "III"
  birth_year INT,
  death_year INT,
  birth_place VARCHAR(100),
  death_place VARCHAR(100),
  nationality VARCHAR(100),
  biography TEXT,
  
  -- Organization fields
  organization_type VARCHAR(100),
  founded_year INT,
  dissolved_year INT,
  
  -- External Authority IDs (for linking to global databases)
  viaf_id VARCHAR(50),        -- Virtual International Authority File
  wikidata_id VARCHAR(20),    -- Q-number
  isni VARCHAR(20),           -- International Standard Name Identifier
  lc_naf_id VARCHAR(50),      -- Library of Congress Name Authority
  gnd_id VARCHAR(50),         -- German National Library
  
  -- Meta
  is_verified BOOLEAN DEFAULT FALSE,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributors_canonical_name ON contributors(canonical_name);
CREATE INDEX idx_contributors_sort_name ON contributors(sort_name);
CREATE INDEX idx_contributors_family_name ON contributors(family_name);
CREATE INDEX idx_contributors_viaf ON contributors(viaf_id) WHERE viaf_id IS NOT NULL;
CREATE INDEX idx_contributors_wikidata ON contributors(wikidata_id) WHERE wikidata_id IS NOT NULL;

-- ============================================
-- CONTRIBUTOR ALIASES (Name variants)
-- ============================================
CREATE TABLE contributor_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,  -- "J.W. Goethe"
  alias_type VARCHAR(50) NOT NULL,  -- 'abbreviation', 'translation', 'pseudonym', 'spelling_variant', 'maiden_name', 'religious_name', 'transliteration'
  language_id UUID REFERENCES languages(id),
  notes TEXT,
  source VARCHAR(255),  -- Where did this alias come from
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributor_aliases_name ON contributor_aliases(name);
CREATE INDEX idx_contributor_aliases_contributor ON contributor_aliases(contributor_id);

-- ============================================
-- PUBLISHERS (Globally shared)
-- ============================================
CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100),
  founded_year INT,
  ceased_year INT,
  
  -- External IDs
  viaf_id VARCHAR(50),
  wikidata_id VARCHAR(20),
  
  -- Meta
  is_verified BOOLEAN DEFAULT FALSE,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_publishers_name ON publishers(name);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributor_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Public read for contributors" ON contributors FOR SELECT USING (true);
CREATE POLICY "Public read for contributor_aliases" ON contributor_aliases FOR SELECT USING (true);
CREATE POLICY "Public read for publishers" ON publishers FOR SELECT USING (true);

-- Authenticated users can create
CREATE POLICY "Authenticated users can create contributors" ON contributors 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create aliases" ON contributor_aliases 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create publishers" ON publishers 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only creator or admin can update (for now, simple rule)
CREATE POLICY "Creator can update contributors" ON contributors 
  FOR UPDATE USING (auth.uid() = created_by_user_id);
CREATE POLICY "Creator can update publishers" ON publishers 
  FOR UPDATE USING (auth.uid() = created_by_user_id);

-- ============================================
-- TRIGGER: Update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contributors_updated_at
  BEFORE UPDATE ON contributors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publishers_updated_at
  BEFORE UPDATE ON publishers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
