-- Shop Approval System - Safe Related Tables Update
-- Only update tables that exist

-- 1. Check if tables exist before updating
DO $$
BEGIN
    -- Update staff table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public') THEN
        -- Check if store_id column exists before renaming
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'store_id' AND table_schema = 'public') THEN
            ALTER TABLE staff RENAME COLUMN store_id TO shop_id;
            RAISE NOTICE 'Renamed store_id to shop_id in staff table';
        END IF;
        
        -- Create index if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_staff_shop_id ON staff(shop_id);
        RAISE NOTICE 'Created index on staff.shop_id';
    ELSE
        RAISE NOTICE 'Staff table does not exist, skipping updates';
    END IF;

    -- Update inventory table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory' AND table_schema = 'public') THEN
        -- Check if store_id column exists before renaming
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'store_id' AND table_schema = 'public') THEN
            ALTER TABLE inventory RENAME COLUMN store_id TO shop_id;
            RAISE NOTICE 'Renamed store_id to shop_id in inventory table';
        END IF;
        
        -- Create index if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_inventory_shop_id ON inventory(shop_id);
        RAISE NOTICE 'Created index on inventory.shop_id';
    ELSE
        RAISE NOTICE 'Inventory table does not exist, skipping updates';
    END IF;

    -- Update deliveries table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliveries' AND table_schema = 'public') THEN
        -- Add shop_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliveries' AND column_name = 'shop_id' AND table_schema = 'public') THEN
            ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id);
            RAISE NOTICE 'Added shop_id column to deliveries table';
        END IF;
        
        -- Create index if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_deliveries_shop_id ON deliveries(shop_id);
        RAISE NOTICE 'Created index on deliveries.shop_id';
    ELSE
        RAISE NOTICE 'Deliveries table does not exist, skipping updates';
    END IF;

    -- Update notifications table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        -- Add related_shop_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_shop_id' AND table_schema = 'public') THEN
            ALTER TABLE notifications 
            ADD COLUMN IF NOT EXISTS related_shop_id UUID REFERENCES shops(id);
            RAISE NOTICE 'Added related_shop_id column to notifications table';
        END IF;
        
        -- Add notification_type column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'notification_type' AND table_schema = 'public') THEN
            ALTER TABLE notifications 
            ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'general' CHECK (notification_type IN ('general', 'shop_approval', 'shop_rejection', 'order_update', 'promotion', 'system'));
            RAISE NOTICE 'Added notification_type column to notifications table';
        END IF;
        
        -- Create indexes if they don't exist
        CREATE INDEX IF NOT EXISTS idx_notifications_related_shop_id ON notifications(related_shop_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
        RAISE NOTICE 'Created indexes on notifications table';
    ELSE
        RAISE NOTICE 'Notifications table does not exist, skipping updates';
    END IF;
END $$;

-- 2. Create trigger function for shop approval validation (only if staff/inventory exist)
DO $$
BEGIN
    -- Only create trigger function if we have tables that need it
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public') OR
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory' AND table_schema = 'public') THEN
       
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
        
        RAISE NOTICE 'Created validate_shop_approval function';
    END IF;
END $$;

-- 3. Apply triggers to existing tables
DO $$
BEGIN
    -- Apply trigger to staff table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS validate_staff_shop_approval ON staff;
        CREATE TRIGGER validate_staff_shop_approval
            BEFORE INSERT OR UPDATE ON staff
            FOR EACH ROW
            EXECUTE FUNCTION validate_shop_approval();
        RAISE NOTICE 'Applied trigger to staff table';
    END IF;

    -- Apply trigger to inventory table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS validate_inventory_shop_approval ON inventory;
        CREATE TRIGGER validate_inventory_shop_approval
            BEFORE INSERT OR UPDATE ON inventory
            FOR EACH ROW
            EXECUTE FUNCTION validate_shop_approval();
        RAISE NOTICE 'Applied trigger to inventory table';
    END IF;
END $$;

-- 4. Verification - Show current table status
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('staff', 'inventory', 'deliveries', 'notifications')
AND table_schema = 'public'
AND column_name IN ('shop_id', 'related_shop_id', 'notification_type')
ORDER BY table_name, column_name;
