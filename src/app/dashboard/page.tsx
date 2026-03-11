"use client";

import { useEffect, useState, useRef } from "react";
import { BarChart3, TrendingUp, Users, ShoppingBag, ArrowUpRight, ArrowDownRight, Package, Download, Calendar, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import RevenueChart from "@/components/charts/RevenueChart";
import jsPDF from 'jspdf';

interface DashboardStats {
    totalRevenue: number;
    activeOrders: number;
    newCustomers: number;
    completedOrders: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
    completedChange: number;
}

interface RecentOrder {
    id: string;
    customer_name: string;
    total_price: number;
    status: string;
    priority_level: string;
    created_at: string;
    order_date: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    }
};

const stats = [
    {
        name: "Total Revenue",
        value: "₹45,231.89",
        change: "+20.1%",
        trend: "up",
        icon: BarChart3,
        color: "from-blue-500 to-blue-600",
        bgLight: "bg-blue-50",
        textColor: "text-blue-600"
    },
    {
        name: "Active Orders",
        value: "156",
        change: "+12.5%",
        trend: "up",
        icon: ShoppingBag,
        color: "from-green-500 to-green-600",
        bgLight: "bg-green-50",
        textColor: "text-green-600"
    },
    {
        name: "New Customers",
        value: "2,350",
        change: "+18.2%",
        trend: "up",
        icon: Users,
        color: "from-purple-500 to-purple-600",
        bgLight: "bg-purple-50",
        textColor: "text-purple-600"
    },
    {
        name: "Completed",
        value: "12,234",
        change: "-4.5%",
        trend: "down",
        icon: Package,
        color: "from-orange-500 to-orange-600",
        bgLight: "bg-orange-50",
        textColor: "text-orange-600"
    },
];

