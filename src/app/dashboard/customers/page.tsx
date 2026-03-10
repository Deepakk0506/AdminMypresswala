"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Users, Mail, Phone, MapPin, Calendar, TrendingUp, Star, Filter, Edit2, Trash2, Eye, MessageSquare, Tag, Crown, Shield, Clock, DollarSign } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  addr: string;
  created_at: string;
}

interface CustomerOrderSummary {
  customer_id: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  average_order_value: number;
  updated_at: string;
}

interface CustomerTag {
  id: string;
  customer_id: string;
  tag_name: string;
  color: string;
  created_at: string;
}

interface CustomerAddress {
  id: string;
  customer_id: string;
  address_type: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  customer_id: string;
  method_type: string;
  provider?: string;
  last_four?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

interface CustomerReview {
  id: string;
  customer_id: string;
  service_id?: string;
  order_id?: string;
  rating: number;
  comment: string;
  is_public: boolean;
  created_at: string;
}

interface CustomerCommunication {
  id: string;
  customer_id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  sent_by: string;
  created_at: string;
}

interface CustomerNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

interface CustomerWithDetails extends Customer {
  order_summary?: CustomerOrderSummary;
  tags?: CustomerTag[];
  communications?: CustomerCommunication[];
  addresses?: CustomerAddress[];
  payment_methods?: PaymentMethod[];
  reviews?: CustomerReview[];
  notifications?: CustomerNotification[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterTag, setFilterTag] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting customer fetch...');
      
      // Test basic connection first
      console.log('📊 Testing basic connection...');
      const { data: testData, error: testError } = await supabase.from('customers').select('count');
      console.log('📊 Basic test result:', { testData, testError });
      
      // Fetch customers with their order summaries, tags, and communications
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('👥 Customers query result:', { data: customersData, error: customersError });

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        setError(customersError.message);
        setCustomers([]);
        return;
      }

      // Fetch order summaries for all customers
      const { data: orderSummaries } = await supabase
        .from("customer_order_summary")
        .select("*");

      console.log('📈 Order summaries:', orderSummaries);

      // Fetch tags for all customers
      const { data: tags } = await supabase
        .from("customer_tags")
        .select("*");

      console.log('🏷️ Tags:', tags);

      // Fetch communications for all customers
      const { data: communications } = await supabase
        .from("customer_communications")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('💬 Communications:', communications);

      // Fetch addresses for all customers
      const { data: addresses } = await supabase
        .from("customer_addresses")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('🏠 Addresses:', addresses);

      // Fetch payment methods for all customers
      const { data: paymentMethods } = await supabase
        .from("payment_methods")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('💳 Payment methods:', paymentMethods);

      // Fetch reviews for all customers
      const { data: reviews } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('⭐ Reviews:', reviews);

      // Fetch notifications for all customers
      const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('🔔 Notifications:', notifications);

      // Combine all data - show all customers even if they don't have related data
      const customersWithDetails: CustomerWithDetails[] = customersData?.map(customer => ({
        ...customer,
        order_summary: orderSummaries?.find(summary => summary.customer_id === customer.id) || {
          customer_id: customer.id,
          total_orders: 0,
          total_spent: 0,
          last_order_date: customer.created_at,
          average_order_value: 0,
          updated_at: new Date().toISOString()
        },
        tags: tags?.filter(tag => tag.customer_id === customer.id) || [],
        communications: communications?.filter(comm => comm.customer_id === customer.id) || [],
        addresses: addresses?.filter(addr => addr.customer_id === customer.id) || [],
        payment_methods: paymentMethods?.filter(pm => pm.customer_id === customer.id) || [],
        reviews: reviews?.filter(review => review.customer_id === customer.id) || [],
        notifications: notifications?.filter(notif => notif.user_id === customer.id) || []
      })) || [];

