"use client";
import React from 'react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b-2 border-gray-200 pb-6">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">Settings</h2>
        <p className="text-gray-500 font-medium text-base md:text-lg">Manage your store details, shipping, taxes, and permissions.</p>
      </div>
      
      <div className="space-y-6">
         {[
           { title: "Store Details", desc: "Update your store name, contact info, and currency." },
           { title: "Domains", desc: "Manage your custom URL so customers can find you." },
           { title: "Shipping & Delivery", desc: "Set up shipping rates and fulfillment locations." },
           { title: "Taxes", desc: "Manage how you collect taxes for your region." },
           { title: "Users & Permissions", desc: "Add staff members and set their dashboard access levels." },
           { title: "Billing & Plans", desc: "Manage your subscription, invoices, and payment methods." }
         ].map((setting, i) => (
           <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-black/40 transition-colors cursor-pointer group">
              <div>
                <h3 className="font-semibold text-lg text-black mb-1">{setting.title}</h3>
                <p className="text-gray-500 font-medium text-sm">{setting.desc}</p>
              </div>
              <svg className="w-6 h-6 text-gray-300 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
           </div>
         ))}
      </div>
    </div>
  );
}
