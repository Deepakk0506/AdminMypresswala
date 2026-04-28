"use client";

import { useState } from "react";
import { User, Shield, Edit2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import MFASettings from "@/components/mfa/MFASettings";

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.full_name || "",
        email: user?.email || "",
    });

    const getInitials = (name: string) => {
        return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "A";
    };

    const getRoleBadgeColor = (role: string) => {
        return role === "super_admin" 
            ? "bg-purple-100 text-purple-700 border-purple-200" 
            : "bg-blue-100 text-blue-700 border-blue-200";
    };

    const handleSave = () => {
        // TODO: Implement profile update API
        setIsEditing(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-500">Manage your account settings and security</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                {/* Profile Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-2xl font-bold text-secondary">
                            {getInitials(user?.full_name || "Admin")}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                            <p className="text-gray-600">{user?.email}</p>
                            <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full border ${getRoleBadgeColor(user?.role || "admin")}`}>
                                {user?.role === "super_admin" ? "Super Administrator" : "Administrator"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-100">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "profile"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <User className="w-4 h-4" />
                            Profile Information
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "security"
                                    ? "border-red-500 text-red-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Shield className="w-4 h-4" />
                            Security & MFA
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    {isEditing ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.role === "super_admin" ? "Super Admin" : "Admin"}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Status
                                    </label>
                                    <div className="flex items-center gap-2 px-4 py-2 border border-green-200 rounded-lg bg-green-50 text-green-700">
                                        <CheckCircle className="w-4 h-4" />
                                        Active
                                    </div>
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <MFASettings />
                    )}
                </div>
            </div>
        </div>
    );
}
