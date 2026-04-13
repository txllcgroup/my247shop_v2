"use client";
import React, { useState, useEffect } from 'react';
import { AnalyticsService, AnalyticsData, TopProduct, AnalyticsOrder, AnalyticsTransaction } from './analyticsService';

const MetricCard = ({ title, value, subValue, icon, color }: { title: string, value: string | number, subValue?: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm relative overflow-hidden group hover:border-black transition-all duration-300">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-500 font-semibold text-sm tracking-wide uppercase">{title}</span>
        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-black">
          {icon}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-4xl font-bold tracking-tight text-black">{value}</div>
        {subValue && <div className="text-sm font-semibold text-gray-500">{subValue}</div>}
      </div>
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('NGN');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const storeId = localStorage.getItem('storeId') || '';
      if (!storeId) throw new Error('Store ID not found');
      
      const res = await AnalyticsService.getAnalytics(storeId);
      if (res.success) {
        setData(res.data);
      } else {
        throw new Error('Failed to load analytics data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedCurrency = localStorage.getItem('currency');
    const storedCountry = localStorage.getItem('country');
    const profileStr = localStorage.getItem('profile');

    let curr = storedCurrency || "NGN";
    let country = storedCountry || "";

    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        curr = profile.currency || curr;
        country = profile.country || country;
      } catch (e) {
        console.error("Error parsing profile for currency", e);
      }
    }

    if (country && country !== "Nigeria") {
      curr = "USD";
    }
    setCurrency(curr);
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Gathering insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto p-10">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Failed to load analytics</h2>
          <p className="text-red-600 font-medium mb-6">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Retry Fetching
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-32 px-4 lg:px-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-4">Analytics</h1>
          <p className="text-xl text-gray-500 font-medium max-w-xl">Deep insights into your store performance and customer behavior.</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-white text-black px-6 py-3 rounded-xl border-2 border-gray-200 text-base font-semibold hover:border-black transition-colors flex items-center gap-2 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export Report
           </button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={`${currency} ${data.totalRevenue.toLocaleString()}`} 
          subValue={`Avg Order: ${currency} ${data.averageOrderValue.toLocaleString()}`}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="bg-emerald-400"
        />
        <MetricCard 
          title="Orders" 
          value={data.totalOrders} 
          subValue={`${data.fulfilledOrders} Fulfilled, ${data.cancelledOrders} Cancelled`}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          color="bg-blue-400"
        />
        <MetricCard 
          title="Customers" 
          value={data.totalCustomers} 
          subValue={`${data.activeCustomers} Active recent`}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          color="bg-purple-400"
        />
        <MetricCard 
          title="Products" 
          value={data.totalProducts} 
          subValue={`${data.lowStockProducts} Low stock items`}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
          color="bg-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Products */}
        <div className="lg:col-span-1 bg-white rounded-3xl border-2 border-gray-100 shadow-sm flex flex-col h-full">
          <div className="p-8 border-b-2 border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-black">Top Products</h3>
            <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg uppercase tracking-wider">Revenue</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              {data.topProducts.map((product, i) => (
                <div key={product.productId} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-black group-hover:underline underline-offset-4">{product.productName}</h4>
                      <p className="text-sm font-semibold text-gray-500">{product.unitsSold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">{data.currency} {product.revenue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {data.topProducts.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold italic">No product data yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Orders */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
             <div className="p-8 border-b-2 border-gray-50 flex items-center justify-between sticky left-0">
               <h3 className="text-xl font-bold text-black">Insights: Recent Orders</h3>
               <button className="text-sm font-bold text-black hover:underline underline-offset-4">View All</button>
             </div>
             <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-50/50">
                   <tr>
                     <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Order</th>
                     <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                     <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-50">
                   {data.recentOrders.map((order) => (
                     <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors border-b-2 border-gray-50 last:border-0 group cursor-pointer" onClick={() => window.location.href=`/dashboard/orders/${order.orderId}`}>
                       <td className="px-8 py-5">
                          <span className="font-bold text-black group-hover:underline underline-offset-4">{order.orderNumber}</span>
                       </td>
                       <td className="px-8 py-5 text-gray-500 font-semibold">
                          {new Date(order.placedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </td>
                       <td className="px-8 py-5 text-right font-bold text-black">
                         {data.currency} {order.totalAmount.toLocaleString()}
                       </td>
                       <td className="px-8 py-5 text-right">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border-2 ${
                            order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {order.status}
                          </span>
                       </td>
                     </tr>
                   ))}
                   {data.recentOrders.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold italic">No recent orders</td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>

          {/* Recent Transactions */}
          <div className="bg-black text-white rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-96 h-96 bg-gray-800 opacity-20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-bold">Live Cashflow</h3>
                   <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>

                <div className="space-y-6">
                   {data.recentTransactions.map((tx) => (
                     <div key={tx.transactionId} className="flex items-center justify-between bg-white/5 p-5 rounded-[24px] border border-white/10 hover:border-white/20 transition-all group">
                        <div className="flex items-center gap-5">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${tx.type === 'Credit' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-gray-500/20 border-gray-500/30'}`}>
                              {tx.type === 'Credit' ? (
                                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                              ) : (
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                              )}
                           </div>
                           <div>
                              <span className="text-xl font-bold block">{tx.category}</span>
                              <span className="text-gray-400 font-semibold text-sm">Ref: {tx.reference}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`text-2xl font-bold block mb-1 ${tx.type === 'Credit' ? 'text-emerald-400' : 'text-gray-400'}`}>
                             {tx.type === 'Credit' ? '+' : '-'}{data.currency} {tx.amount.toLocaleString()}
                           </span>
                           <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded-md">{tx.status}</span>
                        </div>
                     </div>
                   ))}
                   {data.recentTransactions.length === 0 && (
                     <div className="text-center py-10 text-gray-500 font-bold italic">No cashflow activity recorded</div>
                   )}
                </div>

                <div className="mt-10 flex justify-center">
                   <button 
                     onClick={() => window.location.href='/dashboard/wallet'}
                     className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
                   >
                      Wallet Activity
                   </button>
                </div>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
}
