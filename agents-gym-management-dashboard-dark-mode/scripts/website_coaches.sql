-- SQL Schema for website_coaches table in Supabase

CREATE TABLE IF NOT EXISTS website_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  rating NUMERIC(3, 1) DEFAULT 4.9,
  certification TEXT,
  focus TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE website_coaches ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to website_coaches"
  ON website_coaches FOR SELECT
  USING (true);

-- Allow full access to website_coaches
CREATE POLICY "Allow full access to website_coaches"
  ON website_coaches FOR ALL
  USING (true)
  WITH CHECK (true);

-- Initial Seed Data
INSERT INTO website_coaches (name, title, rating, certification, focus, image_url, display_order) VALUES
  (
    'Coach Marcus Vance',
    'Head Bodybuilding & Strength Specialist',
    5.0,
    'IFBB Pro Card & NSCA-CSCS Certified',
    'Hypertrophy, Powerlifting & Contest Prep',
    'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&auto=format&fit=crop&q=80',
    1
  ),
  (
    'Coach Elena Rostova',
    'Cardio & Functional HIIT Master Coach',
    4.9,
    'ACE Certified Personal Trainer & Precision Nutrition',
    'Fat Loss, Conditioning & Core Endurance',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
    2
  ),
  (
    'Coach David Miller',
    'Rehabilitation & Athletic Performance Coach',
    4.8,
    'NASM Master Trainer & Functional Movement Specialist',
    'Posture Correction, Injury Rehab & Agility',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
    3
  );
