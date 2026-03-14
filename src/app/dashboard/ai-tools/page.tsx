"use client";
import React, { useState } from 'react';

export default function AIToolsPage() {
  const [features, setFeatures] = useState([
    { id: 'desc', title: "Product Description Generator", desc: "Instantly write SEO-friendly copy for your items based on uploaded images.", enabled: true },
    { id: 'price', title: "Smart Pricing Suggestions", desc: "Optimize your margins based on real-time market data and competitor analysis.", enabled: false },
    { id: 'email', title: "Marketing Email Writer", desc: "Generate high-converting email campaigns and abandoned cart flows.", enabled: true },
    { id: 'tag', title: "Automated Tagging", desc: "Automatically categorize and generate tags for uploaded products.", enabled: true },
    { id: 'theme', title: "Store Theme AI", desc: "Redesign your entire storefront layout with a simple text prompt.", enabled: false },
    { id: 'forecast', title: "Sales Forecasting", desc: "Predict future inventory needs based on historical trends and seasonality.", enabled: false }
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-4">AI Features</h1>
          <p className="text-xl text-gray-500 font-medium max-w-xl">Configure which My247Shop AI capabilities are active on your store.</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 border-2 border-gray-200 px-6 py-4 rounded-2xl w-full sm:w-auto shadow-sm">
           <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shrink-0">
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
           </div>
           <div>
              <span className="block text-sm font-bold text-gray-500 uppercase tracking-widest">Plan</span>
              <span className="block text-xl font-bold text-black">Pro AI Tier</span>
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
         {features.map((tool) => (
           <div key={tool.id} className="bg-white p-8 border-2 border-gray-200 rounded-3xl hover:border-black transition-all cursor-pointer flex flex-col group shadow-sm" onClick={() => toggleFeature(tool.id)}>
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-colors ${tool.enabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400 group-hover:bg-gray-100 group-hover:text-black'}`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                 </div>
                 
                 {/* Chunky Toggle Switch */}
                 <div className="relative w-16 h-8 rounded-full border-2 border-gray-200 bg-gray-100 transition-colors cursor-pointer" style={{ backgroundColor: tool.enabled ? '#000' : '#f3f4f6', borderColor: tool.enabled ? '#000' : '#e5e7eb' }}>
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm flex items-center justify-center ${tool.enabled ? 'translate-x-[32px]' : 'translate-x-0'}`}>
                       {tool.enabled && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
                    </div>
                 </div>
              </div>
              
              <h3 className="font-semibold text-2xl text-black mb-3">{tool.title}</h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed">{tool.desc}</p>
              
              <div className="mt-8 pt-6 border-t-2 border-gray-100 flex items-center justify-between">
                 <span className={`font-semibold text-base ${tool.enabled ? 'text-emerald-600' : 'text-gray-400 group-hover:text-black transition-colors'}`}>
                    {tool.enabled ? 'Active' : 'Inactive'}
                 </span>
                 {tool.enabled && (
                    <button className="text-black font-semibold text-base hover:underline flex flex-row items-center gap-1">
                       Configure <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                 )}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
