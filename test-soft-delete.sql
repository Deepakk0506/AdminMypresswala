-- Test Soft Delete Functionality
-- Run this to verify soft delete is working correctly

-- 1. Check current shops status
SELECT 
    shop_name,
    CASE 
        WHEN deleted_at IS NULL THEN 'Active'
        ELSE 'Deleted'
    END as status,
    deleted_at
FROM shops 
ORDER BY deleted_at NULLS LAST, shop_name;

-- 2. Test soft delete on a shop (uncomment to test)
-- UPDATE shops 
-- SET deleted_at = NOW() 
-- WHERE shop_name = 'Premium Press Point';

-- 3. Test restoring a shop (uncomment to test)
-- UPDATE shops 
-- SET deleted_at = NULL 
-- WHERE shop_name = 'Premium Press Point';

-- 4. Query that the UI uses (should only show active shops)
SELECT * FROM shops WHERE deleted_at IS NULL ORDER BY created_at DESC;

-- 5. Query to show deleted shops (for admin purposes)
SELECT 
    shop_name,
    deleted_at,
    EXTRACT(EPOCH FROM (NOW() - deleted_at))/3600 as hours_ago
FROM shops 
WHERE deleted_at IS NOT NULL 
ORDER BY deleted_at DESC;
