"use client";

import { useState } from "react";
import { Settings, Zap, X, TrendingUp, DollarSign, Package, Phone } from "lucide-react";
import SettingsForm from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSave = (message: string) => {
    showNotification('success', message);
  };

  const handleError = (message: string) => {
    showNotification('error', message);
  };

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
              <Settings className="w-10 h-10 text-white relative z-10" />
              <Zap className="absolute top-2 right-2 w-4 h-4 text-white opacity-80" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-gradient">
                Settings
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your shop configuration and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-pulse ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            notification.type === 'success' ? 'bg-white' : 'bg-white'
          }`}></div>
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-80 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/40 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Config</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Active
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
              <p className="text-sm font-medium text-gray-600">Tax Settings</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Configured
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
              <p className="text-sm font-medium text-gray-600">Support Contact</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Ready
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="relative z-10">
        <SettingsForm 
          onSave={handleSave}
          onError={handleError}
        />
      </div>
    </div>
  );
}
