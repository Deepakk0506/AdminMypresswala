-- Add Category Column to Services Table
-- Execute this in Supabase SQL Editor

-- 1. Add category column
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Update existing services with categories
UPDATE services 
SET category = CASE 
    WHEN LOWER(service_name) LIKE '%laundry%' OR LOWER(name) LIKE '%laundry%' THEN 'Laundry'
    WHEN LOWER(service_name) LIKE '%ironing%' OR LOWER(name) LIKE '%ironing%' THEN 'Ironing'
    WHEN LOWER(service_name) LIKE '%dry cleaning%' OR LOWER(name) LIKE '%dry%' THEN 'Dry Cleaning'
    WHEN LOWER(service_name) LIKE '%pressing%' OR LOWER(name) LIKE '%pressing%' THEN 'Pressing'
    WHEN LOWER(service_name) LIKE '%pickup%' OR LOWER(name) LIKE '%pickup%' THEN 'Pickup & Delivery'
    WHEN LOWER(service_name) LIKE '%delivery%' OR LOWER(name) LIKE '%delivery%' THEN 'Pickup & Delivery'
    WHEN LOWER(service_name) LIKE '%stain%' OR LOWER(name) LIKE '%stain%' THEN 'Stain Removal'
    ELSE 'Other'
END
WHERE category IS NULL;

-- 3. Verify the column was added
SELECT id, service_name, name, category, price, description 
FROM services 
ORDER BY id;
