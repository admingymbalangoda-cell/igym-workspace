-- SQL Schema for website_gallery_images table and storage bucket setup in Supabase

-- 1. Create table for storing gallery image records
CREATE TABLE IF NOT EXISTS website_gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  storage_path TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Turn on Row Level Security (RLS)
ALTER TABLE website_gallery_images ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access to website_gallery_images
CREATE POLICY "Allow public read access to website_gallery_images"
  ON website_gallery_images FOR SELECT
  USING (true);

-- 4. Allow full access to website_gallery_images for all/authenticated
CREATE POLICY "Allow full access to website_gallery_images"
  ON website_gallery_images FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Storage Bucket Setup (Execute in Supabase SQL editor or create bucket named 'website_gallery' in Supabase Dashboard)
-- Insert bucket into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('website_gallery', 'website_gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for website_gallery bucket
CREATE POLICY "Allow public read access to website_gallery bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'website_gallery');

CREATE POLICY "Allow full access to website_gallery bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'website_gallery')
  WITH CHECK (bucket_id = 'website_gallery');
