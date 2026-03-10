-- Check if customer data actually exists and matches customer IDs
-- Execute this in Supabase SQL Editor

-- Check if we have any data in the tables
SELECT 'Customer Addresses Count:' as info, COUNT(*) as count FROM customer_addresses
UNION ALL
SELECT 'Payment Methods Count:', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Reviews Count:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Notifications Count:', COUNT(*) FROM notifications;

-- Check specific customer IDs in addresses
SELECT 'Address Customer IDs:' as info, customer_id, COUNT(*) as address_count 
FROM customer_addresses 
GROUP BY customer_id
LIMIT 5;

-- Check specific customer IDs in payment methods  
SELECT 'Payment Customer IDs:' as info, customer_id, COUNT(*) as payment_count
FROM payment_methods
GROUP BY customer_id
LIMIT 5;

-- Check specific customer IDs in reviews
SELECT 'Review Customer IDs:' as info, customer_id, COUNT(*) as review_count
FROM reviews
GROUP BY customer_id
LIMIT 5;

-- Check specific customer IDs in notifications
SELECT 'Notification Customer IDs:' as info, user_id as customer_id, COUNT(*) as notification_count
FROM notifications
GROUP BY user_id
LIMIT 5;

-- Get your actual customer IDs for comparison
SELECT 'Your Customer IDs:' as info, id, name FROM customers LIMIT 5;
