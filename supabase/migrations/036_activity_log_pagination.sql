-- Paginated activity log for admin viewer (step 5)

-- Count total activity entries (with optional filters)
CREATE OR REPLACE FUNCTION get_activity_count_filtered(
  category_filter TEXT DEFAULT NULL,
  user_filter UUID DEFAULT NULL,
  search_filter TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)
  FROM activity_log a
  WHERE
    (category_filter IS NULL OR a.category = category_filter)
    AND (user_filter IS NULL OR a.user_id = user_filter)
    AND (search_filter IS NULL OR a.entity_label ILIKE '%' || search_filter || '%');
$$;

-- Paginated activity log with offset
CREATE OR REPLACE FUNCTION get_activity_page_for_admin(
  lim INT DEFAULT 50,
  off_set INT DEFAULT 0,
  category_filter TEXT DEFAULT NULL,
  user_filter UUID DEFAULT NULL,
  search_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  user_id UUID,
  user_email TEXT,
  action TEXT,
  category TEXT,
  entity_type TEXT,
  entity_id UUID,
  entity_label TEXT,
  metadata JSONB,
  source TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.created_at,
    a.user_id,
    u.email AS user_email,
    a.action,
    a.category,
    a.entity_type,
    a.entity_id,
    a.entity_label,
    a.metadata,
    a.source
  FROM activity_log a
  LEFT JOIN auth.users u ON u.id = a.user_id
  WHERE
    (category_filter IS NULL OR a.category = category_filter)
    AND (user_filter IS NULL OR a.user_id = user_filter)
    AND (search_filter IS NULL OR a.entity_label ILIKE '%' || search_filter || '%')
  ORDER BY a.created_at DESC
  LIMIT lim
  OFFSET off_set;
$$;
