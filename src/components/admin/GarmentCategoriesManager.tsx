"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { GarmentCategory, GarmentCategoryFormData } from "@/types/database";
import { Search, Plus, Edit2, Trash2, Save, X, Tag, Sparkles, Zap } from "lucide-react";

interface GarmentCategoriesManagerProps {
  className?: string;
}

export default function GarmentCategoriesManager({ className = "" }: GarmentCategoriesManagerProps) {
  const [categories, setCategories] = useState<GarmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<GarmentCategoryFormData>({
    name: "",
    description: ""
  });

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("garment_categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching categories:", error);
        setError(error.message);
        setCategories([]);
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Unexpected error: ${err}`);
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!formData.name) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('garment_categories')
        .insert([formData])
        .select();

      if (error) {
        setError(`Failed to add category: ${error.message}`);
      } else {
        setFormData({ name: "", description: "" });
        setIsAdding(false);
        await fetchCategories();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleEditCategory = (category: GarmentCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || "",
      description: category.description || ""
    });
  };

  const handleUpdateCategory = async () => {
    if (!editingId) {
      setError("No category selected for update");
      return;
    }
    
    if (!formData.name) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('garment_categories')
        .update(formData)
        .eq('id', editingId)
        .select();

      if (error) {
        setError(`Failed to update category: ${error.message}`);
      } else {
        setEditingId(null);
        setFormData({ name: "", description: "" });
        await fetchCategories();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all garments in this category.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('garment_categories')
        .delete()
        .eq('id', id);

      if (error) {
        setError(`Failed to delete category: ${error.message}`);
      } else {
        await fetchCategories();
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

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const predefinedCategories = [
    "Men's Wear",
    "Women's Wear", 
    "Kids Wear",
    "Home Linen"
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Garment Categories</h2>
            <p className="text-gray-600">Manage clothing and linen categories</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Zap className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            {isAdding ? 'Add New Category' : 'Edit Category'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Men's Wear, Women's Wear"
              />
              {!isAdding && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {predefinedCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, name: cat })}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Describe the category..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={isAdding ? handleAddCategory : handleUpdateCategory}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isAdding ? 'Add Category' : 'Update Category'}
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

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-8">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No categories found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first category to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Tag className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created: {new Date(category.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
