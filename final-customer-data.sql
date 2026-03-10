-- Complete Customer Data Insert Script (Fixed All Errors)
-- Execute this in Supabase SQL Editor

-- 1. Insert Customer Addresses
INSERT INTO customer_addresses (customer_id, address_type, address_line1, address_line2, city, state, postal_code, is_default, created_at)
SELECT 
    id as customer_id,
    CASE 
        WHEN random() < 0.7 THEN 'delivery'
        ELSE 'billing'
    END as address_type,
    CONCAT(FLOOR(random() * 999 + 1)::text, ' Main Street') as address_line1,
    CASE 
        WHEN random() < 0.5 THEN 'Apt ' || FLOOR(random() * 20 + 1)::text
        WHEN random() < 0.8 THEN 'Suite ' || FLOOR(random() * 500 + 100)::text
        ELSE NULL
    END as address_line2,
    COALESCE((ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad'])[FLOOR(random() * 7)], 'Unknown') as city,
    COALESCE((ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'West Bengal', 'Telangana'])[FLOOR(random() * 7)], 'Unknown') as state,
    LPAD(FLOOR(random() * 900000 + 100000)::text, 6, '0') as postal_code,
    random() < 0.6 as is_default,
    NOW() as created_at
FROM customers
WHERE id IS NOT NULL;

-- 2. Insert Payment Methods
INSERT INTO payment_methods (customer_id, method_type, provider, last_four, expiry_month, expiry_year, is_default, is_active, created_at)
SELECT 
    id as customer_id,
    COALESCE((ARRAY['card', 'upi', 'wallet', 'cash'])[FLOOR(random() * 4)], 'cash') as method_type,
    CASE 
        WHEN COALESCE((ARRAY['card', 'upi', 'wallet', 'cash'])[FLOOR(random() * 4)], 'cash') = 'card' THEN (ARRAY['Visa', 'Mastercard', 'Rupay'])[FLOOR(random() * 3)]
        WHEN COALESCE((ARRAY['card', 'upi', 'wallet', 'cash'])[FLOOR(random() * 4)], 'cash') = 'upi' THEN (ARRAY['GPay', 'PhonePe', 'Paytm', 'BHIM'])[FLOOR(random() * 4)]
        ELSE NULL
    END as provider,
    CASE 
        WHEN COALESCE((ARRAY['card', 'upi', 'wallet', 'cash'])[FLOOR(random() * 4)], 'cash') = 'card' THEN LPAD(FLOOR(random() * 9000 + 1000)::text, 4, '0')
        ELSE NULL
    END as last_four,
    CASE 
        WHEN COALESCE((ARRAY['card', 'upi', 'wallet', 'cash'])[FLOOR(random() * 4)], 'cash') = 'card' THEN FLOOR(random() * 12 + 1)
        ELSE NULL
    END as expiry_month,
    CASE 
        WHEN COALESCE((ARRAY['card', 'upi', 'wallet', 'cash'])[FLOOR(random() * 4)], 'cash') = 'card' THEN 2024 + FLOOR(random() * 4)
        ELSE NULL
    END as expiry_year,
    random() < 0.4 as is_default,
    random() < 0.8 as is_active,
    NOW() as created_at
FROM customers
WHERE id IS NOT NULL;

-- 3. Insert Customer Reviews
INSERT INTO reviews (customer_id, service_id, order_id, rating, comment, is_public, created_at)
SELECT 
    c.id as customer_id,
    s.id as service_id,
    o.id as order_id,
    FLOOR(random() * 5) + 1 as rating,
    CASE 
        WHEN FLOOR(random() * 5) + 1 >= 4 THEN 'Excellent service! Very professional and quick delivery.'
        WHEN FLOOR(random() * 5) + 1 >= 3 THEN 'Good service, satisfied with the quality.'
        WHEN FLOOR(random() * 5) + 1 >= 2 THEN 'Average service, could be better.'
        ELSE 'Not satisfied with the service.'
    END as comment,
    random() < 0.8 as is_public,
    NOW() - (FLOOR(random() * 30) || ' days')::INTERVAL as created_at
FROM customers c
CROSS JOIN LATERAL (
    SELECT id FROM services ORDER BY RANDOM() LIMIT 1
) s
CROSS JOIN LATERAL (
    SELECT id FROM orders ORDER BY RANDOM() LIMIT 1
) o
WHERE c.id IS NOT NULL
AND random() < 0.7;

-- 4. Insert Notifications
INSERT INTO notifications (user_id, title, message, type, is_read, data, created_at)
SELECT 
    id as user_id,
    title,
    message,
    type,
    is_read,
    data,
    created_at
FROM (
    SELECT 
        id as user_id,
        CASE 
            WHEN random() < 0.3 THEN 'Order Confirmation'
            WHEN random() < 0.5 THEN 'Delivery Update'
            WHEN random() < 0.7 THEN 'Payment Received'
            WHEN random() < 0.85 THEN 'Special Offer'
            ELSE 'Welcome Message'
        END as title,
        CASE 
            WHEN CASE 
                WHEN random() < 0.3 THEN 'Order Confirmation'
                WHEN random() < 0.5 THEN 'Delivery Update'
                WHEN random() < 0.7 THEN 'Payment Received'
                WHEN random() < 0.85 THEN 'Special Offer'
                ELSE 'Welcome Message'
            END = 'Order Confirmation' THEN 'Your order #' || FLOOR(random() * 10000 + 1000) || ' has been confirmed and is being processed.'
            WHEN CASE 
                WHEN random() < 0.3 THEN 'Order Confirmation'
                WHEN random() < 0.5 THEN 'Delivery Update'
                WHEN random() < 0.7 THEN 'Payment Received'
                WHEN random() < 0.85 THEN 'Special Offer'
                ELSE 'Welcome Message'
            END = 'Delivery Update' THEN 'Your order is out for delivery. Expected arrival: 2-3 hours.'
            WHEN CASE 
                WHEN random() < 0.3 THEN 'Order Confirmation'
                WHEN random() < 0.5 THEN 'Delivery Update'
                WHEN random() < 0.7 THEN 'Payment Received'
                WHEN random() < 0.85 THEN 'Special Offer'
                ELSE 'Welcome Message'
            END = 'Payment Received' THEN 'Thank you! Your payment of ₹' || (FLOOR(random() * 5000 + 500) || ' has been received.'
            WHEN CASE 
                WHEN random() < 0.3 THEN 'Order Confirmation'
                WHEN random() < 0.5 THEN 'Delivery Update'
                WHEN random() < 0.7 THEN 'Payment Received'
                WHEN random() < 0.85 THEN 'Special Offer'
                ELSE 'Welcome Message'
            END = 'Special Offer' THEN 'Get 20% off on your next laundry service! Use code SAVE20.'
            ELSE 'Welcome to our service! We are excited to serve you.'
        END as message,
        CASE 
            WHEN CASE 
                WHEN random() < 0.3 THEN 'Order Confirmation'
                WHEN random() < 0.5 THEN 'Delivery Update'
                WHEN random() < 0.7 THEN 'Payment Received'
                WHEN random() < 0.85 THEN 'Special Offer'
                ELSE 'Welcome Message'
            END IN ('Order Confirmation', 'Delivery Update', 'Payment Received') THEN 'order_update'
            WHEN CASE 
                WHEN random() < 0.3 THEN 'Order Confirmation'
                WHEN random() < 0.5 THEN 'Delivery Update'
                WHEN random() < 0.7 THEN 'Payment Received'
                WHEN random() < 0.85 THEN 'Special Offer'
                ELSE 'Welcome Message'
            END = 'Special Offer' THEN 'promotion'
            ELSE 'system'
        END as type,
        random() < 0.6 as is_read,
        CASE 
            WHEN CASE 
                WHEN random() < 0.3 THEN 'Order Confirmation'
                WHEN random() < 0.5 THEN 'Delivery Update'
                WHEN random() < 0.7 THEN 'Payment Received'
                WHEN random() < 0.85 THEN 'Special Offer'
                ELSE 'Welcome Message'
            END LIKE '%order%' THEN jsonb_build_object('order_id', FLOOR(random() * 10000 + 1000))
            WHEN CASE 
                WHEN random() < 0.3 THEN 'Order Confirmation'
                WHEN random() < 0.5 THEN 'Delivery Update'
                WHEN random() < 0.7 THEN 'Payment Received'
                WHEN random() < 0.85 THEN 'Special Offer'
                ELSE 'Welcome Message'
            END = 'Special Offer' THEN jsonb_build_object('discount_code', 'SAVE20', 'discount_percent', 20)
            ELSE '{}'::jsonb
        END as data,
        NOW() - (FLOOR(random() * 15) || ' days')::INTERVAL as created_at
    FROM customers
    WHERE id IS NOT NULL
) subq
WHERE id IS NOT NULL;

-- 5. Add multiple addresses per customer
INSERT INTO customer_addresses (customer_id, address_type, address_line1, address_line2, city, state, postal_code, is_default, created_at)
SELECT 
    id as customer_id,
    'billing' as address_type,
    CONCAT(FLOOR(random() * 999 + 1)::text, ' Office Complex') as address_line1,
    'Floor ' || FLOOR(random() * 10 + 1) as address_line2,
    COALESCE((ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Pune'])[FLOOR(random() * 4)], 'Unknown') as city,
    COALESCE((ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Maharashtra'])[FLOOR(random() * 4)], 'Unknown') as state,
    LPAD(FLOOR(random() * 900000 + 100000)::text, 6, '0') as postal_code,
    false as is_default,
    NOW() as created_at
FROM customers
WHERE id IS NOT NULL
AND random() < 0.4;

-- 6. Add multiple payment methods per customer
INSERT INTO payment_methods (customer_id, method_type, provider, last_four, expiry_month, expiry_year, is_default, is_active, created_at)
SELECT 
    id as customer_id,
    'upi' as method_type,
    (ARRAY['GPay', 'PhonePe', 'Paytm'])[FLOOR(random() * 3)] as provider,
    NULL as last_four,
    NULL as expiry_month,
    NULL as expiry_year,
    false as is_default,
    true as is_active,
    NOW() as created_at
FROM customers
WHERE id IS NOT NULL
AND random() < 0.5;

-- 7. Add service completion notifications
INSERT INTO notifications (user_id, title, message, type, is_read, data, created_at)
SELECT 
    id as user_id,
    'Service Completed' as title,
    'Your laundry service has been completed and is ready for pickup/delivery.' as message,
    'order_update' as type,
    random() < 0.3 as is_read,
    jsonb_build_object('order_id', FLOOR(random() * 10000 + 1000), 'status', 'completed') as data,
    NOW() - (FLOOR(random() * 7) || ' days')::INTERVAL as created_at
FROM customers
WHERE id IS NOT NULL
AND random() < 0.6;

-- 8. Verification queries
SELECT 'Customer Addresses Count:' as info, COUNT(*) as count FROM customer_addresses
UNION ALL
SELECT 'Payment Methods Count:', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Reviews Count:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Notifications Count:', COUNT(*) FROM notifications;
