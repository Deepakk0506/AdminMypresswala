-- Create a trigger to automatically set services_id when new orders are inserted with NULL

-- Step 1: Create a function that will set the services_id
CREATE OR REPLACE FUNCTION set_default_service_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If services_id is NULL, set it to the first available service
    IF NEW.services_id IS NULL THEN
        NEW.services_id := (SELECT id FROM services ORDER BY id LIMIT 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS trigger_set_service_id ON orders;
CREATE TRIGGER trigger_set_service_id
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_default_service_id();

-- Step 3: Also fix existing NULL values
UPDATE orders 
SET services_id = (SELECT id FROM services ORDER BY id LIMIT 1)
WHERE services_id IS NULL;

-- Step 4: Verify trigger is created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'orders';
