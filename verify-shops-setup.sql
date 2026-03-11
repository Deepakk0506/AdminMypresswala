-- Final Verification - Shops Table Setup
-- Run this to confirm everything is working for the UI

-- 1. Check final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shops' 
ORDER BY ordinal_position;

-- 2. Check total shops and basic stats
SELECT 
    COUNT(*) as total_shops,
    COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_shops,
    COUNT(CASE WHEN status = 'Busy' THEN 1 END) as busy_shops,
    AVG(rating) as avg_rating,
    SUM(revenue) as total_revenue
FROM shops;

-- 3. Show sample shop data (what the UI will see)
SELECT 
    shop_name,
    owner_name,
    rating,
    completed_orders,
    current_load,
    status,
    revenue,
    employees,
    services,
    specialties,
    phone,
    email,
    website,
    created_at,
    updated_at
FROM shops 
LIMIT 3;

-- 4. Test the UI field mapping
SELECT 
    shop_name as "name",
    owner_name as "owner", 
    address || ', ' || city || ', ' || state as "location",
    completed_orders as "completedOrders",
    current_load as "currentLoad",
    rating,
    status,
    services,
    phone,
    email,
    website
FROM shops 
LIMIT 2;
