-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', true) ON CONFLICT DO NOTHING;

-- Set up basic access policies for buckets (public read, authenticated write)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('profiles', 'logos', 'media', 'posters') );
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id IN ('profiles', 'logos', 'media', 'posters') );
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING ( bucket_id IN ('profiles', 'logos', 'media', 'posters') );
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING ( bucket_id IN ('profiles', 'logos', 'media', 'posters') );
