"use client";
import React, { useState, useEffect } from 'react';
import { WalletService, Wallet, Transaction, BankAccount } from './walletService';

// Reusable styling for the massive floating inputs used in the aesthetic
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

const getCurrencySymbol = (currency?: string) => {
  if (currency === 'NGN') return '₦';
  if (currency === 'USD') return '$';
  if (currency === 'GBP') return '£';
  if (currency === 'EUR') return '€';
  return currency || '';
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [bankFormData, setBankFormData] = useState({ bankName: '', accountName: '', accountNumber: '' });
  const [page, setPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [currency, setCurrency] = useState('NGN');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const storeId = localStorage.getItem('storeId') || '';
      if (!storeId) throw new Error('Store ID not found');

      const country = localStorage.getItem('country');
      if (country) {
        setCurrency(country === 'Nigeria' ? 'NGN' : 'USD');
      }

      const [walletRes, transRes, banksRes] = await Promise.all([
        WalletService.getWallet(storeId),
        WalletService.getTransactions(storeId, page),
        WalletService.getBankAccounts(storeId)
      ]);

      if (walletRes.success) setWallet(walletRes.data);
      if (transRes.success) {
        if (page === 1) setTransactions(transRes.data.items);
        else setTransactions((prev: Transaction[]) => [...prev, ...transRes.data.items]);
        setTotalTransactions(transRes.data.totalCount);
      }
      if (Array.isArray(banksRes)) {
        setBankAccounts(banksRes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const storeId = localStorage.getItem('storeId') || '';
      if (editingBank) {
        const res = await WalletService.updateBankAccount({
          accountId: editingBank.id,
          ...bankFormData
        });
        if (res.success || (res as any) === 200) {
          setShowBankForm(false);
          setEditingBank(null);
          fetchData();
        }
      } else {
        const res = await WalletService.createBankAccount({
          storeId,
          ...bankFormData
        });
        if (res.success) {
          setShowBankForm(false);
          fetchData();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openBankForm = (bank?: BankAccount) => {
    if (bank) {
      setEditingBank(bank);
      setBankFormData({ bankName: bank.bankName, accountName: bank.accountName, accountNumber: bank.accountNumber });
    } else {
      setEditingBank(null);
      setBankFormData({ bankName: '', accountName: '', accountNumber: '' });
    }
    setShowBankForm(true);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto p-10">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Failed to load wallet</h2>
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

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-gray-200 pb-8 px-4 lg:px-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-4">Wallet</h1>
          <p className="text-xl text-gray-500 font-medium max-w-xl">Manage your store balance, payouts, and transactions.</p>
        </div>
        <div className="flex gap-4 flex-col sm:flex-row w-full md:w-auto mt-4 md:mt-0">
           <button 
             onClick={() => openBankForm()}
             className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-xl border-2 border-gray-200 text-base font-semibold hover:border-black transition-colors flex justify-center items-center gap-2 shadow-sm"
           >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Add Bank Account
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 lg:px-0">
         {/* Balance Card */}
         <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 lg:p-12 flex flex-col justify-between aspect-auto md:aspect-[4/3] relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
               <span className="text-lg font-semibold text-gray-500 mb-2 md:mb-4 block">Settled Balance</span>
               <div className="text-5xl md:text-7xl font-semibold tracking-tight text-black">
                 {currency} {wallet?.settledBalance?.toLocaleString() || '0.00'}
               </div>
               <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Pending: {currency} {wallet?.pendingBalance?.toLocaleString() || '0.00'}
               </div>
            </div>
            
            <div className="relative z-10 mt-12 md:mt-0">
               {!isWithdrawing ? (
                  <button 
                     onClick={() => setIsWithdrawing(true)}
                     disabled={!wallet?.settledBalance}
                     className={`w-full bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg flex justify-center items-center gap-2 ${!wallet?.settledBalance ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                     Request Payout
                  </button>
               ) : (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                     <FloatingInput 
                       label="Withdrawal Amount" 
                       type="number" 
                       id="amount" 
                       prefix={getCurrencySymbol(currency)} 
                       placeholder="0.00" 
                     />
                     <div className="flex gap-3">
                        <button 
                           onClick={() => setIsWithdrawing(false)}
                           className="bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                           Cancel
                        </button>
                        <button className="flex-1 bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg">
                           Confirm Withdraw
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Right Side Stats / Summary  */}
         <div className="flex flex-col gap-8">
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 flex-1 shadow-sm">
               <h3 className="font-semibold text-xl text-black mb-6">Payout Accounts</h3>
               <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {bankAccounts.length > 0 ? bankAccounts.map((bank: BankAccount) => (
                    <div 
                      key={bank.id} 
                      onClick={() => openBankForm(bank)}
                      className="border-2 border-gray-200 rounded-2xl p-6 flex items-center justify-between bg-white hover:border-black transition-colors cursor-pointer group"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                             <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          </div>
                          <div>
                            <span className="text-black text-lg font-semibold block">{bank.bankName}</span>
                            <span className="text-gray-500 font-medium tracking-widest mt-1 block">•••• {bank.accountNumber.slice(-4)}</span>
                          </div>
                       </div>
                       {bank.isDefault && <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-emerald-200">Default</span>}
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400 font-medium italic">No bank accounts added yet.</div>
                  )}
                  <div 
                    onClick={() => openBankForm()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center justify-center bg-gray-50 hover:bg-white hover:border-black transition-colors cursor-pointer text-gray-500 font-semibold group"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center group-hover:border-black transition-colors shrink-0">
                           <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-lg">Add Bank Account</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-gray-50 rounded-3xl border-2 border-gray-200 p-8 flex items-center justify-between shadow-sm">
                <div>
                   <span className="text-lg font-semibold text-gray-500 block mb-1">Total Earnings</span>
                   <span className="text-2xl font-semibold text-black">Net Lifetime</span>
                </div>
                <div className="bg-white px-5 py-3 rounded-xl border-2 border-gray-200 shadow-sm">
                   <span className="text-xl font-bold text-black">{currency} {wallet?.totalEarnings?.toLocaleString() || '0.00'}</span>
                </div>
            </div>
         </div>
      </div>
      
      {/* Transactions List */}
      <div className="px-4 lg:px-0">
         <h2 className="text-2xl font-semibold text-black mb-6">Recent Transactions</h2>
         <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[800px]">
               <thead className="bg-gray-50/50">
                  <tr>
                     <th className="px-6 py-5 text-sm font-semibold text-gray-500 border-b-2 border-gray-200">Transaction</th>
                     <th className="px-6 py-5 text-sm font-semibold text-gray-500 border-b-2 border-gray-200">Date</th>
                     <th className="px-6 py-5 text-sm font-semibold text-gray-500 border-b-2 border-gray-200">Status</th>
                     <th className="px-6 py-5 text-sm font-semibold text-gray-500 border-b-2 border-gray-200 text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y-2 divide-gray-100">
                  {transactions.map((tx) => (
                     <tr key={tx.id} className="hover:bg-gray-50 transition-colors group border-b-2 border-gray-100 last:border-0 relative cursor-pointer">
                     <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${tx.type === 'Credit' ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-200'}`}>
                              {tx.type === 'Credit' ? (
                                 <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                              ) : (
                                 <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                              )}
                           </div>
                           <div className="min-w-0">
                              <span className="font-semibold text-black text-lg block truncate group-hover:underline underline-offset-4">{tx.description || tx.category}</span>
                              <span className="text-gray-500 font-medium text-sm">{tx.reference}</span>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-5 text-gray-500 font-semibold text-base whitespace-nowrap">
                       {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </td>
                     <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border-2 inline-flex items-center gap-1.5 whitespace-nowrap ${
                           tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                           tx.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                           'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                           {tx.status}
                        </span>
                     </td>
                     <td className={`px-6 py-5 text-right font-bold text-xl whitespace-nowrap ${tx.type === 'Credit' ? 'text-black' : 'text-gray-500'}`}>
                        {tx.type === 'Credit' ? '+' : '-'}{currency} {tx.amount.toLocaleString()}
                     </td>
                     </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-bold italic">No transactions found</td>
                    </tr>
                  )}
               </tbody>
               </table>
            </div>
            {transactions.length < totalTransactions && (
              <div className="p-4 border-t-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                 <button 
                   onClick={() => setPage(prev => prev + 1)}
                   disabled={loading}
                   className="text-gray-600 font-semibold hover:text-black transition-colors px-4 py-2 hover:bg-white rounded-xl flex items-center gap-2"
                 >
                    {loading && <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>}
                    Load more transactions
                 </button>
              </div>
            )}
         </div>
      </div>

      {/* Bank Account Modal */}
      {showBankForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBankForm(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 md:p-12 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-semibold text-black mb-8">{editingBank ? 'Edit Bank Account' : 'Add Bank Account'}</h2>
            <form onSubmit={handleBankSubmit} className="space-y-6">
              <FloatingInput 
                label="Bank Name" 
                id="bankName" 
                value={bankFormData.bankName} 
                onChange={(e: any) => setBankFormData({ ...bankFormData, bankName: e.target.value })} 
                placeholder="e.g. Guaranty Trust Bank"
              />
              <FloatingInput 
                label="Account Name" 
                id="accountName" 
                value={bankFormData.accountName} 
                onChange={(e: any) => setBankFormData({ ...bankFormData, accountName: e.target.value })} 
                placeholder="e.g. John Doe Store"
              />
              <FloatingInput 
                label="Account Number" 
                id="accountNumber" 
                value={bankFormData.accountNumber} 
                onChange={(e: any) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })} 
                placeholder="0123456789"
              />
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowBankForm(false)}
                  className="flex-1 bg-gray-100 text-gray-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  {actionLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {editingBank ? 'Update' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
