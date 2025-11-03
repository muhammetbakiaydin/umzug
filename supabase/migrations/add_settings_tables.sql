-- Add vat_rate column to existing company_settings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='company_settings' AND column_name='vat_rate') THEN
    ALTER TABLE company_settings ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 7.7;
  END IF;
END $$;

-- Update existing row or insert if none exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM company_settings LIMIT 1) THEN
    UPDATE company_settings SET vat_rate = 7.7 WHERE vat_rate IS NULL;
  ELSE
    INSERT INTO company_settings (vat_rate) VALUES (7.7);
  END IF;
END $$;

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default service categories
INSERT INTO service_categories (name, value, active, display_order) VALUES 
  ('Umzug', 'umzug', true, 0),
  ('Reinigung', 'reinigung', true, 1),
  ('Entsorgung', 'entsorgung', true, 2),
  ('Lagerung', 'lagerung', true, 3)
ON CONFLICT (value) DO NOTHING;

-- Create additional_services table
CREATE TABLE IF NOT EXISTS additional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default additional services
INSERT INTO additional_services (name, description, active, display_order) VALUES 
  ('Reinigung', 'Endreinigung der Wohnung', true, 0),
  ('Entsorgung', 'Entsorgung von Möbeln und Gegenständen', true, 1),
  ('Verpackungsservice', 'Professionelle Verpackung Ihres Umzugsguts', true, 2),
  ('Einlagerung', 'Temporäre Lagerung Ihrer Möbel', true, 3),
  ('Klaviertransport', 'Spezialtransport für Klaviere und Flügel', true, 4),
  ('Möbelmontage', 'De- und Montage Ihrer Möbel', true, 5)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON service_categories(active);
CREATE INDEX IF NOT EXISTS idx_service_categories_display_order ON service_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_additional_services_active ON additional_services(active);
CREATE INDEX IF NOT EXISTS idx_additional_services_display_order ON additional_services(display_order);

-- Enable RLS (Row Level Security)
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read service_categories" ON service_categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert service_categories" ON service_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update service_categories" ON service_categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete service_categories" ON service_categories;
DROP POLICY IF EXISTS "Allow authenticated users to read additional_services" ON additional_services;
DROP POLICY IF EXISTS "Allow authenticated users to insert additional_services" ON additional_services;
DROP POLICY IF EXISTS "Allow authenticated users to update additional_services" ON additional_services;
DROP POLICY IF EXISTS "Allow authenticated users to delete additional_services" ON additional_services;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users full access to service_categories" 
  ON service_categories FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to additional_services" 
  ON additional_services FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);
