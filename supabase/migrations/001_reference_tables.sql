-- Migration: 001_reference_tables
-- Description: System reference tables (shared, read-only for users)
-- These tables contain standardized data that is the same for all users

-- ============================================
-- LANGUAGES (ISO 639)
-- ============================================
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name_en VARCHAR(100) NOT NULL,
  name_native VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_languages_code ON languages(code);

-- ============================================
-- CONDITIONS (Book condition grading)
-- ============================================
CREATE TABLE conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abbreviation VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BINDINGS (Book binding types)
-- ============================================
CREATE TABLE bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  alias VARCHAR(100),
  group_name VARCHAR(100),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bindings_name ON bindings(name);

-- ============================================
-- BOOK FORMATS (Folio, Quarto, Octavo, etc.)
-- ============================================
CREATE TABLE book_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100),
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(20),
  leaves INT,
  pages INT,
  width_inches DECIMAL(5,2),
  height_inches DECIMAL(5,2),
  width_cm DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  joint_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_book_formats_name ON book_formats(name);
CREATE INDEX idx_book_formats_abbreviation ON book_formats(abbreviation);

-- ============================================
-- BOOK PARTS (Title page, Colophon, etc.)
-- ============================================
CREATE TABLE book_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter VARCHAR(20) NOT NULL,  -- 'Front', 'Body', 'Back'
  purpose VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTRIBUTOR ROLES (MARC relator codes)
-- ============================================
CREATE TABLE contributor_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(10),  -- MARC relator code: 'aut', 'ill', 'trl'
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BISAC CODES (Book Industry Standards)
-- ============================================
CREATE TABLE bisac_codes (
  code VARCHAR(20) PRIMARY KEY,
  subject TEXT NOT NULL,
  parent_code VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bisac_subject ON bisac_codes(subject);

-- ============================================
-- DEWEY CLASSIFICATIONS
-- ============================================
CREATE TABLE dewey_classifications (
  ddc VARCHAR(20) PRIMARY KEY,
  first_summary TEXT NOT NULL,
  second_summary TEXT,
  third_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS: Everyone can read reference tables
-- ============================================
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributor_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bisac_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dewey_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for languages" ON languages FOR SELECT USING (true);
CREATE POLICY "Public read for conditions" ON conditions FOR SELECT USING (true);
CREATE POLICY "Public read for bindings" ON bindings FOR SELECT USING (true);
CREATE POLICY "Public read for book_formats" ON book_formats FOR SELECT USING (true);
CREATE POLICY "Public read for book_parts" ON book_parts FOR SELECT USING (true);
CREATE POLICY "Public read for contributor_roles" ON contributor_roles FOR SELECT USING (true);
CREATE POLICY "Public read for bisac_codes" ON bisac_codes FOR SELECT USING (true);
CREATE POLICY "Public read for dewey_classifications" ON dewey_classifications FOR SELECT USING (true);
