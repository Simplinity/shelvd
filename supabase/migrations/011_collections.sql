-- Migration 011: Multiple Collections per User
-- A book can belong to multiple collections (like playlists, not folders)
-- Every user gets a default "Library" collection that can't be deleted

-- 1. Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Book-Collections join table (M:N)
CREATE TABLE book_collections (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (book_id, collection_id)
);

-- 3. Indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_book_collections_collection_id ON book_collections(collection_id);
CREATE INDEX idx_book_collections_book_id ON book_collections(book_id);

-- 4. Updated_at trigger for collections
CREATE TRIGGER set_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS on collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own collections"
  ON collections
  USING (user_id = auth.uid());

-- 6. RLS on book_collections (user owns the collection)
ALTER TABLE book_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own book_collections"
  ON book_collections
  USING (
    collection_id IN (
      SELECT id FROM collections WHERE user_id = auth.uid()
    )
  );

-- 7. Seed: create default "Library" collection for all existing users
INSERT INTO collections (user_id, name, is_default, sort_order)
SELECT id, 'Library', true, 0
FROM auth.users;

-- 8. Seed: assign ALL existing books to their user's default "Library" collection
INSERT INTO book_collections (book_id, collection_id)
SELECT b.id, c.id
FROM books b
JOIN collections c ON c.user_id = b.user_id AND c.is_default = true;

-- 9. Function + trigger: auto-create "Library" for new users
CREATE OR REPLACE FUNCTION create_default_collection()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO collections (user_id, name, is_default, sort_order)
  VALUES (NEW.id, 'Library', true, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_collection
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_collection();
