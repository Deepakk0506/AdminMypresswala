"use client";

import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { format, subDays, subMonths, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

interface OrderData {
    created_at: string;
    total_price: number;
    status: string;
}

interface ChartData {
    date: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
}

interface RevenueChartProps {
    data: OrderData[];
    period: '7days' | '30days' | 'year';
}

export default function RevenueChart({ data, period }: RevenueChartProps) {
    const processData = (): ChartData[] => {
        if (!data || data.length === 0) return [];

        const now = new Date();
        let startDate: Date;
        let groupBy: 'day' | 'week' | 'month';

        switch (period) {
            case '7days':
                startDate = subDays(now, 7);
                groupBy = 'day';
                break;
            case '30days':
                startDate = subDays(now, 30);
                groupBy = 'week';
                break;
            case 'year':
                startDate = subMonths(now, 12);
                groupBy = 'month';
                break;
            default:
                startDate = subDays(now, 7);
                groupBy = 'day';
        }

        // Filter data by date range
        const filteredData = data.filter(order => 
            new Date(order.created_at) >= startDate && 
            new Date(order.created_at) <= now
        );

        // Group data by period
        const groupedData = filteredData.reduce((acc, order) => {
            const orderDate = new Date(order.created_at);
            let key: string;

            switch (groupBy) {
                case 'day':
                    key = format(orderDate, 'MMM dd');
                    break;
                case 'week':
                    const weekStart = startOfWeek(orderDate);
                    key = format(weekStart, 'MMM dd');
                    break;
                case 'month':
                    const monthStart = startOfMonth(orderDate);
                    key = format(monthStart, 'MMM yyyy');
                    break;
                default:
                    key = format(orderDate, 'MMM dd');
            }

            if (!acc[key]) {
                acc[key] = {
                    date: key,
                    revenue: 0,
                    orders: 0,
                    avgOrderValue: 0
                };
            }

            acc[key].revenue += order.total_price || 0;
            acc[key].orders += 1;

            return acc;
        }, {} as Record<string, ChartData>);

        // Calculate average order values and convert to array
        return Object.values(groupedData).map(item => ({
            ...item,
            avgOrderValue: item.orders > 0 ? Math.round(item.revenue / item.orders) : 0
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const chartData = processData();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-gray-100/50">
                    <p className="font-black text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 font-medium">No revenue data available</p>
                    <p className="text-gray-400 text-sm mt-2">Orders will appear here once customers start placing them</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        yAxisId="revenue"
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                        yAxisId="orders"
                        orientation="right"
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    />
                    
                    <Bar
                        yAxisId="revenue"
                        dataKey="revenue"
                        name="Revenue"
                        fill="url(#revenueGradient)"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                    />
                    
                    <Line
                        yAxisId="orders"
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8 }}
                        animationDuration={1500}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
