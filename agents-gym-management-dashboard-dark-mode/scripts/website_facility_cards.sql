-- SQL Schema for website_facility_cards table in Supabase

CREATE TABLE IF NOT EXISTS website_facility_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_text TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE website_facility_cards ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to website_facility_cards"
  ON website_facility_cards FOR SELECT
  USING (true);

-- Allow full access to website_facility_cards
CREATE POLICY "Allow full access to website_facility_cards"
  ON website_facility_cards FOR ALL
  USING (true)
  WITH CHECK (true);

-- Initial Seed Data
INSERT INTO website_facility_cards (title, description, badge_text, image_url, display_order) VALUES
  (
    'Strength & Resistance Zone',
    'Heavy-duty squat racks, Olympic barbells, dumbbell racks up to 50kg, and plate-loaded machines built for intense bodybuilding & strength gains.',
    'BODYBUILDING & STRENGTH',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    1
  ),
  (
    'Cardio & Endurance Deck',
    'Commercial treadmills, stationary cycles, and elliptical trainers with real-time heart-rate monitoring to maximize fat burn.',
    'FAT BURN & STAMINA',
    'https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800&auto=format&fit=crop&q=80',
    2
  ),
  (
    'Functional & Core Arena',
    'Kettlebells, battle ropes, medicine balls, plyo boxes, and spacious mat space for high-intensity interval training and agility drills.',
    'HIIT & MOBILITY',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    3
  );
