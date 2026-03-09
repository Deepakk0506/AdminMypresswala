-- Fix Missing Columns in Services Table
-- Execute this in Supabase SQL Editor to fix the schema error

-- 1. Add missing category column
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Add other essential columns that your app expects
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true;

-- 3. Update existing services with default values
UPDATE services 
SET 
    category = CASE 
        WHEN LOWER(service_name) LIKE '%laundry%' OR LOWER(name) LIKE '%laundry%' THEN 'Laundry'
        WHEN LOWER(service_name) LIKE '%ironing%' OR LOWER(name) LIKE '%ironing%' THEN 'Ironing'
        WHEN LOWER(service_name) LIKE '%dry cleaning%' OR LOWER(name) LIKE '%dry%' THEN 'Dry Cleaning'
        WHEN LOWER(service_name) LIKE '%pressing%' OR LOWER(name) LIKE '%pressing%' THEN 'Pressing'
        WHEN LOWER(service_name) LIKE '%pickup%' OR LOWER(name) LIKE '%pickup%' THEN 'Pickup & Delivery'
        WHEN LOWER(service_name) LIKE '%delivery%' OR LOWER(name) LIKE '%delivery%' THEN 'Pickup & Delivery'
        WHEN LOWER(service_name) LIKE '%stain%' OR LOWER(name) LIKE '%stain%' THEN 'Stain Removal'
        ELSE 'Other'
    END,
    duration = CASE 
        WHEN LOWER(service_name) LIKE '%laundry%' OR LOWER(name) LIKE '%laundry%' THEN '2-3 days'
        WHEN LOWER(service_name) LIKE '%ironing%' OR LOWER(name) LIKE '%ironing%' THEN '1-2 days'
        WHEN LOWER(service_name) LIKE '%dry cleaning%' OR LOWER(name) LIKE '%dry%' THEN '3-4 days'
        WHEN LOWER(service_name) LIKE '%pressing%' OR LOWER(name) LIKE '%pressing%' THEN '1-2 days'
        ELSE '2-3 days'
    END,
    status = COALESCE(status, true)
WHERE category IS NULL OR duration IS NULL;

-- 4. Verify all columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;

-- 5. Show updated services data
SELECT 
    id, 
    service_name, 
    name, 
    price,
    category,
    duration,
    status,
    description,
    created_at
FROM services 
ORDER BY id;
