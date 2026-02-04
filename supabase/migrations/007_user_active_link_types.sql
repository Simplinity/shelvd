-- ============================================================================
-- USER ACTIVE LINK TYPES — Migration
-- Tracks which external link types each user has activated
-- Run in Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_active_link_types (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_type_id UUID NOT NULL REFERENCES external_link_types(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, link_type_id)
);

CREATE INDEX idx_ualt_user_id ON user_active_link_types (user_id);

ALTER TABLE user_active_link_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own active link types"
  ON user_active_link_types FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own active link types"
  ON user_active_link_types FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own active link types"
  ON user_active_link_types FOR DELETE TO authenticated
  USING (user_id = auth.uid());
