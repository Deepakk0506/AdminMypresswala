-- Populate Orders with Realistic Dummy Data
-- Execute this in Supabase SQL Editor after running enhance-orders-table.sql

-- Update existing orders with realistic dummy data
UPDATE orders SET 
    payment_method = CASE 
        WHEN random() < 0.6 THEN 'cash'
        WHEN random() < 0.85 THEN 'upi'
        WHEN random() < 0.95 THEN 'card'
        ELSE 'wallet'
    END,
    payment_status = CASE 
        WHEN random() < 0.7 THEN 'paid'
        WHEN random() < 0.9 THEN 'pending'
        WHEN random() < 0.95 THEN 'failed'
        ELSE 'refunded'
    END,
    priority_level = CASE 
        WHEN random() < 0.7 THEN 'normal'
        WHEN random() < 0.95 THEN 'express'
        ELSE 'urgent'
    END,
    delivery_fee = CASE 
        WHEN priority_level = 'urgent' THEN 50 + (random() * 20)::integer
        WHEN priority_level = 'express' THEN 30 + (random() * 10)::integer
        ELSE 20 + (random() * 10)::integer
    END,
    discount_amount = CASE 
        WHEN random() < 0.1 THEN total_price * 0.10  -- 10% new customer
        WHEN random() < 0.15 THEN total_price * 0.15  -- 15% bulk order
        WHEN random() < 0.18 THEN total_price * 0.05  -- 5% loyalty
        ELSE 0
    END,
    order_notes = CASE 
        WHEN random() < 0.2 THEN 'Handle with care - expensive clothes'
        WHEN random() < 0.4 THEN 'Starch required for shirts'
        WHEN random() < 0.6 THEN 'Deliver after 6 PM'
        WHEN random() < 0.8 THEN 'Extra care for silk items'
        ELSE 'Standard processing'
    END,
    customer_notes = CASE 
        WHEN random() < 0.3 THEN 'Please call before delivery'
        WHEN random() < 0.5 THEN 'Gate code: #1234'
        WHEN random() < 0.7 THEN 'Leave at security desk'
        WHEN random() < 0.9 THEN 'Deliver to back entrance'
        ELSE 'Standard delivery instructions'
    END,
    delivery_address = CASE 
        WHEN random() < 0.25 THEN '123 Main Street, Apt 5, Mumbai 400001'
        WHEN random() < 0.5 THEN '456 Park Avenue, Building B, Pune 411001'
        WHEN random() < 0.75 THEN '789 Commercial Street, Shop 12, Delhi 110001'
        ELSE '321 Residential Complex, Tower A, Bangalore 560001'
    END,
    tax_amount = total_price * 0.18,  -- 18% GST
    updated_at = NOW()
WHERE 
    payment_method IS NULL OR 
    payment_status IS NULL OR 
    priority_level IS NULL;

-- Verification queries to check data distribution
SELECT 'Payment Method Distribution:' as info;
SELECT 
    payment_method, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
FROM orders 
GROUP BY payment_method
ORDER BY count DESC;

SELECT 'Payment Status Distribution:' as info;
SELECT 
    payment_status, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
FROM orders 
GROUP BY payment_status
ORDER BY count DESC;

SELECT 'Priority Level Distribution:' as info;
SELECT 
    priority_level, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
FROM orders 
GROUP BY priority_level
ORDER BY count DESC;

SELECT 'Sample Order Data:' as info;
SELECT 
    id,
    payment_method,
    payment_status,
    priority_level,
    delivery_fee,
    discount_amount,
    tax_amount,
    LEFT(order_notes, 30) as order_notes_sample,
    LEFT(customer_notes, 30) as customer_notes_sample,
    LEFT(delivery_address, 30) as delivery_address_sample
FROM orders 
LIMIT 5;
