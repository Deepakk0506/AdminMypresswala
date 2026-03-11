-- UI Debug Check - Run this to see what the UI expects vs what we have
-- ========================================

-- 1. Check if we have any shops at all
SELECT COUNT(*) as shop_count FROM shops;

-- 2. Show basic shop info (what the UI search looks for)
SELECT 
    shop_name,
    owner_name,
    address || ', ' || city || ', ' || state as full_location,
    rating,
    completed_orders,
    current_load,
    status
FROM shops 
LIMIT 3;

-- 3. Check JSON data format (UI expects arrays)
SELECT 
    shop_name,
    CASE 
        WHEN services IS NULL THEN 'NULL services'
        WHEN jsonb_typeof(services) = 'array' THEN 'Good: ' || services::text
        ELSE 'Bad type: ' || jsonb_typeof(services)
    END as services_check,
    CASE 
        WHEN specialties IS NULL THEN 'NULL specialties'
        WHEN jsonb_typeof(specialties) = 'array' THEN 'Good: ' || specialties::text
        ELSE 'Bad type: ' || jsonb_typeof(specialties)
    END as specialties_check
FROM shops 
LIMIT 3;

-- 4. Test the exact query the UI uses
SELECT * FROM shops ORDER BY created_at DESC LIMIT 5;
