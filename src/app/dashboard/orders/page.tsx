"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Clock, CheckCircle2, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = "New" | "Picked Up" | "In Progress" | "Ironing" | "Ready" | "Delivered";

interface Order {
    id: string;
    customerName: string;
    items: number;
    status: OrderStatus;
    urgency: "Normal" | "Express";
    amount: number;
    time: string;
}

const initialOrders: Order[] = [
    { id: "ORD-8041", customerName: "Amit Kumar", items: 4, status: "New", urgency: "Express", amount: 350, time: "10 mins ago" },
    { id: "ORD-8042", customerName: "Priya Singh", items: 12, status: "New", urgency: "Normal", amount: 840, time: "45 mins ago" },
    { id: "ORD-8038", customerName: "Rahul Sharma", items: 6, status: "Picked Up", urgency: "Normal", amount: 420, time: "2 hours ago" },
    { id: "ORD-8035", customerName: "Sneha Patel", items: 3, status: "In Progress", urgency: "Express", amount: 280, time: "3 hours ago" },
    { id: "ORD-8033", customerName: "Vikram Reddy", items: 8, status: "Ironing", urgency: "Normal", amount: 560, time: "4 hours ago" },
    { id: "ORD-8029", customerName: "Neha Gupta", items: 5, status: "Ready", urgency: "Express", amount: 450, time: "Yesterday" },
];

const columns: { title: string; status: OrderStatus; color: string }[] = [
    { title: "New Orders", status: "New", color: "bg-blue-500" },
    { title: "Picked Up", status: "Picked Up", color: "bg-indigo-500" },
    { title: "In Progress", status: "In Progress", color: "bg-amber-500" },
    { title: "Ironing", status: "Ironing", color: "bg-orange-500" },
    { title: "Ready", status: "Ready", color: "bg-emerald-500" },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);

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

    return (
        <div className="h-full flex flex-col font-inter fade-in">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-poppins font-bold tracking-tight">Order Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and update active orders across all stages.</p>
                </div>
                <button className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>New Order</span>
                </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/20 p-4">
                <div className="flex h-full gap-4 w-max min-w-full">
                    {columns.map(column => (
                        <div
                            key={column.status}
                            className="flex flex-col w-80 shrink-0 h-full rounded-xl bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.status)}
                        >
                            <div className="p-3 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center space-x-2">
                                    <div className={cn("w-2 h-2 rounded-full", column.color)} />
                                    <h3 className="font-semibold text-sm">{column.title}</h3>
                                    <span className="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {orders.filter(o => o.status === column.status).length}
                                    </span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {orders
                                    .filter(order => order.status === column.status)
                                    .map(order => (
                                        <div
                                            key={order.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, order.id)}
                                            className="bg-white dark:bg-[#1a1c23] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-secondary/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-1 rounded-md">
                                                    {order.id}
                                                </span>
                                                {order.urgency === "Express" && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-full">
                                                        Express
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-secondary transition-colors">
                                                {order.customerName}
                                            </h4>

                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 space-x-3">
                                                <span className="flex items-center">
                                                    <Shirt className="w-3 h-3 mr-1" />
                                                    {order.items} items
                                                </span>
                                                <span className="flex items-center">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    ₹{order.amount}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                                                <div className="flex items-center text-xs text-gray-400">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {order.time}
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-medium text-primary dark:text-white">
                                                    {order.customerName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
