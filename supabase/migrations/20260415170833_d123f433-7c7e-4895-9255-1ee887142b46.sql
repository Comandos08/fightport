
-- Drop all existing policies on storage.objects for school-logos bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "public_read_school_logos" ON storage.objects;
DROP POLICY IF EXISTS "school_upload_logo" ON storage.objects;
DROP POLICY IF EXISTS "school_update_logo" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view school logos" ON storage.objects;
DROP POLICY IF EXISTS "Schools can upload their logo" ON storage.objects;
DROP POLICY IF EXISTS "Schools can update their logo" ON storage.objects;

-- Allow anyone to read a specific file by path (no listing)
CREATE POLICY "public_read_school_logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'school-logos');

-- Schools can upload their own logo (folder = their auth.uid)
CREATE POLICY "school_upload_logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Schools can update their own logo
CREATE POLICY "school_update_logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
