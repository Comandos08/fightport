
-- Drop the broad SELECT policy
DROP POLICY IF EXISTS "public_read_school_logos" ON storage.objects;

-- Create a more restrictive SELECT policy that allows reading specific objects
-- but blocks listing (listing uses empty/prefix paths via the API, not direct object access)
-- For public buckets, direct object GET bypasses RLS, so this policy only affects listing
-- To block listing, we deny SELECT entirely for anonymous users
CREATE POLICY "authenticated_read_school_logos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'school-logos');
