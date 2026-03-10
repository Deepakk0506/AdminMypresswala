-- Phase 1: Essential Orders Table Enhancement
-- Execute this in Supabase SQL Editor

-- 1. Basic Payment Fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash', -- cash, card, upi, wallet
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'; -- paid, pending, failed, refunded

-- 2. Order Management Fields  
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'normal', -- normal, express, urgent
ADD COLUMN IF NOT EXISTS order_notes TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- 3. Simple Delivery Information
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0.00;

-- 4. Financial Tracking
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0.00;

-- 5. Add updated_at timestamp for tracking changes
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_priority_level ON orders(priority_level);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);

-- 7. Add constraints for data quality (using DO block to check existence)
DO $$ 
BEGIN
    -- Payment method constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_method') THEN
        ALTER TABLE orders ADD CONSTRAINT check_payment_method 
        CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet'));
    END IF;
    
    -- Payment status constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_status') THEN
        ALTER TABLE orders ADD CONSTRAINT check_payment_status 
        CHECK (payment_status IN ('paid', 'pending', 'failed', 'refunded'));
    END IF;
    
    -- Priority level constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_priority_level') THEN
        ALTER TABLE orders ADD CONSTRAINT check_priority_level 
        CHECK (priority_level IN ('normal', 'express', 'urgent'));
    END IF;
    
    -- Delivery fee constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_delivery_fee') THEN
        ALTER TABLE orders ADD CONSTRAINT check_delivery_fee 
        CHECK (delivery_fee >= 0);
    END IF;
    
    -- Discount amount constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_discount_amount') THEN
        ALTER TABLE orders ADD CONSTRAINT check_discount_amount 
        CHECK (discount_amount >= 0);
    END IF;
    
    -- Tax amount constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_tax_amount') THEN
        ALTER TABLE orders ADD CONSTRAINT check_tax_amount 
        CHECK (tax_amount >= 0);
    END IF;
END $$;

-- 8. Update existing records with default values
UPDATE orders 
SET 
    payment_method = 'cash',
    payment_status = 'pending',
    priority_level = 'normal',
    delivery_fee = 0.00,
    discount_amount = 0.00,
    tax_amount = 0.00,
    updated_at = NOW()
WHERE 
    payment_method IS NULL OR 
    payment_status IS NULL OR 
    priority_level IS NULL OR 
    delivery_fee IS NULL OR 
    discount_amount IS NULL OR 
    tax_amount IS NULL;

-- 9. Verification Query
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
