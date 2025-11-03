-- Add price field to additional_services table
ALTER TABLE additional_services
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;

COMMENT ON COLUMN additional_services.price IS 'Price for the additional service in CHF';

-- Set default price for existing services
UPDATE additional_services
SET price = 0.00
WHERE price IS NULL;
