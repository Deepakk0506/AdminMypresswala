"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus, Edit2, Trash2, Save, X, Package, Star, Clock, Tag, Sparkles, Zap, Shield, TrendingUp } from "lucide-react";

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
    setError(null);
    try {
      console.log('Adding service:', serviceData);
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();

      if (error) {
        console.error('Error adding service:', error);
        setError(`Failed to add service: ${error.message}`);
        setLoading(false);
        return;
      } else {
        console.log('Service added successfully:', data);
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
        await fetchServices();
      }
    } catch (err) {
      console.error('Unexpected error adding service:', err);
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
    setError(null);
    try {
      console.log('Updating service:', editingId, serviceData);
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingId);

      if (error) {
        console.error('Error updating service:', error);
        setError(`Failed to update service: ${error.message}`);
        setLoading(false);
        return;
      } else {
        console.log('Service updated successfully');
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
        await fetchServices();
      }
    } catch (err) {
      console.error('Unexpected error updating service:', err);
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
      console.log('Deleting service:', id);
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting service:', error);
        setError(`Failed to delete service: ${error.message}`);
        setLoading(false);
        return;
      } else {
        console.log('Service deleted successfully');
        await fetchServices();
      }
    } catch (err) {
      console.error('Unexpected error deleting service:', err);
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
    <div className="min-h-screen bg-gray-50 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl shadow-2xl relative overflow-hidden group transform hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Package className="w-10 h-10 text-white relative z-10" />
              <Sparkles className="absolute top-2 right-2 w-4 h-4 text-white opacity-80" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-gradient">
                Services
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your laundry and pressing services</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsAdding(true)}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Zap className="w-5 h-5 relative z-10" />
              <span className="font-semibold relative z-10">Add Service</span>
              <div className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl blur-lg opacity-20"></div>
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500 z-10" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl shadow-lg relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <X className="w-4 h-4 text-white" />
            </div>
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Service Form */}
      {(isAdding || editingId) && (
        <div className="mb-8 p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 relative z-10 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {isAdding ? '✨ Create New Service' : '🎨 Edit Service'}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                  placeholder="e.g., Premium Laundry Service"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                  rows={4}
                  placeholder="Describe your service..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 font-semibold text-lg">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                      placeholder="29.99"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Service Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                    <input
                      type="text"
                      value={formData.service_code}
                      onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                      placeholder="e.g., LAUNDRY001"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Duration Estimate
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    type="text"
                    value={formData.duration_estimate}
                    onChange={(e) => setFormData({ ...formData, duration_estimate: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                    placeholder="e.g., Usually ready in 2-3 days"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Min Order Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_order_quantity}
                    onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                    className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Popularity Score
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.popularity_score}
                      onChange={(e) => setFormData({ ...formData, popularity_score: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                      placeholder="0-100"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Image URL
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                    placeholder="https://example.com/service-image.jpg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="w-6 h-6 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Active Service
                  </span>
                </label>
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  onClick={isAdding ? handleAddService : handleUpdateService}
                  disabled={loading}
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <Zap className="w-5 h-5 relative z-10" />
                  <span className="font-semibold relative z-10">{isAdding ? 'Create Service' : 'Update Service'}</span>
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-3 px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <X className="w-5 h-5" />
                  <span className="font-medium">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-16 relative z-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 relative z-10">
          <div className="p-8 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl inline-block mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Package className="w-20 h-20 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">No services found</h3>
          <p className="text-gray-600 mb-8 text-lg">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first service'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5" />
              Add Your First Service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]"
            >
              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300">
                          {service.service_name || service.name}
                        </h3>
                        {service.service_code && (
                          <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-mono">
                            {service.service_code}
                          </span>
                        )}
                      </div>
                    </div>
                    {service.status !== undefined && (
                      <div className="inline-flex">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          service.status 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-sm' 
                            : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 shadow-sm'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${service.status ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          {service.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {service.price && (
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            ₹{service.price}
                          </span>
                        </div>
                        {service.min_order_quantity && service.min_order_quantity > 1 && (
                          <p className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded inline-block">
                            Min {service.min_order_quantity} items
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0">
                      <button
                        onClick={() => handleEditService(service)}
                        className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 hover:rotate-3"
                        title="Edit service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 hover:-rotate-3"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Image Section */}
                {service.image_url && (
                  <div className="mb-4 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <img 
                      src={service.image_url} 
                      alt={service.service_name || service.name}
                      className="w-full h-36 object-cover rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Content Section */}
                <div className="space-y-4">
                  {service.category && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                        <Tag className="w-3 h-3 mr-1" />
                        {service.category}
                      </span>
                      {service.duration_estimate && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {service.duration_estimate}
                        </span>
                      )}
                      {service.popularity_score && service.popularity_score > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 shadow-sm">
                          <Star className="w-3 h-3 mr-1" />
                          {service.popularity_score}/100
                        </span>
                      )}
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 leading-relaxed line-clamp-3 text-sm">
                      {service.description || 'No description available'}
                    </p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(service.created_at || '').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
