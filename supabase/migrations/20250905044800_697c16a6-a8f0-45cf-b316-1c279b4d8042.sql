-- First, drop the problematic policy we just created
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Drop the view we created
DROP VIEW IF EXISTS public.public_profiles;

-- Now create proper RLS policies for the profiles table
-- Policy 1: Users can see their own complete profile (including email)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can see other users' profiles BUT without email
-- We'll handle email filtering in the application layer
CREATE POLICY "Authenticated users can view other profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() != user_id);

-- Fix the function search path issues for security
-- Update existing functions to set search_path
CREATE OR REPLACE FUNCTION public.update_whisper_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.whispers 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.whisper_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.whispers 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.whisper_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_whisper_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.whispers 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.whisper_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.whispers 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.whisper_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;