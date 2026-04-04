// Database types for Admin Panel

export interface Service {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GarmentCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Garment {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
  garment_categories?: GarmentCategory;
}

export interface ServiceGarmentPricing {
  id: number;
  service_id: number;
  garment_id: number;
  price: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
  services?: Service;
  garments?: Garment;
}

// Join types for populated data
export interface GarmentWithCategory extends Garment {
  garment_categories: GarmentCategory;
}

export interface ServiceGarmentPricingWithDetails extends ServiceGarmentPricing {
  services: Service;
  garments: GarmentWithCategory;
}

// Form types
export interface ServiceFormData {
  name: string;
  description: string;
}

export interface GarmentCategoryFormData {
  name: string;
  description: string;
}

export interface GarmentFormData {
  name: string;
  category_id: number;
  description: string;
}

export interface PricingFormData {
  service_id: number;
  garment_id: number;
  price: string;
  is_available: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
