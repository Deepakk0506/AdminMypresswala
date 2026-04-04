"use client";

import { useState } from "react";
import ServicesManager from "@/components/admin/ServicesManager";
import GarmentCategoriesManager from "@/components/admin/GarmentCategoriesManager";
import GarmentsManager from "@/components/admin/GarmentsManager";
import PricingGrid from "@/components/admin/PricingGrid";
import { 
  Package, 
  Tag, 
  Shirt, 
  Grid3x3, 
  Settings, 
  BarChart3 
} from "lucide-react";

type TabType = 'services' | 'categories' | 'garments' | 'pricing';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('services');

  const tabs = [
    {
      id: 'services' as TabType,
      label: 'Services',
      icon: Package,
      description: 'Manage laundry and pressing services',
      color: 'blue'
    },
    {
      id: 'categories' as TabType,
      label: 'Categories',
      icon: Tag,
      description: 'Manage garment categories',
      color: 'purple'
    },
    {
      id: 'garments' as TabType,
      label: 'Garments',
      icon: Shirt,
      description: 'Manage individual garment items',
      color: 'green'
    },
    {
      id: 'pricing' as TabType,
      label: 'Pricing Matrix',
      icon: Grid3x3,
      description: 'Set prices for services and garments',
      color: 'indigo'
    }
  ];

  const getTabColor = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      purple: isActive ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      green: isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600 hover:bg-green-200',
      indigo: isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
    };
    return colors[color as keyof typeof colors];
  };

  const getTabIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      indigo: 'text-indigo-600'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Manage services, garments, and pricing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm text-gray-600">Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 ${getTabIconColor(tab.color)}`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${getTabColor(tab.color, activeTab === tab.id)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'services' && (
          <div className="animate-fadeIn">
            <ServicesManager />
          </div>
        )}
        
        {activeTab === 'categories' && (
          <div className="animate-fadeIn">
            <GarmentCategoriesManager />
          </div>
        )}
        
        {activeTab === 'garments' && (
          <div className="animate-fadeIn">
            <GarmentsManager />
          </div>
        )}
        
        {activeTab === 'pricing' && (
          <div className="animate-fadeIn">
            <PricingGrid />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
