-- 063: Restore ORIGINAL working trigger + clean up all debug functions

-- Restore the original trigger that WORKED (from migration 005)
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

-- Drop all debug functions
DROP FUNCTION IF EXISTS public.debug_auth_users();
DROP FUNCTION IF EXISTS public.debug_user_profiles();
DROP FUNCTION IF EXISTS public.debug_test_insert();
DROP FUNCTION IF EXISTS public.debug_signup_check();
