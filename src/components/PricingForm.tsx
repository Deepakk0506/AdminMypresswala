"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Save, X, DollarSign, Package, RefreshCw } from "lucide-react";

interface Service {
  id: string;
  service_name: string;
}

interface PricingFormData {
  service_id: string;
  unit: string;
  price: string;
}

interface PricingFormProps {
  initialData?: PricingFormData & { id?: string };
  onSubmit: (data: PricingFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PricingForm({ initialData, onSubmit, onCancel, loading = false }: PricingFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [formData, setFormData] = useState<PricingFormData>({
    service_id: "",
    unit: "per item",
    price: ""
  });

  const units = [
    { value: "per item", label: "Per Item" },
    { value: "per kg", label: "Per Kilogram" },
    { value: "per trip", label: "Per Trip" }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        service_id: initialData.service_id,
        unit: initialData.unit,
        price: initialData.price
      });
    }
  }, [initialData]);

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, service_name")
        .eq("status", true)
        .order("service_name");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_id || !formData.price) {
      return;
    }

    await onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      service_id: initialData?.service_id || "",
      unit: initialData?.unit || "per item",
      price: initialData?.price || ""
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
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              disabled={loading || servicesLoading}
              className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 disabled:opacity-50"
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.service_name}
                </option>
              ))}
            </select>
            {servicesLoading && (
              <p className="text-sm text-gray-500 mt-2">Loading services...</p>
            )}
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Unit Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {units.map((unit) => (
                <label
                  key={unit.value}
                  className={`relative flex items-center p-4 bg-white/80 backdrop-blur-sm border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.unit === unit.value
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="unit"
                    value={unit.value}
                    checked={formData.unit === unit.value}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    disabled={loading}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      formData.unit === unit.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}>
                      {formData.unit === unit.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`font-medium ${
                      formData.unit === unit.value ? "text-blue-700" : "text-gray-700"
                    }`}>
                      {unit.label}
                    </span>
                  </div>
                </label>
              ))}
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
                className="w-full pl-12 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500 disabled:opacity-50"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || !formData.service_id || !formData.price}
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
