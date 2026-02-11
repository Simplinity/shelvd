-- Activity log: records every meaningful action in Shelvd
-- Foundation for admin live feed (A3), weekly digest (A8), audit trails

CREATE TABLE activity_log (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Who
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- What
  action        TEXT NOT NULL,          -- 'book.created', 'book.updated', 'collection.renamed', etc.
  category      TEXT NOT NULL,          -- 'book', 'collection', 'provenance', 'account', 'admin'

  -- On what
  entity_type   TEXT,                   -- 'book', 'collection', 'provenance_entry', 'user_profile'
  entity_id     UUID,
  entity_label  TEXT,                   -- Human-readable: "Gutenberg Bible (1455)" — avoids joins

  -- Details
  metadata      JSONB DEFAULT '{}',    -- Diff, source, old/new values, context

  -- Context
  source        TEXT DEFAULT 'app'     -- 'app', 'import', 'api', 'admin', 'system'
);

-- Indices for common query patterns
CREATE INDEX idx_activity_log_user      ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_action    ON activity_log(action, created_at DESC);
CREATE INDEX idx_activity_log_entity    ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created   ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_category  ON activity_log(category, created_at DESC);

-- RLS: users can only read their own activity
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin access via SECURITY DEFINER RPC (no broad RLS policy — learned from migration 031)

-- RPC: get recent activity for admin dashboard feed
CREATE OR REPLACE FUNCTION get_recent_activity_for_admin(
  lim INT DEFAULT 50,
  category_filter TEXT DEFAULT NULL,
  user_filter UUID DEFAULT NULL
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
  ORDER BY a.created_at DESC
  LIMIT lim;
$$;

-- RPC: get activity count for admin stats
CREATE OR REPLACE FUNCTION get_activity_count_for_admin(
  since TIMESTAMPTZ DEFAULT now() - INTERVAL '7 days'
)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM activity_log WHERE created_at >= since;
$$;
