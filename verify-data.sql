-- Quick verification script
-- Run this after executing fix-customer-addresses-payments.sql

-- Check if data exists for customers
SELECT '=== VERIFICATION RESULTS ===' as info;

-- Show customers with their address and payment counts
SELECT 
  c.name,
  c.email,
  COUNT(DISTINCT ca.id) as address_count,
  COUNT(DISTINCT pm.id) as payment_count,
  COUNT(DISTINCT r.id) as review_count,
  COUNT(DISTINCT n.id) as notification_count
FROM customers c
LEFT JOIN customer_addresses ca ON c.id = ca.customer_id
LEFT JOIN payment_methods pm ON c.id = pm.customer_id
LEFT JOIN reviews r ON c.id = r.customer_id
LEFT JOIN notifications n ON c.id = n.user_id
GROUP BY c.id, c.name, c.email
ORDER BY c.created_at DESC
LIMIT 5;
