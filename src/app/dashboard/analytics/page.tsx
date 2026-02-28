"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const revenueData = [
    { name: 'Jan', revenue: 4000, orders: 240 },
    { name: 'Feb', revenue: 3000, orders: 1398 },
    { name: 'Mar', revenue: 2000, orders: 9800 },
    { name: 'Apr', revenue: 2780, orders: 3908 },
    { name: 'May', revenue: 1890, orders: 4800 },
    { name: 'Jun', revenue: 2390, orders: 3800 },
    { name: 'Jul', revenue: 3490, orders: 4300 },
];

const garmentTypeData = [
    { name: 'Shirts', value: 45 },
    { name: 'Pants', value: 25 },
    { name: 'Dresses', value: 20 },
    { name: 'Suits', value: 10 },
];

const peakHoursData = [
    { time: '08:00', orders: 45 },
    { time: '10:00', orders: 85 },
    { time: '12:00', orders: 55 },
    { time: '14:00', orders: 40 },
    { time: '16:00', orders: 75 },
    { time: '18:00', orders: 110 },
    { time: '20:00', orders: 65 },
];

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState("Last 7 Days");

    return (
        <div className="space-y-6 fade-in font-inter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-poppins font-bold tracking-tight">Analytics & Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">Deep dive into revenue, operational metrics, and growth.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg flex items-center p-1">
                        {["Today", "Last 7 Days", "This Month", "Year to Date"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                    dateRange === range
                                        ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Gross Volume", value: "₹1,24,500", change: "+12.5%", trend: "up", icon: DollarSign },
                    { label: "Net Revenue", value: "₹94,200", change: "+15.2%", trend: "up", icon: TrendingUp },
                    { label: "Avg. Order Value", value: "₹450", change: "-2.4%", trend: "down", icon: TrendingDown },
                    { label: "Total Completed", value: "3,254", change: "+8.1%", trend: "up", icon: Package },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-4">
                            <span className="text-sm font-medium">{stat.label}</span>
                            <stat.icon className="w-4 h-4" />
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-poppins font-semibold text-gray-900 dark:text-white tracking-tight">
                                {stat.value}
                            </div>
                            <div className={cn(
                                "text-xs font-medium flex items-center bg-opacity-10 px-2 py-1 rounded-md",
                                stat.trend === "up" ? "text-success bg-success" : "text-amber-500 bg-amber-500"
                            )}>
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-poppins font-semibold">Revenue Trend</h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-white/5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-white)', color: '#111827' }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: 500 }}
                                    formatter={(value: number | undefined) => [`₹${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-poppins font-semibold">Peak Hours</h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakHoursData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-white/5" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                                />
                                <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
