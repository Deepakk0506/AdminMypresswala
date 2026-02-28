"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, MessageSquare, Phone, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    spent: number;
    tier: "Bronze" | "Silver" | "Gold";
    lastOrder: string;
}

const customers: Customer[] = [
    { id: "CUS-001", name: "Amit Kumar", email: "amit.k@example.com", phone: "+91 98765 43210", orders: 24, spent: 12500, tier: "Gold", lastOrder: "2 days ago" },
    { id: "CUS-002", name: "Priya Singh", email: "priya.s@example.com", phone: "+91 98765 43211", orders: 12, spent: 5400, tier: "Silver", lastOrder: "5 days ago" },
    { id: "CUS-003", name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 98765 43212", orders: 3, spent: 1200, tier: "Bronze", lastOrder: "1 week ago" },
    { id: "CUS-004", name: "Sneha Patel", email: "sneha.p@example.com", phone: "+91 98765 43213", orders: 45, spent: 28900, tier: "Gold", lastOrder: "Yesterday" },
    { id: "CUS-005", name: "Vikram Reddy", email: "vikram.r@example.com", phone: "+91 98765 43214", orders: 8, spent: 3400, tier: "Bronze", lastOrder: "3 weeks ago" },
    { id: "CUS-006", name: "Neha Gupta", email: "neha.g@example.com", phone: "+91 98765 43215", orders: 18, spent: 8900, tier: "Silver", lastOrder: "Today" },
];

export default function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 fade-in font-inter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-poppins font-bold tracking-tight">Customer Management</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage customer profiles and loyalty tiers.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none w-full sm:w-64"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-100 dark:border-white/10">
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Contact</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Total Orders</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Total Spent</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Tier</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Last Order</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-sm font-medium text-secondary">
                                                {customer.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-secondary transition-colors">
                                                    {customer.name}
                                                </div>
                                                <div className="text-xs text-gray-500">{customer.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900 dark:text-gray-300">{customer.phone}</div>
                                        <div className="text-xs text-gray-500">{customer.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-300">
                                        {customer.orders}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-300 font-mono tracking-tight">
                                        ₹{customer.spent.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none",
                                            customer.tier === "Gold" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                                customer.tier === "Silver" ? "bg-slate-100 text-slate-800 border border-slate-200" :
                                                    "bg-orange-50 text-orange-800 border border-orange-200"
                                        )}>
                                            <Star className="w-3 h-3 mr-1" />
                                            {customer.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {customer.lastOrder}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-400 hover:text-secondary bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white/10 transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-success bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white/10 transition-colors">
                                                <Phone className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-primary bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white/10 transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredCustomers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No customers found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