export default function DashboardOverview() {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        activeOrders: 0,
        newCustomers: 0,
        completedOrders: 0,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        completedChange: 0
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | 'year'>('7days');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const exportButtonRef = useRef<HTMLDivElement>(null);

    const handleExportData = (format: 'csv' | 'pdf') => {
        setTimeout(() => {
            if (format === 'csv') {
                // Create CSV data for export
                const csvContent = [
                    ['Metric', 'Value'],
                    ['Total Revenue', formatCurrency(stats.totalRevenue)],
                    ['Active Orders', stats.activeOrders.toString()],
                    ['New Customers', stats.newCustomers.toString()],
                    ['Completed Orders', stats.completedOrders.toString()],
                    [],
                    ['Recent Orders'],
                    ['Order ID', 'Customer Name', 'Amount', 'Status', 'Date'],
                    ...recentOrders.map(order => [
                        `#${String(order.id).slice(-4)}`,
                        order.customer_name,
                        formatCurrency(order.total_price),
                        order.status,
                        formatDate(order.created_at)
                    ])
                ].map(row => row.join(',')).join('\n');

                // Create blob and download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (format === 'pdf') {
                // Create actual PDF using jsPDF
                const pdf = new jsPDF();
                
                // Add title
                pdf.setFontSize(20);
                pdf.text('DASHBOARD REPORT', 20, 20);
                
                // Add generation date
                pdf.setFontSize(12);
                pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
                
                // Add summary metrics
                pdf.setFontSize(16);
                pdf.text('SUMMARY METRICS', 20, 55);
                
                pdf.setFontSize(12);
                pdf.text('================', 20, 65);
                pdf.text(`Total Revenue: ${formatCurrency(stats.totalRevenue)}`, 20, 75);
                pdf.text(`Active Orders: ${stats.activeOrders}`, 20, 85);
                pdf.text(`New Customers: ${stats.newCustomers}`, 20, 95);
                pdf.text(`Completed Orders: ${stats.completedOrders}`, 20, 105);
                
                // Add recent orders
                pdf.setFontSize(16);
                pdf.text('RECENT ORDERS', 20, 125);
                
                pdf.setFontSize(12);
                pdf.text('==============', 20, 135);
                
                let yPosition = 145;
                recentOrders.forEach((order, index) => {
                    if (yPosition > 270) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    pdf.text(`Order #${String(order.id).slice(-4)}`, 20, yPosition);
                    pdf.text(`Customer: ${order.customer_name}`, 20, yPosition + 10);
                    pdf.text(`Amount: ${formatCurrency(order.total_price)}`, 20, yPosition + 20);
                    pdf.text(`Status: ${order.status}`, 20, yPosition + 30);
                    pdf.text(`Date: ${formatDate(order.created_at)}`, 20, yPosition + 40);
                    pdf.text('---', 20, yPosition + 50);
                    
                    yPosition += 60;
                });
                
                // Save the PDF
                pdf.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
            }
            setExportDropdownOpen(false);
        }, 100);
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('🔍 Fetching dashboard data...');
            
            // Test basic connection first
            const { data: testData, error: testError } = await supabase.from('shops').select('count');
            console.log('📊 Connection test result:', { testData, testError });
            
            if (testError) {
                throw new Error(`Database connection failed: ${testError.message}`);
            }

            // Fetch orders data with customer names
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    customers(name)
                `)
                .order('created_at', { ascending: false })
                .limit(100);

            console.log('📦 Orders data:', ordersData?.length, 'orders');
            console.log('📊 Order statuses:', ordersData?.map(o => ({ id: o.id, status: o.status })));

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
            }

            // Fetch customers data
            const { data: customersData, error: customersError } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            console.log('👥 Customers data:', customersData?.length, 'customers');

            if (customersError) {
                console.error('Error fetching customers:', customersError);
            }

            // Calculate statistics
            const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
            const activeOrders = ordersData?.filter(order => 
                order.status === 'pending' || order.status === 'in_progress' || order.status === 'processing'
            ).length || 0;
            const completedOrders = ordersData?.filter(order => 
                order.status === 'completed' || order.status === 'Completed'
            ).length || 0;
            
            console.log('✅ Completed orders count:', completedOrders);
            console.log('🔍 Completed orders:', ordersData?.filter(o => 
                o.status === 'completed' || o.status === 'Completed'
            ).map(o => ({ id: o.id, status: o.status })));
            
            // Calculate new customers (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const newCustomers = customersData?.filter(customer => 
                new Date(customer.created_at) > thirtyDaysAgo
            ).length || 0;

            // Calculate recent orders for display
            const recent = ordersData?.slice(0, 5).map(order => ({
                id: order.id,
                customer_name: order.customers?.name || 'Unknown Customer',
                total_price: order.total_price || 0,
                status: order.status || 'pending',
                priority_level: order.priority_level || 'normal',
                created_at: order.created_at,
                order_date: order.order_date || order.created_at
            })) || [];

            // Calculate percentage changes (mock data for now since we don't have historical data)
            const revenueChange = 20.1; // This would be calculated from historical data
            const ordersChange = 12.5;
            const customersChange = 18.2;
            const completedChange = -4.5;

            setStats({
                totalRevenue,
                activeOrders,
                newCustomers,
                completedOrders,
                revenueChange,
                ordersChange,
                customersChange,
                completedChange
            });

            setRecentOrders(recent);
            setAllOrders(ordersData || []);

            console.log('✅ Dashboard data fetched successfully');

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportDropdownOpen && exportButtonRef.current && !exportButtonRef.current.contains(event.target as Node)) {
                setExportDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [exportDropdownOpen]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const statsData = [
        {
            name: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            icon: BarChart3,
            color: "from-blue-500 to-blue-600",
            bgLight: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            name: "Active Orders",
            value: stats.activeOrders.toString(),
            icon: ShoppingBag,
            color: "from-green-500 to-green-600",
            bgLight: "bg-green-50",
            textColor: "text-green-600"
        },
        {
            name: "New Customers",
            value: stats.newCustomers.toString(),
            icon: Users,
            color: "from-purple-500 to-purple-600",
            bgLight: "bg-purple-50",
            textColor: "text-purple-600"
        },
        {
            name: "Completed",
            value: stats.completedOrders.toString(),
            icon: Package,
            color: "from-orange-500 to-orange-600",
            bgLight: "bg-orange-50",
            textColor: "text-orange-600"
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 relative overflow-hidden flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 relative overflow-hidden flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="p-6 bg-red-50 border border-red-200 rounded-3xl mb-4">
                        <p className="text-red-700 font-semibold">{error}</p>
                    </div>
                    <button 
                        onClick={fetchDashboardData}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 relative overflow-hidden">
            {/* Enhanced Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
                <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-r from-indigo-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-[450px] h-[450px] bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-rose-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse animation-delay-2000"></div>
            </div>
            
            {/* Floating Particles Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>
            
            {/* Header */}
            <div className="mb-10 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-8">
                        <div className="p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl relative overflow-hidden group transform hover:scale-105 transition-all duration-500 hover:rotate-3">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                            <BarChart3 className="w-12 h-12 text-white relative z-10 drop-shadow-lg" />
                            <TrendingUp className="absolute top-3 right-3 w-5 h-5 text-white opacity-90 animate-bounce" />
                        </div>
                        <div>
                            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                                Dashboard
                            </h1>
                            <p className="text-gray-600 mt-3 text-xl font-medium">Real-time insights into your business performance</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-500">Live data</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={exportButtonRef}>
                            <button 
                                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                                className="group relative bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl px-8 py-4 text-sm font-semibold text-gray-700 flex items-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1"
                            >
                                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-normal">Export</div>
                                    <div>Choose Format</div>
                                </div>
                            </button>
                            
                            {exportDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <button
                                        onClick={() => handleExportData('csv')}
                                        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                            <Download className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">CSV</div>
                                            <div className="text-xs text-gray-500">Spreadsheet format</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleExportData('pdf')}
                                        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors flex items-center gap-3 border-t border-gray-100/50"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                            <Download className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">PDF</div>
                                            <div className="text-xs text-gray-500">Report format</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={fetchDashboardData}
                            className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl px-8 py-4 text-sm font-bold transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                            <RotateCcw className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Refresh Data</span>
                        </button>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <motion.div
                    className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    role="region"
                    aria-label="Key Performance Indicators"
                >
                    {statsData.map((item, index) => (
                        <motion.div
                            variants={itemVariants}
                            key={item.name}
                            className="group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl p-8 border border-gray-100/50 shadow-xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-700"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Animated Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-8 transition-all duration-700`}></div>
                            
                            {/* Glass Effect Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            
                            {/* Decorative Border */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-sm`}></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`p-5 bg-gradient-to-r ${item.color} rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <item.icon className="w-7 h-7 text-white relative z-10 drop-shadow-md" />
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">{item.name}</p>
                                    <p className="text-4xl font-black text-gray-900 tracking-tight">
                                        {item.value}
                                    </p>
                                </div>
                            </div>

                            {/* Enhanced Decorative Elements */}
                            <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${item.color} rounded-full opacity-0 group-hover:opacity-15 transition-all duration-700 transform group-hover:scale-125 blur-xl`} aria-hidden="true" />
                            <div className={`absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br ${item.color} rounded-full opacity-0 group-hover:opacity-5 transition-all duration-700 transform group-hover:scale-150 blur-2xl`} aria-hidden="true" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <motion.div
                className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Revenue Overview Chart */}
                <motion.div variants={itemVariants} className="xl:col-span-2 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-100/50 shadow-xl hover:shadow-3xl transition-all duration-700 p-10 overflow-hidden group">
                    {/* Glass Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <TrendingUp className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">Revenue Overview</h2>
                        </div>
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as '7days' | '30days' | 'year')}
                            className="text-sm font-semibold border-none bg-white/80 backdrop-blur-sm rounded-2xl py-3 px-6 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <option value="7days">Last 7 days</option>
                            <option value="30days">Last 30 days</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <RevenueChart data={allOrders} period={selectedPeriod} />
                </motion.div>

                {/* Recent Orders */}
                <motion.div variants={itemVariants} className="rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-100/50 shadow-xl hover:shadow-3xl transition-all duration-700 p-10 overflow-hidden group">
                    {/* Glass Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <ShoppingBag className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">Recent Orders</h2>
                        </div>
                        <a href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 font-black hover:underline transition-all duration-300 transform hover:scale-105">View All</a>
                    </div>

                    <div className="space-y-5 relative z-10">
                        {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                            <div key={order.id} className="flex items-center justify-between p-5 rounded-3xl hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-blue-50/50 backdrop-blur-sm transition-all duration-500 cursor-pointer group hover:shadow-lg hover:-translate-x-2 border border-transparent hover:border-gray-100/50">
                                <div className="flex items-center gap-5">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{order.customer_name}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{formatDate(order.created_at)} • {order.priority_level}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-gray-900">{formatCurrency(order.total_price)}</div>
                                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-black shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                                        order.status === 'completed' 
                                            ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-white'
                                            : order.status === 'pending'
                                            ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white'
                                            : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 text-white'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12">
                                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 font-medium">No recent orders found</p>
                                <p className="text-gray-400 text-sm mt-2">Orders will appear here once customers start placing them</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
