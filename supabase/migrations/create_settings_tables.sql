-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vat_rate DECIMAL(5,2) DEFAULT 7.7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default company settings
INSERT INTO company_settings (vat_rate) 
VALUES (7.7)
ON CONFLICT DO NOTHING;

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
INSERT INTO service_categories (name, value, active, display_order) 
VALUES 
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
INSERT INTO additional_services (name, description, active, display_order) 
VALUES 
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
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read company_settings" 
  ON company_settings FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to update company_settings" 
  ON company_settings FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to read service_categories" 
  ON service_categories FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert service_categories" 
  ON service_categories FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update service_categories" 
  ON service_categories FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to delete service_categories" 
  ON service_categories FOR DELETE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to read additional_services" 
  ON additional_services FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert additional_services" 
  ON additional_services FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update additional_services" 
  ON additional_services FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to delete additional_services" 
  ON additional_services FOR DELETE 
  TO authenticated 
  USING (true);
