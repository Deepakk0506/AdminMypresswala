-- Phase 1 Services Table Migration
-- Execute this in Supabase SQL Editor

-- 1. Add Phase 1 Customer-Facing Columns
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS duration_estimate TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_services_service_code ON services(service_code);
CREATE INDEX IF NOT EXISTS idx_services_popularity ON services(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- 3. Add Constraints for Data Quality
ALTER TABLE services 
ADD CONSTRAINT IF NOT EXISTS check_popularity_score CHECK (popularity_score >= 0 AND popularity_score <= 100),
ADD CONSTRAINT IF NOT EXISTS check_min_order_quantity CHECK (min_order_quantity > 0);

-- 4. Update Existing Records with Default Values
UPDATE services 
SET 
    duration_estimate = 'Usually ready in 2-3 days',
    min_order_quantity = 1,
    popularity_score = 50,
    service_code = 'SRV' || LPAD(id::text, 4, '0'),
    updated_at = NOW()
WHERE duration_estimate IS NULL OR service_code IS NULL;

-- 5. Verification Query
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;
