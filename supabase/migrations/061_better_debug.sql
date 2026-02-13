-- 061: Better debug function — check trigger, constraints, RLS

CREATE OR REPLACE FUNCTION public.debug_signup_check()
RETURNS JSONB
SECURITY DEFINER
LANGUAGE plpgsql AS $$
DECLARE
  trigger_def TEXT;
  rls_enabled BOOLEAN;
  policies JSONB;
  columns JSONB;
  result JSONB;
BEGIN
  -- 1. Get current trigger function source
  SELECT prosrc INTO trigger_def 
  FROM pg_proc WHERE proname = 'handle_new_user';

  -- 2. Check if RLS is enabled
  SELECT relrowsecurity INTO rls_enabled 
  FROM pg_class WHERE relname = 'user_profiles';

  -- 3. Get RLS policies
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', polname,
    'cmd', polcmd,
    'permissive', polpermissive
  )), '[]'::jsonb) INTO policies
  FROM pg_policy WHERE polrelid = 'public.user_profiles'::regclass;

  -- 4. Get all columns with their defaults and nullability
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'column', column_name,
    'type', data_type,
    'nullable', is_nullable,
    'default', column_default
  ) ORDER BY ordinal_position), '[]'::jsonb) INTO columns
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'user_profiles';

  result := jsonb_build_object(
    'trigger_source', trigger_def,
    'rls_enabled', rls_enabled,
    'policies', policies,
    'columns', columns
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.debug_signup_check() TO authenticated;
