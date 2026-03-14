"use client";
import React from 'react';

export default function PaymentsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">Payments</h2>
          <p className="text-gray-500 font-medium text-base md:text-lg">Configure payment gateways and manage checkout options.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
        <h3 className="font-semibold text-lg text-black mb-6">Active Payment Methods</h3>
        
        <div className="space-y-4">
           {['Stripe', 'Paystack', 'PayPal'].map((provider, i) => (
             <div key={i} className="flex items-center justify-between p-6 border-2 border-gray-100 rounded-2xl">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                     <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">{provider}</h4>
                    <span className="text-sm font-medium text-gray-500">Not connected</span>
                  </div>
               </div>
               <button className="bg-gray-100 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">Connect</button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
