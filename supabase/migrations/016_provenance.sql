-- Migration 016: Provenance Tracking
-- Chain-of-custody records for books: ownership history, transaction details, evidence, associations.
-- Based on ABAA/ILAB/Beinecke cataloging standards.

-- Provenance entries: one row per ownership event in the chain
CREATE TABLE IF NOT EXISTS provenance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 1,
  owner_name TEXT NOT NULL,
  owner_type TEXT NOT NULL DEFAULT 'person'
    CHECK (owner_type IN ('person', 'institution', 'dealer', 'auction_house', 'self')),
  date_from TEXT,
  date_to TEXT,
  evidence_type TEXT[] DEFAULT '{}',
  evidence_description TEXT,
  transaction_type TEXT DEFAULT 'unknown'
    CHECK (transaction_type IN ('presentation', 'purchase', 'gift', 'inheritance', 'auction', 'dealer', 'unknown')),
  transaction_detail TEXT,
  price_paid NUMERIC(12,2),
  price_currency VARCHAR(3),
  association_type TEXT DEFAULT 'none'
    CHECK (association_type IN ('none', 'association_copy', 'presentation_copy', 'inscribed', 'annotated', 'from_notable_collection')),
  association_note TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provenance sources: supporting documentation for claims
CREATE TABLE IF NOT EXISTS provenance_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provenance_entry_id UUID NOT NULL REFERENCES provenance_entries(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'url'
    CHECK (source_type IN ('auction_catalog', 'dealer_catalog', 'receipt', 'certificate', 'publication', 'url', 'correspondence')),
  title TEXT,
  url TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_provenance_entries_book_id ON provenance_entries(book_id);
CREATE INDEX IF NOT EXISTS idx_provenance_entries_position ON provenance_entries(book_id, position);
CREATE INDEX IF NOT EXISTS idx_provenance_entries_owner_name ON provenance_entries(owner_name);
CREATE INDEX IF NOT EXISTS idx_provenance_sources_entry_id ON provenance_sources(provenance_entry_id);

-- Updated_at trigger (reuse pattern from books)
CREATE OR REPLACE FUNCTION update_provenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provenance_entries_updated_at
  BEFORE UPDATE ON provenance_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_provenance_updated_at();

-- RLS
ALTER TABLE provenance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE provenance_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage provenance for own books"
  ON provenance_entries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = provenance_entries.book_id AND books.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = provenance_entries.book_id AND books.user_id = auth.uid())
  );

CREATE POLICY "Users can manage provenance sources for own books"
  ON provenance_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM provenance_entries pe
      JOIN books b ON b.id = pe.book_id
      WHERE pe.id = provenance_sources.provenance_entry_id
      AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM provenance_entries pe
      JOIN books b ON b.id = pe.book_id
      WHERE pe.id = provenance_sources.provenance_entry_id
      AND b.user_id = auth.uid()
    )
  );
