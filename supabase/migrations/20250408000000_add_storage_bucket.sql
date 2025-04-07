
-- Create storage for user photos
INSERT INTO storage.buckets (id, name, public) VALUES
  ('user-photos', 'user-photos', true)
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow public access to user-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-photos')
ON CONFLICT DO NOTHING;

CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-photos')
ON CONFLICT DO NOTHING;

CREATE POLICY "Allow users to update their own uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1])
ON CONFLICT DO NOTHING;

CREATE POLICY "Allow users to delete their own uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1])
ON CONFLICT DO NOTHING;
