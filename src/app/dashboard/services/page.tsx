"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Plus, Edit2, Trash2, Save, X, Package, ChevronRight, 
  ArrowLeft, Tag, Shirt, DollarSign, ToggleLeft, ToggleRight 
} from "lucide-react";

// Updated interfaces to match your schema
interface Service {
  id: number;
  name: string;
  description?: string;
  icon_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface GarmentCategory {
  id: number;
  name: string;
  icon_url?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Garment {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ServiceGarmentPricing {
  id: number;
  service_id: number;
  garment_id: number;
  price: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

type ViewType = 'services' | 'categories' | 'garments' | 'pricing';

interface NavigationState {
  view: ViewType;
  selectedService: Service | null;
  selectedCategory: GarmentCategory | null;
  selectedGarment: Garment | null;
}

export default function ServicesPage() {
  const [navigation, setNavigation] = useState<NavigationState>({
    view: 'services',
    selectedService: null,
    selectedCategory: null,
    selectedGarment: null
  });

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<GarmentCategory[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [pricing, setPricing] = useState<ServiceGarmentPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    icon_url: ""
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon_url: "",
    display_order: 0
  });

  const [garmentForm, setGarmentForm] = useState({
    name: "",
    description: "",
    display_order: 0
  });

  // Fetch functions
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setServices([]);
      } else {
        setServices(data || []);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      setServices([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("garment_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        setError(error.message);
        setCategories([]);
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      setCategories([]);
    }
    setLoading(false);
  };

  const fetchGarments = async (categoryId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("garments")
        .select("*")
        .eq("category_id", categoryId)
        .order("display_order", { ascending: true });

      if (error) {
        setError(error.message);
        setGarments([]);
      } else {
        setGarments(data || []);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      setGarments([]);
    }
    setLoading(false);
  };

  const fetchPricing = async (garmentId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("service_garment_pricing")
        .select("*")
        .eq("garment_id", garmentId);

      if (error) {
        setError(error.message);
        setPricing([]);
      } else {
        setPricing(data || []);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      setPricing([]);
    }
    setLoading(false);
  };

  // CRUD operations
  const handleAddService = async () => {
    if (!serviceForm.name) {
      setError("Service name is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('services')
        .insert([{
          ...serviceForm,
          is_active: true
        }]);

      if (error) {
        setError(`Failed to add service: ${error.message}`);
      } else {
        setServiceForm({ name: "", description: "", icon_url: "" });
        setIsAdding(false);
        await fetchServices();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleUpdateService = async (id: number, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        setError(`Failed to update service: ${error.message}`);
      } else {
        await fetchServices();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        setError(`Failed to delete service: ${error.message}`);
      } else {
        await fetchServices();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('garment_categories')
        .insert([{
          ...categoryForm,
          is_active: true
        }]);

      if (error) {
        setError(`Failed to add category: ${error.message}`);
      } else {
        setCategoryForm({ name: "", icon_url: "", display_order: 0 });
        setIsAdding(false);
        await fetchCategories();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleAddGarment = async () => {
    if (!garmentForm.name || !navigation.selectedCategory) {
      setError("Garment name and category are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('garments')
        .insert([{
          ...garmentForm,
          category_id: navigation.selectedCategory.id,
          is_active: true
        }]);

      if (error) {
        setError(`Failed to add garment: ${error.message}`);
      } else {
        setGarmentForm({ name: "", description: "", display_order: 0 });
        setIsAdding(false);
        await fetchGarments(navigation.selectedCategory.id);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleUpdatePricing = async (pricingId: number, price: number, isAvailable: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('service_garment_pricing')
        .update({ price, is_available: isAvailable })
        .eq('id', pricingId);

      if (error) {
        setError(`Failed to update pricing: ${error.message}`);
      } else {
        await fetchPricing(navigation.selectedGarment!.id);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  // Navigation handlers
  const handleServiceClick = (service: Service) => {
    setNavigation({
      view: 'categories',
      selectedService: service,
      selectedCategory: null,
      selectedGarment: null
    });
    fetchCategories();
  };

  const handleCategoryClick = (category: GarmentCategory) => {
    setNavigation({
      view: 'garments',
      selectedService: navigation.selectedService,
      selectedCategory: category,
      selectedGarment: null
    });
    fetchGarments(category.id);
  };

  const handleGarmentClick = (garment: Garment) => {
    setNavigation({
      view: 'pricing',
      selectedService: navigation.selectedService,
      selectedCategory: navigation.selectedCategory,
      selectedGarment: garment
    });
    fetchPricing(garment.id);
  };

  const handleBack = () => {
    if (navigation.view === 'pricing') {
      handleCategoryClick(navigation.selectedCategory!);
    } else if (navigation.view === 'garments') {
      handleServiceClick(navigation.selectedService!);
    } else if (navigation.view === 'categories') {
      setNavigation({
        view: 'services',
        selectedService: null,
        selectedCategory: null,
        selectedGarment: null
      });
      fetchServices();
    }
  };

  // Initial load
  useEffect(() => {
    if (navigation.view === 'services') {
      fetchServices();
    }
  }, []);

  // Breadcrumb component
  const Breadcrumb = () => (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <button 
        onClick={() => {
          setNavigation({
            view: 'services',
            selectedService: null,
            selectedCategory: null,
            selectedGarment: null
          });
          fetchServices();
        }}
        className="hover:text-blue-600 transition-colors"
      >
        Services
      </button>
      {navigation.selectedService && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{navigation.selectedService.name}</span>
        </>
      )}
      {navigation.selectedCategory && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{navigation.selectedCategory.name}</span>
        </>
      )}
      {navigation.selectedGarment && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{navigation.selectedGarment.name}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        {navigation.view !== 'services' && <Breadcrumb />}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              {navigation.view === 'services' && <Package className="w-6 h-6 text-white" />}
              {navigation.view === 'categories' && <Tag className="w-6 h-6 text-white" />}
              {navigation.view === 'garments' && <Shirt className="w-6 h-6 text-white" />}
              {navigation.view === 'pricing' && <DollarSign className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {navigation.view === 'services' && 'Services'}
                {navigation.view === 'categories' && 'Categories'}
                {navigation.view === 'garments' && 'Garments'}
                {navigation.view === 'pricing' && 'Pricing'}
              </h1>
              <p className="text-gray-600">
                {navigation.view === 'services' && 'Manage your laundry and pressing services'}
                {navigation.view === 'categories' && `Categories for ${navigation.selectedService?.name}`}
                {navigation.view === 'garments' && `Garments in ${navigation.selectedCategory?.name}`}
                {navigation.view === 'pricing' && `Pricing for ${navigation.selectedGarment?.name}`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {navigation.view !== 'services' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {navigation.view === 'services' && 'Add Service'}
              {navigation.view === 'categories' && 'Add Category'}
              {navigation.view === 'garments' && 'Add Garment'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Services View */}
      {navigation.view === 'services' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {service.icon_url ? (
                    <img src={service.icon_url} alt={service.name} className="w-10 h-10 rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateService(service.id, !service.is_active);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    service.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {service.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(service.id);
                      setServiceForm({
                        name: service.name,
                        description: service.description || '',
                        icon_url: service.icon_url || ''
                      });
                      setIsAdding(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteService(service.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories View */}
      {navigation.view === 'categories' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.icon_url ? (
                    <img src={category.icon_url} alt={category.name} className="w-10 h-10 rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500">Order: {category.display_order}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle active state (you'd implement this)
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    category.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {category.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Garments View */}
      {navigation.view === 'garments' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garments.map((garment) => (
            <div
              key={garment.id}
              onClick={() => handleGarmentClick(garment)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{garment.name}</h3>
                    <p className="text-sm text-gray-500">Order: {garment.display_order}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle active state
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    garment.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {garment.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{garment.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  garment.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {garment.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pricing View */}
      {navigation.view === 'pricing' && !loading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Pricing for {navigation.selectedGarment?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map((service) => {
                  const pricingData = pricing.find(p => p.service_id === service.id);
                  return (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {service.icon_url ? (
                            <img src={service.icon_url} alt={service.name} className="w-8 h-8 rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pricingData?.price || ''}
                          onChange={(e) => {
                            const newPrice = parseFloat(e.target.value) || 0;
                            if (pricingData) {
                              handleUpdatePricing(pricingData.id, newPrice, pricingData.is_available);
                            }
                          }}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (pricingData) {
                              handleUpdatePricing(pricingData.id, pricingData.price, !pricingData.is_available);
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            pricingData?.is_available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {pricingData?.is_available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit' : 'Add'} {navigation.view === 'services' && 'Service'}
              {navigation.view === 'categories' && 'Category'}
              {navigation.view === 'garments' && 'Garment'}
            </h3>
            
            {navigation.view === 'services' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Pressing, Ironing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the service..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                  <input
                    type="url"
                    value={serviceForm.icon_url}
                    onChange={(e) => setServiceForm({ ...serviceForm, icon_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
              </div>
            )}

            {navigation.view === 'categories' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Men's Wear"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                  <input
                    type="url"
                    value={categoryForm.icon_url}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
              </div>
            )}

            {navigation.view === 'garments' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={garmentForm.name}
                    onChange={(e) => setGarmentForm({ ...garmentForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Shirt, Dress"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={garmentForm.description}
                    onChange={(e) => setGarmentForm({ ...garmentForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the garment..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={garmentForm.display_order}
                    onChange={(e) => setGarmentForm({ ...garmentForm, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (navigation.view === 'services') handleAddService();
                  else if (navigation.view === 'categories') handleAddCategory();
                  else if (navigation.view === 'garments') handleAddGarment();
                }}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setServiceForm({ name: "", description: "", icon_url: "" });
                  setCategoryForm({ name: "", icon_url: "", display_order: 0 });
                  setGarmentForm({ name: "", description: "", display_order: 0 });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty States */}
      {!loading && navigation.view === 'services' && services.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
          <p className="text-gray-600 mb-6">Add your first service to get started</p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Your First Service
          </button>
        </div>
      )}

      {!loading && navigation.view === 'categories' && categories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-6">Add categories for {navigation.selectedService?.name}</p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add First Category
          </button>
        </div>
      )}

      {!loading && navigation.view === 'garments' && garments.length === 0 && (
        <div className="text-center py-12">
          <Shirt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No garments found</h3>
          <p className="text-gray-600 mb-6">Add garments to {navigation.selectedCategory?.name}</p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add First Garment
          </button>
        </div>
      )}
    </div>
  );
}
