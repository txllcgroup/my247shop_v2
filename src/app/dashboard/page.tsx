"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
import { useWindowSize } from 'react-use';
import { usePaystackPayment } from 'react-paystack-19';
import { OrderService, Order, OrderSummary } from './orders/orderService';

const SummaryCard = ({ title, value }: any) => (
  <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 flex flex-col justify-center">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-500 font-semibold text-sm">{title}</h3>
    </div>
    <div className="flex items-end gap-3">
      <div className="text-3xl font-semibold tracking-tight text-black">{value}</div>
    </div>
  </div>
);

export default function DashboardHome() {
  const { width, height } = useWindowSize();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionStep, setSubscriptionStep] = useState<'choose' | 'pay-per-tx-success' | 'monthly-success'>('choose');

  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check subscription status
    const status = localStorage.getItem('subscription_status');
    const isSubscribed = status === 'monthly' || status === 'per-tx';

    // Show modal when user gets to the dashboard if not subscribed
    const timer = setTimeout(() => {
      if (!isSubscribed) {
        setShowSubscriptionModal(true);
      }
    }, 500);

    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    const fetchData = async () => {
      try {
        const storeId = localStorage.getItem('storeId') || '';
        if (!storeId) return;

        const [summaryRes, recentRes] = await Promise.all([
          OrderService.getOrderSummary(storeId),
          OrderService.getRecentOrders(storeId, 5)
        ]);

        if (summaryRes.success) setSummary(summaryRes.data);
        if (recentRes.success) setRecentOrders(recentRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => clearTimeout(timer);
  }, []);

  const paystackConfig = {
    reference: `SUB-${new Date().getTime()}`,
    email: profile?.email || "store@my247.com",
    amount: 2000 * 100, // 2000 NGN in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleMonthlySuccess = (reference: any) => {
    localStorage.setItem('subscription_status', 'monthly');
    setSubscriptionStep('monthly-success');
    setTimeout(() => setShowSubscriptionModal(false), 4000);
  };

  const handlePayPerTx = () => {
    localStorage.setItem('subscription_status', 'per-tx');
    setSubscriptionStep('pay-per-tx-success');
    setTimeout(() => setShowSubscriptionModal(false), 4000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-4 leading-tight">Welcome back, {profile?.fullName || 'Store Owner'}</h1>
          <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed">Here's a breakdown of what's happening with your store today, along with some AI-driven suggestions.</p>
        </div>

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <SummaryCard title="Total Revenue" value={summary ? `₦${(summary.totalRevenue || 0).toLocaleString()}` : "₦0.00"} />
        <SummaryCard title="Total Orders" value={summary?.totalOrders || 0} />
        <SummaryCard title="Pending Orders" value={summary?.pendingOrders || 0} />
        <SummaryCard title="Processing" value={summary?.processingOrders || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[480px]">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="font-semibold text-[15px] text-black tracking-tight">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-[13px] font-semibold text-gray-400 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md text-center">View all</Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Order</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Loading orders...</td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No orders found</td>
                  </tr>
                ) : recentOrders.map((order) => {
                  const statusColors: any = {
                    'Pending': 'text-amber-700 bg-amber-50 border-amber-200',
                    'Processing': 'text-blue-700 bg-blue-50 border-blue-200',
                    'Fulfilled': 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    'Cancelled': 'text-rose-700 bg-rose-50 border-rose-200',
                    'Returned': 'text-gray-700 bg-gray-50 border-gray-200'
                  };
                  return (
                    <tr key={order.id} onClick={() => window.location.href = `/dashboard/orders/${order.id}`} className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors last:border-0 cursor-pointer group">
                      <td className="px-6 py-4 font-semibold text-black group-hover:text-blue-600 transition-colors">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {order.placedAt ? new Date(order.placedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-medium text-black truncate max-w-[150px]">{order.customerEmail}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold border ${statusColors[order.status] || 'text-gray-600 bg-gray-100'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-black text-right">{order.currency} {(order.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Suggestions / To-Do */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden h-[480px]">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[15px] text-black tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              AI Next Steps
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">

            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-full bg-blue-50/50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:scale-105 transition-all">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-black text-[14px] mb-1">Set up custom domain</h4>
                <p className="text-[13px] font-medium text-gray-500 mb-2 leading-relaxed">Connect your own domain name to build trust and strengthen your brand.</p>
                <button className="text-[12px] font-semibold text-black border border-gray-200 rounded-[8px] px-3 py-1.5 hover:bg-gray-50 hover:border-black/20 transition-all shadow-sm">Connect domain</button>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-full bg-emerald-50/50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:scale-105 transition-all">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-black text-[14px] mb-1">Optimize product titles</h4>
                <p className="text-[13px] font-medium text-gray-500 mb-2 leading-relaxed">AI noticed 3 products with short titles. Longer titles improve search ranking.</p>
                <button className="text-[12px] font-semibold text-black border border-gray-200 rounded-[8px] px-3 py-1.5 hover:bg-gray-50 hover:border-black/20 transition-all shadow-sm">Fix with AI</button>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-full bg-purple-50/50 border border-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-50 group-hover:scale-105 transition-all">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-black text-[14px] mb-1">Create discount code</h4>
                <p className="text-[13px] font-medium text-gray-500 mb-2 leading-relaxed">Incentivize your first buyers by offering a small welcome discount.</p>
                <button className="text-[12px] font-semibold text-black border border-gray-200 rounded-[8px] px-3 py-1.5 hover:bg-gray-50 hover:border-black/20 transition-all shadow-sm">Create code</button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <>
          {(subscriptionStep === 'pay-per-tx-success' || subscriptionStep === 'monthly-success') && (
            <div className="fixed inset-0 z-[110] pointer-events-none">
              <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
            </div>
          )}
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-[420px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">

              {subscriptionStep === 'choose' && (
                <div className="p-8 pb-3 text-center animate-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-[24px] font-bold text-black tracking-tight mb-2">Choose Your Plan</h2>
                  <p className="text-gray-500 font-medium text-[15px] leading-relaxed mb-8">
                    Select a billing option to keep your store active and start accepting payments.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => initializePayment({ onSuccess: handleMonthlySuccess, onClose: () => { } })}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-black bg-black text-white hover:bg-gray-800 hover:border-gray-800 transition-all group"
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-bold text-[16px]">Monthly Subscription</span>
                        <span className="text-white/80 text-[13px] font-medium">Flat fee, full access</span>
                      </div>
                      <span className="font-bold text-[18px] group-hover:scale-105 transition-transform origin-right">₦2,000</span>
                    </button>

                    <button
                      onClick={handlePayPerTx}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200 bg-white text-black hover:border-black hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-bold text-[16px]">Pay per transaction</span>
                        <span className="text-gray-500 text-[13px] font-medium">No fixed monthly fees</span>
                      </div>
                      <span className="font-bold text-[18px] group-hover:scale-105 transition-transform origin-right">Select</span>
                    </button>
                  </div>
                </div>
              )}

              {(subscriptionStep === 'pay-per-tx-success' || subscriptionStep === 'monthly-success') && (
                <div className="p-8 pt-10 pb-10 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-[26px] font-bold text-black tracking-tight mb-3">Congratulations!</h2>
                  <p className="text-gray-500 font-medium text-[16px] leading-relaxed mb-6">
                    {subscriptionStep === 'pay-per-tx-success'
                      ? "You can now continue enjoying the platform and doing transactions seamlessly."
                      : "You have successfully subscribed to the monthly plan. Enjoy full access!"}
                  </p>
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="w-full py-3.5 rounded-xl bg-gray-100 text-black font-semibold text-[15px] hover:bg-gray-200 transition-colors"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              )}

              {subscriptionStep === 'choose' && (
                <div className="px-8 py-4 bg-gray-50 flex justify-center border-t border-gray-100 mt-5">
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="text-[14px] font-semibold text-gray-500 hover:text-black transition-colors py-1 px-3 rounded-lg hover:bg-gray-200/50"
                  >
                    I'll decide later
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
