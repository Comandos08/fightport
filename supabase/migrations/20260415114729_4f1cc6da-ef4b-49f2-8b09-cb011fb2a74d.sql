
-- Remove overly permissive public read policy that exposes school email
DROP POLICY IF EXISTS "schools_public_read" ON public.schools;
