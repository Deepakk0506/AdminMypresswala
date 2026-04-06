"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Save, X, DollarSign, Package, RefreshCw, Package as PackageIcon, Scale, Truck } from "lucide-react";
import ServiceIcon from "./services/ServiceIcon";

interface Service {
  id: string;
  name: string;
}

interface Garment {
  id: string;
  name: string;
}

interface PricingFormData {
  service_id: string;
  garment_id: string;
  price: string;
  is_available: boolean;
}

interface PricingFormProps {
  initialData?: PricingFormData & { id?: string };
  onSubmit: (data: PricingFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PricingForm({ initialData, onSubmit, onCancel, loading = false }: PricingFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [garmentsLoading, setGarmentsLoading] = useState(true);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isGarmentDropdownOpen, setIsGarmentDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<PricingFormData>({
    service_id: "",
    garment_id: "",
    price: "",
    is_available: true
  });

  useEffect(() => {
    fetchServices();
    fetchGarments();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        service_id: initialData.service_id,
        garment_id: initialData.garment_id,
        price: initialData.price,
        is_available: initialData.is_available ?? true
      });
    }
  }, [initialData]);

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching services:", error);
      } else {
        setServices(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    setServicesLoading(false);
  };

  const fetchGarments = async () => {
    setGarmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from("garments")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching garments:", error);
      } else {
        setGarments(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    setGarmentsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_id || !formData.garment_id || !formData.price) {
      return;
    }

    console.log('Submitting pricing form:', formData);
    await onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      service_id: initialData?.service_id || "",
      garment_id: initialData?.garment_id || "",
      price: initialData?.price || "",
      is_available: initialData?.is_available ?? true
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl opacity-50"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {initialData ? "✏️ Edit Pricing" : "➕ Add New Pricing"}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {initialData ? "Update pricing information" : "Set pricing for your services"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Package className="inline w-4 h-4 mr-2 text-blue-500" />
              Service *
            </label>
            {/* Custom Service Dropdown with Icons */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                disabled={loading || servicesLoading}
                className="w-full px-12 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 disabled:opacity-50 text-left flex items-center justify-between"
              >
                <span className={formData.service_id ? "text-gray-900" : "text-gray-500"}>
                  {formData.service_id 
                    ? (() => {
                        const selectedService = services.find(s => s.id === formData.service_id);
                        return selectedService ? selectedService.name : "Select a service";
                      })()
                    : "Select a service"
                  }
                </span>
                <Package className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown Options */}
              {isServiceDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div className="py-2">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, service_id: service.id });
                          setIsServiceDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                          formData.service_id === service.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <ServiceIcon serviceName={service.name} size={16} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {service.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {servicesLoading && (
              <p className="text-sm text-gray-500 mt-2">Loading services...</p>
            )}
          </div>

          {/* Garment Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Package className="inline w-4 h-4 mr-2 text-blue-500" />
              Garment *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsGarmentDropdownOpen(!isGarmentDropdownOpen)}
                disabled={loading || garmentsLoading}
                className="w-full px-12 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 disabled:opacity-50 text-left flex items-center justify-between"
              >
                <span className={formData.garment_id ? "text-gray-900" : "text-gray-500"}>
                  {formData.garment_id 
                    ? (() => {
                        const selectedGarment = garments.find(g => g.id === formData.garment_id);
                        return selectedGarment ? selectedGarment.name : "Select a garment";
                      })()
                    : "Select a garment"
                  }
                </span>
                <Package className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown Options */}
              {isGarmentDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div className="py-2">
                    {garments.map((garment) => (
                      <button
                        key={garment.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, garment_id: garment.id });
                          setIsGarmentDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                          formData.garment_id === garment.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {garment.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {garmentsLoading && (
              <p className="text-sm text-gray-500 mt-2">Loading garments...</p>
            )}
          </div>

          {/* Availability Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Availability
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="is_available"
                  checked={formData.is_available === true}
                  onChange={() => setFormData({ ...formData, is_available: true })}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Available</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="is_available"
                  checked={formData.is_available === false}
                  onChange={() => setFormData({ ...formData, is_available: false })}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Unavailable</span>
              </label>
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Price (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-500 font-semibold text-lg">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                disabled={loading}
                className="w-full pl-12 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || !formData.service_id || !formData.garment_id || !formData.price}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Save className="w-5 h-5 relative z-10" />
              <span className="font-semibold relative z-10">
                {loading ? "Saving..." : initialData ? "Update Pricing" : "Save Pricing"}
              </span>
              <div className="absolute -right-2 -top-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="group flex items-center gap-3 px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Reset</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <X className="w-5 h-5" />
              <span className="font-medium">Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
