"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus, Edit2, Trash2, Save, X, Package } from "lucide-react";

interface Service {
  id: number;
  service_name?: string;
  name?: string;
  description?: string;
  status?: boolean;
  price?: number;
  duration_estimate?: string;
  category?: string;
  image_url?: string;
  min_order_quantity?: number;
  popularity_score?: number;
  service_code?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    price: "",
    duration_estimate: "",
    category: "",
    image_url: "",
    min_order_quantity: "1",
    popularity_score: "0",
    service_code: "",
    status: true
  });

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching services:", error);
        setError(error.message);
        setServices([]);
      } else {
        setServices(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Unexpected error: ${err}`);
      setServices([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async () => {
    if (!formData.service_name || !formData.description) {
      setError("Service name and description are required");
      return;
    }

    const serviceData = {
      service_name: formData.service_name,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : null,
      duration_estimate: formData.duration_estimate || null,
      category: formData.category || null,
      image_url: formData.image_url || null,
      min_order_quantity: formData.min_order_quantity ? parseInt(formData.min_order_quantity) : 1,
      popularity_score: formData.popularity_score ? parseInt(formData.popularity_score) : 0,
      service_code: formData.service_code || null,
      status: formData.status
    };

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();

      if (error) {
        setError(error.message);
      } else {
        setFormData({ 
          service_name: "", 
          description: "", 
          price: "", 
          duration_estimate: "", 
          category: "", 
          image_url: "", 
          min_order_quantity: "1", 
          popularity_score: "0", 
          service_code: "", 
          status: true 
        });
        setIsAdding(false);
        fetchServices();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleEditService = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      service_name: service.service_name || service.name || "",
      description: service.description || "",
      price: service.price?.toString() || "",
      duration_estimate: service.duration_estimate || "",
      category: service.category || "",
      image_url: service.image_url || "",
      min_order_quantity: service.min_order_quantity?.toString() || "1",
      popularity_score: service.popularity_score?.toString() || "0",
      service_code: service.service_code || "",
      status: service.status ?? true
    });
  };

  const handleUpdateService = async () => {
    if (!formData.service_name || !formData.description) {
      setError("Service name and description are required");
      return;
    }

    const serviceData = {
      service_name: formData.service_name,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : null,
      duration_estimate: formData.duration_estimate || null,
      category: formData.category || null,
      image_url: formData.image_url || null,
      min_order_quantity: formData.min_order_quantity ? parseInt(formData.min_order_quantity) : 1,
      popularity_score: formData.popularity_score ? parseInt(formData.popularity_score) : 0,
      service_code: formData.service_code || null,
      status: formData.status,
      updated_at: new Date().toISOString()
    };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingId);

      if (error) {
        setError(error.message);
      } else {
        setEditingId(null);
        setFormData({ 
          service_name: "", 
          description: "", 
          price: "", 
          duration_estimate: "", 
          category: "", 
          image_url: "", 
          min_order_quantity: "1", 
          popularity_score: "0", 
          service_code: "", 
          status: true 
        });
        fetchServices();
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
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
      } else {
        fetchServices();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ 
      service_name: "", 
      description: "", 
      price: "", 
      duration_estimate: "", 
      category: "", 
      image_url: "", 
      min_order_quantity: "1", 
      popularity_score: "0", 
      service_code: "", 
      status: true 
    });
    setError(null);
  };

  const filteredServices = services.filter(service => 
    (service.service_name || service.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600 mt-1">Manage your laundry and pressing services</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Add/Edit Service Form */}
      {(isAdding || editingId) && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? 'Add New Service' : 'Edit Service'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Premium Laundry"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the service..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="29.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Code
                </label>
                <input
                  type="text"
                  value={formData.service_code}
                  onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., LAUNDRY001"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration Estimate
              </label>
              <input
                type="text"
                value={formData.duration_estimate}
                onChange={(e) => setFormData({ ...formData, duration_estimate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Usually ready in 2-3 days"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Dry Cleaning">Dry Cleaning</option>
                  <option value="Pressing">Pressing</option>
                  <option value="Ironing">Ironing</option>
                  <option value="Stain Removal">Stain Removal</option>
                  <option value="Pickup & Delivery">Pickup & Delivery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Order Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.min_order_quantity}
                  onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popularity Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.popularity_score}
                  onChange={(e) => setFormData({ ...formData, popularity_score: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/service-image.jpg"
              />
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={isAdding ? handleAddService : handleUpdateService}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isAdding ? 'Add Service' : 'Update Service'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first service'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Your First Service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.service_name || service.name}
                      </h3>
                      {service.service_code && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {service.service_code}
                        </span>
                      )}
                    </div>
                    {service.status !== undefined && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        service.status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.status ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  {service.price && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ${service.price}
                      </p>
                      {service.min_order_quantity && service.min_order_quantity > 1 && (
                        <p className="text-xs text-gray-500">Min {service.min_order_quantity} items</p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {service.image_url && (
                  <div className="mb-4">
                    <img 
                      src={service.image_url} 
                      alt={service.service_name || service.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  {service.category && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {service.category}
                      </span>
                      {service.duration_estimate && (
                        <span className="text-sm text-gray-500">
                          ⏱️ {service.duration_estimate}
                        </span>
                      )}
                      {service.popularity_score && service.popularity_score > 0 && (
                        <span className="text-sm text-orange-500">
                          ⭐ {service.popularity_score}/100
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-gray-600 line-clamp-3">
                    {service.description || 'No description available'}
                  </p>
                </div>
                
                {service.created_at && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(service.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
