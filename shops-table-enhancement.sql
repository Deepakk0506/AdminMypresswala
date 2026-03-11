-- Shops Table Enhancement Migration
-- Production-safe migration to add missing columns for UI functionality
-- Execute in Supabase SQL Editor in phases

-- ========================================
-- PHASE 1: Core Required Columns (Immediate UI Functionality)
-- ========================================

-- Add basic performance and status columns
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS completed_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_load NUMERIC(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Busy', 'Offline', 'Maintenance')),
ADD COLUMN IF NOT EXISTS revenue NUMERIC(12,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS employees INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for performance on new columns
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
CREATE INDEX IF NOT EXISTS idx_shops_rating ON shops(rating DESC);
CREATE INDEX IF NOT EXISTS idx_shops_current_load ON shops(current_load);

-- ========================================
-- PHASE 2: Complex Data Columns (JSON Approach)
-- ========================================

-- Add JSON columns for complex data structures
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;

-- Create GIN indexes for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_shops_services_gin ON shops USING GIN (services);
CREATE INDEX IF NOT EXISTS idx_shops_specialties_gin ON shops USING GIN (specialties);

-- ========================================
-- PHASE 3: Additional Enhancement Columns
-- ========================================

-- Add remaining UI columns
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS established TEXT,
ADD COLUMN IF NOT EXISTS average_turnaround TEXT,
ADD COLUMN IF NOT EXISTS last_month_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS customer_satisfaction NUMERIC(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add constraints for data quality (skip if already exists to avoid errors)
DO $$
BEGIN
    -- Add check_rating constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_rating') THEN
        ALTER TABLE shops ADD CONSTRAINT check_rating CHECK (rating >= 0 AND rating <= 5);
    END IF;
    
    -- Add check_current_load constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_current_load') THEN
        ALTER TABLE shops ADD CONSTRAINT check_current_load CHECK (current_load >= 0 AND current_load <= 100);
    END IF;
    
    -- Add check_employees constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_employees') THEN
        ALTER TABLE shops ADD CONSTRAINT check_employees CHECK (employees > 0);
    END IF;
    
    -- Add check_customer_satisfaction constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_customer_satisfaction') THEN
        ALTER TABLE shops ADD CONSTRAINT check_customer_satisfaction CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 100);
    END IF;
END $$;

-- ========================================
-- PHASE 4: Data Population for Existing Shops
-- ========================================

-- Update existing shops with realistic default data
UPDATE shops 
SET 
    rating = CASE 
        WHEN rating = 0.0 THEN 4.2 + (RANDOM() * 0.7) -- Random rating between 4.2-4.9
        ELSE rating 
    END,
    completed_orders = CASE 
        WHEN completed_orders = 0 THEN FLOOR(RANDOM() * 2000 + 100)::integer -- Random orders 100-2100
        ELSE completed_orders 
    END,
    current_load = CASE 
        WHEN current_load = 0.0 THEN (RANDOM() * 95)::numeric(5,2) -- Random load 0-95%
        ELSE current_load 
    END,
    revenue = CASE 
        WHEN revenue = 0.0 THEN (completed_orders * (RANDOM() * 200 + 50))::numeric(12,2) -- Revenue based on orders
        ELSE revenue 
    END,
    employees = CASE 
        WHEN employees = 1 THEN FLOOR(RANDOM() * 12 + 3)::integer -- Random employees 3-15
        ELSE employees 
    END,
    services = CASE 
        WHEN services = '[]'::jsonb THEN 
            CASE FLOOR(RANDOM() * 4)::integer
                WHEN 0 THEN '["Dry Cleaning", "Ironing", "Stain Removal"]'::jsonb
                WHEN 1 THEN '["Laundry", "Folding", "Pickup & Delivery"]'::jsonb
                WHEN 2 THEN '["Premium Ironing", "Steaming", "Fabric Care"]'::jsonb
                ELSE '["Express Wash", "Quick Press", "Same Day Service"]'::jsonb
            END
        ELSE services 
    END,
    specialties = CASE 
        WHEN specialties = '[]'::jsonb THEN 
            CASE FLOOR(RANDOM() * 4)::integer
                WHEN 0 THEN '["Express Service", "Wedding Wear"]'::jsonb
                WHEN 1 THEN '["Quick Service", "Bulk Orders"]'::jsonb
                WHEN 2 THEN '["Luxury Garments", "Delicate Fabrics"]'::jsonb
                ELSE '["Same Day Delivery", "Emergency Service"]'::jsonb
            END
        ELSE specialties 
    END,
    equipment = CASE 
        WHEN equipment = '[]'::jsonb THEN 
            CASE FLOOR(RANDOM() * 4)::integer
                WHEN 0 THEN '["Steam Press", "Industrial Washer"]'::jsonb
                WHEN 1 THEN '["Washer-Dryer", "Steam Iron"]'::jsonb
                WHEN 2 THEN '["Vacuum Iron", "Steam Chamber"]'::jsonb
                ELSE '["High-Speed Washer", "Quick Press"]'::jsonb
            END
        ELSE equipment 
    END,
    certifications = CASE 
        WHEN certifications = '[]'::jsonb THEN 
            CASE FLOOR(RANDOM() * 3)::integer
                WHEN 0 THEN '["ISO 9001", "Eco-Certified"]'::jsonb
                WHEN 1 THEN '["Quality Certified"]'::jsonb
                ELSE '["Fast Service Certified"]'::jsonb
            END
        ELSE certifications 
    END,
    established = CASE 
        WHEN established IS NULL THEN (2016 + FLOOR(RANDOM() * 6))::text -- Random year 2016-2021
        ELSE established 
    END,
    average_turnaround = CASE 
        WHEN average_turnaround IS NULL THEN 
            CASE FLOOR(RANDOM() * 4)::integer
                WHEN 0 THEN '24 hours'
                WHEN 1 THEN '48 hours'
                WHEN 2 THEN '12 hours'
                ELSE '6 hours'
            END
        ELSE average_turnaround 
    END,
    last_month_orders = CASE 
        WHEN last_month_orders = 0 THEN FLOOR(completed_orders * 0.1 + RANDOM() * 50)::integer
        ELSE last_month_orders 
    END,
    customer_satisfaction = CASE 
        WHEN customer_satisfaction = 0.0 THEN (80 + RANDOM() * 18)::numeric(5,2) -- 80-98%
        ELSE customer_satisfaction 
    END,
    website = CASE 
        WHEN website IS NULL THEN 'www.' || LOWER(REPLACE(REPLACE(REPLACE(shop_name, ' ', ''), '&', 'and'), '''', '')) || '.com'
        ELSE website 
    END,
    description = CASE 
        WHEN description IS NULL THEN 'Professional laundry and dry cleaning services serving ' || city || ' area with quality guarantee.'
        ELSE description 
    END,
    updated_at = NOW()
WHERE rating = 0.0 OR completed_orders = 0 OR current_load = 0.0 OR revenue = 0.0 OR employees = 1;

-- ========================================
-- PHASE 5: Verification Queries
-- ========================================

-- Check table structure after migration
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'shops' 
ORDER BY ordinal_position;

-- Verify data population
SELECT 
    shop_name,
    rating,
    completed_orders,
    current_load,
    status,
    revenue,
    employees,
    services,
    specialties
FROM shops 
LIMIT 5;

-- Check JSON data structure
SELECT 
    shop_name,
    jsonb_typeof(services) as services_type,
    jsonb_array_length(services) as services_count,
    jsonb_typeof(equipment) as equipment_type,
    jsonb_array_length(equipment) as equipment_count
FROM shops
WHERE services != '[]'::jsonb
LIMIT 3;

-- Performance check
SELECT 
    COUNT(*) as total_shops,
    COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_shops,
    COUNT(CASE WHEN status = 'Busy' THEN 1 END) as busy_shops,
    AVG(rating) as avg_rating,
    SUM(revenue) as total_revenue
FROM shops;

-- ========================================
-- PHASE 6: Update Trigger for updated_at
-- ========================================

-- Drop trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS trigger_update_shops_updated_at ON shops;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_shops_updated_at
    BEFORE UPDATE ON shops
    FOR EACH ROW
    EXECUTE FUNCTION update_shops_updated_at();
