# Manual Dry Cleaning Service Addition

Since SQL scripts aren't working, let's add the service manually through the Supabase Dashboard.

## Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to **Table Editor** 
3. Select the **services** table

## Step 2: Add Dry Cleaning Service Manually

Copy and paste this SQL query into the Table Editor:

```sql
INSERT INTO services (
    service_name, 
    description, 
    status, 
    duration_estimate, 
    image_url, 
    min_order_quantity, 
    popularity_score, 
    service_code, 
    price, 
    category
) VALUES (
    'Dry Cleaning',
    'Professional dry cleaning for delicate fabrics and special garments',
    true,
    'Usually ready in 2-3 days',
    NULL,
    1,
    50,
    'SRVDRY',
    150,
    'Dry Cleaning'
);
```

## Step 3: Verify Addition

After running the query, check if it was added by running:

```sql
SELECT * FROM services WHERE service_name = 'Dry Cleaning';
```

## Step 4: Refresh Your App

1. **Hard refresh** your browser: `Ctrl+F5` or `Cmd+R`
2. **Go to pricing page**: `http://localhost:3000/dashboard/pricing`
3. **Check service dropdown** - should now show "Dry Cleaning" with hanger icon

## Expected Result

- ✅ **Dry Cleaning service appears** in dropdown
- ✅ **Hanger icon** visible next to service name
- ✅ **All 5 services** available for pricing

## If This Still Doesn't Work

If the manual approach doesn't work, the issue might be:
1. **Browser cache** - try incognito mode
2. **Supabase connection** - check if .env.local is correct
3. **Table permissions** - verify the INSERT actually worked

Try the manual approach first - this should definitely work!
