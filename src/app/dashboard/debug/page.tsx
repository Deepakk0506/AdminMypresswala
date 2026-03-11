"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DebugPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const testConnection = async () => {
            setLoading(true);
            const testResults = [];

            try {
                // Test 1: Basic connection
                console.log('🔍 Testing basic connection...');
                const { data: shopsData, error: shopsError } = await supabase.from('shops').select('count');
                testResults.push({
                    test: 'Shops Connection',
                    data: shopsData,
                    error: shopsError,
                    status: shopsError ? '❌ Failed' : '✅ Success'
                });

                // Test 2: Customers table
                console.log('👥 Testing customers table...');
                const { data: customersData, error: customersError } = await supabase.from('customers').select('*').limit(3);
                testResults.push({
                    test: 'Customers Table',
                    data: customersData,
                    error: customersError,
                    status: customersError ? '❌ Failed' : '✅ Success'
                });

                // Test 3: Orders table
                console.log('📦 Testing orders table...');
                const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').limit(3);
                testResults.push({
                    test: 'Orders Table',
                    data: ordersData,
                    error: ordersError,
                    status: ordersError ? '❌ Failed' : '✅ Success'
                });

                // Test 4: Services table
                console.log('🧵 Testing services table...');
                const { data: servicesData, error: servicesError } = await supabase.from('services').select('*').limit(3);
                testResults.push({
                    test: 'Services Table',
                    data: servicesData,
                    error: servicesError,
                    status: servicesError ? '❌ Failed' : '✅ Success'
                });

                // Test 5: Orders with JOIN
                console.log('🔗 Testing orders with JOIN...');
                const { data: joinData, error: joinError } = await supabase
                    .from("orders")
                    .select(`
                        *,
                        customer:customer_id(name, email, phone),
                        service:service_id(service_name, price)
                    `)
                    .limit(3);
                testResults.push({
                    test: 'Orders JOIN Query',
                    data: joinData,
                    error: joinError,
                    status: joinError ? '❌ Failed' : '✅ Success'
                });

                // Test 6: Count queries
                console.log('📊 Testing count queries...');
                const [customersCount, ordersCount, servicesCount] = await Promise.all([
                    supabase.from('customers').select('count'),
                    supabase.from('orders').select('count'),
                    supabase.from('services').select('count')
                ]);

                testResults.push({
                    test: 'Customers Count',
                    data: customersCount.data,
                    error: customersCount.error,
                    status: customersCount.error ? '❌ Failed' : '✅ Success'
                });

                testResults.push({
                    test: 'Orders Count',
                    data: ordersCount.data,
                    error: ordersCount.error,
                    status: ordersCount.error ? '❌ Failed' : '✅ Success'
                });

                testResults.push({
                    test: 'Services Count',
                    data: servicesCount.data,
                    error: servicesCount.error,
                    status: servicesCount.error ? '❌ Failed' : '✅ Success'
                });

            } catch (err) {
                testResults.push({
                    test: 'Overall Error',
                    error: err,
                    status: '❌ Failed'
                });
            }

            setResults(testResults);
            setLoading(false);
        };

        testConnection();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Testing database connection...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Database Debug Results</h1>
                
                <div className="space-y-4">
                    {results.map((result, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">{result.test}</h2>
                                <span className={`text-2xl ${result.status.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.status}
                                </span>
                            </div>
                            
                            {result.error && (
                                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                                    <p className="text-red-700 font-medium">Error: {result.error?.message || JSON.stringify(result.error)}</p>
                                </div>
                            )}
                            
                            {result.data && (
                                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                    <p className="text-sm text-gray-600 mb-2">Data Response:</p>
                                    <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-auto max-h-40">
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Next Steps:</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>If all tests show ✅ Success but no data appears, run the SQL script in test-data-connection.sql</li>
                        <li>If tests show ❌ Failed, check your Supabase configuration and RLS policies</li>
                        <li>Check browser console for detailed error messages</li>
                        <li>Verify your .env.local file has correct Supabase URL and keys</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
