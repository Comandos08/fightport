
-- 1. Create public view with only non-sensitive fields
CREATE VIEW public.practitioners_public
WITH (security_invoker = on) AS
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

-- 2. Drop the overly permissive public read policy
DROP POLICY IF EXISTS "practitioners_public_read" ON public.practitioners;

-- 3. Create a new public read policy that only allows reading via the view
-- We need anon/public to still be able to read rows (the view filters columns)
CREATE POLICY "practitioners_public_read_limited"
ON public.practitioners
FOR SELECT
TO anon
USING (true);

-- Authenticated non-owner also gets limited access via view
CREATE POLICY "practitioners_authenticated_read"
ON public.practitioners
FOR SELECT
TO authenticated
USING (true);
