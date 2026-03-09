"use client";

import { useState } from "react";
import { Search, MapPin, Star, Truck, Calendar, MoreHorizontal, Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface Shop {
    id: string;
    name: string;
    owner: string;
    location: string;
    rating: number;
    completedOrders: number;
    currentLoad: number; // percentage
    status: "Active" | "Busy" | "Offline";
}

const shops: Shop[] = [
    { id: "SHP-101", name: "Premium Press Point", owner: "Rakesh Verma", location: "Koramangala, 4th Block", rating: 4.8, completedOrders: 1245, currentLoad: 85, status: "Busy" },
    { id: "SHP-102", name: "Sparkle Laundry Services", owner: "Suresh Kumar", location: "Indiranagar, 100ft Road", rating: 4.5, completedOrders: 890, currentLoad: 30, status: "Active" },
    { id: "SHP-103", name: "Elite Ironing Co.", owner: "Mohammed Ali", location: "HSR Layout, Sector 2", rating: 4.9, completedOrders: 2100, currentLoad: 10, status: "Offline" },
    { id: "SHP-104", name: "Quick Wash & Press", owner: "Anitha S.", location: "Jayanagar, 3rd Block", rating: 4.2, completedOrders: 430, currentLoad: 60, status: "Active" },
    { id: "SHP-105", name: "Royal Garment Care", owner: "Thomas K.", location: "Whitefield, Near ITPL", rating: 4.7, completedOrders: 3250, currentLoad: 95, status: "Busy" },
    { id: "SHP-106", name: "Fresh Fold Center", owner: "Sunil Dass", location: "Malleshwaram, 8th Cross", rating: 4.6, completedOrders: 1560, currentLoad: 45, status: "Active" },
];

export default function ShopsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 fade-in font-inter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-poppins font-bold tracking-tight">Partner Shops</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage vendor capacity, performance, and workload.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search shops or locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none w-full sm:w-72"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
                    <div key={shop.id} className="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <Store className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-secondary transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-secondary transition-colors line-clamp-1">{shop.name}</h3>
                                    <p className="text-xs text-secondary font-medium">{shop.id}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{shop.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Star className="w-4 h-4 mr-2 text-amber-500 fill-amber-500" />
                                <span>{shop.rating} rating</span>
                                <span className="mx-2 text-gray-300">•</span>
                                <Truck className="w-4 h-4 mr-2" />
                                <span>{shop.completedOrders}+ orders</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-gray-500">Current Load Volume</span>
                                <span className={cn(
                                    shop.currentLoad > 80 ? "text-red-500" :
                                        shop.currentLoad > 50 ? "text-amber-500" :
                                            "text-success"
                                )}>
                                    {shop.currentLoad}% Capacity
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out",
                                        shop.currentLoad > 80 ? "bg-red-500" :
                                            shop.currentLoad > 50 ? "bg-amber-500" :
                                                "bg-success"
                                    )}
                                    style={{ width: `${shop.currentLoad}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                shop.status === "Active" ? "bg-success/10 text-success" :
                                    shop.status === "Busy" ? "bg-amber-500/10 text-amber-500" :
                                        "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                            )}>
                                {shop.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />}
                                {shop.status === "Busy" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
                                {shop.status === "Offline" && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />}
                                {shop.status}
                            </span>

                            <button className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredShops.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No partner shops found matching your search.
                </div>
            )}
        </div>
    );
}
