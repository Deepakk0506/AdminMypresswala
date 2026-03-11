-- Shop Approval System - Related Tables Update
-- Connect approval system with all related tables

-- 1. Rename store_id to shop_id for consistency
ALTER TABLE staff RENAME COLUMN store_id TO shop_id;

-- 2. Add shop_id to deliveries table (if not exists)
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id);

-- 3. Enhance notifications table for shop approval workflow
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_shop_id UUID REFERENCES shops(id),
ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'general' CHECK (notification_type IN ('general', 'shop_approval', 'shop_rejection', 'order_update', 'promotion', 'system'));

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_shop_id ON staff(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_shop_id ON inventory(shop_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_shop_id ON deliveries(shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_shop_id ON notifications(related_shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- 5. Add constraints to ensure only approved shops can have related data
-- Note: PostgreSQL doesn't support conditional foreign keys directly, 
-- so we'll use triggers for this logic

-- 6. Create trigger function to validate shop approval status
CREATE OR REPLACE FUNCTION validate_shop_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if shop is approved when inserting/updating related data
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.shop_id IS NOT NULL THEN
            -- Check if shop is approved
            PERFORM 1 FROM shops WHERE id = NEW.shop_id AND approval_status IN ('approved', 'active');
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Shop must be approved to create related records';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Apply triggers to related tables
DROP TRIGGER IF EXISTS validate_staff_shop_approval ON staff;
CREATE TRIGGER validate_staff_shop_approval
    BEFORE INSERT OR UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION validate_shop_approval();

DROP TRIGGER IF EXISTS validate_inventory_shop_approval ON inventory;
CREATE TRIGGER validate_inventory_shop_approval
    BEFORE INSERT OR UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION validate_shop_approval();

-- 8. Update existing records to ensure they reference approved shops
-- Update staff records
UPDATE staff 
SET shop_id = NULL 
WHERE shop_id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM shops 
    WHERE shops.id = staff.shop_id 
    AND shops.approval_status IN ('approved', 'active')
);

-- Update inventory records
UPDATE inventory 
SET shop_id = NULL 
WHERE shop_id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM shops 
    WHERE shops.id = inventory.shop_id 
    AND shops.approval_status IN ('approved', 'active')
);

-- 9. Update deliveries to reference shops through orders
UPDATE deliveries 
SET shop_id = (
    SELECT o.shop_id 
    FROM orders o 
    WHERE o.id = deliveries.order_id
    AND o.shop_id IS NOT NULL
)
WHERE deliveries.shop_id IS NULL
AND EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = deliveries.order_id 
    AND o.shop_id IS NOT NULL
);

-- 10. Verification queries
-- Check staff table
SELECT 
    'staff' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN shop_id IS NOT NULL THEN 1 END) as with_shop_id,
    COUNT(CASE WHEN shop_id IS NULL THEN 1 END) as without_shop_id
FROM staff;

-- Check inventory table  
SELECT 
    'inventory' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN shop_id IS NOT NULL THEN 1 END) as with_shop_id,
    COUNT(CASE WHEN shop_id IS NULL THEN 1 END) as without_shop_id
FROM inventory;

-- Check deliveries table
SELECT 
    'deliveries' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN shop_id IS NOT NULL THEN 1 END) as with_shop_id,
    COUNT(CASE WHEN shop_id IS NULL THEN 1 END) as without_shop_id
FROM deliveries;

-- Check notification types
SELECT 
    notification_type,
    COUNT(*) as count
FROM notifications 
GROUP BY notification_type
ORDER BY notification_type;
