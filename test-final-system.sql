-- Final System Test - Verify Everything Works
-- Run this to check the complete approval system

-- 1. Check shops table with approval columns
SELECT 
    shop_name,
    approval_status,
    category,
    submitted_at,
    approved_at
FROM shops 
ORDER BY submitted_at DESC;

-- 2. Check pending shops (for approval dashboard)
SELECT 
    shop_name,
    owner_name,
    email,
    category,
    approval_status,
    submitted_at
FROM shops 
WHERE approval_status = 'pending'
ORDER BY submitted_at DESC;

-- 3. Check approved shops (for main UI)
SELECT 
    shop_name,
    approval_status,
    category,
    approved_at
FROM shops 
WHERE approval_status IN ('approved', 'active')
ORDER BY approved_at DESC;

-- 4. Check related tables exist and have proper columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('staff', 'inventory', 'deliveries', 'notifications')
AND column_name IN ('shop_id', 'related_shop_id', 'notification_type')
ORDER BY table_name, column_name;

-- 5. Check notifications for shop approval events
SELECT 
    title,
    message,
    type,
    related_shop_id,
    created_at
FROM notifications 
WHERE type IN ('shop_approval', 'shop_rejection')
ORDER BY created_at DESC;

-- 6. Summary statistics
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
WHERE approval_status = 'pending'

UNION ALL

SELECT 
    'Approved Shops' as metric,
    COUNT(*) as value
FROM shops
WHERE approval_status = 'approved'

UNION ALL

SELECT 
    'Active Shops' as metric,
    COUNT(*) as value
FROM shops
WHERE approval_status = 'active';
