-- SQL Schema for website_pricing_plans table in Supabase

CREATE TABLE IF NOT EXISTS website_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('base', 'cardio')),
  price NUMERIC NOT NULL,
  period TEXT DEFAULT '/ month',
  features JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS) if needed
ALTER TABLE website_pricing_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to pricing plans
CREATE POLICY "Allow public read access to website_pricing_plans" 
  ON website_pricing_plans FOR SELECT 
  USING (true);

-- Allow authenticated admins to insert/update/delete pricing plans
CREATE POLICY "Allow authenticated full access to website_pricing_plans" 
  ON website_pricing_plans FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Initial Seed Data
INSERT INTO website_pricing_plans (name, category, price, period, features, badge, popular) VALUES
  ('Men''s Standard', 'base', 4000, '/ month', '["Full Access to Weight & Strength Training Area", "Personalized Workout Orientation", "Locker Room & Shower Access", "Free Trainer Guidance on Floor"]'::jsonb, 'Popular', true),
  ('Ladies'' Standard', 'base', 3500, '/ month', '["Access to Women''s Training Area & Equipment", "Personalized Workout Orientation", "Locker Room & Shower Access", "Free Trainer Guidance on Floor"]'::jsonb, 'Standard', false),
  ('Student Special', 'base', 3000, '/ month', '["Valid Student ID Required", "Full Gym Access (Off-peak & Peak)", "Fitness Assessment", "Locker Room Access"]'::jsonb, 'Student', false),
  ('Men''s Cardio + Treadmill', 'cardio', 5500, '/ month', '["Full Gym Access + Unlimited Treadmill & Cardio", "Heart-Rate Monitored Cardio Zones", "Free Trainer Fitness Assessment", "Locker Room & Shower Access"]'::jsonb, 'Best Value', true),
  ('Ladies'' Cardio + Treadmill', 'cardio', 5000, '/ month', '["Ladies'' Gym Access + Unlimited Treadmill & Cardio", "Dedicated Cardio Zone Access", "Free Trainer Guidance & Assessment", "Locker Room & Shower Access"]'::jsonb, 'Popular', false),
  ('VIP All-Inclusive', 'cardio', 8000, '/ month', '["Unlimited Access to All Facilities & Cardio", "1-on-1 Personal Trainer Consultations", "Customized Diet Plan", "Priority Locker & Towel Service"]'::jsonb, 'VIP Tier', false);
