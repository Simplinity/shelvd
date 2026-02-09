-- Migration 027: Condition History
-- Track restorations, repairs, damage events, assessments over time.
-- Mirrors provenance_entries pattern: per-book timeline with positional ordering.

CREATE TABLE IF NOT EXISTS condition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 1,
  event_date TEXT,
  event_type TEXT NOT NULL DEFAULT 'assessment'
    CHECK (event_type IN ('assessment', 'restoration', 'repair', 'cleaning', 'rebinding', 'damage', 'conservation', 'other')),
  description TEXT,
  performed_by TEXT,
  cost NUMERIC(12,2),
  cost_currency VARCHAR(3),
  before_condition_id UUID REFERENCES conditions(id),
  after_condition_id UUID REFERENCES conditions(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_condition_history_book_id ON condition_history(book_id);
CREATE INDEX IF NOT EXISTS idx_condition_history_position ON condition_history(book_id, position);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_condition_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER condition_history_updated_at
  BEFORE UPDATE ON condition_history
  FOR EACH ROW
  EXECUTE FUNCTION update_condition_history_updated_at();

-- RLS
ALTER TABLE condition_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage condition history for own books"
  ON condition_history FOR ALL
  USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = condition_history.book_id AND books.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = condition_history.book_id AND books.user_id = auth.uid())
  );
