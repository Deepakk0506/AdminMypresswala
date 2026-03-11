"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Star, Truck, Calendar, MoreHorizontal, Store, TrendingUp, Users, Package, DollarSign, Filter, Clock, Award, Phone, Mail, Globe, ChevronRight, BarChart3, Activity, Zap, Shield, Coffee, Wifi, Eye, Trash2, ArrowLeft, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import AddShopModal from "@/components/AddShopModal";
import ShopApprovalDashboard from "@/components/ShopApprovalDashboard";

interface Shop {
    // Database fields
    id: string;
    shop_name: string;
    owner_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    opening_time: string;
    closing_time: string;
    rating: number;
    completed_orders: number;
    current_load: number;
    status: "Active" | "Busy" | "Offline" | "Maintenance";
    revenue: number;
    employees: number;
    services: string[];
    specialties: string[];
    equipment: string[];
    certifications: string[];
    website: string;
    established: string;
    average_turnaround: string;
    last_month_orders: number;
    customer_satisfaction: number;
    image_url: string;
    description: string;
    created_at: string;
    updated_at: string;
    approval_status: string;
    category: string;
    submitted_at: string;
    approved_at: string;
    approved_by: string;
    rejection_reason: string;
    
    // UI computed fields
    name: string;
    owner: string;
    location: string;
    completedOrders: number;
    currentLoad: number;
    lastMonthOrders: number;
    customerSatisfaction: number;
    averageTurnaround: string;
    contact: {
        phone: string;
        email: string;
        website: string;
    };
    operatingHours: {
        open: string;
        close: string;
    };
}

// Helper function to format database data to UI format
const formatShopData = (shop: any): Shop => {
    // Handle JSON arrays safely
    const parseArray = (data: any): string[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch {
                return [];
            }
        }
        return [];
    };

    return {
        ...shop,
        // Map database fields to UI expected fields
        name: shop.shop_name || '',
        owner: shop.owner_name || '',
        location: `${shop.address || ''}, ${shop.city || ''}, ${shop.state || ''}`.replace(/^, |, $/g, ''),
        completedOrders: shop.completed_orders || 0,
        currentLoad: shop.current_load || 0,
        lastMonthOrders: shop.last_month_orders || 0,
        customerSatisfaction: shop.customer_satisfaction || 0,
        averageTurnaround: shop.average_turnaround || '24 hours',
        // Handle JSON arrays
        services: parseArray(shop.services),
        specialties: parseArray(shop.specialties),
        equipment: parseArray(shop.equipment),
        certifications: parseArray(shop.certifications),
        // Create nested objects
        contact: {
            phone: shop.phone || '',
            email: shop.email || '',
            website: shop.website || ''
        },
        operatingHours: {
            open: shop.opening_time || '09:00',
            close: shop.closing_time || '18:00'
        }
    };
};

