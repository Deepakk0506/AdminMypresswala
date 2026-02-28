"use client";

import { Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6 fade-in max-w-4xl font-inter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-poppins font-bold tracking-tight">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage global preferences, pricing, and system configurations.</p>
                </div>
                <button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 dark:bg-white dark:text-primary dark:hover:bg-white/90 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors shadow-sm">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Settings Navigation */}
                <div className="col-span-1 border-r border-gray-100 dark:border-white/10 pr-4 hidden md:block">
                    <nav className="space-y-1">
                        {['General', 'Pricing', 'Notifications', 'Team', 'Integrations'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${item === 'General'
                                    ? 'bg-secondary/10 text-secondary'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Settings Form Content */}
                <div className="col-span-1 md:col-span-3 space-y-8">

                    <section className="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-white/10 pb-4">Business Profile</h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                                    <input type="text" defaultValue="Mypresswala Premium" className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                                    <input type="email" defaultValue="support@mypresswala.com" className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Description</label>
                                <textarea rows={3} defaultValue="Premium care for your wardrobe, delivered with tech elegance." className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all resize-none" />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-white/10 pb-4">Global Pricing Configuration</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-white/10 rounded-xl">
                                <div>
                                    <h3 className="font-medium">Surge Pricing</h3>
                                    <p className="text-xs text-gray-500 mt-1">Automatically apply multipliers during peak hours or extreme weather.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secondary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-white/10 rounded-xl">
                                <div>
                                    <h3 className="font-medium">Express Delivery Surcharge</h3>
                                    <p className="text-xs text-gray-500 mt-1">Fixed fee applied for 4-hour express turnarounds.</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-500">₹</span>
                                    <input type="number" defaultValue="150" className="w-20 px-3 py-1.5 border border-gray-300 dark:border-white/20 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-right" />
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
