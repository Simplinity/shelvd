-- Migration 043: Valuation History
-- Timeline of value assessments per book. Links to provenance entries when
-- the valuation comes from a transaction (purchase, auction, etc.).

CREATE TABLE IF NOT EXISTS valuation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 1,
  valuation_date TEXT,
  value NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  source TEXT NOT NULL DEFAULT 'self_estimate'
    CHECK (source IN (
      'self_estimate',
      'appraisal',
      'auction_result',
      'dealer_quote',
      'insurance',
      'market_research',
      'provenance_purchase'
    )),
  appraiser TEXT,
  provenance_entry_id UUID REFERENCES provenance_entries(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_valuation_history_book_id ON valuation_history(book_id);
CREATE INDEX IF NOT EXISTS idx_valuation_history_position ON valuation_history(book_id, position);
CREATE INDEX IF NOT EXISTS idx_valuation_history_provenance ON valuation_history(provenance_entry_id);

-- RLS
ALTER TABLE valuation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "valuation_history_select" ON valuation_history
  FOR SELECT USING (
    book_id IN (SELECT id FROM books WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "valuation_history_insert" ON valuation_history
  FOR INSERT WITH CHECK (
    book_id IN (SELECT id FROM books WHERE user_id = auth.uid())
  );

CREATE POLICY "valuation_history_update" ON valuation_history
  FOR UPDATE USING (
    book_id IN (SELECT id FROM books WHERE user_id = auth.uid())
  );

CREATE POLICY "valuation_history_delete" ON valuation_history
  FOR DELETE USING (
    book_id IN (SELECT id FROM books WHERE user_id = auth.uid())
  );
