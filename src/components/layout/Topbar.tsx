"use client";

import { Bell, Search, User, Moon, Sun } from "lucide-react";

export function Topbar() {
    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-primary/80 dark:border-white/10 sticky top-0 z-40">
            <div className="flex-1 flex items-center">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-secondary transition-colors" aria-hidden="true" />
                    <input
                        type="text"
                        aria-label="Search orders and customers"
                        placeholder="Search orders, customers..."
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-secondary/50 dark:bg-white/5 dark:text-white dark:focus:ring-white/20 transition-all text-sm outline-none shadow-sm focus:shadow-md"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    aria-label="Toggle theme"
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                    <Moon className="w-5 h-5" aria-hidden="true" />
                </button>

                <button
                    aria-label="Notifications"
                    className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                    <Bell className="w-5 h-5" aria-hidden="true" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white dark:border-primary"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2" />

                <button
                    aria-label="User profile"
                    aria-haspopup="menu"
                    className="flex items-center space-x-2 group p-1 pr-3 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95"
                >
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-medium shadow-inner">
                        A
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                        Admin
                    </span>
                </button>
            </div>
        </header>
    );
}
