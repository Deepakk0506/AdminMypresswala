-- Debug Shops Table - Run this to check current state
-- ========================================

-- 1. Check if shops table exists and has the new columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'shops' 
ORDER BY ordinal_position;

-- 2. Check if there's any data in shops table
SELECT COUNT(*) as total_shops FROM shops;

-- 3. Show sample data if exists
SELECT 
    id, 
    shop_name, 
    owner_name, 
    rating, 
    completed_orders, 
    current_load, 
    status, 
    revenue, 
    employees, 
    created_at, 
    updated_at
FROM shops 
LIMIT 5;

-- 4. Check if new columns have default values
SELECT 
    shop_name,
    COALESCE(rating, 0) as rating,
    COALESCE(completed_orders, 0) as completed_orders,
    COALESCE(current_load, 0) as current_load,
    COALESCE(status, 'No Status') as status,
    COALESCE(revenue, 0) as revenue,
    COALESCE(employees, 0) as employees
FROM shops
LIMIT 3;

-- 5. Check JSON columns structure
SELECT 
    shop_name,
    CASE 
        WHEN services IS NULL THEN 'NULL'
        WHEN jsonb_typeof(services) = 'array' THEN 'Array: ' || jsonb_array_length(services)::text
        ELSE 'Type: ' || jsonb_typeof(services)
    END as services_info,
    CASE 
        WHEN specialties IS NULL THEN 'NULL'
        WHEN jsonb_typeof(specialties) = 'array' THEN 'Array: ' || jsonb_array_length(specialties)::text
        ELSE 'Type: ' || jsonb_typeof(specialties)
    END as specialties_info
FROM shops
LIMIT 3;

-- 6. Test simple insert to see if table is writable
INSERT INTO shops (
    shop_name, 
    owner_name, 
    phone, 
    email, 
    address, 
    city, 
    state, 
    pincode, 
    opening_time, 
    closing_time,
    rating,
    completed_orders,
    current_load,
    status,
    revenue,
    employees
) VALUES (
    'Test Shop',
    'Test Owner',
    '+91 12345 67890',
    'test@example.com',
    'Test Address',
    'Test City',
    'Test State',
    '560001',
    '09:00:00',
    '18:00:00',
    4.5,
    100,
    50.0,
    'Active',
    50000.00,
    5
) ON CONFLICT (id) DO NOTHING;

-- 7. Check if test insert worked
SELECT shop_name, owner_name, rating, status FROM shops WHERE shop_name = 'Test Shop';

-- 8. Clean up test data
DELETE FROM shops WHERE shop_name = 'Test Shop';
