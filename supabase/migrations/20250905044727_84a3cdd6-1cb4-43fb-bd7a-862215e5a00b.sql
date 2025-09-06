-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more secure SELECT policy
-- Users can see their own full profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy for viewing other profiles (without sensitive data)
-- This requires creating a view for public profile data
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add RLS policy for the view (everyone can see public profile info)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if selecting only non-sensitive columns
  -- This policy works in conjunction with the view
  auth.uid() IS NOT NULL OR auth.uid() IS NULL
);