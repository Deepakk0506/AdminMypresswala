"use client";

import { useState } from "react";
import { X, Upload, ChevronRight, ChevronLeft, Store, MapPin, Phone, Mail, Globe, Clock, Users, Package, Star, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { NotificationService } from "@/lib/notifications";

interface AddShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShopAdded: () => void;
}

const SHOP_CATEGORIES = [
    "Laundry & Dry Cleaning",
    "Ironing & Pressing", 
    "Premium Garment Care",
    "Express Services",
    "Wedding & Special Occasion",
    "Corporate & Bulk Services",
    "Eco-Friendly Services"
];

const COMMON_SERVICES = {
    "Laundry & Dry Cleaning": ["Dry Cleaning", "Laundry", "Stain Removal", "Folding"],
    "Ironing & Pressing": ["Ironing", "Steaming", "Pressing", "Crease Removal"],
    "Premium Garment Care": ["Luxury Garments", "Silk Care", "Wool Care", "Delicate Fabrics"],
    "Express Services": ["Same Day Service", "2-Hour Service", "Emergency Service", "Quick Turnaround"],
    "Wedding & Special Occasion": ["Wedding Wear", "Bridal Gowns", "Specialty Garments", "Heirloom Care"],
    "Corporate & Bulk Services": ["Uniforms", "Bulk Laundry", "Corporate Contracts", "Regular Service"],
    "Eco-Friendly Services": ["Organic Cleaning", "Green Products", "Eco-Friendly", "Sustainable"]
};

export default function AddShopModal({ isOpen, onClose, onShopAdded }: AddShopModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        shop_name: "",
        owner_name: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        category: "",
        
        // Step 2: Operations
        opening_time: "09:00",
        closing_time: "18:00",
        services: [] as string[],
        equipment: [] as string[],
        specialties: [] as string[],
        employees: 1,
        
        // Step 3: Branding
        description: "",
        established: new Date().getFullYear().toString()
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileName = `shop-${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('shop-images')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('shop-images')
                .getPublicUrl(fileName);

            setImageUrl(publicUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const shopData = {
                ...formData,
                image_url: imageUrl,
                rating: 0.0,
                completed_orders: 0,
                current_load: 0.0,
                revenue: 0.0,
                last_month_orders: 0,
                customer_satisfaction: 0.0,
                services: formData.services,
                specialties: formData.specialties,
                equipment: formData.equipment,
                certifications: [],
                average_turnaround: "24 hours"
            };

            const { data, error } = await supabase.from('shops').insert(shopData).select('id');
            
            if (error) throw error;
            
            // Send notification for shop submission
            if (data && data[0]) {
                await NotificationService.sendShopSubmissionNotification(data[0].id, formData.shop_name);
                console.log('📢 Shop submission notification sent');
            }
            
            onShopAdded();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error creating shop:', error);
            alert('Failed to create shop');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            shop_name: "",
            owner_name: "",
            phone: "",
            email: "",
            website: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            category: "",
            opening_time: "09:00",
            closing_time: "18:00",
            services: [],
            equipment: [],
            specialties: [],
            employees: 1,
            description: "",
            established: new Date().getFullYear().toString()
        });
        setImageUrl("");
        setCurrentStep(1);
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Add New Shop
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                                    step <= currentStep 
                                        ? "bg-blue-500 text-white" 
                                        : "bg-gray-200 text-gray-500"
                                )}>
                                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                                </div>
                                <div className="ml-3">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        step <= currentStep ? "text-blue-600" : "text-gray-500"
                                    )}>
                                        {step === 1 && "Basic Info"}
                                        {step === 2 && "Operations"}
                                        {step === 3 && "Branding"}
                                    </p>
                                </div>
                                {step < 3 && (
                                    <div className="w-12 h-0.5 bg-gray-300 mx-4" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name *</label>
                                    <input
                                        type="text"
                                        value={formData.shop_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter shop name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                                    <input
                                        type="text"
                                        value={formData.owner_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter owner name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+91 12345 67890"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="shop@example.com"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="www.example.com"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select category</option>
                                        {SHOP_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Street address"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="City"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="560001"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Operations Setup</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                                    <input
                                        type="time"
                                        value={formData.opening_time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, opening_time: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                                    <input
                                        type="time"
                                        value={formData.closing_time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, closing_time: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.employees}
                                        onChange={(e) => setFormData(prev => ({ ...prev, employees: parseInt(e.target.value) || 1 }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
                                    <input
                                        type="text"
                                        value={formData.established}
                                        onChange={(e) => setFormData(prev => ({ ...prev, established: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="2020"
                                    />
                                </div>
                            </div>
                            
                            {formData.category && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Services Offered</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {COMMON_SERVICES[formData.category as keyof typeof COMMON_SERVICES]?.map(service => (
                                            <label key={service} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.services.includes(service)}
                                                    onChange={() => toggleService(service)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{service}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Branding & Review</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Logo/Image</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="Shop logo" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                                        >
                                            {uploading ? 'Uploading...' : 'Choose Image'}
                                        </label>
                                        <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe your shop and services..."
                                />
                            </div>
                            
                            {/* Review Section */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-4">Review Shop Details</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Name:</strong> {formData.shop_name}</p>
                                    <p><strong>Owner:</strong> {formData.owner_name}</p>
                                    <p><strong>Category:</strong> {formData.category}</p>
                                    <p><strong>Contact:</strong> {formData.phone} | {formData.email}</p>
                                    <p><strong>Location:</strong> {formData.address}, {formData.city}</p>
                                    <p><strong>Hours:</strong> {formData.opening_time} - {formData.closing_time}</p>
                                    <p><strong>Services:</strong> {formData.services.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                            currentStep === 1 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    {currentStep === 3 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Shop'}
                            <Store className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
