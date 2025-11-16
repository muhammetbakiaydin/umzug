-- Add signature fields to offers table
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS customer_signature TEXT,
ADD COLUMN IF NOT EXISTS signature_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS signature_date VARCHAR(50);

-- Add comment
COMMENT ON COLUMN offers.customer_signature IS 'Customer signature as base64 data URL';
COMMENT ON COLUMN offers.signature_location IS 'Location where signature was made (e.g. Lyss)';
COMMENT ON COLUMN offers.signature_date IS 'Date when signature was made';
