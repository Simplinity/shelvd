-- Migration 025: Feedback & Support system
-- Bug reports, contact requests, callback requests

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Type & content
  type TEXT NOT NULL CHECK (type IN ('bug', 'contact', 'callback')),
  subject TEXT,
  message TEXT,

  -- Bug-specific
  severity TEXT CHECK (severity IN ('critical', 'major', 'minor', 'cosmetic')),
  steps_to_reproduce TEXT,

  -- Contact-specific
  category TEXT CHECK (category IN ('general', 'account', 'feature_request', 'data_question', 'partnership')),
  preferred_response TEXT CHECK (preferred_response IN ('email', 'in_app')),

  -- Callback-specific
  phone TEXT,
  preferred_time TEXT CHECK (preferred_time IN ('morning', 'afternoon', 'evening')),
  timezone TEXT,
  urgency TEXT CHECK (urgency IN ('normal', 'urgent')),

  -- Auto-captured browser info
  browser_info JSONB DEFAULT '{}'::jsonb,

  -- Admin workflow
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'acknowledged', 'in_progress', 'resolved', 'closed', 'spam')),
  priority TEXT NOT NULL DEFAULT 'none'
    CHECK (priority IN ('none', 'low', 'medium', 'high', 'critical')),
  admin_notes TEXT,
  admin_response TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: users see own, admins see all
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  );

CREATE POLICY "Admins can update all feedback"
  ON feedback FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  );

CREATE POLICY "Admins can delete feedback"
  ON feedback FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  );

-- Indexes for admin queue queries
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();
