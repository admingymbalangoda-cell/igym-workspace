-- SQL Schema for website_about_section table in Supabase

CREATE TABLE IF NOT EXISTS website_about_section (
  id INT PRIMARY KEY DEFAULT 1,
  heading TEXT NOT NULL DEFAULT 'ELEVATE YOUR FITNESS JOURNEY',
  subheading TEXT NOT NULL DEFAULT 'ABOUT OUR GYM & PHILOSOPHY',
  paragraph_1 TEXT NOT NULL DEFAULT 'Founded in 2019 in Balangoda, iGYM was built with a single mission: to empower individuals through disciplined training, state-of-the-art equipment, and expert coaching.',
  paragraph_2 TEXT NOT NULL DEFAULT 'Whether you are looking to build raw strength, improve endurance, or transform your lifestyle, our supportive community and dedicated trainers are here to guide every step of your transformation.',
  quote_text TEXT NOT NULL DEFAULT 'Consistency is the key to unlocking your true physical potential.',
  quote_author TEXT NOT NULL DEFAULT 'iGYM Head Coach',
  badge_title TEXT NOT NULL DEFAULT 'ESTABLISHED 2019',
  badge_subtitle TEXT NOT NULL DEFAULT 'BALANGODA, SRI LANKA',
  image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  storage_path TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure row level security
ALTER TABLE website_about_section ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to website_about_section"
  ON website_about_section FOR SELECT
  USING (true);

-- Allow authenticated full access
CREATE POLICY "Allow full access to website_about_section"
  ON website_about_section FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert initial row with id = 1 if not exists
INSERT INTO website_about_section (id, heading, subheading, paragraph_1, paragraph_2, quote_text, quote_author, badge_title, badge_subtitle, image_url)
VALUES (
  1,
  'ELEVATE YOUR FITNESS JOURNEY',
  'ABOUT OUR GYM & PHILOSOPHY',
  'Founded in 2019 in Balangoda, iGYM was built with a single mission: to empower individuals through disciplined training, state-of-the-art equipment, and expert coaching.',
  'Whether you are looking to build raw strength, improve endurance, or transform your lifestyle, our supportive community and dedicated trainers are here to guide every step of your transformation.',
  'Consistency is the key to unlocking your true physical potential.',
  'iGYM Head Coach',
  'ESTABLISHED 2019',
  'BALANGODA, SRI LANKA',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO NOTHING;
