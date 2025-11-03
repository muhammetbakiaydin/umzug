-- First, let's see what we have and drop/recreate if needed

-- Drop existing tables if they have wrong structure
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS additional_services CASCADE;

-- Add vat_rate column to company_settings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='company_settings' AND column_name='vat_rate') THEN
    ALTER TABLE company_settings ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 7.7;
  END IF;
END $$;

-- Update company_settings to ensure vat_rate has a value
UPDATE company_settings SET vat_rate = 7.7 WHERE vat_rate IS NULL;

-- Insert default company_settings if table is empty
INSERT INTO company_settings (vat_rate)
SELECT 7.7
WHERE NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1);

-- Create service_categories table with correct structure
CREATE TABLE service_categories (
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
  ('Lagerung', 'lagerung', true, 3);

-- Create additional_services table
CREATE TABLE additional_services (
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
  ('Möbelmontage', 'De- und Montage Ihrer Möbel', true, 5);

-- Create indexes
CREATE INDEX idx_service_categories_active ON service_categories(active);
CREATE INDEX idx_service_categories_display_order ON service_categories(display_order);
CREATE INDEX idx_additional_services_active ON additional_services(active);
CREATE INDEX idx_additional_services_display_order ON additional_services(display_order);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated full access to service_categories" 
  ON service_categories FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to additional_services" 
  ON additional_services FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);
