-- Migration 041: Admin write policies for tier_features and tier_limits
-- Allows admins to manage tier configuration from the admin UI

-- tier_features: admin can insert, update, delete
CREATE POLICY "tier_features_admin_insert" ON tier_features
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "tier_features_admin_update" ON tier_features
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "tier_features_admin_delete" ON tier_features
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- tier_limits: admin can update
CREATE POLICY "tier_limits_admin_update" ON tier_limits
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );
