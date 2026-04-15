
-- 1. Drop the policies that still allow direct base table access
DROP POLICY IF EXISTS "practitioners_public_read_limited" ON public.practitioners;
DROP POLICY IF EXISTS "practitioners_authenticated_read" ON public.practitioners;

-- 2. Recreate view without security_invoker so it runs as owner (bypasses RLS)
-- This way anon/authenticated can query the view but NOT the base table
DROP VIEW IF EXISTS public.practitioners_public;

CREATE VIEW public.practitioners_public AS
SELECT
  id,
  fp_id,
  first_name,
  last_name,
  current_belt,
  martial_art,
  school_id,
  photo_url,
  created_at,
  updated_at
FROM public.practitioners;

-- 3. Grant access to the view for anon and authenticated roles
GRANT SELECT ON public.practitioners_public TO anon;
GRANT SELECT ON public.practitioners_public TO authenticated;
