"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Service, ServiceFormData } from "@/types/database";
import { Search, Plus, Edit2, Trash2, Save, X, Package, Sparkles, Zap } from "lucide-react";

interface ServicesManagerProps {
  className?: string;
}

export default function ServicesManager({ className = "" }: ServicesManagerProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: ""
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
    if (!formData.name || !formData.description) {
      setError("Service name and description are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([formData])
        .select();

      if (error) {
        setError(`Failed to add service: ${error.message}`);
      } else {
        setFormData({ name: "", description: "" });
        setIsAdding(false);
        await fetchServices();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleEditService = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name || "",
      description: service.description || ""
    });
  };

  const handleUpdateService = async () => {
    if (!editingId) {
      setError("No service selected for update");
      return;
    }
    
    if (!formData.name || !formData.description) {
      setError("Service name and description are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('services')
        .update(formData)
        .eq('id', editingId)
        .select();

      if (error) {
        setError(`Failed to update service: ${error.message}`);
      } else {
        setEditingId(null);
        setFormData({ name: "", description: "" });
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

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setError(null);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Services</h2>
            <p className="text-gray-600">Manage laundry and pressing services</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Zap className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? 'Add New Service' : 'Edit Service'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Pressing, Ironing, Laundry"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the service..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={isAdding ? handleAddService : handleUpdateService}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isAdding ? 'Add Service' : 'Update Service'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No services found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first service to get started'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                  <p className="text-gray-600 mt-1">{service.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
