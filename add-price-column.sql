-- Add Price Column to Existing Services Table
-- Execute this in Supabase SQL Editor

-- 1. Add price column to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;

-- 2. Add constraint to ensure price is non-negative
ALTER TABLE services 
ADD CONSTRAINT IF NOT EXISTS check_price_non_negative CHECK (price >= 0);

-- 3. Update existing services with default prices (optional)
-- You can customize these values based on your services
UPDATE services 
SET price = CASE 
    WHEN LOWER(service_name) LIKE '%laundry%' OR LOWER(name) LIKE '%laundry%' THEN 29.99
    WHEN LOWER(service_name) LIKE '%ironing%' OR LOWER(name) LIKE '%ironing%' THEN 15.99
    WHEN LOWER(service_name) LIKE '%dry cleaning%' OR LOWER(name) LIKE '%dry%' THEN 39.99
    WHEN LOWER(service_name) LIKE '%pressing%' OR LOWER(name) LIKE '%pressing%' THEN 19.99
    WHEN LOWER(service_name) LIKE '%pickup%' OR LOWER(name) LIKE '%pickup%' THEN 9.99
    WHEN LOWER(service_name) LIKE '%delivery%' OR LOWER(name) LIKE '%delivery%' THEN 9.99
    WHEN LOWER(service_name) LIKE '%stain%' OR LOWER(name) LIKE '%stain%' THEN 24.99
    ELSE 25.00 -- Default price for other services
END
WHERE price IS NULL OR price = 0.00;

-- 4. Verify the price column was added and populated
SELECT 
    id, 
    service_name, 
    name, 
    price, 
    description,
    category,
    status,
    created_at
FROM services 
ORDER BY id;

-- 5. Check table structure to confirm price column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'services' AND column_name = 'price';
