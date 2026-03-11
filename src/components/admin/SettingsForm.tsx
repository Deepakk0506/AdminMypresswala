"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Save, Settings, DollarSign, Phone, Percent, Package, RefreshCw } from "lucide-react";

interface SettingsData {
  delivery_charge: string;
  pickup_charge: string;
  tax_rate: string;
  minimum_order_amount: string;
  currency: string;
  support_phone: string;
}

interface SettingsFormProps {
  onSave: (message: string) => void;
  onError: (message: string) => void;
}

export default function SettingsForm({ onSave, onError }: SettingsFormProps) {
  const [settings, setSettings] = useState<SettingsData>({
    delivery_charge: "50",
    pickup_charge: "30",
    tax_rate: "18",
    minimum_order_amount: "100",
    currency: "INR",
    support_phone: "+919876543210"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value");

      if (error) {
        console.error("Error fetching settings:", error);
        onError("Failed to fetch settings");
        return;
      }

      if (data) {
        const settingsObj = data.reduce((acc, setting) => {
          acc[setting.key as keyof SettingsData] = setting.value;
          return acc;
        }, {} as SettingsData);

        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      onError("Unexpected error fetching settings");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    console.log('🔧 Starting to save settings:', settings);
    
    try {
      // Use individual updates instead of upsert for better error handling
      const promises = Object.entries(settings).map(async ([key, value]) => {
        console.log(`💾 Updating ${key} to: ${value}`);
        
        const { data, error } = await supabase
          .from("settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key)
          .select();

        console.log(`📊 Result for ${key}:`, { data, error });

        if (error) {
          console.error(`❌ Error updating ${key}:`, error);
          throw error;
        }
        return { key, success: true, data };
      });

      const results = await Promise.all(promises);
      console.log('✅ All settings saved successfully:', results);
      onSave("Settings saved successfully!");
    } catch (err) {
      console.error("❌ Unexpected error saving settings:", err);
      onError("Failed to save settings");
    }
    setSaving(false);
  };

  const handleReset = () => {
    fetchSettings();
  };

  const getIcon = (field: keyof SettingsData) => {
    switch (field) {
      case 'delivery_charge':
      case 'pickup_charge':
        return <DollarSign className="w-5 h-5" />;
      case 'tax_rate':
        return <Percent className="w-5 h-5" />;
      case 'minimum_order_amount':
        return <Package className="w-5 h-5" />;
      case 'support_phone':
        return <Phone className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getLabel = (field: keyof SettingsData) => {
    switch (field) {
      case 'delivery_charge':
        return 'Delivery Charge';
      case 'pickup_charge':
        return 'Pickup Charge';
      case 'tax_rate':
        return 'Tax Rate (%)';
      case 'minimum_order_amount':
        return 'Minimum Order Amount';
      case 'currency':
        return 'Currency';
      case 'support_phone':
        return 'Support Phone Number';
      default:
        return field;
    }
  };

  const getPlaceholder = (field: keyof SettingsData) => {
    switch (field) {
      case 'delivery_charge':
        return '50';
      case 'pickup_charge':
        return '30';
      case 'tax_rate':
        return '18';
      case 'minimum_order_amount':
        return '100';
      case 'currency':
        return 'INR';
      case 'support_phone':
        return '+919876543210';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl opacity-50"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ⚙️ System Settings
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Configure your shop's operational settings
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(settings).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    {getIcon(key as keyof SettingsData)}
                    <span>{getLabel(key as keyof SettingsData)}</span>
                  </div>
                </label>
                <div className="relative">
                  {(key === 'delivery_charge' || key === 'pickup_charge' || key === 'minimum_order_amount') && (
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 font-semibold text-lg">₹</span>
                  )}
                  {(key === 'tax_rate') && (
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 font-semibold text-lg">%</span>
                  )}
                  <input
                    type={key === 'support_phone' ? 'tel' : key === 'currency' ? 'text' : 'number'}
                    step={key === 'tax_rate' ? '0.01' : '1'}
                    min="0"
                    value={value}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    disabled={saving}
                    className={`w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500 disabled:opacity-50 ${
                      (key === 'delivery_charge' || key === 'pickup_charge' || key === 'minimum_order_amount') ? 'pl-12' : 
                      key === 'tax_rate' ? 'pl-12' : 'pl-5'
                    }`}
                    placeholder={getPlaceholder(key as keyof SettingsData)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Save className="w-5 h-5 relative z-10" />
              <span className="font-semibold relative z-10">
                {saving ? "Saving..." : "Save Settings"}
              </span>
              <div className="absolute -right-2 -top-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </button>

            <button
              onClick={handleReset}
              disabled={saving}
              className="group flex items-center gap-3 px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
