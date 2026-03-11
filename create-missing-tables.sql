-- Create Missing Tables for Shop Approval System
-- Create tables that don't exist yet

-- 1. Create staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('manager', 'staff', 'delivery')),
    is_active BOOLEAN DEFAULT true,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 100,
    reorder_point INTEGER DEFAULT 15,
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create deliveries table if it doesn't exist
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    delivery_person_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    delivery_notes TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    distance_km DECIMAL(8,2),
    delivery_fee DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'shop_approval', 'shop_rejection', 'order_update', 'promotion', 'system')),
    related_shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_shop_id ON staff(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_shop_id ON inventory(shop_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_shop_id ON deliveries(shop_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_shop_id ON notifications(related_shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- 6. Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('staff', 'inventory', 'deliveries', 'notifications')
ORDER BY table_name;
