"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OrderService, Order, OrderFilters } from './orderService';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [currency, setCurrency] = useState('NGN');
  const pageSize = 20;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const storeId = localStorage.getItem('storeId') || '';
      if (!storeId) {
        throw new Error('Store ID not found. Please log in again.');
      }

      const filters: OrderFilters = {
        status: activeTab === 'All' ? undefined : activeTab,
        search: searchQuery,
        page: page,
        pageSize: pageSize
      };

      const response = await OrderService.getOrders(storeId, filters);
      if (response.success) {
        if (page === 1) {
          setOrders(response.data.items);
        } else {
          setOrders(prev => [...prev, ...response.data.items]);
        }
        setTotalCount(response.data.totalCount);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchOrders();
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
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

    if (page > 1) {
      fetchOrders();
    }
  }, [page]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
      case 'processing':
      case 'unfulfilled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
      case 'refunded':
      case 'returned':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">Orders</h2>
          <p className="text-gray-500 font-medium text-base md:text-lg">Manage and fulfill your customer orders.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-x-auto pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); setOrders([]); }}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                  activeTab === tab 
                    ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-96 flex items-center shrink-0">
            <svg className="absolute left-4 w-5 h-5 text-gray-400 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search by customer or order #..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-black transition-all font-semibold placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-gray-100 bg-gray-50/50">
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Order</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold italic animate-pulse">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold italic">No orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group border-b-2 border-gray-100 last:border-0 relative">
                    <td className="px-6 py-5">
                      <Link href={`/dashboard/orders/${order.id}`} className="absolute inset-0 z-20"></Link>
                      <span className="relative z-30 font-bold text-black text-lg group-hover:underline underline-offset-4 pointer-events-none">#{order.orderNumber.split('-').pop()}</span>
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-semibold text-base relative z-10">
                      {new Date(order.placedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">
                          {order.customerEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-black text-base block truncate">{order.customerEmail.split('@')[0]}</span>
                          <span className="text-gray-500 font-medium text-sm">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 relative z-10">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border-2 inline-flex items-center gap-1.5 whitespace-nowrap ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus === 'Paid' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 relative z-10">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border-2 inline-flex items-center gap-1.5 whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-black text-lg relative z-10 whitespace-nowrap">
                      {currency} {order.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && orders.length < totalCount && (
        <div className="flex items-center justify-center pt-8">
          <button 
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-white text-black border-2 border-gray-100 px-10 py-4 rounded-2xl font-bold text-lg hover:border-black transition-all shadow-sm flex items-center gap-3"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin"></span>
            ) : null}
            Load more orders
          </button>
        </div>
      )}
    </div>
  );
}
