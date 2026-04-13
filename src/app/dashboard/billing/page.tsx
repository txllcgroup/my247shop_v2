"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BillingService, BillingWallet, BillingAnalytics, BillingTransaction } from './billingService';
import { usePaystackPayment } from 'react-paystack-19';

// Reusable styling for the massive floating inputs
const FloatingInput = ({ label, type = "text", id, value = "", onChange, placeholder = "", prefix = "" }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value !== "");

  useEffect(() => {
    setHasValue(value !== "");
  }, [value]);

  return (
    <div className="relative group w-full">
      {prefix && (
        <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-semibold text-xl transition-colors duration-200 z-10 ${isFocused || hasValue ? 'text-black' : 'text-gray-400'}`}>
          {prefix}
        </span>
      )}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={isFocused && !prefix ? placeholder : ""}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value.length > 0);
        }}
        className={`w-full bg-white border-2 rounded-2xl ${prefix ? 'pl-10' : 'pl-5'} pr-5 pt-8 pb-4 text-xl font-semibold text-black outline-none transition-all duration-200 peer
          ${isFocused ? 'border-black' : 'border-gray-300 hover:border-gray-400'}`}
      />
      <label
        htmlFor={id}
        className={`absolute ${prefix ? 'left-10' : 'left-5'} transition-all duration-200 pointer-events-none font-semibold z-10
          ${isFocused || hasValue ? 'text-sm text-gray-500 top-2.5' : 'text-xl text-gray-400 top-1/2 -translate-y-1/2'}`}
      >
        {label}
      </label>
    </div>
  );
};

const AnalyticsCard = ({ title, value, subtext, icon, trend }: any) => (
  <div className="bg-white border-2 border-gray-100 rounded-[24px] p-6 hover:border-black transition-all duration-300 shadow-sm group">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-black group-hover:bg-gray-100 transition-colors">
        {icon}
      </div>
      {trend && (
        <span className={`text-[12px] font-bold px-2 py-1 rounded-lg ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-gray-500 font-semibold text-[13px] uppercase tracking-wider">{title}</h3>
      <div className="text-2xl font-bold text-black">{value}</div>
      {subtext && <p className="text-[12px] text-gray-400 font-medium">{subtext}</p>}
    </div>
  </div>
);

export default function BillingPage() {
  const [wallet, setWallet] = useState<BillingWallet | null>(null);
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundDescription, setFundDescription] = useState('Credit Purchase');
  const [currency, setCurrency] = useState('NGN');
  const [profile, setProfile] = useState<any>(null);
  const [isFunding, setIsFunding] = useState(false);

  const fetchData = async () => {
    try {
      const [walletRes, analyticsRes, transRes] = await Promise.all([
        BillingService.getWallet(),
        BillingService.getAnalytics(),
        BillingService.getTransactions(1, 10)
      ]);
      setWallet(walletRes);
      setAnalytics(analyticsRes);
      setTransactions(transRes.items);
    } catch (err) {
      console.error("Failed to fetch billing data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      const p = JSON.parse(storedProfile);
      setProfile(p);
      const country = localStorage.getItem('country');
      setCurrency(country === 'Nigeria' ? 'NGN' : 'USD');
    }
    fetchData();
  }, []);

  const handleFundSuccess = async (reference: string) => {
    setIsFunding(true);
    try {
      await BillingService.fund({
        amount: parseFloat(fundAmount),
        currency: currency,
        reference: reference,
        description: fundDescription
      });
      alert("Wallet funded successfully!");
      setShowFundModal(false);
      setFundAmount('');
      fetchData();
    } catch (err: any) {
      alert("Failed to record funding: " + err.message);
    } finally {
      setIsFunding(false);
    }
  };

  const paystackConfig = {
    reference: `BILL-${new Date().getTime()}`,
    email: profile?.email || 'user@example.com',
    amount: parseFloat(fundAmount) * 100, // Paystack uses kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePaystack = usePaystackPayment(paystackConfig);

  const handleStripeCheckout = async () => {
    setIsFunding(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            productName: `My247Shop Credits - ${fundDescription}`,
            unitPrice: parseFloat(fundAmount),
            quantity: 1
          }],
          currency: 'usd',
          successUrl: `${window.location.origin}/dashboard/billing?status=success&amount=${fundAmount}&desc=${fundDescription}`,
          cancelUrl: `${window.location.origin}/dashboard/billing?status=cancel`,
          customerEmail: profile?.email || "store@my247.com",
          metadata: { type: 'billing_fund', description: fundDescription }
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
      setIsFunding(false);
    }
  };

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (currency === 'NGN') {
      initializePaystack({
        onSuccess: (response: any) => handleFundSuccess(response.reference),
        onClose: () => console.log("Paystack closed")
      });
    } else {
      handleStripeCheckout();
    }
  };

  useEffect(() => {
    // Handle Stripe redirect success check
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      const amount = params.get('amount');
      const desc = params.get('desc');
      const ref = `STRIPE-${new Date().getTime()}`;
      if (amount && desc) {
        // Record the funding
        BillingService.fund({
          amount: parseFloat(amount),
          currency: 'USD',
          reference: ref,
          description: desc
        }).then(() => {
          alert("Wallet funded successfully!");
          window.history.replaceState(null, '', '/dashboard/billing');
          fetchData();
        });
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-black">Billing</h1>
            <p className="text-xl text-gray-500 font-medium">Manage your platform credits and billing usage.</p>
          </div>

          <div className="bg-black text-white rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col justify-between aspect-auto md:aspect-[2.5/1]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <span className="text-white/60 font-semibold text-lg uppercase tracking-widest mb-4 block">Available Credits</span>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl md:text-8xl font-bold tracking-tighter">
                  {wallet?.balanceCredits?.toLocaleString() || '0'}
                </span>
                <span className="text-2xl font-bold text-white/40">Credits</span>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap gap-4 mt-12 md:mt-0">
              <button
                onClick={() => setShowFundModal(true)}
                className="bg-white text-black px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1"
              >
                Fund Account
              </button>
              <div className="flex items-center gap-3 px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-lg font-bold">1 Credit = {currency} {currency === 'NGN' ? '1.00' : '0.01'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnalyticsCard 
            title="Total Funded" 
            value={`${currency} ${(wallet?.totalFundedAmount || 0).toLocaleString()}`} 
            subtext={`${wallet?.totalCreditsPurchased?.toLocaleString() || 0} Credits Purchased`}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}
          />
          <AnalyticsCard 
            title="Total Consumed" 
            value={`${analytics?.totalCreditsConsumed?.toLocaleString() || 0} Credits`} 
            subtext={`${analytics?.totalDebitTransactions || 0} Transactions`}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Consumed Today" 
          value={`${analytics?.creditsConsumedToday || 0}`} 
          trend={12}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <AnalyticsCard 
          title="Consumed This Week" 
          value={`${analytics?.creditsConsumedThisWeek || 0}`} 
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <AnalyticsCard 
          title="Consumed This Month" 
          value={`${analytics?.creditsConsumedThisMonth || 0}`} 
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <AnalyticsCard 
          title="Funding Volume" 
          value={`${currency} ${(analytics?.fundingVolumeByCurrency?.[currency] || 0).toLocaleString()}`} 
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Recent Transactions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black tracking-tight">Recent Billing Transactions</h2>
          <button className="text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">View All</button>
        </div>
        
        <div className="bg-white border-2 border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b-2 border-gray-100">
                <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Usage</th>
                <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${tx.type === 'Funding' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        {tx.type === 'Funding' ? (
                          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                        ) : (
                          <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                        )}
                      </div>
                      <div>
                        <span className="text-[17px] font-bold text-black block mb-0.5">{tx.description}</span>
                        <span className="text-[13px] font-medium text-gray-400 tracking-wider font-mono">{tx.reference}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[15px] font-bold text-gray-600 block mb-0.5">{new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-[13px] font-medium text-gray-400">{new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border-2 ${tx.status === 'Successful' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={`px-8 py-6 text-right text-xl font-bold ${tx.type === 'Funding' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'Funding' ? '+' : '-'}{tx.credits?.toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">No billing history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isFunding && setShowFundModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-xl p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-bold text-black tracking-tight mb-8">Fund Your Wallet</h2>
            
            <form onSubmit={handleFundSubmit} className="space-y-6">
              <FloatingInput 
                label="Amount" 
                id="fundAmount" 
                type="number" 
                prefix={currency === 'NGN' ? '₦' : '$'}
                value={fundAmount}
                onChange={(e: any) => setFundAmount(e.target.value)}
                placeholder="0.00"
              />
              
              <FloatingInput 
                label="Description" 
                id="fundDescription" 
                value={fundDescription}
                onChange={(e: any) => setFundDescription(e.target.value)}
                placeholder="e.g. Credit Purchase"
              />

              <div className="p-6 bg-gray-50 rounded-3xl border-2 border-gray-100">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="font-bold text-gray-500 uppercase tracking-widest text-[11px]">You will receive</span>
                  <span className="font-bold text-black text-xl">{fundAmount ? (parseFloat(fundAmount) * (currency === 'NGN' ? 1 : 100)).toLocaleString() : '0'} Credits</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                    Credits are used for platform features like AI image generation, AI assistant, and broadcasting messages to customers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFundModal(false)}
                  disabled={isFunding}
                  className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-2xl text-lg font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFunding || !fundAmount}
                  className="flex-1 bg-black text-white py-5 rounded-2xl text-lg font-bold shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isFunding ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${currency === 'NGN' ? '₦' : '$'}${parseFloat(fundAmount || '0').toLocaleString()}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
