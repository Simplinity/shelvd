-- Migration: 003_user_data
-- Description: User profiles, locations, and books
-- All user data is isolated via RLS policies

-- ============================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  display_name VARCHAR(100),
  avatar_url TEXT,
  
  -- Preferences
  default_currency VARCHAR(3) DEFAULT 'EUR',
  default_size_unit VARCHAR(10) DEFAULT 'cm',  -- 'cm' or 'inches'
  default_weight_unit VARCHAR(10) DEFAULT 'g', -- 'g', 'kg', 'oz', 'lbs'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER LOCATIONS (Storage locations)
-- ============================================
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,  -- "Kippenhok", "Kantoor"
  description TEXT,
  address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_locations_user ON user_locations(user_id);

-- ============================================
-- BOOK STATUS ENUM
-- ============================================
CREATE TYPE book_status AS ENUM (
  'in_collection',
  'wishlist',
  'on_sale',
  'sold',
  'lent',
  'ordered',
  'lost'
);

-- ============================================
-- BOOKS (Main table - user-owned)
-- ============================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- === MAIN INFO ===
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  original_title VARCHAR(500),
  language_id UUID REFERENCES languages(id),
  original_language_id UUID REFERENCES languages(id),
  series VARCHAR(255),
  series_number VARCHAR(50),
  status book_status NOT NULL DEFAULT 'in_collection',
  
  -- === IMPRINT ===
  publisher_id UUID REFERENCES publishers(id),
  publication_place VARCHAR(100),
  publication_year VARCHAR(20),  -- Text to allow "ca. 1920", "1920?"
  printer_id UUID REFERENCES publishers(id),
  printing_place VARCHAR(100),
  
  -- === EDITION ===
  edition VARCHAR(100),
  impression VARCHAR(100),
  issue_state TEXT,
  edition_notes TEXT,
  
  -- === PHYSICAL DESCRIPTION ===
  page_count INT,
  pagination_description VARCHAR(255),  -- "vi,[4],660,[1]"
  volumes VARCHAR(50),
  height_mm INT,  -- Always store in mm, convert in UI
  width_mm INT,
  depth_mm INT,
  weight_grams INT,
  format_id UUID REFERENCES book_formats(id),
  cover_type VARCHAR(50),
  binding_id UUID REFERENCES bindings(id),
  has_dust_jacket BOOLEAN DEFAULT FALSE,
  is_signed BOOLEAN DEFAULT FALSE,
  condition_id UUID REFERENCES conditions(id),
  condition_notes TEXT,
  dust_jacket_condition_id UUID REFERENCES conditions(id),
  
  -- === IDENTIFIERS ===
  isbn_13 VARCHAR(17),
  isbn_10 VARCHAR(13),
  oclc_number VARCHAR(50),
  lccn VARCHAR(50),
  user_catalog_id VARCHAR(50),  -- User's own numbering
  
  -- === CLASSIFICATION ===
  ddc VARCHAR(50),
  udc VARCHAR(100),
  lcc VARCHAR(50),
  bisac_code VARCHAR(20) REFERENCES bisac_codes(code),
  topic VARCHAR(255),
  
  -- === LOCATION ===
  location_id UUID REFERENCES user_locations(id),
  shelf VARCHAR(100),
  shelf_section VARCHAR(50),
  
  -- === ACQUISITION ===
  acquired_from VARCHAR(255),
  acquired_date DATE,
  acquired_price DECIMAL(10,2),
  acquired_currency VARCHAR(3),
  acquired_notes TEXT,
  
  -- === VALUATION ===
  lowest_price DECIMAL(10,2),
  highest_price DECIMAL(10,2),
  estimated_value DECIMAL(10,2),
  sales_price DECIMAL(10,2),
  price_currency VARCHAR(3),
  valuation_date DATE,
  
  -- === CONTENT ===
  illustrations_description TEXT,
  signatures_description TEXT,
  provenance TEXT,
  bibliography TEXT,
  summary TEXT,
  catalog_entry TEXT,
  internal_notes TEXT,
  
  -- === META ===
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_books_user ON books(user_id);
CREATE INDEX idx_books_user_status ON books(user_id, status);
CREATE INDEX idx_books_user_title ON books(user_id, title);
CREATE INDEX idx_books_isbn13 ON books(isbn_13) WHERE isbn_13 IS NOT NULL;
CREATE INDEX idx_books_isbn10 ON books(isbn_10) WHERE isbn_10 IS NOT NULL;

-- Full text search
CREATE INDEX idx_books_title_fts ON books USING GIN (to_tsvector('simple', title));

-- ============================================
-- BOOK CONTRIBUTORS (Junction table)
-- ============================================
CREATE TABLE book_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES contributors(id),
  role_id UUID NOT NULL REFERENCES contributor_roles(id),
  
  credited_as VARCHAR(255),  -- Name as printed in book
  sort_order INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(book_id, contributor_id, role_id)
);

CREATE INDEX idx_book_contributors_book ON book_contributors(book_id);
CREATE INDEX idx_book_contributors_contributor ON book_contributors(contributor_id);

-- ============================================
-- BOOK IMAGES
-- ============================================
CREATE TABLE book_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  original_filename VARCHAR(255),
  mime_type VARCHAR(50),
  width INT,
  height INT,
  file_size_bytes INT,
  
  book_part_id UUID REFERENCES book_parts(id),
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_book_images_book ON book_images(book_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_images ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only see/edit their own
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User locations: users can only see/edit their own
CREATE POLICY "Users can manage own locations" ON user_locations 
  FOR ALL USING (auth.uid() = user_id);

-- Books: users can only see/edit their own
CREATE POLICY "Users can manage own books" ON books 
  FOR ALL USING (auth.uid() = user_id);

-- Book contributors: based on book ownership
CREATE POLICY "Users can manage own book contributors" ON book_contributors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_contributors.book_id AND books.user_id = auth.uid()
    )
  );

-- Book images: based on book ownership
CREATE POLICY "Users can manage own book images" ON book_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_images.book_id AND books.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