export default function ShopsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterService, setFilterService] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [shops, setShops] = useState<Shop[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showApprovalDashboard, setShowApprovalDashboard] = useState(false);

    // Handle soft delete shop
    const handleDeleteShop = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shop? This action can be undone by restoring the shop later.')) {
            return;
        }

        try {
            console.log('🗑️ Starting soft delete for shop:', id);
            
            const { error } = await supabase
                .from('shops')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) {
                console.error("Error deleting shop:", error);
                setError(`Failed to delete shop: ${error.message}`);
            } else {
                console.log('✅ Shop soft deleted successfully');
                // Refresh shops list
                await fetchShops();
                // Close modal if open
                setShowDetails(false);
                setActiveTab("overview");
            }
        } catch (err) {
            console.error("Unexpected error during delete:", err);
            setError(`Unexpected error: ${err}`);
        }
    };

    // Fetch shops from database
    const fetchShops = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('🔍 Starting shops fetch...');
            
            const { data: shopsData, error: shopsError } = await supabase
                .from("shops")
                .select("*")
                .is("deleted_at", null) // Only fetch non-deleted shops
                .in("approval_status", ["approved", "active"]) // Only fetch approved shops
                .order("created_at", { ascending: false });

            console.log('🏪 Shops query result:', { data: shopsData, error: shopsError });

            if (shopsError) {
                console.error("Error fetching shops:", shopsError);
                setError(shopsError.message);
                setShops([]);
                return;
            }

            // Debug: Log raw data from Supabase
            console.log('🔍 Raw shops data from Supabase:', shopsData);
            
            // Format data for UI
            const formattedShops = shopsData?.map((shop, index) => {
                console.log(`🔧 Processing shop ${index}:`, shop);
                const formatted = formatShopData(shop);
                console.log(`✨ Formatted shop ${index}:`, formatted);
                return formatted;
            }) || [];
            
            console.log('✅ Final formatted shops:', formattedShops);
            console.log('📊 Shops array length:', formattedShops.length);
            setShops(formattedShops);

        } catch (err) {
            console.error("Unexpected error:", err);
            setError(`Unexpected error: ${err}`);
            setShops([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const filteredShops = shops
        .filter((shop: Shop) => {
            const matchesSearch = 
                shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.owner.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !filterStatus || shop.status === filterStatus;
            const matchesService = !filterService || shop.services.includes(filterService);
            
            return matchesSearch && matchesStatus && matchesService;
        })
        .sort((a: Shop, b: Shop) => {
            switch (sortBy) {
                case "rating":
                    return b.rating - a.rating;
                case "orders":
                    return b.completedOrders - a.completedOrders;
                case "revenue":
                    return b.revenue - a.revenue;
                case "load":
                    return a.currentLoad - b.currentLoad;
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    const totalShops = shops.length;
    const activeShops = shops.filter((s: Shop) => s.status === "Active").length;
    const busyShops = shops.filter((s: Shop) => s.status === "Busy").length;
    const totalRevenue = shops.reduce((sum: number, shop: Shop) => sum + shop.revenue, 0);
    const totalOrders = shops.reduce((sum: number, shop: Shop) => sum + shop.completedOrders, 0);
    const avgRating = shops.length > 0 ? (shops.reduce((sum: number, shop: Shop) => sum + shop.rating, 0) / shops.length).toFixed(1) : "0.0";

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Active": return <Activity className="w-4 h-4" />;
            case "Busy": return <Zap className="w-4 h-4" />;
            case "Offline": return <Coffee className="w-4 h-4" />;
            case "Maintenance": return <Shield className="w-4 h-4" />;
            default: return <Store className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active": return "bg-gradient-to-r from-emerald-400 to-green-400 text-white shadow-md";
            case "Busy": return "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md";
            case "Offline": return "bg-gradient-to-r from-slate-400 to-gray-400 text-white shadow-md";
            case "Maintenance": return "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md";
            default: return "bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-md";
        }
    };

    const getLoadColor = (load: number) => {
        if (load > 80) return "bg-red-500";
        if (load > 60) return "bg-amber-500";
        if (load > 40) return "bg-blue-500";
        return "bg-emerald-500";
    };

    const allServices = Array.from(new Set(shops.flatMap(shop => shop.services)));

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
                            <Store className="w-10 h-10 text-white relative z-10" />
                            <Shield className="absolute top-2 right-2 w-4 h-4 text-white opacity-80" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-gradient">
                                Partner Shops
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">Manage vendor capacity, performance, and operations</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                    <button
                        onClick={() => setShowApprovalDashboard(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Clock className="w-5 h-5" />
                        Approve Shops
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Add Shop
                    </button>
                </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl blur-lg opacity-20"></div>
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500 z-10" />
                        <input
                            type="text"
                            placeholder="Search shops by name, location, or owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="relative w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 z-10" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 appearance-none cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Busy">Busy</option>
                            <option value="Offline">Offline</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 z-10" />
                        <select
                            value={filterService}
                            onChange={(e) => setFilterService(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 appearance-none cursor-pointer"
                        >
                            <option value="">All Services</option>
                            {allServices.map(service => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <BarChart3 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 z-10" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 appearance-none cursor-pointer"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="orders">Sort by Orders</option>
                            <option value="revenue">Sort by Revenue</option>
                            <option value="load">Sort by Load</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-8 p-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl shadow-lg relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-red-700 font-semibold">{error}</p>
                    </div>
                </div>
            )}

            {/* Shops Grid */}
            {loading ? (
                <div className="text-center py-16 relative z-10">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-6 text-gray-600 text-lg">Loading shops...</p>
                </div>
            ) : filteredShops.length === 0 ? (
                <div className="text-center py-16 relative z-10">
                    <div className="p-8 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl inline-block mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <Store className="w-20 h-20 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">No shops found</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                        {searchTerm || filterStatus || filterService ? 'Try adjusting your search or filter' : 'Your shop list is empty'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                    {filteredShops.map((shop) => (
                        <div
                            key={shop.id}
                            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1 flex flex-col h-full"
                        >
                            {/* Card Header with Light Gradient Background */}
                            <div className="bg-gradient-to-r from-sky-100 to-blue-100 p-6 relative border-b border-blue-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-r from-sky-400 to-blue-400 rounded-xl shadow-lg">
                                            <Store className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm",
                                                getStatusColor(shop.status)
                                            )}>
                                                {getStatusIcon(shop.status)}
                                                <span className="ml-1">{shop.status}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:scale-105 transition-transform duration-300">
                                                {shop.name}
                                            </h3>
                                        </div>
                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0">
                                            <button
                                                onClick={() => {
                                                    setSelectedShop(shop);
                                                    setShowDetails(true);
                                                }}
                                                className="p-2 bg-gradient-to-r from-sky-50 to-blue-50 text-sky-600 rounded-lg hover:from-sky-100 hover:to-blue-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 hover:rotate-3"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteShop(shop.id)}
                                                className="p-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 hover:-rotate-3"
                                                title="Delete shop"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex flex-col flex-1">
                                {/* Shop Information */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium line-clamp-1">{shop.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Users className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium">{shop.owner}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="p-2 bg-amber-50 rounded-lg">
                                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-800">{shop.rating}</span>
                                            <span className="text-gray-400">•</span>
                                            <div className="flex items-center gap-1">
                                                <Truck className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium">{shop.completedOrders} orders</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg">
                                                <DollarSign className="w-3 h-3 text-white" />
                                            </div>
                                            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Revenue</p>
                                        </div>
                                        <p className="text-xl font-bold text-emerald-800">₹{(shop.revenue / 1000).toFixed(0)}K</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg">
                                                <Activity className="w-3 h-3 text-white" />
                                            </div>
                                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Load</p>
                                        </div>
                                        <p className="text-xl font-bold text-amber-800">{shop.currentLoad}%</p>
                                    </div>
                                </div>

                                {/* Load Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between text-xs font-medium mb-2">
                                        <span className="text-gray-500">Current Capacity</span>
                                        <span className={cn(
                                            "font-bold",
                                            shop.currentLoad > 80 ? "text-red-600" :
                                            shop.currentLoad > 60 ? "text-amber-600" :
                                            shop.currentLoad > 40 ? "text-blue-600" :
                                            "text-green-600"
                                        )}>
                                            {shop.currentLoad}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000 ease-out relative", getLoadColor(shop.currentLoad))}
                                            style={{ width: `${shop.currentLoad}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white opacity-20"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Services Preview */}
                                <div className="mb-6">
                                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-3">Services</p>
                                    <div className="flex flex-wrap gap-2">
                                        {shop.services.slice(0, 3).map((service, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border border-sky-200 shadow-sm"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                        {shop.services.length > 3 && (
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200 shadow-sm">
                                                +{shop.services.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Shop Details Modal */}
            {showDetails && selectedShop && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                <button
                                    onClick={() => {
                                        setShowDetails(false);
                                        setActiveTab("overview");
                                    }}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
                                    title="Go back"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent truncate">
                                    Shop Details - {selectedShop.name}
                                </h2>
                            </div>
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => {
                                        setShowDetails(false);
                                        setActiveTab("overview");
                                    }}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Close"
                                >
                                    <Trash2 className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Main content area with scroll */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6">
                                {/* Tab Navigation */}
                                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl">
                                    {[
                                        { id: "overview", label: "Overview", icon: Store },
                                        { id: "performance", label: "Performance", icon: BarChart3 },
                                        { id: "services", label: "Services", icon: Package },
                                        { id: "contact", label: "Contact", icon: Phone }
                                    ].map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setActiveTab(id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                activeTab === id
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-600 hover:text-gray-800"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Tab Content */}
                                <div className="overflow-y-auto max-h-[60vh]">
                                    {/* Overview Tab */}
                                    {activeTab === "overview" && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Shop Info */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <Store className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Shop ID</p>
                                                                <p className="font-semibold text-gray-800">{selectedShop.id}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Users className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Owner</p>
                                                                <p className="font-semibold text-gray-800">{selectedShop.owner}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <MapPin className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Location</p>
                                                                <p className="font-semibold text-gray-800">{selectedShop.location}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Established</p>
                                                                <p className="font-semibold text-gray-800">{selectedShop.established}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Clock className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Operating Hours</p>
                                                                <p className="font-semibold text-gray-800">{selectedShop.operatingHours.open} - {selectedShop.operatingHours.close}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Performance Metrics */}
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Performance Metrics</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-blue-50 p-4 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Star className="w-5 h-5 text-amber-500" />
                                                                <p className="text-sm text-gray-600">Rating</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-gray-900">{selectedShop.rating}⭐</p>
                                                        </div>
                                                        <div className="bg-green-50 p-4 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Truck className="w-5 h-5 text-green-500" />
                                                                <p className="text-sm text-gray-600">Orders</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-gray-900">{selectedShop.completedOrders}</p>
                                                        </div>
                                                        <div className="bg-purple-50 p-4 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <DollarSign className="w-5 h-5 text-purple-500" />
                                                                <p className="text-sm text-gray-600">Revenue</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-gray-900">₹{(selectedShop.revenue / 1000).toFixed(0)}K</p>
                                                        </div>
                                                        <div className="bg-amber-50 p-4 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Users className="w-5 h-5 text-amber-500" />
                                                                <p className="text-sm text-gray-600">Staff</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-gray-900">{selectedShop.employees}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Right Column */}
                                            <div className="space-y-6">
                                                {/* Status & Load */}
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Current Status</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="text-sm text-gray-500">Status</p>
                                                                <span className={cn(
                                                                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                                                                    getStatusColor(selectedShop.status)
                                                                )}>
                                                                    {getStatusIcon(selectedShop.status)}
                                                                    <span className="ml-2">{selectedShop.status}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500 mb-2">Current Load</p>
                                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                                <div
                                                                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", getLoadColor(selectedShop.currentLoad))}
                                                                    style={{ width: `${selectedShop.currentLoad}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-700 mt-1">{selectedShop.currentLoad}% Capacity</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Metrics */}
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Additional Metrics</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm text-gray-600">Average Turnaround</span>
                                                            <span className="font-medium text-gray-800">{selectedShop.averageTurnaround}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm text-gray-600">Last Month Orders</span>
                                                            <span className="font-medium text-gray-800">{selectedShop.lastMonthOrders}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm text-gray-600">Customer Satisfaction</span>
                                                            <span className="font-medium text-gray-800">{selectedShop.customerSatisfaction}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Performance Tab */}
                                    {activeTab === "performance" && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold text-gray-800">Performance Analytics</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Star className="w-8 h-8 text-blue-600" />
                                                        <h4 className="font-semibold text-gray-800">Customer Rating</h4>
                                                    </div>
                                                    <p className="text-3xl font-bold text-blue-600">{selectedShop.rating}/5.0</p>
                                                    <p className="text-sm text-gray-600 mt-2">Based on customer reviews</p>
                                                </div>
                                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Truck className="w-8 h-8 text-green-600" />
                                                        <h4 className="font-semibold text-gray-800">Total Orders</h4>
                                                    </div>
                                                    <p className="text-3xl font-bold text-green-600">{selectedShop.completedOrders}</p>
                                                    <p className="text-sm text-gray-600 mt-2">All time completed</p>
                                                </div>
                                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <DollarSign className="w-8 h-8 text-purple-600" />
                                                        <h4 className="font-semibold text-gray-800">Total Revenue</h4>
                                                    </div>
                                                    <p className="text-3xl font-bold text-purple-600">₹{(selectedShop.revenue / 1000).toFixed(0)}K</p>
                                                    <p className="text-sm text-gray-600 mt-2">Lifetime earnings</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Services Tab */}
                                    {activeTab === "services" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-gray-800">Services Offered</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedShop.services.map((service, idx) => (
                                                        <span key={idx} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                                            {service}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-gray-800">Specialties</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedShop.specialties.map((specialty, idx) => (
                                                        <span key={idx} className="px-3 py-2 bg-amber-50 text-amber-600 rounded-full text-sm font-medium">
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-gray-800">Equipment</h3>
                                                <div className="space-y-2">
                                                    {selectedShop.equipment.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                            <Package className="w-5 h-5 text-blue-500" />
                                                            <span className="font-medium text-gray-800">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-gray-800">Certifications</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedShop.certifications.map((cert, idx) => (
                                                        <span key={idx} className="px-3 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium flex items-center gap-2">
                                                            <Award className="w-4 h-4" />
                                                            {cert}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Tab */}
                                    {activeTab === "contact" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <Phone className="w-5 h-5 text-blue-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Phone</p>
                                                            <p className="font-semibold text-gray-800">{selectedShop.contact.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="w-5 h-5 text-blue-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Email</p>
                                                            <p className="font-semibold text-gray-800">{selectedShop.contact.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Globe className="w-5 h-5 text-blue-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Website</p>
                                                            <p className="font-semibold text-gray-800">{selectedShop.contact.website}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => handleDeleteShop(selectedShop.id)}
                                        className="flex items-center gap-3 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete Shop
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Shop Modal */}
            <AddShopModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onShopAdded={() => {
                    fetchShops();
                    setShowAddModal(false);
                }}
            />

            {/* Shop Approval Dashboard */}
            <ShopApprovalDashboard
                isOpen={showApprovalDashboard}
                onClose={() => setShowApprovalDashboard(false)}
                onApprovalComplete={() => {
                    fetchShops();
                    setShowApprovalDashboard(false);
                }}
            />
        </div>
    );
}
