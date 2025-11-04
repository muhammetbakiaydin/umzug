-- Allow public read access to offers table for PDF viewing
-- This enables customers to view their offer PDFs without logging in

-- Enable RLS on offers table if not already enabled
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to offers" ON offers;

-- Create policy to allow anyone to read offers (for PDF viewing)
CREATE POLICY "Allow public read access to offers"
  ON offers
  FOR SELECT
  USING (true);

-- Note: This allows read-only access to all offers.
-- Write access (INSERT, UPDATE, DELETE) still requires authentication
-- and should have separate policies that check for authenticated users.

-- Also allow public read access to company_settings for VAT display
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to company_settings" ON company_settings;

CREATE POLICY "Allow public read access to company_settings"
  ON company_settings
  FOR SELECT
  USING (true);
