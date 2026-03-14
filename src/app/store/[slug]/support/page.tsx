"use client";
import React, { useState } from 'react';

const FloatingInput = ({ label, type = "text", id, defaultValue = "", placeholder = "", className = "" }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(defaultValue !== "");

  return (
    <div className={`relative group w-full ${className}`}>
      {type === "textarea" ? (
         <textarea
            id={id}
            defaultValue={defaultValue}
            placeholder={isFocused ? placeholder : ""}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
               setIsFocused(false);
               setHasValue(e.target.value.length > 0);
            }}
            className={`w-full bg-white border-2 rounded-2xl px-5 pt-8 pb-4 h-32 text-xl font-semibold text-black outline-none transition-all duration-200 peer resize-none
            ${isFocused ? 'border-black' : 'border-gray-300 hover:border-gray-400'}`}
         />
      ) : (
         <input
            type={type}
            id={id}
            defaultValue={defaultValue}
            placeholder={isFocused ? placeholder : ""}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
               setIsFocused(false);
               setHasValue(e.target.value.length > 0);
            }}
            className={`w-full bg-white border-2 rounded-2xl px-5 pt-8 pb-4 text-xl font-semibold text-black outline-none transition-all duration-200 peer
            ${isFocused ? 'border-black' : 'border-gray-300 hover:border-gray-400'}`}
         />
      )}
      
      <label
        htmlFor={id}
        className={`absolute left-5 transition-all duration-200 pointer-events-none font-semibold z-10
          ${isFocused || hasValue ? 'text-sm text-gray-500 top-2.5' : 'text-xl text-gray-400 top-1/2 -translate-y-1/2'}`}
      >
        {label}
      </label>
    </div>
  );
};

export default function SupportPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
     {
        q: "What is your return policy?",
        a: "We accept returns within 30 days of delivery for a full refund. Items must be in their original condition with tags attached. Final sale items cannot be returned."
     },
     {
        q: "How long does shipping take?",
        a: "Standard shipping takes 3-5 business days within the continental US. Expedited 2-day shipping is available at checkout for an additional fee."
     },
     {
        q: "Do you ship internationally?",
        a: "Currently, we only ship within the United States, Canada, and the United Kingdom. We are looking to expand our shipping zones early next year."
     },
     {
        q: "How can I track my order?",
        a: "Once your order ships, you will receive a confirmation email with a tracking link. You can also view your live order status by logging into your account and navigating to the Orders page."
     }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16 animate-in fade-in duration-500">
      
      <div className="max-w-3xl mx-auto text-center mb-16">
         <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-6">How can we help?</h1>
         <p className="text-xl text-gray-500 font-medium">Search our FAQs below or send us a message. We typically respond within 24 hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
         
         {/* FAQ Section */}
         <div>
            <h2 className="text-3xl font-bold text-black mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
               {faqs.map((faq, i) => (
                  <div 
                     key={i} 
                     onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                     className={`bg-white border-2 rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 ${activeFaq === i ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                     <div className="flex justify-between items-center text-lg md:text-xl font-bold text-black gap-4">
                        {faq.q}
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${activeFaq === i ? 'bg-black border-black text-white' : 'border-gray-200 text-black'}`}>
                           {activeFaq === i ? '−' : '+'}
                        </div>
                     </div>
                     {activeFaq === i && (
                        <div className="mt-4 text-lg text-gray-500 font-medium leading-relaxed animate-in slide-in-from-top-2 duration-300 pr-8">
                           {faq.a}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>

         {/* Contact Form Section */}
         <div>
            <div className="bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-8 md:p-10 sticky top-32">
               <h2 className="text-3xl font-bold text-black mb-4">Contact Us</h2>
               <p className="text-lg text-gray-500 font-medium mb-8">Fill out the form below and our support team will get back to you.</p>
               
               <div className="space-y-4 mb-8">
                  <FloatingInput label="Your Name" />
                  <FloatingInput label="Email Address" type="email" />
                  <FloatingInput label="Order Number (Optional)" />
                  <FloatingInput label="How can we help you?" type="textarea" />
               </div>
               
               <button className="w-full bg-black text-white px-8 py-5 rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">
                     Send Message
                     <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </span>
               </button>
            </div>
         </div>

      </div>
    </div>
  );
}
