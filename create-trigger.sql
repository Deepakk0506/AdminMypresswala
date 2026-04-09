-- Create working trigger for services_id

-- Step 1: Check if trigger already exists and drop it
DROP TRIGGER IF EXISTS trigger_set_service_id ON orders;

-- Step 2: Create the function
CREATE OR REPLACE FUNCTION set_default_service_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set if NULL
    IF NEW.services_id IS NULL THEN
        NEW.services_id := (SELECT id FROM services ORDER BY id LIMIT 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger
CREATE TRIGGER trigger_set_service_id
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_default_service_id();

-- Step 4: Fix existing NULL values
UPDATE orders 
SET services_id = (SELECT id FROM services ORDER BY id LIMIT 1)
WHERE services_id IS NULL;

-- Step 5: Verify trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'orders';
