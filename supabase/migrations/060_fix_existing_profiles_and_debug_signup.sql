-- 060: Fix existing profiles + add signup debug function

-- Fix bruno@vanbranden.be (has 5000+ books, never got onboarding data)
UPDATE public.user_profiles 
SET user_type = 'collector', 
    onboarding_completed = true, 
    collection_size_estimate = '5000_plus'
WHERE id = '10d55057-46c6-40bc-927f-4266178be025';

-- Fix admin (bruno@simplinity.co) — mark as properly onboarded
UPDATE public.user_profiles 
SET user_type = 'collector', 
    onboarding_completed = true
WHERE id = '1b7bc552-7d9d-4c20-a07e-ff93114cb1fd';

-- Debug: test if inserting a user_profiles row works at all
-- This simulates what the trigger does
CREATE OR REPLACE FUNCTION public.debug_test_insert()
RETURNS TEXT
SECURITY DEFINER
LANGUAGE plpgsql AS $$
DECLARE
  test_id UUID := gen_random_uuid();
  result TEXT;
BEGIN
  -- Try the exact same INSERT the trigger does
  INSERT INTO public.user_profiles (id, display_name, created_at)
  VALUES (test_id, 'test_user', NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- If we get here, insert works
  -- Clean up
  DELETE FROM public.user_profiles WHERE id = test_id;
  
  RETURN 'INSERT works fine';
EXCEPTION WHEN OTHERS THEN
  RETURN 'INSERT FAILED: ' || SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.debug_test_insert() TO authenticated;