      console.log('✅ Final customers with details:', customersWithDetails);
      setCustomers(customersWithDetails);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Unexpected error: ${err}`);
      setCustomers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.addr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !filterTag || customer.tags?.some(tag => tag.tag_name === filterTag);
    
    return matchesSearch && matchesTag;
  });

  const getUniqueTags = () => {
    const allTags = customers.flatMap(customer => customer.tags || []);
    return Array.from(new Set(allTags.map(tag => tag.tag_name)));
  };

  const getTagIcon = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'vip': return <Crown className="w-3 h-3" />;
      case 'regular': return <Users className="w-3 h-3" />;
      case 'new': return <Star className="w-3 h-3" />;
      case 'inactive': return <Clock className="w-3 h-3" />;
      default: return <Tag className="w-3 h-3" />;
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This will also delete all their orders and related data.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        setError(`Failed to delete customer: ${error.message}`);
      } else {
        await fetchCustomers();
        setShowDetails(false);
        setSelectedCustomer(null);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
    setLoading(false);
  };

  const handleCreateTestCustomer = async () => {
    try {
      console.log('🧪 Creating test customer...');
      
      // Generate unique phone number and email
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      
      // First create a basic customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: `Test Customer ${randomSuffix}`,
          email: `test${randomSuffix}@example.com`,
          phone: `+91 98765 ${timestamp.toString().slice(-4)}`,
          addr: '123 Test Street, Test City'
        })
        .select()
        .single();

      if (customerError) {
        console.error('❌ Error creating customer:', customerError);
        setError(`Failed to create test customer: ${customerError.message}`);
        return;
      }

      console.log('✅ Test customer created:', newCustomer);

      // Create order summary for this customer
      const { data: summary, error: summaryError } = await supabase
        .from('customer_order_summary')
        .insert({
          customer_id: newCustomer.id,
          total_orders: 5,
          total_spent: 2500,
          last_order_date: new Date().toISOString(),
          average_order_value: 500
        })
        .select();

      if (summaryError) {
        console.error('❌ Error creating summary:', summaryError);
      } else {
        console.log('✅ Order summary created:', summary);
      }

      // Create a tag for this customer
      const { data: tag, error: tagError } = await supabase
        .from('customer_tags')
        .insert({
          customer_id: newCustomer.id,
          tag_name: 'New',
          color: '#3B82F6'
        })
        .select();

      if (tagError) {
        console.error('❌ Error creating tag:', tagError);
      } else {
        console.log('✅ Tag created:', tag);
      }

      // Refresh the customers list
      await fetchCustomers();
      
    } catch (err) {
      console.error('💥 Unexpected error creating test customer:', err);
      setError(`Unexpected error: ${err}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl shadow-2xl relative overflow-hidden group transform hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Users className="w-10 h-10 text-white relative z-10" />
              <Shield className="absolute top-2 right-2 w-4 h-4 text-white opacity-80" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-gradient">
                Customers
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your customer relationships and orders</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl blur-lg opacity-20"></div>
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500 z-10" />
            <input
              type="text"
              placeholder="Search customers by name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 z-10" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-800 appearance-none cursor-pointer"
            >
              <option value="">All Tags</option>
              {getUniqueTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateTestCustomer}
            className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Create Test Customer
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl shadow-lg relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Customer Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setActiveTab("overview");
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: "overview", label: "Overview", icon: Users },
                  { id: "addresses", label: "Addresses", icon: MapPin, count: selectedCustomer.addresses?.length },
                  { id: "payments", label: "Payments", icon: DollarSign, count: selectedCustomer.payment_methods?.length },
                  { id: "reviews", label: "Reviews", icon: Star, count: selectedCustomer.reviews?.length },
                  { id: "notifications", label: "Notifications", icon: MessageSquare, count: selectedCustomer.notifications?.length }
                ].map(({ id, label, icon: Icon, count }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {count !== undefined && count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        activeTab === id ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              <div className="overflow-y-auto max-h-[60vh]">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customer Info */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-semibold text-gray-800">{selectedCustomer.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-semibold text-gray-800">{selectedCustomer.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-semibold text-gray-800">{selectedCustomer.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="font-semibold text-gray-800">{selectedCustomer.addr}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-500">Member Since</p>
                              <p className="font-semibold text-gray-800">{formatDate(selectedCustomer.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {selectedCustomer.tags && selectedCustomer.tags.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedCustomer.tags.map(tag => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                              >
                                {getTagIcon(tag.tag_name)}
                                <span className="ml-1">{tag.tag_name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                      {selectedCustomer.order_summary && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <p className="text-sm text-gray-600">Total Orders</p>
                              </div>
                              <p className="text-2xl font-bold text-blue-600">{selectedCustomer.order_summary.total_orders}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-gray-600">Total Spent</p>
                              </div>
                              <p className="text-2xl font-bold text-green-600">₹{selectedCustomer.order_summary.total_spent}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                <p className="text-sm text-gray-600">Avg Order Value</p>
                              </div>
                              <p className="text-2xl font-bold text-purple-600">₹{selectedCustomer.order_summary.average_order_value}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-orange-600" />
                                <p className="text-sm text-gray-600">Last Order</p>
                              </div>
                              <p className="text-sm font-bold text-orange-600">{formatDate(selectedCustomer.order_summary.last_order_date)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recent Communications */}
                      {selectedCustomer.communications && selectedCustomer.communications.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Communications</h3>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {selectedCustomer.communications.slice(0, 5).map(comm => (
                              <div key={comm.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-800">{comm.subject}</span>
                                  <span className="text-xs text-gray-500">{formatDate(comm.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{comm.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <MessageSquare className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs text-gray-500">{comm.type}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    comm.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {comm.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Addresses</h3>
                    {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                      <div className="grid gap-4">
                        {selectedCustomer.addresses.map(address => (
                          <div key={address.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-gray-800 capitalize">{address.address_type} Address</span>
                                {address.is_default && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{formatDate(address.created_at)}</span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p className="font-medium">{address.address_line1}</p>
                              {address.address_line2 && <p>{address.address_line2}</p>}
                              <p>{address.city}, {address.state} {address.postal_code}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No addresses found for this customer</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === "payments" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Methods</h3>
                    {selectedCustomer.payment_methods && selectedCustomer.payment_methods.length > 0 ? (
                      <div className="grid gap-4">
                        {selectedCustomer.payment_methods.map(payment => (
                          <div key={payment.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800 capitalize">{payment.method_type}</div>
                                  {payment.provider && <div className="text-sm text-gray-500">{payment.provider}</div>}
                                </div>
                                {payment.is_default && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                                )}
                              </div>
                              <div className="text-right">
                                {payment.last_four && (
                                  <div className="text-sm text-gray-600">•••• {payment.last_four}</div>
                                )}
                                {payment.expiry_month && payment.expiry_year && (
                                  <div className="text-xs text-gray-500">
                                    {payment.expiry_month.toString().padStart(2, '0')}/{payment.expiry_year}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                payment.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {payment.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs text-gray-500">{formatDate(payment.created_at)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No payment methods found for this customer</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Reviews</h3>
                    {selectedCustomer.reviews && selectedCustomer.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCustomer.reviews.map(review => (
                          <div key={review.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-medium text-gray-800">{review.rating}/5 Stars</span>
                                {review.is_public && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Public</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            {review.service_id && (
                              <div className="text-xs text-gray-500">
                                Service ID: {review.service_id.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No reviews found for this customer</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Notifications</h3>
                    {selectedCustomer.notifications && selectedCustomer.notifications.length > 0 ? (
                      <div className="space-y-3">
                        {selectedCustomer.notifications.map(notification => (
                          <div key={notification.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-800">{notification.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  notification.is_read ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {notification.is_read ? 'Read' : 'Unread'}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-gray-500 capitalize">{notification.type.replace('_', ' ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No notifications found for this customer</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                  className="flex items-center gap-3 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Grid */}
      {loading ? (
        <div className="text-center py-16 relative z-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 relative z-10">
          <div className="p-8 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl inline-block mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Users className="w-20 h-20 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">No customers found</h3>
          <p className="text-gray-600 mb-8 text-lg">
            {searchTerm || filterTag ? 'Try adjusting your search or filter' : 'Your customer list is empty'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]"
            >
              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300">
                          {customer.name}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {customer.tags && customer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {customer.tags.map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {getTagIcon(tag.tag_name)}
                            <span className="ml-1">{tag.tag_name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowDetails(true);
                      }}
                      className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 hover:rotate-3"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="p-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 hover:-rotate-3"
                      title="Delete customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="line-clamp-1">{customer.addr}</span>
                  </div>
                </div>

                {/* Order Summary */}
                {customer.order_summary && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        <p className="text-xs text-gray-600">Orders</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{customer.order_summary.total_orders}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <p className="text-xs text-gray-600">Spent</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">₹{customer.order_summary.total_spent}</p>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{customer.addresses?.length || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">Addresses</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{customer.payment_methods?.length || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">Payments</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{customer.reviews?.length || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Member since {formatDate(customer.created_at)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
