-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true);

-- Public read access
CREATE POLICY "School logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');

-- Schools can upload their own logo
CREATE POLICY "Schools can upload their own logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'school-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Schools can update their own logo
CREATE POLICY "Schools can update their own logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'school-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Schools can delete their own logo
CREATE POLICY "Schools can delete their own logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'school-logos' AND auth.uid()::text = (storage.foldername(name))[1]);