# Orders Dummy Data Population - Ready to Execute

## What This Script Does

The `populate-orders-dummy-data.sql` script will update all existing orders with realistic dummy data based on actual presswala business patterns.

## Realistic Business Logic Applied

### Payment Methods (Typical Indian Presswala Distribution)
- **60% Cash** - Most common for laundry services
- **25% UPI** - Growing digital adoption
- **10% Card** - Credit/Debit cards
- **5% Wallet** - Digital wallets

### Payment Status
- **70% Paid** - Most orders completed successfully
- **20% Pending** - Recent or processing orders
- **5% Failed** - Payment issues
- **5% Refunded** - Customer cancellations

### Priority Levels
- **70% Normal** - Standard service
- **25% Express** - Urgent needs
- **5% Urgent** - Emergency service

### Delivery Fees (Based on Priority)
- **Urgent**: ₹50-70 (higher fee for priority)
- **Express**: ₹30-40 (moderate fee)
- **Normal**: ₹20-30 (standard fee)

### Discounts (Realistic Business Rules)
- **10%** of orders get new customer discount (10% off)
- **5%** of orders get bulk order discount (15% off)
- **3%** of orders get loyalty discount (5% off)
- **82%** of orders get no discount

### Real Business Notes
**Order Notes (Internal):**
- "Handle with care - expensive clothes"
- "Starch required for shirts"
- "Deliver after 6 PM"
- "Extra care for silk items"

**Customer Notes (Delivery):**
- "Please call before delivery"
- "Gate code: #1234"
- "Leave at security desk"
- "Deliver to back entrance"

### Indian Addresses
- Mumbai, Pune, Delhi, Bangalore locations
- Realistic apartment/building formats
- Proper PIN codes

## Tax Calculation
- **18% GST** applied to all orders (standard Indian service tax)

## Execution Steps

1. **Run the SQL script** in Supabase SQL Editor
2. **Review verification output** showing data distribution
3. **Test admin interface** with realistic data

## Benefits After Execution

✅ **No More NULL Values** - All orders have complete data
✅ **Realistic Testing** - Admin interface gets proper business scenarios
✅ **Feature Testing** - All new fields have meaningful values
✅ **UI Compatibility** - No more undefined/null display issues
✅ **Business Ready** - Data reflects actual presswala operations

## Sample Output Expected

After execution, you'll see:
- Payment method distribution percentages
- Payment status breakdown
- Priority level distribution
- Sample order data with all fields populated

## Future Considerations

When customer app is implemented:
- Real customer data will replace dummy values
- Business logic will generate actual payment methods
- Customer addresses will come from user input
- Order notes will be customer-generated

This dummy data provides a solid foundation for development and testing!
