"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { StorefrontService } from '../storefrontService';

export default function OrdersPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    setIsLoggedIn(true);
    const fetchOrders = async () => {
      try {
        const data = await StorefrontService.getCustomerOrders(customerId);
        setOrders(data.orders || []);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const triggerLogin = () => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading your orders...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h1 className="text-4xl font-black text-black mb-4">Sign in to see your orders</h1>
        <p className="text-xl text-gray-500 mb-10 max-w-md mx-auto">Track your purchases and view order history by signing in to your account.</p>
        <button onClick={triggerLogin} className="bg-black text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all shadow-xl">
           Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16 animate-in fade-in duration-700 text-black">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
         <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-4">My Orders</h1>
            <p className="text-xl text-gray-500 font-medium tracking-tight">Track, manage and view your previous purchases.</p>
         </div>
         <div className="flex gap-4">
            <Link href={`/store/${slug}/shop`} className="bg-white border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold hover:border-black transition-all">
               Continue Shopping
            </Link>
         </div>
      </div>

      {error ? (
         <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[2rem] text-red-600 font-bold text-center">
            {error}
         </div>
      ) : orders.length === 0 ? (
         <div className="py-24 bg-gray-50 border-2 border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
               <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">No orders yet</h2>
            <p className="text-gray-500 max-w-sm mb-10 text-lg">Looks like you haven't placed any orders yet. Start shopping to see your history here!</p>
            <Link href={`/store/${slug}/shop`} className="bg-black text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all shadow-xl">
               Browse Products
            </Link>
         </div>
      ) : (
         <div className="space-y-8">
            {orders.map((order) => (
               <div key={order.id} className="bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden hover:border-black transition-all group shadow-sm hover:shadow-xl">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-8 py-6 border-b-2 border-gray-100 flex flex-wrap items-center justify-between gap-6">
                     <div className="flex flex-wrap items-center gap-10">
                        <div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Placed</p>
                           <p className="font-bold text-black">{new Date(order.placedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                           <p className="font-bold text-black">{order.currency} {order.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                           <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter border-2 ${
                              order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              order.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                           }`}>
                              {order.status}
                           </span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order #</p>
                        <p className="font-bold text-black font-mono">{order.orderNumber}</p>
                     </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-8">
                     <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-6">
                           {order.items.slice(0, 2).map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-6">
                                 <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-gray-100 overflow-hidden flex-shrink-0">
                                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="text-lg font-bold text-black group-hover:text-black transition-colors">{item.productName}</h4>
                                    <p className="text-gray-500 font-bold hidden sm:block">Quantity: {item.quantity} × {order.currency} {item.unitPrice.toLocaleString()}</p>
                                    <p className="text-gray-500 font-bold sm:hidden">{item.quantity} Item(s)</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="font-bold text-black">{order.currency} {item.totalPrice.toLocaleString()}</p>
                                 </div>
                              </div>
                           ))}
                           {order.items.length > 2 && (
                              <p className="text-gray-400 font-bold text-sm">+ {order.items.length - 2} more item(s)</p>
                           )}
                        </div>
                        <div className="md:w-64 flex flex-col justify-center gap-4 pt-4 md:pt-0">
                           <button onClick={() => setSelectedOrder(order)} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20">
                              View Order Details
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setSelectedOrder(null)} 
               className="absolute inset-0 bg-black/40 backdrop-blur-md" 
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 30 }} 
               className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
               {/* Modal Header */}
               <div className="px-8 py-10 md:px-12 border-b-2 border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                     <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Order Details</p>
                     <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter">#{selectedOrder.orderNumber}</h2>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-gray-200 rounded-2xl transition-colors">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>

               {/* Modal Content */}
               <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                     {/* Left Column: Items */}
                     <div className="lg:col-span-8 space-y-8">
                        <section>
                           <h3 className="text-2xl font-black text-black mb-8 flex items-center gap-3">
                              Order Items
                              <span className="text-sm font-bold bg-black text-white px-2 py-0.5 rounded-lg">{selectedOrder.items.length}</span>
                           </h3>
                           <div className="space-y-6">
                              {selectedOrder.items.map((item: any, idx: number) => (
                                 <div key={idx} className="flex gap-6 p-4 rounded-3xl border-2 border-transparent hover:border-gray-100 transition-all hover:bg-gray-50/50">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-50 border-2 border-gray-100 overflow-hidden flex-shrink-0">
                                       <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                       <h4 className="text-xl md:text-2xl font-black text-black mb-1">{item.productName}</h4>
                                       <p className="text-gray-400 font-bold text-lg mb-2">
                                          {item.quantity} × {selectedOrder.currency} {item.unitPrice.toLocaleString()}
                                       </p>
                                       <div className="flex md:hidden">
                                          <p className="font-black text-black text-xl">{selectedOrder.currency} {item.totalPrice.toLocaleString()}</p>
                                       </div>
                                    </div>
                                    <div className="hidden md:flex flex-col justify-center text-right">
                                       <p className="font-black text-black text-2xl tracking-tighter">{selectedOrder.currency} {item.totalPrice.toLocaleString()}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </section>
                     </div>

                     {/* Right Column: Address & Summaries */}
                     <div className="lg:col-span-4 space-y-10">
                        <section className="bg-gray-50 rounded-[2.5rem] p-8 border-2 border-gray-100">
                           <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                              Shipping Address
                           </h3>
                           <div className="text-gray-500 font-bold space-y-1 text-lg">
                              <p className="text-black">{selectedOrder.shippingAddress.addressLine1}</p>
                              {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                              <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                              <p>{selectedOrder.shippingAddress.country}, {selectedOrder.shippingAddress.postalCode}</p>
                           </div>
                        </section>

                        <section className="bg-black text-white rounded-[2.5rem] p-8 shadow-xl shadow-black/10">
                           <h3 className="text-xl font-black mb-6">Order Summary</h3>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-gray-400 font-bold">
                                 <span>Subtotal</span>
                                 <span className="text-white">{selectedOrder.currency} {selectedOrder.subtotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-gray-400 font-bold">
                                 <span>Shipping</span>
                                 <span className="text-emerald-400 uppercase text-xs tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/20">Free</span>
                              </div>
                              <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-end">
                                 <span className="text-lg font-black uppercase tracking-tighter">Total</span>
                                 <div className="text-right">
                                    <p className="text-3xl md:text-4xl font-black tracking-tighter leading-none">{selectedOrder.currency} {selectedOrder.totalAmount.toLocaleString()}</p>
                                 </div>
                              </div>
                           </div>
                        </section>

                        <div className="pt-4">
                           <div className={`p-6 rounded-[2rem] border-2 text-center ${
                              selectedOrder.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                              selectedOrder.status === 'Pending' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                              'bg-gray-50 border-gray-100 text-gray-500'
                           }`}>
                              <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">Fulfillment Status</p>
                              <p className="text-2xl font-black tracking-tighter">{selectedOrder.status}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
