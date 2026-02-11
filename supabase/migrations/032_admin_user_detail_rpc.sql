-- Admin user detail stats RPC
-- Bypasses RLS using SECURITY DEFINER (same pattern as 026_admin_stats.sql)

CREATE OR REPLACE FUNCTION get_user_detail_for_admin(target_user_id UUID)
RETURNS TABLE(
  book_count BIGINT,
  collection_count BIGINT,
  unique_tags BIGINT,
  unique_contributors BIGINT,
  ticket_count BIGINT,
  recent_book_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM books WHERE user_id = target_user_id),
    (SELECT count(*) FROM collections WHERE user_id = target_user_id),
    (SELECT count(DISTINCT bt.tag_id) FROM book_tags bt INNER JOIN books b ON b.id = bt.book_id WHERE b.user_id = target_user_id),
    (SELECT count(DISTINCT bc.contributor_id) FROM book_contributors bc INNER JOIN books b ON b.id = bc.book_id WHERE b.user_id = target_user_id),
    (SELECT count(*) FROM feedback WHERE user_id = target_user_id),
    (SELECT count(*) FROM books WHERE user_id = target_user_id AND created_at >= NOW() - INTERVAL '30 days');
$$;

-- Recent books for a user (admin only)
CREATE OR REPLACE FUNCTION get_user_recent_books_for_admin(target_user_id UUID, lim INT DEFAULT 10)
RETURNS TABLE(
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ,
  status TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.title, b.created_at, b.status
  FROM books b
  WHERE b.user_id = target_user_id
  ORDER BY b.created_at DESC
  LIMIT lim;
$$;

-- User collections (admin only)
CREATE OR REPLACE FUNCTION get_user_collections_for_admin(target_user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  is_default BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name, c.is_default
  FROM collections c
  WHERE c.user_id = target_user_id
  ORDER BY c.sort_order;
$$;
