-- #13 Invite Codes — RLS policies for admin access

-- Admin can do everything with invite_codes
CREATE POLICY "Admins can manage invite codes"
  ON invite_codes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  );

-- Admin can read redemptions
CREATE POLICY "Admins can read redemptions"
  ON invite_code_redemptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  );

-- Redemptions are inserted via SECURITY DEFINER RPC (redeem_invite_code), so no insert policy needed for regular users
