-- Fix Services Table Schema and Permissions
-- Execute this in Supabase SQL Editor

-- 1. Ensure all required columns exist with correct names
ALTER TABLE services
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS duration_estimate TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add constraints (using DO block to handle conditional creation)
DO $$
BEGIN
    -- Add price constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.constraint_name = 'check_price_non_negative'
        AND tc.table_name = 'services'
        AND tc.constraint_type = 'CHECK'
    ) THEN
        ALTER TABLE services ADD CONSTRAINT check_price_non_negative CHECK (price >= 0);
    END IF;

    -- Add popularity score constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.constraint_name = 'check_popularity_score'
        AND tc.table_name = 'services'
        AND tc.constraint_type = 'CHECK'
    ) THEN
        ALTER TABLE services ADD CONSTRAINT check_popularity_score CHECK (popularity_score >= 0 AND popularity_score <= 100);
    END IF;

    -- Add min order quantity constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.constraint_name = 'check_min_order_quantity'
        AND tc.table_name = 'services'
        AND tc.constraint_type = 'CHECK'
    ) THEN
        ALTER TABLE services ADD CONSTRAINT check_min_order_quantity CHECK (min_order_quantity > 0);
    END IF;
END $$;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_service_code ON services(service_code);
CREATE INDEX IF NOT EXISTS idx_services_popularity ON services(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- 4. Disable RLS to allow full access (if you want public access)
-- Uncomment the next line if you want to disable RLS completely
-- ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for authenticated users (if using auth)
-- Uncomment these lines if you want to use RLS with authentication
/*
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read services
DROP POLICY IF EXISTS "services_select_policy" ON services;
CREATE POLICY "services_select_policy" ON services
FOR SELECT USING (true);

-- Allow authenticated users to insert services
DROP POLICY IF EXISTS "services_insert_policy" ON services;
CREATE POLICY "services_insert_policy" ON services
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update services
DROP POLICY IF EXISTS "services_update_policy" ON services;
CREATE POLICY "services_update_policy" ON services
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete services
DROP POLICY IF EXISTS "services_delete_policy" ON services;
CREATE POLICY "services_delete_policy" ON services
FOR DELETE USING (auth.role() = 'authenticated');
*/

-- 6. Update existing records with default values
UPDATE services
SET
    service_name = COALESCE(service_name, name, 'Unnamed Service'),
    status = COALESCE(status, true),
    price = COALESCE(price, 0.00),
    min_order_quantity = COALESCE(min_order_quantity, 1),
    popularity_score = COALESCE(popularity_score, 0),
    updated_at = NOW()
WHERE service_name IS NULL OR status IS NULL;

-- 7. Verify the schema
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;

-- 8. Show current services data
SELECT
    id,
    service_name,
    description,
    price,
    category,
    status,
    created_at
FROM services
ORDER BY created_at DESC
LIMIT 10;
