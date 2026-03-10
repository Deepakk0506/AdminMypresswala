-- Insert Dummy Data for Customer Admin Portal Tables
-- Execute this in Supabase SQL Editor after creating the tables

-- 1. Insert Customer Order Summary Data
INSERT INTO customer_order_summary (customer_id, total_orders, total_spent, last_order_date, average_order_value, updated_at)
SELECT 
    id as customer_id,
    -- Random order count between 1 and 20
    floor(random() * 20) + 1 as total_orders,
    -- Random total spent between 500 and 50000
    round((random() * 49500 + 500)::numeric, 2) as total_spent,
    -- Random last order date in last 90 days
    NOW() - (floor(random() * 90) || ' days')::INTERVAL as last_order_date,
    -- Calculate average order value
    round(((random() * 49500 + 500) / (floor(random() * 20) + 1))::numeric, 2) as average_order_value,
    NOW() as updated_at
FROM customers
WHERE id IS NOT NULL;

-- 2. Insert Customer Tags
INSERT INTO customer_tags (customer_id, tag_name, color, created_at)
SELECT 
    id as customer_id,
    CASE 
        WHEN random() < 0.1 THEN 'VIP'
        WHEN random() < 0.3 THEN 'Regular'
        WHEN random() < 0.5 THEN 'New'
        ELSE 'Inactive'
    END as tag_name,
    CASE 
        WHEN random() < 0.1 THEN '#FFD700'  -- Gold for VIP
        WHEN random() < 0.3 THEN '#10B981'  -- Green for Regular
        WHEN random() < 0.5 THEN '#3B82F6'  -- Blue for New
        ELSE '#6B7280'  -- Gray for Inactive
    END as color,
    NOW() as created_at
FROM customers
WHERE id IS NOT NULL;

-- 3. Insert Customer Communications
INSERT INTO customer_communications (customer_id, type, subject, message, status, sent_by, created_at)
SELECT 
    id as customer_id,
    CASE 
        WHEN random() < 0.4 THEN 'email'
        WHEN random() < 0.7 THEN 'sms'
        WHEN random() < 0.9 THEN 'notification'
        ELSE 'call'
    END as type,
    CASE 
        WHEN random() < 0.3 THEN 'Order Confirmation'
        WHEN random() < 0.5 THEN 'Delivery Update'
        WHEN random() < 0.7 THEN 'Special Offer'
        WHEN random() < 0.9 THEN 'Payment Reminder'
        ELSE 'Welcome Message'
    END as subject,
    CASE 
        WHEN random() < 0.3 THEN 'Your order has been confirmed and will be delivered soon.'
        WHEN random() < 0.5 THEN 'Your order is out for delivery. Expected arrival: 2-3 hours.'
        WHEN random() < 0.7 THEN 'Special discount just for you! Get 20% off on your next order.'
        WHEN random() < 0.9 THEN 'Your payment is due. Please complete the payment to continue service.'
        ELSE 'Welcome to our service! We are excited to serve you.'
    END as message,
    CASE 
        WHEN random() < 0.8 THEN 'sent'
        WHEN random() < 0.95 THEN 'delivered'
        ELSE 'failed'
    END as status,
    -- Random admin user ID (you can replace with actual admin IDs)
    '00000000-0000-0000-0000-000000000001'::UUID as sent_by,
    -- Random communication date in last 30 days
    NOW() - (floor(random() * 30) || ' days')::INTERVAL as created_at
FROM customers
WHERE id IS NOT NULL;

-- 4. Add some multiple communications per customer
INSERT INTO customer_communications (customer_id, type, subject, message, status, sent_by, created_at)
SELECT 
    id as customer_id,
    'email' as type,
    'Monthly Newsletter' as subject,
    'Check out our latest services and special offers this month!' as message,
    'sent' as status,
    '00000000-0000-0000-0000-000000000001'::UUID as sent_by,
    NOW() - (floor(random() * 15) || ' days')::INTERVAL as created_at
FROM customers
WHERE id IS NOT NULL AND random() < 0.6; -- 60% of customers get newsletter

-- 5. Verify the inserted data
SELECT 'Customer Order Summary Count:' as info, COUNT(*) as count FROM customer_order_summary
UNION ALL
SELECT 'Customer Tags Count:', COUNT(*) FROM customer_tags
UNION ALL
SELECT 'Customer Communications Count:', COUNT(*) FROM customer_communications;

-- 6. Show sample data
SELECT 'Sample Customer Order Summary:' as info;
SELECT * FROM customer_order_summary LIMIT 3;

SELECT 'Sample Customer Tags:' as info;
SELECT * FROM customer_tags LIMIT 5;

SELECT 'Sample Customer Communications:' as info;
SELECT * FROM customer_communications LIMIT 5;
