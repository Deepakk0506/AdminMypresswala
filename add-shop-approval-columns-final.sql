-- Add Shop Approval Columns - Final Fixed Version
-- Add columns to existing tables safely

-- 1. Add shop approval columns to notifications table
DO $$
BEGIN
    -- Add related_shop_id column if it doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_shop_id' AND table_schema = 'public') THEN
            ALTER TABLE notifications ADD COLUMN related_shop_id UUID;
        END IF;
        
        -- Update notification_type column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'notification_type' AND table_schema = 'public') THEN
            ALTER TABLE notifications ADD COLUMN notification_type TEXT DEFAULT 'general';
        END IF;
    END IF;
END $$;

-- 2. Add constraint to notification_type separately
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'notification_type' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_notification_type_check') THEN
            ALTER TABLE notifications ADD CONSTRAINT notifications_notification_type_check 
            CHECK (notification_type IN ('general', 'shop_approval', 'shop_rejection', 'order_update', 'promotion', 'system'));
        END IF;
    END IF;
END $$;

-- 3. Create indexes (outside DO blocks)
CREATE INDEX IF NOT EXISTS idx_notifications_related_shop_id ON notifications(related_shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- 4. Add foreign key constraints (only if tables exist)
DO $$
BEGIN
    -- Add foreign key for notifications.related_shop_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_shop_id' AND table_schema = 'public') THEN
        -- Check if constraint doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_related_shop_id') THEN
            ALTER TABLE notifications 
            ADD CONSTRAINT fk_notifications_related_shop_id 
            FOREIGN KEY (related_shop_id) REFERENCES shops(id) ON DELETE SET NULL;
        END IF;
    END IF;
    
    -- Add foreign key for staff.shop_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'shop_id' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_staff_shop_id') THEN
            ALTER TABLE staff 
            ADD CONSTRAINT fk_staff_shop_id 
            FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key for inventory.shop_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory' AND table_schema = 'public') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'shop_id' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_inventory_shop_id') THEN
            ALTER TABLE inventory 
            ADD CONSTRAINT fk_inventory_shop_id 
            FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key for deliveries.shop_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliveries' AND table_schema = 'public') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliveries' AND column_name = 'shop_id' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_deliveries_shop_id') THEN
            ALTER TABLE deliveries 
            ADD CONSTRAINT fk_deliveries_shop_id 
            FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- 5. Verification - Check current table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('staff', 'inventory', 'deliveries', 'notifications')
AND table_schema = 'public'
AND column_name IN ('shop_id', 'related_shop_id', 'notification_type')
ORDER BY table_name, column_name;
