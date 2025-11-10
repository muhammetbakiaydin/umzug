-- Add document_type field to offers table to support offers, receipts, and invoices
-- Also add receipt_number and invoice_number fields

ALTER TABLE offers 
  ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'offer' CHECK (document_type IN ('offer', 'receipt', 'invoice')),
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_offers_document_type ON offers(document_type);
CREATE INDEX IF NOT EXISTS idx_offers_receipt_number ON offers(receipt_number);
CREATE INDEX IF NOT EXISTS idx_offers_invoice_number ON offers(invoice_number);

-- Add unique constraints for receipt and invoice numbers
CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_receipt_number_unique ON offers(receipt_number) WHERE receipt_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_invoice_number_unique ON offers(invoice_number) WHERE invoice_number IS NOT NULL;

-- Update existing records to have 'offer' as document_type
UPDATE offers SET document_type = 'offer' WHERE document_type IS NULL;

COMMENT ON COLUMN offers.document_type IS 'Type of document: offer, receipt, or invoice';
COMMENT ON COLUMN offers.receipt_number IS 'Unique receipt number for receipts';
COMMENT ON COLUMN offers.invoice_number IS 'Unique invoice number for invoices';
