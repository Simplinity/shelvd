-- Temporary debug function to check auth state
CREATE OR REPLACE FUNCTION public.debug_auth_users()
RETURNS TABLE(user_id UUID, email TEXT, confirmed BOOLEAN, created TEXT) 
SECURITY DEFINER
LANGUAGE sql AS $$
  SELECT id, email::TEXT, 
    (email_confirmed_at IS NOT NULL) as confirmed,
    created_at::TEXT 
  FROM auth.users ORDER BY created_at;
$$;

-- Also check user_profiles
CREATE OR REPLACE FUNCTION public.debug_user_profiles()
RETURNS TABLE(profile_id UUID, display TEXT, user_type_val TEXT, onboarded BOOLEAN)
SECURITY DEFINER
LANGUAGE sql AS $$
  SELECT id, display_name::TEXT, user_type::TEXT, onboarding_completed
  FROM public.user_profiles ORDER BY created_at;
$$;
