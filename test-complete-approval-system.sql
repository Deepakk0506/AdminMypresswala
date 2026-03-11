-- Complete Approval System Test
-- Test the entire shop approval workflow

-- 1. Check all related tables are properly connected
SELECT 
    'shops' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN approval_status = 'active' THEN 1 END) as active,
    COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected
FROM shops

UNION ALL

SELECT 
    'staff' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN shop_id IS NOT NULL THEN 1 END) as with_shop,
    COUNT(CASE WHEN shop_id IS NULL THEN 1 END) as without_shop,
    0 as approved,
    0 as active
FROM staff

UNION ALL

SELECT 
    'inventory' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN shop_id IS NOT NULL THEN 1 END) as with_shop,
    COUNT(CASE WHEN shop_id IS NULL THEN 1 END) as without_shop,
    0 as approved,
    0 as active
FROM inventory

UNION ALL

SELECT 
    'notifications' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN notification_type = 'shop_approval' THEN 1 END) as shop_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
    0 as approved,
    0 as active
FROM notifications;

-- 2. Test shop submission workflow
-- Create a test pending shop
INSERT INTO shops (
    shop_name, owner_name, phone, email, address, city, state, pincode,
    opening_time, closing_time, category, services, employees,
    approval_status, submitted_at
) VALUES (
    'Test Approval Shop',
    'Test Owner',
    '+91 98765 43210',
    'test@approval.com',
    '456 Test Avenue',
    'Test City',
    'Test State',
    '560002',
    '08:00:00',
    '20:00:00',
    'Laundry & Dry Cleaning',
    '["Dry Cleaning", "Laundry", "Stain Removal"]',
    3,
    'pending',
    NOW()
) RETURNING id, shop_name, approval_status, submitted_at;

-- 3. Test notification creation for shop submission
SELECT 
    title,
    message,
    type,
    related_shop_id,
    is_read,
    created_at
FROM notifications 
WHERE type = 'shop_approval'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Test approval workflow simulation
-- Approve the test shop (uncomment to test)
-- UPDATE shops 
-- SET approval_status = 'approved', approved_at = NOW()
-- WHERE shop_name = 'Test Approval Shop';

-- 5. Test rejection workflow simulation
-- Reject the test shop with reason (uncomment to test)
-- UPDATE shops 
-- SET approval_status = 'rejected', rejection_reason = 'Insufficient documentation', approved_at = NOW()
-- WHERE shop_name = 'Test Approval Shop';

-- 6. Check shop visibility in main UI (should only show approved/active)
SELECT 
    shop_name,
    approval_status,
    category,
    submitted_at,
    approved_at
FROM shops 
WHERE deleted_at IS NULL 
AND approval_status IN ('approved', 'active')
ORDER BY created_at DESC;

-- 7. Check pending shops for admin dashboard
SELECT 
    shop_name,
    owner_name,
    email,
    phone,
    category,
    submitted_at,
    approval_status
FROM shops 
WHERE deleted_at IS NULL 
AND approval_status = 'pending'
ORDER BY submitted_at DESC;

-- 8. Test foreign key constraints (should prevent invalid shop assignments)
-- This should fail if shop is not approved (uncomment to test)
-- INSERT INTO staff (name, email, role, shop_id)
-- VALUES ('Test Staff', 'staff@test.com', 'manager', 'invalid-shop-id');

-- 9. Check notification system integration
SELECT 
    n.title,
    n.message,
    n.type,
    s.shop_name,
    n.created_at
FROM notifications n
LEFT JOIN shops s ON n.related_shop_id = s.id
WHERE n.type IN ('shop_approval', 'shop_rejection')
ORDER BY n.created_at DESC;

-- 10. Performance check - indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('shops', 'staff', 'inventory', 'notifications')
AND indexname LIKE '%approval%' OR indexname LIKE '%shop%' OR indexname LIKE '%notification%'
ORDER BY tablename, indexname;

-- 11. Data integrity check
SELECT 
    'Orphaned Staff Records' as issue,
    COUNT(*) as count
FROM staff s
WHERE s.shop_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM shops sh 
    WHERE sh.id = s.shop_id 
    AND sh.approval_status IN ('approved', 'active')
)

UNION ALL

SELECT 
    'Orphaned Inventory Records' as issue,
    COUNT(*) as count
FROM inventory i
WHERE i.shop_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM shops sh 
    WHERE sh.id = i.shop_id 
    AND sh.approval_status IN ('approved', 'active')
);

-- 12. Summary statistics
SELECT 
    'Total Shops' as metric,
    COUNT(*) as value
FROM shops
WHERE deleted_at IS NULL

UNION ALL

SELECT 
    'Pending Approval' as metric,
    COUNT(*) as value
FROM shops
WHERE deleted_at IS NULL AND approval_status = 'pending'

UNION ALL

SELECT 
    'Approved Shops' as metric,
    COUNT(*) as value
FROM shops
WHERE deleted_at IS NULL AND approval_status = 'approved'

UNION ALL

SELECT 
    'Active Shops' as metric,
    COUNT(*) as value
FROM shops
WHERE deleted_at IS NULL AND approval_status = 'active'

UNION ALL

SELECT 
    'Rejected Shops' as metric,
    COUNT(*) as value
FROM shops
WHERE deleted_at IS NULL AND approval_status = 'rejected'

UNION ALL

SELECT 
    'Shop Notifications' as metric,
    COUNT(*) as value
FROM notifications
WHERE type IN ('shop_approval', 'shop_rejection');
