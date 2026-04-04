"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Service, 
  Garment, 
  GarmentCategory, 
  ServiceGarmentPricing, 
  ServiceGarmentPricingWithDetails,
  GarmentWithCategory,
  PricingFormData 
} from "@/types/database";
import { 
  DollarSign, 
  Save, 
  X, 
  Check, 
  XCircle, 
  Edit3, 
  Grid3x3, 
  RefreshCw,
  AlertCircle 
} from "lucide-react";

interface PricingGridProps {
  className?: string;
}

export default function PricingGrid({ className = "" }: PricingGridProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [garments, setGarments] = useState<GarmentWithCategory[]>([]);
  const [pricing, setPricing] = useState<ServiceGarmentPricingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{serviceId: number, garmentId: number} | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    service_id: 0,
    garment_id: 0,
    price: "",
    is_available: true
  });

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching services:", error);
      } else {
        setServices(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching services:", err);
    }
  };

  const fetchGarments = async () => {
    try {
      const { data, error } = await supabase
        .from("garments")
        .select(`
          *,
          garment_categories (*)
        `)
        .order("name");

      if (error) {
        console.error("Error fetching garments:", error);
      } else {
        setGarments(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching garments:", err);
    }
  };

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("service_garment_pricing")
        .select(`
          *,
          services (*),
          garments (
            *,
            garment_categories (*)
          )
        `);

      if (error) {
        console.error("Error fetching pricing:", error);
        setError(error.message);
        setPricing([]);
      } else {
        setPricing(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Unexpected error: ${err}`);
      setPricing([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
    fetchGarments();
    fetchPricing();
  }, []);

  const getPricingForCell = (serviceId: number, garmentId: number) => {
    return pricing.find(p => p.service_id === serviceId && p.garment_id === garmentId);
  };

  const handleEditCell = (serviceId: number, garmentId: number) => {
    const existingPricing = getPricingForCell(serviceId, garmentId);
    setEditingCell({ serviceId, garmentId });
    setFormData({
      service_id: serviceId,
      garment_id: garmentId,
      price: existingPricing ? existingPricing.price.toString() : "",
      is_available: existingPricing ? existingPricing.is_available : true
    });
  };

  const handleSaveCell = async () => {
    if (!editingCell) return;

    setSaving(true);
    setError(null);

    try {
      const existingPricing = getPricingForCell(editingCell.serviceId, editingCell.garmentId);
      
      const pricingData = {
        service_id: editingCell.serviceId,
        garment_id: editingCell.garmentId,
        price: parseFloat(formData.price) || 0,
        is_available: formData.is_available
      };

      let result;
      if (existingPricing) {
        // Update existing
        result = await supabase
          .from('service_garment_pricing')
          .update(pricingData)
          .eq('id', existingPricing.id);
      } else {
        // Insert new
        result = await supabase
          .from('service_garment_pricing')
          .insert([pricingData]);
      }

      if (result.error) {
        setError(`Failed to save pricing: ${result.error.message}`);
      } else {
        setEditingCell(null);
        setFormData({ service_id: 0, garment_id: 0, price: "", is_available: true });
        await fetchPricing();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }

    setSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setFormData({ service_id: 0, garment_id: 0, price: "", is_available: true });
  };

  const handleToggleAvailability = async (serviceId: number, garmentId: number) => {
    const existingPricing = getPricingForCell(serviceId, garmentId);
    
    if (!existingPricing) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('service_garment_pricing')
        .update({ is_available: !existingPricing.is_available })
        .eq('id', existingPricing.id);

      if (error) {
        setError(`Failed to update availability: ${error.message}`);
      } else {
        await fetchPricing();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }

    setSaving(false);
  };

  const handleBulkUpdate = async () => {
    if (!confirm('This will create pricing entries for all missing combinations. Continue?')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const newEntries = [];
      
      for (const service of services) {
        for (const garment of garments) {
          const existing = getPricingForCell(service.id, garment.id);
          if (!existing) {
            newEntries.push({
              service_id: service.id,
              garment_id: garment.id,
              price: 0,
              is_available: false
            });
          }
        }
      }

      if (newEntries.length > 0) {
        const { error } = await supabase
          .from('service_garment_pricing')
          .insert(newEntries);

        if (error) {
          setError(`Failed to create bulk entries: ${error.message}`);
        } else {
          await fetchPricing();
        }
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }

    setSaving(false);
  };

  const groupedGarments = garments.reduce((acc, garment) => {
    const categoryName = garment.garment_categories?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(garment);
    return acc;
  }, {} as Record<string, GarmentWithCategory[]>);

  if (loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading pricing data...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
            <Grid3x3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pricing Matrix</h2>
            <p className="text-gray-600">Set prices for garments across all services</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkUpdate}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Fill Missing
          </button>
          <button
            onClick={fetchPricing}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Grid3x3 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cells</p>
              <p className="text-lg font-semibold">{services.length * garments.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Priced</p>
              <p className="text-lg font-semibold">{pricing.filter(p => p.price > 0).length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-lg font-semibold">{pricing.filter(p => p.is_available).length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Missing</p>
              <p className="text-lg font-semibold">{(services.length * garments.length) - pricing.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 min-w-[150px]">
                  Garment / Category
                </th>
                {services.map((service) => (
                  <th key={service.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[100px]">{service.name}</span>
                      <span className="text-xs text-gray-500 mt-1">Price (₹)</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(groupedGarments).map(([categoryName, categoryGarments]) => (
                <React.Fragment key={categoryName}>
                  {/* Category Header */}
                  <tr className="bg-gray-50">
                    <td colSpan={services.length + 1} className="px-4 py-2 text-sm font-semibold text-gray-700">
                      {categoryName}
                    </td>
                  </tr>
                  {/* Garment Rows */}
                  {categoryGarments.map((garment) => (
                    <tr key={garment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                        <div className="truncate max-w-[140px]" title={garment.name}>
                          {garment.name}
                        </div>
                      </td>
                      {services.map((service) => {
                        const cellPricing = getPricingForCell(service.id, garment.id);
                        const isEditing = editingCell?.serviceId === service.id && editingCell?.garmentId === garment.id;
                        
                        return (
                          <td key={`${service.id}-${garment.id}`} className="px-2 py-2 text-center border-l border-gray-100">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={formData.price}
                                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0.00"
                                />
                                <div className="flex items-center justify-center gap-2">
                                  <label className="flex items-center gap-1 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={formData.is_available}
                                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                      className="rounded"
                                    />
                                    Available
                                  </label>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={handleSaveCell}
                                    disabled={saving}
                                    className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                                  >
                                    <Save className="w-3 h-3 inline" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="flex-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                  >
                                    <X className="w-3 h-3 inline" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                                onClick={() => handleEditCell(service.id, garment.id)}
                              >
                                {cellPricing ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-2">
                                      <span className={`font-semibold ${cellPricing.price > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                        ₹{cellPricing.price.toFixed(2)}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleAvailability(service.id, garment.id);
                                        }}
                                        className={`p-1 rounded ${cellPricing.is_available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                        title={cellPricing.is_available ? 'Available' : 'Not Available'}
                                      >
                                        {cellPricing.is_available ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                      </button>
                                    </div>
                                    <Edit3 className="w-3 h-3 text-gray-400 mx-auto" />
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="text-gray-400 text-sm">Not set</span>
                                    <Edit3 className="w-3 h-3 text-gray-400 mx-auto" />
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {garments.length === 0 && (
        <div className="text-center py-12">
          <Grid3x3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No garments available</h3>
          <p className="text-gray-600">Add garments and categories first to manage pricing</p>
        </div>
      )}

      {services.length === 0 && (
        <div className="text-center py-12">
          <Grid3x3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No services available</h3>
          <p className="text-gray-600">Add services first to manage pricing</p>
        </div>
      )}
    </div>
  );
}
