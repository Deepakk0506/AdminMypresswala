"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Clock, CheckCircle2, Shirt, Search, Filter, Eye, Edit2, Trash2, Calendar, MapPin, DollarSign, CreditCard, Tag, AlertCircle, TrendingUp, Users, Package, ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

type OrderStatus = "New" | "Processing" | "Completed" | "Picked Up" | "In Progress" | "Ironing" | "Pending";

interface Order {
    id: string;
    customer_id: string;
    service_id: string;
    quantity: number;
    total_price: number;
    status: OrderStatus;
    order_date: string;
    created_at: string;
    
    // Additional fields for UI
    payment_method?: 'cash' | 'card' | 'upi' | 'wallet';
    payment_status?: 'Due' | 'Cleared' | 'Declined' | 'Refunded';
    priority_level?: 'normal' | 'express' | 'urgent';
    order_notes?: string;
    customer_notes?: string;
    delivery_address?: string;
    delivery_fee?: number;
    discount_amount?: number;
    tax_amount?: number;
    updated_at?: string;
    
    // Customer info for display
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    
    // Service info
    service_name?: string;
}

const columns = [
    { id: "New", title: "New Orders", status: "New", color: "bg-blue-500" },
    { id: "Processing", title: "Processing", status: "Processing", color: "bg-amber-500" },
    { id: "Completed", title: "Completed", status: "Completed", color: "bg-emerald-500" },
];

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPayment, setFilterPayment] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    const fetchOrders = async () => {
        console.log('🔍 Starting orders fetch with JOIN...');
        setLoading(true);
        setError(null);

        try {
            // Fetch orders with service and customer data using JOIN
            console.log('� Fetching orders with service and customer data...');
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select(`
                    *,
                    customers(name, email, phone),
                    services(id, service_name, price)
                `)
                .order("created_at", { ascending: false });

            if (ordersError) {
                console.error("Error fetching orders:", ordersError);
                setError(ordersError.message);
                setOrders([]);
                return;
            }
            console.log('📦 Raw orders data:', JSON.stringify(ordersData, null, 2));

            // Transform data to include service names
            const transformedOrders = ordersData?.map((order: any) => {
                console.log('🔍 Order processing:', {
                    orderId: order.id,
                    service_id: order.service_id,
                    service_name: order.services?.service_name || 'NOT FOUND',
                    customer_name: order.customers?.name
                });
                
                return {
                    ...order,
                    customer_name: order.customers?.name || 'Unknown Customer',
                    customer_email: order.customers?.email || '',
                    customer_phone: order.customers?.phone || '',
                    service_name: order.services?.service_name || 'Unknown Service',
                    // Legacy fields for compatibility
                    customerName: order.customers?.name || 'Unknown Customer',
                    items: order.quantity,
                    urgency: order.priority_level === 'express' ? 'Express' : 'Normal',
                    amount: order.total_price,
                    time: getTimeAgo(order.created_at)
                };
            }) || [];

            console.log('✅ Final transformed orders:', transformedOrders);
            setOrders(transformedOrders);

        } catch (err) {
            console.error("Unexpected error:", err);
            setError(`Unexpected error: ${err}`);
            setOrders([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("orderId", id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: OrderStatus) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData("orderId");

        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status } : order
        ));
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !filterStatus || order.status === filterStatus;
        const matchesPayment = !filterPayment || order.payment_method === filterPayment;
        
        console.log('🔍 Filtering order:', order.id, {
            matchesSearch,
            matchesStatus,
            matchesPayment,
            searchTerm,
            filterStatus,
            filterPayment,
            orderStatus: order.status,
            orderPayment: order.payment_method
        });
        
        return matchesSearch && matchesStatus && matchesPayment;
    });

    const getUniqueStatuses = () => {
        return Array.from(new Set(orders.map(order => order.status)));
    };

    const getUniquePaymentMethods = () => {
        return Array.from(new Set(orders.map(order => order.payment_method).filter(Boolean)));
    };

    const getPaymentIcon = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'card': return <CreditCard className="w-4 h-4" />;
            case 'upi': return <DollarSign className="w-4 h-4" />;
            case 'wallet': return <DollarSign className="w-4 h-4" />;
            default: return <DollarSign className="w-4 h-4" />;
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'express': return <Tag className="w-4 h-4 text-orange-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
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
                            <Shirt className="w-10 h-10 text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-gradient">
                                Orders
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">Manage your orders and track their progress</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl blur-lg opacity-20"></div>
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500 z-10" />
                        <input
                            type="text"
                            placeholder="Search orders by ID, customer, service..."
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
                            {getUniqueStatuses().map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 z-10" />
                        <select
                            value={filterPayment}
                            onChange={(e) => setFilterPayment(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 appearance-none cursor-pointer"
                        >
                            <option value="">All Payment</option>
                            {getUniquePaymentMethods().map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
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

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Order Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-10">
                        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl shadow-2xl relative overflow-hidden group transform hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-white font-semibold">Total Orders</h3>
                                    <Package className="w-8 h-8 text-white opacity-80" />
                                </div>
                                <p className="text-3xl font-bold text-white">{orders.length}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl shadow-2xl relative overflow-hidden group transform hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-white font-semibold">Revenue</h3>
                                    <DollarSign className="w-8 h-8 text-white opacity-80" />
                                </div>
                                <p className="text-3xl font-bold text-white">₹{orders.reduce((sum, order) => sum + (order.total_price || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl shadow-2xl relative overflow-hidden group transform hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-white font-semibold">Pending</h3>
                                    <Clock className="w-8 h-8 text-white opacity-80" />
                                </div>
                                <p className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'Pending').length}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl shadow-2xl relative overflow-hidden group transform hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-white font-semibold">New Orders</h3>
                                    <Plus className="w-8 h-8 text-white opacity-80" />
                                </div>
                                <p className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'New').length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Modern Orders Card Grid */}
                    <div className="space-y-6">
                        {filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
                                <div className="flex flex-col items-center justify-center">
                                    <Package className="w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500 text-lg font-medium">No orders found</p>
                                    <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                                </div>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
                                        {/* Left Section - Order Info */}
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                    {order.customer_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-gray-900">{order.customer_name || 'Unknown Customer'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Shirt className="w-5 h-5 text-blue-500" />
                                                        <p className="text-xs text-gray-500 font-medium">Service</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">{order.service_name || 'Unknown Service'}</p>
                                                </div>
                                                
                                                <div className="bg-green-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Package className="w-5 h-5 text-green-500" />
                                                        <p className="text-xs text-gray-500 font-medium">Quantity</p>
                                                    </div>
                                                    <p className="text-xl font-bold text-green-600">{order.quantity}</p>
                                                </div>
                                                
                                                <div className="bg-emerald-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                                        <p className="text-xs text-gray-500 font-medium">Total</p>
                                                    </div>
                                                    <p className="text-xl font-bold text-emerald-600">₹{order.total_price}</p>
                                                </div>
                                                
                                                <div className="bg-amber-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Calendar className="w-5 h-5 text-amber-600" />
                                                        <p className="text-xs text-gray-500 font-medium">Date</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">{new Date(order.order_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Right Section - Status & Actions */}
                                        <div className="flex flex-col gap-4 min-w-fit">
                                            <div className="flex flex-col gap-3">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                                                    order.status === 'New' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                    order.status === 'Processing' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                                    'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                    <span className={`w-3 h-3 rounded-full mr-2 ${
                                                        order.status === 'New' ? 'bg-blue-500' :
                                                        order.status === 'Processing' ? 'bg-amber-500' :
                                                        'bg-green-500'
                                                    }`} />
                                                    {order.status}
                                                </span>
                                                
                                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                                    {getPaymentIcon(order.payment_method || 'cash')}
                                                    <span className="text-sm font-medium text-gray-700 capitalize">{order.payment_method || 'cash'}</span>
                                                </div>
                                                
                                                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold shadow-sm ${
                                                    order.priority_level === 'urgent' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                    order.priority_level === 'express' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                                    'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                    {order.priority_level === 'urgent' ? '🔥' :
                                                     order.priority_level === 'express' ? '⚡' : '📋'} 
                                                    {order.priority_level || 'normal'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOrder(order);
                                                        setShowDetails(true);
                                                    }}
                                                    className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 relative z-10"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                {order.status !== 'Completed' && (
                                                    <button
                                                        type="button"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('orders')
                                                                    .update({ status: 'Completed' })
                                                                    .eq('id', order.id);
                                                                
                                                                if (error) {
                                                                    console.error('Error updating order status:', error);
                                                                    alert('Failed to update order status');
                                                                } else {
                                                                    // Update local state
                                                                    setOrders(orders.map(o => 
                                                                        o.id === order.id ? { ...o, status: 'Completed' } : o
                                                                    ));
                                                                    alert('Order marked as completed!');
                                                                }
                                                            } catch (err) {
                                                                console.error('Unexpected error:', err);
                                                                alert('Failed to update order status');
                                                            }
                                                        }}
                                                        className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 relative z-10"
                                                        title="Mark as Complete"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Order Details Modal */}
            {showDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                        {/* Header */}
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
                                    Order Details - {selectedOrder.id}
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
                                        { id: "overview", label: "Overview", icon: Eye },
                                        { id: "payment", label: "Payment", icon: CreditCard },
                                        { id: "notes", label: "Notes", icon: Edit2 },
                                        { id: "delivery", label: "Delivery", icon: MapPin }
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
                                            {/* Order Info */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Order Information</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <Shirt className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Order ID</p>
                                                                <p className="font-semibold text-gray-800">{selectedOrder.id}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Order Date</p>
                                                                <p className="font-semibold text-gray-800">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Shirt className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Service</p>
                                                                <p className="font-semibold text-gray-800">{selectedOrder.service_name || 'Unknown Service'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Eye className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Status</p>
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                                    selectedOrder.status === 'New' ? 'bg-blue-100 text-blue-700' :
                                                                    selectedOrder.status === 'Picked Up' ? 'bg-indigo-100 text-indigo-700' :
                                                                    selectedOrder.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                                                    selectedOrder.status === 'Ironing' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-emerald-100 text-emerald-700'
                                                                }`}>
                                                                    {selectedOrder.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Customer Info */}
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Information</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <Users className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Customer Name</p>
                                                                <p className="font-semibold text-gray-800">{selectedOrder.customer_name || 'Unknown Customer'}</p>
                                                            </div>
                                                        </div>
                                                        {selectedOrder.customer_email && (
                                                            <div className="flex items-center gap-3">
                                                                <Edit2 className="w-5 h-5 text-blue-500" />
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Email</p>
                                                                    <p className="font-semibold text-gray-800">{selectedOrder.customer_email}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {selectedOrder.customer_phone && (
                                                            <div className="flex items-center gap-3">
                                                                <AlertCircle className="w-5 h-5 text-blue-500" />
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Phone</p>
                                                                    <p className="font-semibold text-gray-800">{selectedOrder.customer_phone}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Financial Summary */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Financial Summary</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-blue-50 p-4 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <DollarSign className="w-5 h-5 text-blue-600" />
                                                                <p className="text-sm text-gray-600">Total Price</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-blue-600">₹{selectedOrder.total_price}</p>
                                                        </div>
                                                        <div className="bg-green-50 p-4 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Tag className="w-5 h-5 text-green-600" />
                                                                <p className="text-sm text-gray-600">Delivery Fee</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-green-600">₹{selectedOrder.delivery_fee || 0}</p>
                                                        </div>
                                                        <div className="bg-purple-50 p-4 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <AlertCircle className="w-5 h-5 text-purple-600" />
                                                                <p className="text-sm text-gray-600">Discount</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-purple-600">₹{selectedOrder.discount_amount || 0}</p>
                                                        </div>
                                                        <div className="bg-orange-50 p-4 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Clock className="w-5 h-5 text-orange-600" />
                                                                <p className="text-sm text-gray-600">Tax</p>
                                                            </div>
                                                            <p className="text-2xl font-bold text-orange-600">₹{selectedOrder.tax_amount || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Tab */}
                                    {activeTab === "payment" && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Information</h3>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <CreditCard className="w-5 h-5 text-blue-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Payment Method</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {getPaymentIcon(selectedOrder.payment_method || 'cash')}
                                                                <span className="font-semibold text-gray-800 capitalize">
                                                                    {selectedOrder.payment_method || 'Cash'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <DollarSign className="w-5 h-5 text-blue-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Payment Status</p>
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                                selectedOrder.payment_status === 'Cleared' ? 'bg-green-100 text-green-700' :
                                                                selectedOrder.payment_status === 'Due' ? 'bg-yellow-100 text-yellow-700' :
                                                                selectedOrder.payment_status === 'Declined' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {selectedOrder.payment_status || 'Due'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-6 rounded-xl">
                                                    <h4 className="font-semibold text-gray-800 mb-4">Payment Breakdown</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Subtotal</span>
                                                            <span className="font-medium">₹{selectedOrder.total_price}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Delivery Fee</span>
                                                            <span className="font-medium">₹{selectedOrder.delivery_fee || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Discount</span>
                                                            <span className="font-medium text-green-600">-₹{selectedOrder.discount_amount || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Tax</span>
                                                            <span className="font-medium">₹{selectedOrder.tax_amount || 0}</span>
                                                        </div>
                                                        <div className="border-t pt-3 flex justify-between items-center">
                                                            <span className="font-semibold text-gray-800">Total</span>
                                                            <span className="font-bold text-xl text-blue-600">
                                                                ₹{(selectedOrder.total_price + (selectedOrder.delivery_fee || 0) - (selectedOrder.discount_amount || 0) + (selectedOrder.tax_amount || 0)).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes Tab */}
                                    {activeTab === "notes" && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Order Notes</h3>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-3">Internal Notes</h4>
                                                    <div className="bg-gray-50 p-4 rounded-xl">
                                                        <p className="text-gray-700">
                                                            {selectedOrder.order_notes || 'No internal notes available'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-3">Customer Notes</h4>
                                                    <div className="bg-blue-50 p-4 rounded-xl">
                                                        <p className="text-gray-700">
                                                            {selectedOrder.customer_notes || 'No customer notes available'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Tab */}
                                    {activeTab === "delivery" && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Delivery Information</h3>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-3">Delivery Address</h4>
                                                    <div className="bg-gray-50 p-4 rounded-xl">
                                                        <p className="text-gray-700">
                                                            {selectedOrder.delivery_address || 'No delivery address specified'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-3">Priority & Timing</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            {getPriorityIcon(selectedOrder.priority_level || 'normal')}
                                                            <div>
                                                                <p className="text-sm text-gray-500">Priority Level</p>
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                                                    selectedOrder.priority_level === 'urgent' ? 'bg-red-100 text-red-700' :
                                                                    selectedOrder.priority_level === 'express' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                    {selectedOrder.priority_level || 'Normal'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Clock className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Estimated Delivery</p>
                                                                <p className="font-semibold text-gray-800">
                                                                    {selectedOrder.priority_level === 'urgent' ? 'Within 2 hours' :
                                                                     selectedOrder.priority_level === 'express' ? 'Within 6 hours' :
                                                                     'Within 24 hours'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
