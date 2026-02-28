"use client";

import { BarChart3, TrendingUp, Users, ShoppingBag, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
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
    },
    {
        name: "Active Orders",
        value: "156",
        change: "+12.5%",
        trend: "up",
        icon: ShoppingBag,
    },
    {
        name: "New Customers",
        value: "2,350",
        change: "+18.2%",
        trend: "up",
        icon: Users,
    },
    {
        name: "Completed",
        value: "12,234",
        change: "-4.5%",
        trend: "down",
        icon: Package,
    },
];

export default function DashboardOverview() {
    return (
        <div className="space-y-6 fade-in font-inter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-poppins font-bold tracking-tight">Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Here is what's happening with your business today.</p>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Calendar picker placeholder */}
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm font-medium">
                        Jan 20, 2024 - Feb 09, 2024
                    </div>
                    <button className="bg-secondary hover:bg-secondary/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm">
                        Download Report
                    </button>
                </div>
            </div>

            <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                role="region"
                aria-label="Key Performance Indicators"
            >
                {stats.map((item) => (
                    <motion.div
                        variants={itemVariants}
                        key={item.name}
                        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 p-6 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 sm:p-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <p className="text-3xl font-poppins font-semibold text-gray-900 dark:text-white">
                                        {item.value}
                                    </p>
                                    <span
                                        className={cn(
                                            "flex items-center text-sm font-medium rounded-full px-2 py-0.5",
                                            item.trend === "up"
                                                ? "text-success bg-success/10"
                                                : "text-red-500 bg-red-500/10"
                                        )}
                                    >
                                        {item.trend === "up" ? (
                                            <ArrowUpRight className="w-4 h-4 mr-1" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 mr-1" />
                                        )}
                                        {item.change}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                                <item.icon className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Decorative background element */}
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-secondary/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110" aria-hidden="true" />
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="xl:col-span-2 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-poppins font-semibold">Revenue Overview</h2>
                        <select className="text-sm border-none bg-gray-50 dark:bg-white/5 rounded-lg py-1 px-2 cursor-pointer focus:ring-0">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl">
                        {/* Chart.js or Recharts will go here, currently a placeholder to avoid complex setup immediately before structure is done */}
                        <div className="text-center group">
                            <TrendingUp className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-secondary group-hover:scale-110 transition-all duration-300" aria-hidden="true" />
                            <p className="text-gray-500 text-sm group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Revenue Chart Visualization</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-poppins font-semibold">Recent Orders</h2>
                        <a href="/dashboard/orders" className="text-sm text-secondary hover:underline">View All</a>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/5 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white font-medium">
                                        #{8040 + i}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium group-hover:text-secondary transition-colors">Amit Kumar</h3>
                                        <p className="text-xs text-gray-500">4 items • Express</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">₹350</div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                                        In Progress
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
