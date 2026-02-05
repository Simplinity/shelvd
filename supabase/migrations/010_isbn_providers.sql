-- ISBN Lookup Providers
-- Stores available providers for ISBN lookups with user activation

CREATE TABLE isbn_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(10), -- ISO country code (NL, BE, ES, IT, etc.) or NULL for international
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('api', 'sru', 'html')),
  base_url TEXT,
  is_enabled BOOLEAN DEFAULT true, -- Global enable/disable by admin
  display_order INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's active providers (which ones they want to use)
CREATE TABLE user_isbn_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES isbn_providers(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100, -- Lower = higher priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- RLS
ALTER TABLE isbn_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_isbn_providers ENABLE ROW LEVEL SECURITY;

-- Everyone can read providers
CREATE POLICY "Anyone can read isbn_providers"
  ON isbn_providers FOR SELECT
  USING (true);

-- Users can manage their own provider settings
CREATE POLICY "Users can read own isbn provider settings"
  ON user_isbn_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own isbn provider settings"
  ON user_isbn_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own isbn provider settings"
  ON user_isbn_providers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own isbn provider settings"
  ON user_isbn_providers FOR DELETE
  USING (auth.uid() = user_id);

-- Seed default providers
INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order) VALUES
  -- APIs (most reliable)
  ('open_library', 'Open Library', NULL, 'api', 'https://openlibrary.org', 10),
  ('worldcat', 'WorldCat', NULL, 'api', 'https://classify.oclc.org', 20),
  
  -- SRU (library catalogs)
  ('loc', 'Library of Congress', 'US', 'sru', 'https://lx2.loc.gov', 30),
  ('dnb', 'Deutsche Nationalbibliothek', 'DE', 'sru', 'https://services.dnb.de', 40),
  ('bnf', 'Bibliothèque nationale de France', 'FR', 'sru', 'https://catalogue.bnf.fr', 50),
  ('bl', 'British Library', 'GB', 'sru', 'https://explore.bl.uk', 60),
  ('kb', 'Koninklijke Bibliotheek', 'NL', 'sru', 'https://jsru.kb.nl', 70),
  ('kbr', 'KBR (Belgium)', 'BE', 'sru', 'https://opac.kbr.be', 80),
  
  -- HTML parsers (commercial sites)
  ('bol_nl', 'Bol.com', 'NL', 'html', 'https://www.bol.com', 100),
  ('bol_be', 'Bol.com (BE)', 'BE', 'html', 'https://www.bol.com/be', 101),
  ('amazon_de', 'Amazon.de', 'DE', 'html', 'https://www.amazon.de', 110),
  ('amazon_fr', 'Amazon.fr', 'FR', 'html', 'https://www.amazon.fr', 111),
  ('amazon_nl', 'Amazon.nl', 'NL', 'html', 'https://www.amazon.nl', 112),
  ('amazon_uk', 'Amazon.co.uk', 'GB', 'html', 'https://www.amazon.co.uk', 113),
  ('casa_del_libro', 'Casa del Libro', 'ES', 'html', 'https://www.casadellibro.com', 120),
  ('mondadori', 'Mondadori Store', 'IT', 'html', 'https://www.mondadoristore.it', 130),
  ('ibs', 'IBS.it', 'IT', 'html', 'https://www.ibs.it', 131),
  ('fnac', 'Fnac', 'FR', 'html', 'https://www.fnac.com', 140),
  ('standaard', 'Standaard Boekhandel', 'BE', 'html', 'https://www.standaardboekhandel.be', 150),
  ('abebooks', 'AbeBooks', NULL, 'html', 'https://www.abebooks.com', 200);

-- Function to get user's active providers (with defaults if not set)
CREATE OR REPLACE FUNCTION get_user_isbn_providers()
RETURNS TABLE (
  provider_id UUID,
  code VARCHAR(50),
  name VARCHAR(100),
  country VARCHAR(10),
  provider_type VARCHAR(20),
  base_url TEXT,
  is_active BOOLEAN,
  priority INTEGER
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    p.id as provider_id,
    p.code,
    p.name,
    p.country,
    p.provider_type,
    p.base_url,
    COALESCE(up.is_active, true) as is_active,
    COALESCE(up.priority, p.display_order) as priority
  FROM isbn_providers p
  LEFT JOIN user_isbn_providers up ON up.provider_id = p.id AND up.user_id = auth.uid()
  WHERE p.is_enabled = true
  ORDER BY COALESCE(up.priority, p.display_order);
$$;
