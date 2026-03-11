-- Test Shop Creation Functionality
-- Run this to verify the approval system is working

-- 1. Check current approval status distribution
SELECT 
    approval_status,
    COUNT(*) as count,
    category
FROM shops 
GROUP BY approval_status, category
ORDER BY approval_status;

-- 2. Test creating a pending shop (uncomment to test)
-- INSERT INTO shops (
--     shop_name, owner_name, phone, email, address, city, state, pincode,
--     opening_time, closing_time, category, services, employees,
--     approval_status, submitted_at
-- ) VALUES (
--     'Test Shop Creation',
--     'Test Owner',
--     '+91 12345 67890',
--     'test@shop.com',
--     '123 Test Street',
--     'Test City',
--     'Test State',
--     '560001',
--     '09:00:00',
--     '18:00:00',
--     'Laundry & Dry Cleaning',
--     '["Dry Cleaning", "Laundry"]',
--     2,
--     'pending',
--     NOW()
-- );

-- 3. Query that the main UI uses (should only show approved shops)
SELECT 
    shop_name,
    approval_status,
    category,
    submitted_at
FROM shops 
WHERE deleted_at IS NULL 
AND approval_status IN ('approved', 'active')
ORDER BY created_at DESC;

-- 4. Query for admin approval dashboard (pending shops)
SELECT 
    shop_name,
    owner_name,
    category,
    submitted_at,
    phone,
    email
FROM shops 
WHERE deleted_at IS NULL 
AND approval_status = 'pending'
ORDER BY submitted_at DESC;
