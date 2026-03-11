-- Simple Shops Data Population
-- Run this after the migration to add sample data

-- First, let's clear any existing data to avoid conflicts
-- DELETE FROM shops WHERE shop_name IS NOT NULL;

-- Insert one simple shop to test
INSERT INTO shops (
    shop_name, 
    owner_name, 
    phone, 
    email, 
    address, 
    city, 
    state, 
    pincode, 
    opening_time, 
    closing_time,
    rating,
    completed_orders,
    current_load,
    status,
    revenue,
    employees,
    services,
    specialties,
    equipment,
    certifications,
    website,
    established,
    average_turnaround,
    last_month_orders,
    customer_satisfaction,
    description
) VALUES (
    'Premium Press Point',
    'Rakesh Verma',
    '+91 98765 43210',
    'premium@presspoint.com',
    '4th Block',
    'Koramangala',
    'Karnataka',
    '560034',
    '08:00:00',
    '20:00:00',
    4.8,
    1245,
    85.0,
    'Busy',
    245000.00,
    8,
    ARRAY['Dry Cleaning', 'Ironing', 'Stain Removal'],
    ARRAY['Express Service', 'Wedding Wear'],
    ARRAY['Steam Press', 'Industrial Washer'],
    ARRAY['ISO 9001'],
    'www.premiumpresspoint.com',
    '2019',
    '24 hours',
    186,
    96.0,
    'Professional dry cleaning and ironing services.'
);

-- Verify the insert worked
SELECT 
    shop_name,
    owner_name,
    rating,
    status,
    completed_orders,
    current_load,
    services
FROM shops 
WHERE shop_name = 'Premium Press Point';

-- Check total shops count
SELECT COUNT(*) as total_shops FROM shops;
