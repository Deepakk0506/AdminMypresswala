"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Clock, AlertCircle, Store, Users, Mail, Phone, Calendar, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { NotificationService } from "@/lib/notifications";
import { cn } from "@/lib/utils";

interface PendingShop {
    id: string;
    shop_name: string;
    owner_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    category: string;
    services: string[];
    submitted_at: string;
}

interface ShopApprovalDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    onApprovalComplete: () => void;
}

export default function ShopApprovalDashboard({ isOpen, onClose, onApprovalComplete }: ShopApprovalDashboardProps) {
    const [pendingShops, setPendingShops] = useState<PendingShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShop, setSelectedShop] = useState<PendingShop | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectionModal, setShowRejectionModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPendingShops();
        }
    }, [isOpen]);

    const fetchPendingShops = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("shops")
                .select("*")
                .eq("approval_status", "pending")
                .order("submitted_at", { ascending: false });

            if (error) throw error;
            setPendingShops(data || []);
        } catch (error) {
            console.error("Error fetching pending shops:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (shopId: string, shopName: string, shopEmail: string) => {
        setProcessing(shopId);
        try {
            // Update shop status to approved
            const { error } = await supabase
                .from('shops')
                .update({ 
                    approval_status: 'approved',
                    approved_at: new Date().toISOString()
                })
                .eq('id', shopId);

            if (error) throw error;

            // Send approval notification
            await NotificationService.sendShopApprovalNotification(shopId, shopName, shopEmail);

            // Remove from pending list
            setPendingShops(prev => prev.filter(shop => shop.id !== shopId));
            
            console.log(`✅ Shop ${shopName} approved successfully`);
        } catch (error) {
            console.error("Error approving shop:", error);
            alert("Failed to approve shop");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (shopId: string, shopName: string, shopEmail: string) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }

        setProcessing(shopId);
        try {
            // Update shop status to rejected
            const { error } = await supabase
                .from('shops')
                .update({ 
                    approval_status: 'rejected',
                    rejection_reason: rejectionReason,
                    approved_at: new Date().toISOString()
                })
                .eq('id', shopId);

            if (error) throw error;

            // Send rejection notification
            await NotificationService.sendShopRejectionNotification(shopId, shopName, shopEmail, rejectionReason);

            // Remove from pending list
            setPendingShops(prev => prev.filter(shop => shop.id !== shopId));
            
            setShowRejectionModal(false);
            setRejectionReason("");
            setSelectedShop(null);
            
            console.log(`❌ Shop ${shopName} rejected`);
        } catch (error) {
            console.error("Error rejecting shop:", error);
            alert("Failed to reject shop");
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Shop Approval Dashboard
                        </h2>
                        <p className="text-gray-600 mt-1">Review and approve pending shop applications</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : pendingShops.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl inline-block mb-6">
                                <Check className="w-16 h-16 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">All Caught Up!</h3>
                            <p className="text-gray-600">No pending shop applications to review</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingShops.map((shop) => (
                                <div key={shop.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
                                                    <Store className="w-6 h-6 text-amber-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">{shop.shop_name}</h3>
                                                    <p className="text-sm text-gray-500">Category: {shop.category}</p>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full">
                                                    <Clock className="w-4 h-4 text-amber-600" />
                                                    <span className="text-sm font-medium text-amber-700">Pending</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{shop.owner_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{shop.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{shop.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{formatDate(shop.submitted_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{shop.address}, {shop.city}</span>
                                                </div>
                                            </div>

                                            {shop.services.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {shop.services.slice(0, 3).map((service, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                                                                {service}
                                                            </span>
                                                        ))}
                                                        {shop.services.length > 3 && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                                +{shop.services.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => setSelectedShop(shop)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(shop.id, shop.shop_name, shop.email)}
                                                disabled={processing === shop.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                            >
                                                {processing === shop.id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedShop(shop);
                                                    setShowRejectionModal(true);
                                                }}
                                                disabled={processing === shop.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {pendingShops.length} pending application{pendingShops.length !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Close Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectionModal && selectedShop && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Reject Shop Application</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting <strong>{selectedShop.shop_name}</strong>
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false);
                                    setRejectionReason("");
                                    setSelectedShop(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(selectedShop.id, selectedShop.shop_name, selectedShop.email)}
                                disabled={processing === selectedShop.id}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {processing === selectedShop.id ? 'Processing...' : 'Reject Shop'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
