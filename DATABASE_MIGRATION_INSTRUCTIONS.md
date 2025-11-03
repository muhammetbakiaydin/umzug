# Database Migration Instructions

## ⚠️ IMPORTANT: You must run this migration to fix the update errors!

The error "Fehler beim Aktualisieren der Zusatzleistung" occurs because the `price` column doesn't exist in your database yet.

## Steps to Fix:

### 1. Go to Supabase Dashboard
Open your browser and navigate to: https://supabase.com/dashboard/project/hiymzyupxochrcsrwzwk

### 2. Open SQL Editor
- In the left sidebar, click on **SQL Editor** (database icon)
- Click on **New Query** button

### 3. Run the Migration
Copy and paste this SQL code:

```sql
-- Add price field to additional_services table
ALTER TABLE additional_services
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;

COMMENT ON COLUMN additional_services.price IS 'Price for the additional service in CHF';

-- Set default price for existing services
UPDATE additional_services
SET price = 0.00
WHERE price IS NULL;
```

### 4. Execute
- Click the **Run** button (or press Ctrl+Enter)
- You should see "Success. No rows returned"

### 5. Verify
Go back to your Settings page and try updating a service. The error should be gone!

## What This Does:
- Adds a `price` column to the `additional_services` table
- Sets default value to 0.00 CHF
- Updates any existing services to have 0.00 as the price

## Troubleshooting:
If you still see errors after running the migration:
1. Open your browser's Developer Console (F12)
2. Go to the Console tab
3. Try updating again and check what error message appears
4. The error will now show: "Fehler beim Aktualisieren der Zusatzleistung: [detailed error message]"
5. Share this detailed error message for further help
