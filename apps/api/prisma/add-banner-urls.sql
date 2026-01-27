-- Add bannerUrls column (text array) to users table
-- Safe: uses IF NOT EXISTS to avoid errors if column already present
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "bannerUrls" text[] NOT NULL DEFAULT '{}'::text[];
