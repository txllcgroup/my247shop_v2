"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
import { useWindowSize } from 'react-use';
import { OrderService, Order, OrderSummary } from './orders/orderService';
import { CustomerService } from './customers/customerService';
import { AnalyticsService, AnalyticsData } from './analytics/analyticsService';
import { BillingService, BillingWallet } from './billing/billingService';
import { WalletService, Wallet } from './wallet/walletService';
import { AuthGuard } from '@/components/AuthGuard';

const SummaryCard = ({ title, value, icon, subtext, colorClass }: any) => (
  <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-center relative overflow-hidden group hover:border-black hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-300 ${colorClass}`}>
        {icon}
      </div>
      <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">{title}</h3>
    </div>
    <div className="flex flex-col relative z-10">
      <div className="text-4xl font-bold tracking-tight text-black flex items-baseline gap-1">
        {value}
      </div>
      {subtext && <div className="text-[13px] font-semibold text-gray-400 mt-2 flex items-center gap-1.5 capitalize">{subtext}</div>}
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 blur-2xl"></div>
  </div>
);

const getCurrencySymbol = (currency?: string) => {
  if (currency === 'NGN') return '₦';
  if (currency === 'USD') return '$';
  if (currency === 'GBP') return '£';
  if (currency === 'EUR') return '€';
  return currency || '';
};

export default function DashboardHome() {
  const { width, height } = useWindowSize();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [billingWallet, setBillingWallet] = useState<BillingWallet | null>(null);
  const [sellerWallet, setSellerWallet] = useState<Wallet | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('NGN');

  useEffect(() => {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    
    const storedCountry = localStorage.getItem('country');
    if (storedCountry) {
      setCurrency(storedCountry === 'Nigeria' ? 'NGN' : 'USD');
    }

    const fetchData = async () => {
      try {
        const storeId = localStorage.getItem('storeId') || '';
        if (!storeId) return;

        const [analyticsRes, billingRes, sellerRes] = await Promise.all([
          AnalyticsService.getAnalytics(storeId),
          BillingService.getWallet(),
          WalletService.getWallet(storeId)
        ]);

        if (analyticsRes.success) setAnalytics(analyticsRes.data);
        setBillingWallet(billingRes);
        if (sellerRes.success) setSellerWallet(sellerRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    
    setIsBroadcasting(true);
    try {
      const storeId = localStorage.getItem('storeId') || '';
      await CustomerService.broadcastMessage(storeId, broadcastMessage);
      setBroadcastSuccess(true);
      setBroadcastMessage('');
      setTimeout(() => {
        setBroadcastSuccess(false);
        setShowBroadcastModal(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to send broadcast", err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const symbol = getCurrencySymbol(currency);

  return (
    <AuthGuard>
      <div className="max-w-[1400px] mx-auto space-y-12 md:space-y-16 animate-in fade-in duration-700 pb-20">

      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-8 pt-6">
        <div className="w-full md:w-auto space-y-2">
          <div className="inline-flex items-center px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest mb-2">Live Insights</div>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight text-black">
            Welcome, <span className="font-extrabold">{profile?.fullName?.split(' ')[0] || 'Store Owner'}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium max-w-xl leading-relaxed">Everything that matters to your growth, tracked in real-time.</p>
        </div>

        <button 
          onClick={() => setShowBroadcastModal(true)}
          className="bg-black text-white px-10 py-5 rounded-[24px] text-lg font-bold hover:bg-gray-800 transition-all shadow-2xl hover:-translate-y-1 flex items-center gap-3 group whitespace-nowrap"
        >
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          Broadcast Message
        </button>
      </div>

      {/* Primary Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <SummaryCard 
          title="Total Revenue" 
          value={analytics ? `${symbol}${(analytics.totalRevenue || 0).toLocaleString()}` : `${symbol}0.00`} 
          subtext={`${getCurrencySymbol(currency)}${(analytics?.averageOrderValue || 0).toLocaleString()} average/order`}
          colorClass="bg-emerald-50 text-emerald-600"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <SummaryCard 
          title="Settled Balance" 
          value={sellerWallet ? `${symbol}${(sellerWallet.settledBalance || 0).toLocaleString()}` : `${symbol}0.00`} 
          subtext={`${symbol}${(sellerWallet?.pendingBalance || 0).toLocaleString()} strictly pending`}
          colorClass="bg-blue-50 text-blue-600"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
        />
        <SummaryCard 
          title="Available Credits" 
          value={billingWallet ? (billingWallet.balanceCredits || 0).toLocaleString() : '0'} 
          subtext="Used for AI & Platform features"
          colorClass="bg-purple-50 text-purple-600"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <SummaryCard 
          title="Order Volume" 
          value={analytics?.totalOrders || 0} 
          subtext={`${analytics?.fulfilledOrders || 0} commerce orders successful`}
          colorClass="bg-orange-50 text-orange-600"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
      </div>

      {/* Detailed Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-10">
          {/* Inventory Health */}
          <div className="bg-white rounded-[40px] border-2 border-gray-50 p-10 shadow-sm relative overflow-hidden group">
            <h3 className="text-sm font-bold text-black uppercase tracking-[0.2em] mb-8">Catalogue Health</h3>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-400 font-bold block text-xs uppercase mb-1">Total SKU's</span>
                  <span className="text-3xl font-bold text-black">{analytics?.totalProducts || 0}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-500 font-bold block text-xs uppercase mb-1">Live</span>
                  <span className="text-3xl font-bold text-emerald-600">{analytics?.publishedProducts || 0}</span>
                </div>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-100">
                  <div 
                    style={{ width: `${analytics?.totalProducts ? (analytics.publishedProducts / analytics.totalProducts) * 100 : 0}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black transition-all duration-1000"
                  ></div>
                </div>
              </div>
              <div className={`p-6 rounded-[24px] transition-colors border-2 ${analytics?.lowStockProducts ? 'bg-rose-50 border-rose-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${analytics?.lowStockProducts ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <span className="text-sm font-bold text-black capitalize">Inventory Risks</span>
                  </div>
                  <span className={`text-xl font-bold ${analytics?.lowStockProducts ? 'text-rose-600' : 'text-gray-400'}`}>{analytics?.lowStockProducts || 0}</span>
                </div>
              </div>
            </div>
            <Link href="/dashboard/products" className="mt-8 flex items-center justify-center gap-2 py-4 rounded-[20px] bg-black text-white font-bold text-sm hover:bg-gray-800 transition-all">Go to Products</Link>
          </div>

          {/* Customer Base Section */}
          <div className="bg-black rounded-[40px] p-10 shadow-2xl relative overflow-hidden text-white group">
            <div className="absolute top-0 right-0 p-8">
              <svg className="w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-8">Audience Data</h3>
            <div className="flex items-center gap-8">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                  <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white" strokeDasharray={`${Math.PI * 88}`} strokeDashoffset={`${Math.PI * 88 * (1 - (analytics?.activeCustomers || 0) / (analytics?.totalCustomers || 1))}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-xl font-black">{analytics?.totalCustomers || 0}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-black block">{analytics?.activeCustomers || 0}</span>
                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Global Reach</span>
              </div>
            </div>
            <Link href="/dashboard/customers" className="mt-10 flex items-center justify-center py-4 rounded-[20px] bg-white text-black font-bold text-sm hover:bg-gray-100 transition-all">Engagement Panel</Link>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="lg:col-span-8 space-y-10">
          {/* Commerce Activity Table */}
          <div className="bg-white rounded-[40px] border-2 border-gray-50 shadow-sm overflow-hidden flex flex-col h-[520px]">
            <div className="px-10 py-8 border-b-2 border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-black text-lg tracking-tight">Recent Commerce activity</h3>
              <Link href="/dashboard/orders" className="text-[13px] font-bold text-gray-400 hover:text-black transition-all group flex items-center gap-1.5 uppercase tracking-widest">History <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></Link>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-10 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Invoice</th>
                    <th className="px-10 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Market</th>
                    <th className="px-10 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-10 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Sum</th>
                  </tr>
                </thead>
                <tbody className="text-[15px]">
                  {loading ? (
                    <tr><td colSpan={4} className="px-10 py-24 text-center text-gray-300 font-bold italic animate-pulse tracking-tight">Syncing data engine...</td></tr>
                  ) : !analytics?.recentOrders || analytics.recentOrders.length === 0 ? (
                    <tr><td colSpan={4} className="px-10 py-24 text-center text-gray-400 italic font-medium">No transactions recorded yet</td></tr>
                  ) : analytics.recentOrders.map((order) => {
                    const statusColors: any = {
                      'Pending': 'text-orange-600 bg-orange-50 border-orange-100',
                      'Processing': 'text-blue-600 bg-blue-50 border-blue-100',
                      'Fulfilled': 'text-emerald-600 bg-emerald-50 border-emerald-100',
                      'Cancelled': 'text-rose-600 bg-rose-50 border-rose-100'
                    };
                    return (
                      <tr key={order.orderId} onClick={() => window.location.href = `/dashboard/orders/${order.orderId}`} className="hover:bg-gray-50/80 transition-all cursor-pointer group">
                        <td className="px-10 py-6 border-b border-gray-50 group-last:border-0">
                          <span className="font-bold text-black block mb-1 group-hover:underline underline-offset-4">{order.orderNumber}</span>
                          <span className="text-[12px] font-bold text-gray-400">{new Date(order.placedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </td>
                        <td className="px-10 py-6 border-b border-gray-50 group-last:border-0 font-bold text-gray-500">Retail Order</td>
                        <td className="px-10 py-6 border-b border-gray-50 group-last:border-0">
                          <span className={`px-4 py-2 rounded-full text-[11px] font-black tracking-[0.1em] uppercase border ${statusColors[order.status] || 'text-gray-600 bg-gray-100'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 border-b border-gray-50 group-last:border-0 font-black text-black text-right text-lg">{analytics.currency} {(order.totalAmount || 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Snapshot: Top Products */}
          <div className="bg-white rounded-[40px] border-2 border-gray-50 p-10 shadow-sm transition-all hover:border-black/10">
            <h3 className="text-sm font-bold text-black uppercase tracking-[0.2em] mb-10">Sales performance leaderboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {analytics?.topProducts?.map((p) => (
                <div key={p.productId} className="flex items-center gap-6 group cursor-pointer p-4 hover:bg-gray-50 rounded-[32px] border-2 border-transparent hover:border-black/5 transition-all">
                  <div className="w-20 h-20 bg-gray-100 rounded-[24px] overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${p.productName}&background=000&color=fff&size=256`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt="" 
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-black text-lg block truncate mb-1">{p.productName}</span>
                    <div className="flex items-center gap-3">
                       <span className="text-[12px] font-black text-emerald-600 uppercase tracking-widest">{symbol} {p.revenue.toLocaleString()}</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                       <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{p.unitsSold} sales</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                <div className="col-span-2 py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic">No leader data found</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Hub */}
      <div className="bg-gray-50 rounded-[50px] p-10 md:p-16 border-2 border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400"></div>
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 relative z-10">
          <div className="max-w-md">
            <h3 className="text-3xl font-black text-black tracking-tight mb-4">AI Intelligence insights</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">Our AI engine analyzed your store data and found these immediate growth opportunities for you.</p>
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-gray-200 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-black uppercase tracking-widest">System Active</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[32px] border-2 border-transparent hover:border-blue-200 transition-all group">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
                <h4 className="font-bold text-black mb-1">Product SEO</h4>
                <p className="text-gray-400 text-sm font-medium mb-4">3 products have limited descriptions. Longer descriptions increase sales.</p>
                <button className="px-4 py-2 bg-gray-50 text-black text-xs font-bold rounded-lg hover:bg-black hover:text-white transition-all">Fix with AI</button>
             </div>
             <div className="bg-white p-8 rounded-[32px] border-2 border-transparent hover:border-purple-200 transition-all group">
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></div>
                <h4 className="font-bold text-black mb-1">Domain Status</h4>
                <p className="text-gray-400 text-sm font-medium mb-4">Adding a custom domain increases customer trust by up to 40%.</p>
                <button className="px-4 py-2 bg-gray-50 text-black text-xs font-bold rounded-lg hover:bg-black hover:text-white transition-all">Setup Guide</button>
             </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal Component */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-[540px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative border-2 border-white/20">
            
            {broadcastSuccess && (
              <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-500">
                <Confetti width={500} height={500} recycle={false} numberOfPieces={200} />
                <div className="text-center px-10">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-110 animate-bounce">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-3xl font-black text-black">Broadcast Active!</h2>
                  <p className="text-gray-500 font-bold mt-2 leading-relaxed">Your message is being distributed to your entire customer base right now.</p>
                </div>
              </div>
            )}

            <div className="p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-black tracking-tight">Broadcast Center</h2>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Connect with your audience</p>
                </div>
                <button 
                  onClick={() => setShowBroadcastModal(false)}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Message Protocol</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="E.g. '20% Off everything starting now! Tap to shop...'"
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-black focus:bg-white rounded-[24px] p-8 text-xl font-bold outline-none transition-all h-52 resize-none placeholder:text-gray-200"
                  />
                  <div className="flex justify-between mt-4 px-2">
                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{broadcastMessage.length} / 500 chars</span>
                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Targeting All Verified Customers</span>
                  </div>
                </div>

                <button
                  onClick={handleBroadcast}
                  disabled={isBroadcasting || !broadcastMessage.trim()}
                  className="w-full bg-black text-white py-6 rounded-[24px] text-xl font-bold hover:bg-gray-800 transition-all shadow-2xl disabled:opacity-50 hover:-translate-y-1 flex items-center justify-center gap-4 group h-[76px]"
                >
                  {isBroadcasting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                      Synchronizing...
                    </>
                  ) : (
                    <>
                      Initiate Broadcast
                      <svg className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
