"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Edit2, Trash2, Package, DollarSign, Calendar, Tag, Scale, Truck } from "lucide-react";
import ServiceIcon from "./services/ServiceIcon";

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

interface PricingTableProps {
  pricing: Pricing[];
  onEdit: (pricing: Pricing) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function PricingTable({ pricing, onEdit, onDelete, loading = false }: PricingTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing?')) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnitIcon = (unit: string) => {
    switch (unit) {
      case 'per item':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'per kg':
        return <Scale className="w-4 h-4 text-blue-600" />;
      case 'per trip':
        return <Truck className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-blue-600" />;
    }
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'per item':
        return 'Per Item';
      case 'per kg':
        return 'Per Kilogram';
      case 'per trip':
        return 'Per Trip';
      default:
        return unit;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  if (pricing.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8">
        <div className="text-center py-12">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl inline-block mb-6 shadow-lg">
            <DollarSign className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            No Pricing Data Found
          </h3>
          <p className="text-gray-600 text-lg">
            Start by adding pricing for your services
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Pricing Information
          </h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {pricing.length} {pricing.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pricing.map((item, index) => (
              <tr 
                key={item.id} 
                className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                {/* Service Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg shadow-sm border border-blue-200">
                      {(() => {
                        console.log(`🔍 PricingTable - Service Name: "${item.services?.service_name}"`);
                        console.log(`🔍 Full service object:`, item.services);
                        return item.services?.service_name ? (
                          <ServiceIcon serviceName={item.services.service_name} size={18} />
                        ) : (
                          <Package className="w-4 h-4 text-blue-700" />
                        );
                      })()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.services?.service_name || 'Unknown Service'}
                    </span>
                  </div>
                </td>

                {/* Unit */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg shadow-sm border border-blue-200">
                      {getUnitIcon(item.unit)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {getUnitLabel(item.unit)}
                    </span>
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      ₹{item.price.toFixed(2)}
                    </span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </td>

                {/* Last Updated */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(item.updated_at)}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 hover:rotate-3"
                      title="Edit pricing"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 hover:-rotate-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete pricing"
                    >
                      {deletingId === item.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {pricing.length} pricing {pricing.length === 1 ? 'entry' : 'entries'}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
