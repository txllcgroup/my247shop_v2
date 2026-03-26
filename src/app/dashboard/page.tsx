"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
import { useWindowSize } from 'react-use';
import { usePaystackPayment } from 'react-paystack-19';
import { OrderService, Order, OrderSummary } from './orders/orderService';
import { CustomerService } from './customers/customerService';

const subscriptionPlans = [
  {
    id: 'starter',
    plan_name: "Starter",
    description: "Perfect for small businesses just getting started online.",
    price: { monthly: 3000, annually: 24000 },
    priceUsd: { monthly: 2, annually: 16 },
    features: { max_orders: 10, max_products: 10, ai_assistant: false, broadcast_message: false, image_generation: false, free_transaction_processing: false, support: "basic" }
  },
  {
    id: 'growth',
    plan_name: "Growth",
    description: "Best for growing businesses that need more flexibility and marketing tools.",
    price: { monthly: 4000, annually: 35000 },
    priceUsd: { monthly: 3, annually: 24 },
    features: { max_orders: "unlimited", max_products: "unlimited", ai_assistant: true, broadcast_message: true, image_generation: false, free_transaction_processing: false, support: "standard" },
    isPopular: true
  },
  {
    id: 'pro',
    plan_name: "Pro",
    description: "For serious sellers who want the full power of My247Shop.",
    price: { monthly: 6000, annually: 50000 },
    priceUsd: { monthly: 4, annually: 34 },
    features: { max_orders: "unlimited", max_products: "unlimited", ai_assistant: true, broadcast_message: true, image_generation: true, free_transaction_processing: true, support: "priority" }
  }
];

