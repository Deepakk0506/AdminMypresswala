# Admin Panel for Laundry Management System

This admin panel provides comprehensive management capabilities for services, garment categories, garments, and pricing in your laundry management system.

## Features

### 🧺 Services Management
- **View** all laundry and pressing services
- **Add** new services with name and description
- **Edit** existing service details
- **Delete** services from the system
- **Search** services by name or description

### 🏷️ Garment Categories Management
- **View** all garment categories (Men's Wear, Women's Wear, Kids Wear, Home Linen)
- **Add** new categories with quick suggestions
- **Edit** category details
- **Delete** categories (also deletes associated garments)
- **Search** categories by name or description

### 👕 Garments Management
- **View** all individual garment items organized by category
- **Add** new garments with category selection and quick suggestions
- **Edit** garment details
- **Delete** individual garments
- **Filter** garments by category
- **Search** garments by name, description, or category

### 💰 Pricing Matrix
- **Grid View** with services as columns and garments as rows
- **Set Prices** for any garment-service combination
- **Toggle Availability** for each pricing entry
- **Bulk Operations** to fill missing pricing entries
- **Visual Indicators** for priced items, available items, and missing entries
- **Real-time Updates** with immediate save functionality

## Database Schema

The admin panel works with the following Supabase tables:

### `services`
- `id` (number, primary key)
- `name` (text)
- `description` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `garment_categories`
- `id` (number, primary key)
- `name` (text)
- `description` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `garments`
- `id` (number, primary key)
- `name` (text)
- `category_id` (number, foreign key to garment_categories)
- `description` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `service_garment_pricing`
- `id` (number, primary key)
- `service_id` (number, foreign key to services)
- `garment_id` (number, foreign key to garments)
- `price` (number)
- `is_available` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## File Structure

```
src/
├── types/
│   └── database.ts           # TypeScript interfaces for all database tables
├── components/admin/
│   ├── ServicesManager.tsx   # Services CRUD component
│   ├── GarmentCategoriesManager.tsx  # Categories CRUD component
│   ├── GarmentsManager.tsx   # Garments CRUD component
│   └── PricingGrid.tsx       # Pricing matrix component
└── app/dashboard/admin/
    └── page.tsx              # Main admin panel page
```

## Usage

1. **Access the Admin Panel**: Navigate to `/dashboard/admin` in your application
2. **Manage Services**: Use the Services tab to add/edit laundry services
3. **Set Up Categories**: Create garment categories before adding garments
4. **Add Garments**: Add individual garments to appropriate categories
5. **Configure Pricing**: Use the Pricing Matrix to set prices for each service-garment combination

## Key Features

### Smart Suggestions
- Pre-defined categories (Men's Wear, Women's Wear, Kids Wear, Home Linen)
- Common garment suggestions for each category
- Quick-add buttons for efficient data entry

### Pricing Matrix
- Visual grid interface for easy price management
- Click-to-edit functionality for quick updates
- Availability toggles for service control
- Bulk operations to initialize missing entries

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly controls

### Error Handling
- Comprehensive error messages
- Graceful fallbacks for missing data
- Validation for required fields

## Technology Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Supabase** for database operations
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Development

To run the development server:

```bash
npm run dev
```

The admin panel will be available at `http://localhost:3000/dashboard/admin`

## Database Setup

Ensure your Supabase database has the required tables with proper relationships and RLS policies configured for admin access.
