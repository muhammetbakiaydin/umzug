# Database Migrations

## How to Run Migrations

To apply database migrations to your Supabase project:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `hiymzyupxochrcsrwzwk`
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the contents of the migration file you want to run
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

## Latest Migration

### add_additional_services_price.sql

This migration adds a `price` field to the `additional_services` table to store the price for each additional service in CHF.

**Changes:**
- Adds `price` DECIMAL(10,2) column with default value 0.00
- Sets default price for all existing services to 0.00

**To apply this migration:**
1. Open the file: `supabase/migrations/add_additional_services_price.sql`
2. Copy the SQL content
3. Run it in Supabase SQL Editor

## Note

You need to manually run each migration file in the Supabase SQL Editor to apply changes to your database.
