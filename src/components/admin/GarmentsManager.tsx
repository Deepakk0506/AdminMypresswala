"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Garment, GarmentCategory, GarmentFormData, GarmentWithCategory } from "@/types/database";
import { Search, Plus, Edit2, Trash2, Save, X, Package, Sparkles, Zap, Filter } from "lucide-react";

interface GarmentsManagerProps {
  className?: string;
}

export default function GarmentsManager({ className = "" }: GarmentsManagerProps) {
  const [garments, setGarments] = useState<GarmentWithCategory[]>([]);
  const [categories, setCategories] = useState<GarmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<GarmentFormData>({
    name: "",
    category_id: 0,
    description: ""
  });

  const fetchGarments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("garments")
        .select(`
          *,
          garment_categories (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching garments:", error);
        setError(error.message);
        setGarments([]);
      } else {
        setGarments(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Unexpected error: ${err}`);
      setGarments([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("garment_categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchGarments();
    fetchCategories();
  }, []);

  const handleAddGarment = async () => {
    if (!formData.name || !formData.category_id) {
      setError("Garment name and category are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('garments')
        .insert([formData])
        .select();

      if (error) {
        setError(`Failed to add garment: ${error.message}`);
      } else {
        setFormData({ name: "", category_id: 0, description: "" });
        setIsAdding(false);
        await fetchGarments();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleEditGarment = (garment: GarmentWithCategory) => {
    setEditingId(garment.id);
    setFormData({
      name: garment.name || "",
      category_id: garment.category_id || 0,
      description: garment.description || ""
    });
  };

  const handleUpdateGarment = async () => {
    if (!editingId) {
      setError("No garment selected for update");
      return;
    }
    
    if (!formData.name || !formData.category_id) {
      setError("Garment name and category are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('garments')
        .update(formData)
        .eq('id', editingId)
        .select();

      if (error) {
        setError(`Failed to update garment: ${error.message}`);
      } else {
        setEditingId(null);
        setFormData({ name: "", category_id: 0, description: "" });
        await fetchGarments();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleDeleteGarment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this garment?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('garments')
        .delete()
        .eq('id', id);

      if (error) {
        setError(`Failed to delete garment: ${error.message}`);
      } else {
        await fetchGarments();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", category_id: 0, description: "" });
    setError(null);
  };

  const filteredGarments = garments.filter(garment => {
    const matchesSearch = garment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (garment.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      garment.garment_categories?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || garment.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const predefinedGarments = {
    "Men's Wear": ["Shirt", "T-Shirt", "Trousers", "Jeans", "Suit", "Blazer", "Shorts", "Jacket"],
    "Women's Wear": ["Dress", "Blouse", "Skirt", "Saree", "Salwar Kameez", "Leggings", "Top", "Kurti"],
    "Kids Wear": ["School Uniform", "T-Shirt", "Shorts", "Dress", "Jacket", "Pajamas"],
    "Home Linen": ["Bed Sheet", "Pillow Cover", "Curtains", "Table Cloth", "Towel", "Blanket"]
  };

  const getPredefinedGarments = () => {
    const category = categories.find(cat => cat.id === formData.category_id);
    return category ? predefinedGarments[category.name as keyof typeof predefinedGarments] || [] : [];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Garments</h2>
            <p className="text-gray-600">Manage individual garment items</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Zap className="w-4 h-4" />
          Add Garment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search garments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="relative min-w-48">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
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
            {isAdding ? 'Add New Garment' : 'Edit Garment'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value), name: "" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={0}>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Shirt, Dress, Bed Sheet"
                />
                {formData.category_id && getPredefinedGarments().length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {getPredefinedGarments().map((garment) => (
                        <button
                          key={garment}
                          type="button"
                          onClick={() => setFormData({ ...formData, name: garment })}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                        >
                          {garment}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Describe the garment..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={isAdding ? handleAddGarment : handleUpdateGarment}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isAdding ? 'Add Garment' : 'Update Garment'}
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

      {/* Garments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading garments...</p>
        </div>
      ) : filteredGarments.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No garments found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'Add your first garment to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGarments.map((garment) => (
            <div
              key={garment.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{garment.name}</h3>
                    <p className="text-xs text-gray-500">{garment.garment_categories?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditGarment(garment)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit garment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGarment(garment.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete garment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {garment.description && (
                <p className="text-sm text-gray-600 mb-3">{garment.description}</p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created: {new Date(garment.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
