"use client";

import { useState, useRef, useEffect } from "react";
import { User, Shield, Bell, LogOut, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfileDropdown() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [mfaStatus, setMfaStatus] = useState<boolean | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check MFA status
    useEffect(() => {
        const checkMFA = async () => {
            try {
                const response = await fetch("/api/mfa/status");
                if (response.ok) {
                    const data = await response.json();
                    setMfaStatus(data.mfaEnabled);
                }
            } catch (error) {
                console.error("Error checking MFA status:", error);
            }
        };
        checkMFA();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const getInitials = (name: string) => {
        return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "A";
    };

    const getRoleBadgeColor = (role: string) => {
        return role === "super_admin" 
            ? "bg-purple-100 text-purple-700" 
            : "bg-blue-100 text-blue-700";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 group p-1 pr-3 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95"
            >
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-medium shadow-inner">
                    {getInitials(user?.full_name || "Admin")}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                    {user?.full_name || "Admin"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-medium text-lg">
                                {getInitials(user?.full_name || "Admin")}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{user?.full_name || "Admin"}</p>
                                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user?.role || "admin")}`}>
                                    {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            href="/dashboard/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User className="w-4 h-4 text-gray-400" />
                            Profile Settings
                        </Link>

                        <Link
                            href="/dashboard/security"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="flex-1">Security</span>
                            {mfaStatus === true ? (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    2FA On
                                </span>
                            ) : mfaStatus === false ? (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                    <AlertCircle className="w-3 h-3" />
                                    2FA Off
                                </span>
                            ) : null}
                        </Link>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // TODO: Open notifications panel
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Bell className="w-4 h-4 text-gray-400" />
                            Notifications
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1" />

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
