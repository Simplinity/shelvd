-- User Profiles table for admin management
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Display
  display_name VARCHAR(255),
  
  -- Membership
  membership_tier VARCHAR(20) DEFAULT 'free',
  is_lifetime_free BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  status_reason TEXT,
  
  -- Admin
  is_admin BOOLEAN DEFAULT false,
  admin_role VARCHAR(20),
  
  -- Metadata
  signup_source VARCHAR(50),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_membership ON user_profiles(membership_tier);
CREATE INDEX idx_user_profiles_admin ON user_profiles(is_admin) WHERE is_admin = true;

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Helper function to check admin status (SECURITY DEFINER bypasses RLS)
-- Without this, admin policies on user_profiles cause infinite recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $
  SELECT COALESCE(
    (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()),
    false
  )
$ LANGUAGE sql SECURITY DEFINER;

-- Admins can read all profiles (uses is_admin() to avoid recursion)
CREATE POLICY "Admins can read all profiles" ON user_profiles
  FOR SELECT USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (is_admin());

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (is_admin());

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users
INSERT INTO user_profiles (id, display_name, created_at)
SELECT 
  id,
  split_part(email, '@', 1),
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Set bruno@simplinity.co as super_admin
UPDATE user_profiles 
SET 
  is_admin = true,
  admin_role = 'super_admin',
  is_lifetime_free = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'bruno@simplinity.co');

-- Set bruno@vanbranden.be as lifetime free (early adopter)
UPDATE user_profiles 
SET is_lifetime_free = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'bruno@vanbranden.be');
