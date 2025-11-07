# Database Migrations

## How to Run Migrations

To apply database migrations to your Supabase project:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `hiymzyupxochrcsrwzwk`
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the contents of the migration file you want to run
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

## ⚠️ URGENT Migrations (Must Run Now!)

### 🔴 20241108_add_missing_columns.sql
**Error it fixes:** `Could not find the 'base_price' column of 'service_categories'`

This migration adds missing columns to the `service_categories` table:
- `description` - Service category description
- `pricing_model` - Pricing type (hourly, fixed, custom)
- `hourly_rate` - Hourly rate for services
- `base_price` - Base price for fixed-rate services

**Status:** ⚠️ MUST BE APPLIED NOW! Settings page won't work without this.

### ⚠️ 20241105_allow_public_offer_read.sql

**Purpose:** Allows customers to view offer PDFs via email link without logging in.

This migration adds Row Level Security (RLS) policies that allow public read access to:
- `offers` table (for viewing PDF details)
- `company_settings` table (for VAT settings)

**Why this is needed:** When you send an offer PDF to a customer via email, they need to be able to view it without creating an account or logging in. This migration enables that while keeping all write operations (create, update, delete) protected.

**Security:** Only SELECT (read) operations are allowed publicly. All modifications still require authentication.

**Status:** ⚠️ MUST BE APPLIED for email PDF links to work!

## Latest Migrations

### 20241104_add_vat_enabled.sql

This migration adds a VAT toggle feature to control whether VAT is displayed on offers.

**Changes:**
- Adds `vat_enabled` BOOLEAN column to `company_settings` table
- Defaults to `true` (VAT shown)

**Status:** ⚠️ Needs to be applied for VAT toggle feature

### add_additional_services_price.sql

This migration adds a `price` field to the `additional_services` table to store the price for each additional service in CHF.

**Changes:**
- Adds `price` DECIMAL(10,2) column with default value 0.00
- Sets default price for all existing services to 0.00

## Note

You need to manually run each migration file in the Supabase SQL Editor to apply changes to your database.

