-- #13 Invite Codes — Step 1: Foundation tables

-- ─── invite_codes ───

CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  label TEXT,
  source_type TEXT NOT NULL DEFAULT 'personal',
  source_name TEXT,
  benefit_type TEXT NOT NULL DEFAULT 'none',
  benefit_days INT DEFAULT 0,
  max_uses INT,
  times_used INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive unique index (codes stored uppercase, looked up case-insensitive)
CREATE UNIQUE INDEX idx_invite_codes_code ON invite_codes (upper(code));

CREATE INDEX idx_invite_codes_active ON invite_codes (is_active, created_at DESC);
CREATE INDEX idx_invite_codes_source ON invite_codes (source_type, source_name);

-- RLS
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Admin-only via SECURITY DEFINER RPCs. No direct RLS policies for regular users.
-- Signup validation goes through a SECURITY DEFINER function (below).

-- ─── invite_code_redemptions ───

CREATE TABLE invite_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES invite_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_redemptions_code ON invite_code_redemptions (code_id, redeemed_at DESC);
CREATE INDEX idx_redemptions_user ON invite_code_redemptions (user_id);

ALTER TABLE invite_code_redemptions ENABLE ROW LEVEL SECURITY;

-- ─── user_profiles: add benefit tracking columns ───

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS invite_code_id UUID REFERENCES invite_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS benefit_expires_at TIMESTAMPTZ;

-- ─── RPC: validate and redeem a code (called during signup) ───

CREATE OR REPLACE FUNCTION redeem_invite_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_row invite_codes%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Look up code (case-insensitive)
  SELECT * INTO v_code_row
  FROM invite_codes
  WHERE upper(code) = upper(p_code);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_code');
  END IF;

  IF NOT v_code_row.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'code_inactive');
  END IF;

  IF v_code_row.expires_at IS NOT NULL AND v_code_row.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'code_expired');
  END IF;

  IF v_code_row.max_uses IS NOT NULL AND v_code_row.times_used >= v_code_row.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'code_maxed');
  END IF;

  -- Check if user already redeemed any code
  IF EXISTS (SELECT 1 FROM invite_code_redemptions WHERE user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_redeemed');
  END IF;

  -- Record redemption
  INSERT INTO invite_code_redemptions (code_id, user_id)
  VALUES (v_code_row.id, p_user_id);

  -- Increment counter
  UPDATE invite_codes SET times_used = times_used + 1 WHERE id = v_code_row.id;

  -- Apply benefits to user profile
  IF v_code_row.benefit_type = 'lifetime_free' THEN
    UPDATE user_profiles
    SET is_lifetime_free = true, invite_code_id = v_code_row.id
    WHERE id = p_user_id;
  ELSIF v_code_row.benefit_type = 'trial_days' AND v_code_row.benefit_days > 0 THEN
    UPDATE user_profiles
    SET benefit_expires_at = now() + (v_code_row.benefit_days || ' days')::interval,
        invite_code_id = v_code_row.id
    WHERE id = p_user_id;
  ELSE
    -- No benefit, just attribution
    UPDATE user_profiles
    SET invite_code_id = v_code_row.id
    WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'benefit_type', v_code_row.benefit_type,
    'benefit_days', v_code_row.benefit_days,
    'source_type', v_code_row.source_type,
    'source_name', v_code_row.source_name
  );
END;
$$;

-- ─── RPC: admin — list codes with stats ───

CREATE OR REPLACE FUNCTION get_invite_codes_for_admin()
RETURNS TABLE (
  id UUID,
  code TEXT,
  label TEXT,
  source_type TEXT,
  source_name TEXT,
  benefit_type TEXT,
  benefit_days INT,
  max_uses INT,
  times_used INT,
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, code, label, source_type, source_name,
    benefit_type, benefit_days, max_uses, times_used,
    is_active, expires_at, created_at
  FROM invite_codes
  ORDER BY created_at DESC;
$$;

-- ─── RPC: admin — get redemptions for a specific code ───

CREATE OR REPLACE FUNCTION get_code_redemptions_for_admin(p_code_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  redeemed_at TIMESTAMPTZ,
  user_status TEXT,
  book_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.user_id,
    u.email AS user_email,
    r.redeemed_at,
    p.status AS user_status,
    (SELECT count(*) FROM books b WHERE b.user_id = r.user_id) AS book_count
  FROM invite_code_redemptions r
  JOIN auth.users u ON u.id = r.user_id
  LEFT JOIN user_profiles p ON p.id = r.user_id
  WHERE r.code_id = p_code_id
  ORDER BY r.redeemed_at DESC;
$$;
