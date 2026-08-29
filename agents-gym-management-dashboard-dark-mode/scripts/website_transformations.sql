-- SQL Schema for website_transformations table in Supabase

CREATE TABLE IF NOT EXISTS website_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  member_status TEXT NOT NULL DEFAULT 'Verified iGYM Member',
  review_text TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  badge_text TEXT NOT NULL,
  duration_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Weight Loss',
  image_url TEXT NOT NULL,
  storage_path TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE website_transformations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to website_transformations"
  ON website_transformations FOR SELECT
  USING (true);

-- Allow full access to website_transformations
CREATE POLICY "Allow full access to website_transformations"
  ON website_transformations FOR ALL
  USING (true)
  WITH CHECK (true);

-- Initial Seed Data
INSERT INTO website_transformations (
  member_name,
  member_status,
  review_text,
  rating,
  badge_text,
  duration_text,
  category,
  image_url,
  display_order
) VALUES
(
  'Kavinda Perera',
  'Verified iGYM Member',
  'iGYM transformed my lifestyle completely. With dedicated personal coaching and intense strength training, I shed fat and gained solid muscle mass.',
  5.0,
  'LOST 14 KG',
  '4 Months',
  'Weight Loss',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
  1
),
(
  'Sahan Fernando',
  'Verified iGYM Member',
  'The cardio deck and nutrition guidelines at iGYM were game changers for me. Consistently hitting targets helped me reach peak conditioning.',
  5.0,
  'GAINED 8 KG MUSCLE',
  '6 Months',
  'Muscle Gain',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
  2
)
ON CONFLICT DO NOTHING;
