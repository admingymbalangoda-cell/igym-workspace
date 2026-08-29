-- SQL Schema for website_app_promo_section table in Supabase

CREATE TABLE IF NOT EXISTS website_app_promo_section (
  id INT PRIMARY KEY DEFAULT 1,
  badge_text TEXT NOT NULL DEFAULT 'IGYM MOBILE APP',
  heading TEXT NOT NULL DEFAULT 'WORKOUT & TRACK MEMBERSHIP ON THE GO',
  description TEXT NOT NULL DEFAULT 'Access digital attendance QR passes, track weight progress, view personal workout logs, and renew your membership directly from your smartphone.',
  feature_1 TEXT NOT NULL DEFAULT 'Digital Attendance & QR Entry Pass',
  feature_2 TEXT NOT NULL DEFAULT 'Real-Time Workout & Progress Tracking',
  feature_3 TEXT NOT NULL DEFAULT 'Online Membership Renewal & Payments',
  feature_4 TEXT NOT NULL DEFAULT 'Personal Trainer Guidance & Chat Support',
  image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
  storage_path TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row_app_promo_check CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE website_app_promo_section ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to website_app_promo_section"
  ON website_app_promo_section FOR SELECT
  USING (true);

-- Allow full access to website_app_promo_section
CREATE POLICY "Allow full access to website_app_promo_section"
  ON website_app_promo_section FOR ALL
  USING (true)
  WITH CHECK (true);

-- Initial Seed Data
INSERT INTO website_app_promo_section (
  id,
  badge_text,
  heading,
  description,
  feature_1,
  feature_2,
  feature_3,
  feature_4,
  image_url
) VALUES (
  1,
  'IGYM MOBILE APP',
  'WORKOUT & TRACK MEMBERSHIP ON THE GO',
  'Access digital attendance QR passes, track weight progress, view personal workout logs, and renew your membership directly from your smartphone.',
  'Digital Attendance & QR Entry Pass',
  'Real-Time Workout & Progress Tracking',
  'Online Membership Renewal & Payments',
  'Personal Trainer Guidance & Chat Support',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO NOTHING;
