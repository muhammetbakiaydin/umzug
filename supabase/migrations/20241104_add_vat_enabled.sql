-- Add vat_enabled column to company_settings table
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS vat_enabled BOOLEAN DEFAULT true;

-- Set default value for existing rows
UPDATE company_settings 
SET vat_enabled = true 
WHERE vat_enabled IS NULL;