const PlanPayButton = ({ plan, billing, profile, currency, onSuccess }: any) => {
  const isNgn = currency === 'NGN';
  const amount = isNgn ? plan.price[billing] * 100 : plan.priceUsd[billing] * 100;
  
  const config = {
    reference: `SUB-${plan.plan_name.charAt(0)}-${new Date().getTime()}`,
    email: profile?.email || "store@my247.com",
    amount: isNgn ? amount : 0,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };
  const initializePayment = usePaystackPayment(config);
  
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            productName: `My247Shop ${plan.plan_name} Plan (${billing})`,
            unitPrice: plan.priceUsd[billing],
            quantity: 1
          }],
          currency: 'usd',
          successUrl: `${window.location.origin}/dashboard?subscription=success&plan=${billing === 'annually' ? 'annual' : 'monthly'}`,
          cancelUrl: `${window.location.origin}/dashboard?subscription=cancel`,
          customerEmail: profile?.email || "store@my247.com",
          metadata: { planId: plan.id, billingInterval: billing }
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = () => {
    if (isNgn) {
      initializePayment({ onSuccess, onClose: () => {} });
    } else {
      handleStripeCheckout();
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={isLoading}
      className={`w-full py-4 rounded-xl font-bold transition-all text-[15px] mt-8 shadow-sm ${plan.isPopular ? 'bg-black text-white hover:bg-gray-800 hover:-translate-y-1 hover:shadow-lg' : 'bg-gray-100 text-black hover:bg-gray-200'} ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
    >
      {isLoading ? 'Processing...' : `Subscribe to ${plan.plan_name}`}
    </button>
  );
};

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

const getCurrencySymbol = (currency?: string) => {
  if (currency === 'NGN') return '₦';
  if (currency === 'USD') return '$';
  if (currency === 'GBP') return '£';
  if (currency === 'EUR') return '€';
  return currency || '';
};

export default function DashboardHome() {
  const { width, height } = useWindowSize();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionStep, setSubscriptionStep] = useState<'choose' | 'pay-per-tx-success' | 'success'>('choose');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly');
  const [paymentCurrency, setPaymentCurrency] = useState<'NGN' | 'USD'>('NGN');
  
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('NGN');

  useEffect(() => {
    // Handle Stripe redirect success
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      const plan = params.get('plan') || 'monthly';
      localStorage.setItem('subscription_status', plan);
      setSubscriptionStep('success');
      setShowSubscriptionModal(true);
      window.history.replaceState(null, '', '/dashboard');
      return;
    }

    // Check subscription status
    const status = localStorage.getItem('subscription_status');
    const isSubscribed = status === 'monthly' || status === 'annual' || status === 'per-tx';

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
    
    const storedCountry = localStorage.getItem('country');
    if (storedCountry) {
      setCurrency(storedCountry === 'Nigeria' ? 'NGN' : 'USD');
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

  const handlePlanSuccess = (reference: any) => {
    localStorage.setItem('subscription_status', billingInterval === 'annually' ? 'annual' : 'monthly');
    setSubscriptionStep('success');
    setTimeout(() => setShowSubscriptionModal(false), 4000);
  };

  const handlePayPerTx = () => {
    localStorage.setItem('subscription_status', 'per-tx');
    setSubscriptionStep('pay-per-tx-success');
    setTimeout(() => setShowSubscriptionModal(false), 4000);
  };

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

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-4 leading-tight">Welcome back, {profile?.fullName || 'Store Owner'}</h1>
          <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed">Here's a breakdown of what's happening with your store today, along with some AI-driven suggestions.</p>
        </div>

        <button 
          onClick={() => setShowBroadcastModal(true)}
          className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2 group whitespace-nowrap"
        >
          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          Broadcast Message
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <SummaryCard title="Total Revenue" value={summary ? `${getCurrencySymbol(currency)}${(summary.totalRevenue || 0).toLocaleString()}` : `${getCurrencySymbol(currency)}0.00`} />
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
          {(subscriptionStep === 'pay-per-tx-success' || subscriptionStep === 'success') && (
            <div className="fixed inset-0 z-[110] pointer-events-none">
              <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
            </div>
          )}
          <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className={`bg-white rounded-[32px] w-full ${subscriptionStep === 'choose' ? 'max-w-[1000px]' : 'max-w-[420px]'} overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative my-4`}>

                {subscriptionStep === 'choose' && (
                  <div className="p-8 md:p-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                      <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-4">Choose Your Plan</h2>
                      <p className="text-gray-500 font-medium text-[16px] leading-relaxed mb-8">
                        Select the best plan for your business to unlock premium features and increase your sales.
                      </p>
                      
                      {/* Currency & Billing Controllers */}
                      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-4">
                        {/* Currency Toggle */}
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                          <button 
                            onClick={() => setPaymentCurrency('NGN')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[15px] font-bold transition-all ${paymentCurrency === 'NGN' ? 'bg-white text-black shadow-md ring-1 ring-gray-200 scale-[1.02]' : 'text-gray-400 hover:text-black hover:bg-white/50'}`}
                          >
                            <span className="text-xl leading-none">🇳🇬</span> NGN
                          </button>
                          <button 
                            onClick={() => setPaymentCurrency('USD')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[15px] font-bold transition-all ${paymentCurrency === 'USD' ? 'bg-white text-black shadow-md ring-1 ring-gray-200 scale-[1.02]' : 'text-gray-400 hover:text-black hover:bg-white/50'}`}
                          >
                            <span className="text-xl leading-none">🇺🇸</span> USD
                          </button>
                        </div>

                        <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

                        {/* Billing Toggle */}
                        <div className="flex items-center gap-2 bg-emerald-50/50 p-1.5 rounded-2xl border border-emerald-100/50 shadow-inner">
                          <button 
                            onClick={() => setBillingInterval('monthly')}
                            className={`px-6 py-2.5 rounded-xl text-[15px] font-bold transition-all ${billingInterval === 'monthly' ? 'bg-white text-gray-900 shadow-md ring-1 ring-emerald-100 scale-[1.02]' : 'text-emerald-700/60 hover:text-emerald-800 hover:bg-white/50'}`}
                          >
                            Monthly
                          </button>
                          <button 
                            onClick={() => setBillingInterval('annually')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[15px] font-bold transition-all ${billingInterval === 'annually' ? 'bg-white text-gray-900 shadow-md ring-1 ring-emerald-100 scale-[1.02]' : 'text-emerald-700/60 hover:text-emerald-800 hover:bg-white/50'}`}
                          >
                            Annually
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tracking-wide uppercase ${billingInterval === 'annually' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-100 text-emerald-700'}`}>Save 20%</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {subscriptionPlans.map((plan: any) => (
                        <div key={plan.id} className={`relative flex flex-col p-6 lg:p-8 rounded-[24px] border-2 transition-all ${plan.isPopular ? 'border-black bg-white shadow-xl scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                          {plan.isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase">
                              Most Popular
                            </div>
                          )}
                          
                          <div className="mb-6">
                            <h3 className="text-[22px] font-bold text-black mb-2">{plan.plan_name}</h3>
                            <p className="text-[14px] text-gray-500 font-medium min-h-[42px]">{plan.description}</p>
                          </div>
                          
                          <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[40px] font-bold tracking-tight text-black leading-none">
                                {paymentCurrency === 'NGN' ? '₦' : '$'}
                                {paymentCurrency === 'NGN' ? plan.price[billingInterval].toLocaleString() : plan.priceUsd[billingInterval]}
                              </span>
                              <span className="text-gray-500 font-medium text-sm">/{billingInterval === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            {billingInterval === 'annually' && (
                              <div className="mt-2 text-[13px] font-medium text-emerald-600">
                                Billed annually ({paymentCurrency === 'NGN' ? '₦' : '$'}
                                {paymentCurrency === 'NGN' ? plan.price.annually.toLocaleString() : plan.priceUsd.annually}/year)
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 flex-1">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              <span className="text-[14.5px] font-medium text-gray-700">{plan.features.max_orders === 'unlimited' ? 'Unlimited' : plan.features.max_orders} orders</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              <span className="text-[14.5px] font-medium text-gray-700">{plan.features.max_products === 'unlimited' ? 'Unlimited' : plan.features.max_products} products</span>
                            </div>
                            
                            <div className={`flex items-start gap-3 ${plan.features.ai_assistant ? '' : 'opacity-40 grayscale'}`}>
                              {plan.features.ai_assistant ? (
                                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              )}
                              <span className="text-[14.5px] font-medium text-gray-700">AI Assistant</span>
                            </div>

                            <div className={`flex items-start gap-3 ${plan.features.broadcast_message ? '' : 'opacity-40 grayscale'}`}>
                              {plan.features.broadcast_message ? (
                                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              )}
                              <span className="text-[14.5px] font-medium text-gray-700">Broadcast Messages</span>
                            </div>
                            
                            <div className={`flex items-start gap-3 ${plan.features.free_transaction_processing ? '' : 'opacity-40 grayscale'}`}>
                              {plan.features.free_transaction_processing ? (
                                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              )}
                              <span className="text-[14.5px] font-medium text-gray-700">Free transaction processing</span>
                            </div>

                            <div className={`flex items-start gap-3 ${plan.features.image_generation ? '' : 'opacity-40 grayscale'}`}>
                              {plan.features.image_generation ? (
                                <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              )}
                              <span className="text-[14.5px] font-medium text-gray-700">AI Image Generation</span>
                            </div>

                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              <span className="text-[14.5px] font-medium text-gray-700 tracking-wide capitalize">{plan.features.support} Support</span>
                            </div>
                          </div>

                          <PlanPayButton plan={plan} billing={billingInterval} profile={profile} currency={paymentCurrency} onSuccess={handlePlanSuccess} />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/80 -mx-8 md:-mx-10 -mb-8 md:-mb-10 p-8 md:px-10 md:py-8 rounded-b-[32px]">
                      <div className="text-center md:text-left">
                        <h4 className="text-[17px] font-bold text-black">Not ready for a subscription?</h4>
                        <p className="text-[14px] text-gray-500 font-medium mt-1">Start completely free. We only charge 2% when you make a sale.</p>
                      </div>
                      <button
                        onClick={handlePayPerTx}
                        className="text-[15px] font-bold text-gray-700 hover:text-black transition-all border-2 border-gray-200 px-8 py-3.5 rounded-xl hover:bg-white hover:border-gray-300 shadow-sm whitespace-nowrap bg-gray-100/50"
                      >
                        Skip & Pay-Per-Sale
                      </button>
                    </div>
                  </div>
                )}

                {(subscriptionStep === 'pay-per-tx-success' || subscriptionStep === 'success') && (
                  <div className="p-8 pt-12 pb-12 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-[32px] font-bold text-black tracking-tight mb-4">Congratulations!</h2>
                    <p className="text-gray-500 font-medium text-[16px] leading-relaxed mb-8 max-w-sm mx-auto">
                      {subscriptionStep === 'pay-per-tx-success'
                        ? "You can now continue enjoying the platform and doing transactions seamlessly."
                        : "You have successfully updated your subscription. Enjoy full access to premium features!"}
                    </p>
                    <button
                      onClick={() => setShowSubscriptionModal(false)}
                      className="w-full max-w-xs mx-auto block py-4 rounded-xl bg-black text-white font-bold text-[16px] hover:bg-gray-800 hover:-translate-y-1 transition-all shadow-xl"
                    >
                      Continue to Dashboard
                    </button>
                  </div>
                )}

                {subscriptionStep === 'choose' && (
                  <div className="absolute top-6 right-6 z-10">
                    <button
                      onClick={() => setShowSubscriptionModal(false)}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-black transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-[500px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
            
            {broadcastSuccess && (
              <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-500">
                <Confetti width={500} height={500} recycle={false} numberOfPieces={200} />
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 scale-110 animate-bounce">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black">Message Sent!</h2>
                  <p className="text-gray-500 font-medium mt-2">Your broadcast is on its way to customers.</p>
                </div>
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-black tracking-tight">Broadcast Message</h2>
                  <p className="text-gray-500 font-medium text-sm mt-1">Send a notification to all your customers.</p>
                </div>
                <button 
                  onClick={() => setShowBroadcastModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Message Content</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Type your message here... e.g. 'New collection just dropped! Check it out now.'"
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-black focus:bg-white rounded-2xl p-5 text-lg font-medium outline-none transition-all h-40 resize-none placeholder:text-gray-300"
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{broadcastMessage.length} characters</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sent to all customers</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleBroadcast}
                    disabled={isBroadcasting || !broadcastMessage.trim()}
                    className="w-full bg-black text-white py-5 rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50 disabled:translate-y-0 hover:-translate-y-1 flex items-center justify-center gap-3 group"
                  >
                    {isBroadcasting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Broadcast
                        <svg className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
