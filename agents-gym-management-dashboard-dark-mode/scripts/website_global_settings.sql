-- SQL Schema for website_global_settings table in Supabase

CREATE TABLE IF NOT EXISTS website_global_settings (
  id INT PRIMARY KEY DEFAULT 1,
  whatsapp_number TEXT NOT NULL DEFAULT '+94771234567',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE website_global_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to website_global_settings"
  ON website_global_settings FOR SELECT
  USING (true);

-- Allow full access to website_global_settings
CREATE POLICY "Allow full access to website_global_settings"
  ON website_global_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed initial row
INSERT INTO website_global_settings (id, whatsapp_number)
VALUES (1, '+94771234567')
ON CONFLICT (id) DO NOTHING;
