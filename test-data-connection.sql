-- Test Data Connection and Add Sample Data if Needed
-- Run this in Supabase SQL Editor

-- 1. Check if we have any customers
SELECT 'Customers Count:' as info, COUNT(*) as count FROM customers;

-- 2. Check if we have any orders
SELECT 'Orders Count:' as info, COUNT(*) as count FROM orders;

-- 3. Check if we have any services
SELECT 'Services Count:' as info, COUNT(*) as count FROM services;

-- 4. If no customers exist, add sample customers
INSERT INTO customers (id, name, email, phone, addr, created_at) 
SELECT 
    gen_random_uuid(),
    'Amit Kumar',
    'amit.kumar@email.com',
    '+91 9876543210',
    '123 Main Street, Delhi, India',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers LIMIT 1);

INSERT INTO customers (id, name, email, phone, addr, created_at) 
SELECT 
    gen_random_uuid(),
    'Priya Sharma',
    'priya.sharma@email.com',
    '+91 9876543211',
    '456 Park Avenue, Mumbai, India',
    NOW()
WHERE (SELECT COUNT(*) FROM customers) = 1;

INSERT INTO customers (id, name, email, phone, addr, created_at) 
SELECT 
    gen_random_uuid(),
    'Rahul Verma',
    'rahul.verma@email.com',
    '+91 9876543212',
    '789 Market Road, Bangalore, India',
    NOW()
WHERE (SELECT COUNT(*) FROM customers) = 2;

-- 5. If no services exist, add sample services
INSERT INTO services (id, service_name, price, category, duration_estimate, created_at) 
SELECT 
    gen_random_uuid(),
    'Shirt Washing & Ironing',
    50.00,
    'Laundry',
    '2-3 days',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, service_name, price, category, duration_estimate, created_at) 
SELECT 
    gen_random_uuid(),
    'Dry Cleaning',
    120.00,
    'Dry Cleaning',
    '1-2 days',
    NOW()
WHERE (SELECT COUNT(*) FROM services) = 1;

INSERT INTO services (id, service_name, price, category, duration_estimate, created_at) 
SELECT 
    gen_random_uuid(),
    'Suit Pressing',
    80.00,
    'Pressing',
    'Same day',
    NOW()
WHERE (SELECT COUNT(*) FROM services) = 2;

-- 6. If no orders exist, add sample orders
INSERT INTO orders (id, customer_id, service_id, quantity, total_price, status, order_date, created_at, priority_level, payment_method, payment_status) 
SELECT 
    gen_random_uuid(),
    (SELECT id FROM customers LIMIT 1),
    (SELECT id FROM services LIMIT 1),
    2,
    100.00,
    'pending',
    NOW(),
    NOW(),
    'normal',
    'cash',
    'pending'
WHERE NOT EXISTS (SELECT 1 FROM orders LIMIT 1);

INSERT INTO orders (id, customer_id, service_id, quantity, total_price, status, order_date, created_at, priority_level, payment_method, payment_status) 
SELECT 
    gen_random_uuid(),
    (SELECT id FROM customers LIMIT 1 OFFSET 1),
    (SELECT id FROM services LIMIT 1 OFFSET 1),
    1,
    120.00,
    'in_progress',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    'express',
    'card',
    'paid'
WHERE (SELECT COUNT(*) FROM orders) = 1;

INSERT INTO orders (id, customer_id, service_id, quantity, total_price, status, order_date, created_at, priority_level, payment_method, payment_status) 
SELECT 
    gen_random_uuid(),
    (SELECT id FROM customers LIMIT 1 OFFSET 2),
    (SELECT id FROM services LIMIT 1 OFFSET 2),
    3,
    240.00,
    'completed',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    'normal',
    'upi',
    'paid'
WHERE (SELECT COUNT(*) FROM orders) = 2;

-- 7. Verify data was inserted
SELECT 'Final Customers Count:' as info, COUNT(*) as count FROM customers;
SELECT 'Final Orders Count:' as info, COUNT(*) as count FROM orders;
SELECT 'Final Services Count:' as info, COUNT(*) as count FROM services;

-- 8. Show sample data
SELECT 'Sample Customers:' as info, id, name, email, phone FROM customers LIMIT 3;
SELECT 'Sample Orders:' as info, id, customer_id, service_id, total_price, status FROM orders LIMIT 3;
