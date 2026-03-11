"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus, DollarSign, Zap, X, TrendingUp, Package } from "lucide-react";
import PricingForm from "@/components/PricingForm";
import PricingTable from "@/components/PricingTable";

interface Service {
  id: string;
  service_name: string;
}

interface Pricing {
  id: string;
  service_id: string;
  unit: string;
  price: number;
  created_at: string;
  updated_at: string;
  services?: Service;
}

interface PricingFormData {
  service_id: string;
  unit: string;
  price: string;
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Pricing | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("pricing")
        .select(`
          *,
          services (
            id,
            service_name
          )
        `)
        .order("updated_at", { ascending: false });

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
    fetchPricing();
  }, []);

  const handleAddPricing = async (formData: PricingFormData) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const pricingData = {
        service_id: formData.service_id,
        unit: formData.unit,
        price: parseFloat(formData.price)
      };

      const { data, error } = await supabase
        .from('pricing')
        .insert([pricingData])
        .select();

      if (error) {
        console.error('Error adding pricing:', error);
        setError(`Failed to add pricing: ${error.message}`);
      } else {
        console.log('Pricing added successfully:', data);
        setIsAdding(false);
        await fetchPricing();
        // Show success message
        showSuccessMessage('Pricing added successfully!');
      }
    } catch (err) {
      console.error('Unexpected error adding pricing:', err);
      setError(`Unexpected error: ${err}`);
    }
    setSubmitting(false);
  };

  const handleUpdatePricing = async (formData: PricingFormData) => {
    if (!editingItem) return;

    setSubmitting(true);
    setError(null);
    
    try {
      const pricingData = {
        service_id: formData.service_id,
        unit: formData.unit,
        price: parseFloat(formData.price),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('pricing')
        .update(pricingData)
        .eq('id', editingItem.id);

      if (error) {
        console.error('Error updating pricing:', error);
        setError(`Failed to update pricing: ${error.message}`);
      } else {
        console.log('Pricing updated successfully');
        setEditingItem(null);
        await fetchPricing();
        showSuccessMessage('Pricing updated successfully!');
      }
    } catch (err) {
      console.error('Unexpected error updating pricing:', err);
      setError(`Unexpected error: ${err}`);
    }
    setSubmitting(false);
  };

  const handleDeletePricing = async (id: string) => {
    setError(null);
    
    try {
      const { error } = await supabase
        .from('pricing')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting pricing:', error);
        setError(`Failed to delete pricing: ${error.message}`);
      } else {
        console.log('Pricing deleted successfully');
        await fetchPricing();
        showSuccessMessage('Pricing deleted successfully!');
      }
    } catch (err) {
      console.error('Unexpected error deleting pricing:', err);
      setError(`Unexpected error: ${err}`);
    }
  };

  const handleEdit = (item: Pricing) => {
    setEditingItem(item);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingItem(null);
    setError(null);
  };

  const showSuccessMessage = (message: string) => {
    // Create a simple success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-pulse';
    notification.innerHTML = `
      <div class="w-2 h-2 bg-white rounded-full"></div>
      <span class="font-medium">${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const filteredPricing = pricing.filter(item => 
    (item.services?.service_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.price.toString().includes(searchTerm)
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
              <DollarSign className="w-10 h-10 text-white relative z-10" />
              <Zap className="absolute top-2 right-2 w-4 h-4 text-white opacity-80" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-gradient">
                Pricing Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage service pricing and billing rates</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingItem(null);
              }}
              disabled={isAdding || editingItem !== null}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Plus className="w-5 h-5 relative z-10" />
              <span className="font-semibold relative z-10">Add Pricing</span>
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
            placeholder="Search by service name, unit, or price..."
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/40 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pricing Rules</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {pricing.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/40 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Price</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                ₹{pricing.length > 0 ? (pricing.reduce((sum, item) => sum + item.price, 0) / pricing.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/40 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {new Set(pricing.map(item => item.service_id)).size}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingItem) && (
        <div className="mb-8 relative z-10">
          <PricingForm
            initialData={editingItem ? {
              id: editingItem.id,
              service_id: editingItem.service_id,
              unit: editingItem.unit,
              price: editingItem.price.toString()
            } : undefined}
            onSubmit={isAdding ? handleAddPricing : handleUpdatePricing}
            onCancel={handleCancel}
            loading={submitting}
          />
        </div>
      )}

      {/* Pricing Table */}
      <div className="relative z-10">
        <PricingTable
          pricing={filteredPricing}
          onEdit={handleEdit}
          onDelete={handleDeletePricing}
          loading={loading}
        />
      </div>
    </div>
  );
}
