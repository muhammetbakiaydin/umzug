-- Add missing columns to service_categories table
-- This fixes the error: Could not find the 'base_price' column

-- Add pricing fields to service_categories if they don't exist
ALTER TABLE service_categories
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'custom' CHECK (pricing_model IN ('hourly', 'fixed', 'custom')),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2) DEFAULT 0;

-- Update existing categories with default values if they're null
UPDATE service_categories 
SET 
  description = COALESCE(description, CASE value
    WHEN 'umzug' THEN 'Professioneller Umzugsservice'
    WHEN 'reinigung' THEN 'Professionelle Reinigungsleistungen'
    WHEN 'entsorgung' THEN 'Fachgerechte Entsorgung'
    WHEN 'lagerung' THEN 'Sichere Lagerlösungen'
    ELSE 'Service-Beschreibung'
  END),
  pricing_model = COALESCE(pricing_model, 'custom'),
  hourly_rate = COALESCE(hourly_rate, 120),
  base_price = COALESCE(base_price, 0);
