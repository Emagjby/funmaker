-- Create a function to insert a user
-- This function bypasses RLS since it runs with SECURITY DEFINER
CREATE OR REPLACE FUNCTION insert_user(
  p_auth_id UUID,
  p_email TEXT,
  p_username TEXT,
  p_points_balance INTEGER DEFAULT 1000,
  p_is_active BOOLEAN DEFAULT TRUE
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Insert the user
  INSERT INTO public.users (
    auth_id,
    email,
    username,
    points_balance,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    p_auth_id,
    p_email,
    p_username,
    p_points_balance,
    p_is_active,
    NOW(),
    NOW()
  )
  RETURNING id INTO new_user_id;
  
  -- Get the full user record
  SELECT 
    json_build_object(
      'id', id,
      'auth_id', auth_id,
      'email', email,
      'username', username,
      'points_balance', points_balance,
      'is_active', is_active
    ) INTO result
  FROM public.users
  WHERE id = new_user_id;
  
  RETURN result;
END;
$$; 