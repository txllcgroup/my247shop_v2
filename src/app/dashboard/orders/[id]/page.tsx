"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OrderService, Order } from '../orderService';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({ paymentMethod: 'Card', reference: '' });

  const fetchOrder = async () => {
    if (!resolvedParams.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.getOrderById(resolvedParams.id);
      if (response.success) {
        setOrder(response.data);
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setActionLoading(true);
    try {
      const response = await OrderService.updateOrderStatus(order.id, newStatus);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!order) return;
    if (!paymentData.reference) {
      alert("Please enter a payment reference");
      return;
    }
    setActionLoading(true);
    try {
      const response = await OrderService.markOrderAsPaid(order.id, paymentData);
      if (response.success) {
        setOrder(response.data);
        setShowPaymentForm(false);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setActionLoading(true);
    try {
      const response = await OrderService.cancelOrder(order.id);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'completed':
      case 'fulfilled':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
      case 'processing':
      case 'unfulfilled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
      case 'refunded':
      case 'returned':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium tracking-tight">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-black mb-2">Order not found</h2>
        <p className="text-gray-500 mb-8">{error || "The order you're looking for doesn't exist or you don't have permission to view it."}</p>
        <Link href="/dashboard/orders" className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-500 pb-32 px-4 lg:px-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b-2 border-gray-200 pb-8">
        <div>
          <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-semibold text-sm md:text-base transition-colors mb-4 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border-2 border-transparent hover:border-gray-200">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Back to Orders
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
             <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-black">Order #{order.orderNumber.split('-').pop()}</h1>
             <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 flex items-center gap-2 ${getStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus === 'Paid' && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
                {order.paymentStatus}
             </span>
             <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                {order.status}
             </span>
          </div>
          <p className="text-gray-500 font-medium text-lg mt-3">
            {new Date(order.placedAt).toLocaleDateString(undefined, { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex gap-4 shrink-0 w-full sm:w-auto mt-4 md:mt-0">
           {order.status !== 'Cancelled' && (
             <select 
               onChange={(e) => handleStatusUpdate(e.target.value)}
               value={order.status}
               disabled={actionLoading}
               className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-xl border-2 border-gray-200 text-base font-semibold hover:border-black transition-colors outline-none cursor-pointer"
             >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Unfulfilled">Unfulfilled</option>
                <option value="Returned">Returned</option>
             </select>
           )}
           <button onClick={() => window.print()} className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-xl border-2 border-gray-200 text-base font-semibold hover:border-black transition-colors flex justify-center items-center gap-2 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
           </button>
           {order.status !== 'Cancelled' && (
             <button 
               onClick={handleCancelOrder}
               disabled={actionLoading}
               className="w-full sm:w-auto bg-rose-50 text-rose-600 px-6 py-3 rounded-xl border-2 border-rose-100 text-base font-semibold hover:border-rose-300 transition-colors flex justify-center items-center gap-2 shadow-sm"
             >
                Cancel Order
             </button>
           )}
        </div>
      </div>

      {showPaymentForm && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 animate-in slide-in-from-top-4">
           <h3 className="text-xl font-bold text-emerald-800 mb-4">Mark as Paid</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                 <label className="text-sm font-bold text-emerald-700 ml-2">Payment Method</label>
                 <select 
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl p-3 text-base font-medium outline-none focus:border-emerald-500"
                 >
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-bold text-emerald-700 ml-2">Reference Number</label>
                 <input 
                    type="text"
                    placeholder="e.g. PAY-REF-1001"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl p-3 text-base font-medium outline-none focus:border-emerald-500"
                 />
              </div>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={handleMarkPaid}
                disabled={actionLoading}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Confirm Payment
              </button>
              <button 
                onClick={() => setShowPaymentForm(false)}
                className="bg-white text-emerald-600 border-2 border-emerald-200 px-8 py-3 rounded-xl font-bold hover:bg-emerald-100 transition-colors shadow-sm"
              >
                Cancel
              </button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content (Left) */}
         <div className="lg:col-span-2 space-y-8">
            
      {/* Fulfillment Card */}
      <div className="bg-white border-2 border-gray-200 rounded-3xl p-4 md:p-8">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${getStatusColor(order.status)}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
               </div>
               <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-black">{order.status}</h2>
                  <span className="text-gray-500 font-medium text-sm md:text-base">{order.items.length} {order.items.length === 1 ? 'item' : 'items'} in this order</span>
               </div>
            </div>
            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
              <button 
                onClick={() => handleStatusUpdate('Fulfilled')}
                disabled={actionLoading}
                className="bg-black text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto"
              >
                 Mark as Fulfilled
              </button>
            )}
         </div>

         {/* Line Items Table */}
         <div className="border-t-2 border-gray-100 pt-6 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead className="hidden md:table-header-group">
                    <tr>
                       <th className="px-4 py-3 text-sm font-semibold text-gray-500 border-b-2 border-gray-100">Item</th>
                       <th className="px-4 py-3 text-sm font-semibold text-gray-500 border-b-2 border-gray-100 text-right">Price</th>
                       <th className="px-4 py-3 text-sm font-semibold text-gray-500 border-b-2 border-gray-100 text-center">Qty</th>
                       <th className="px-4 py-3 text-sm font-semibold text-gray-500 border-b-2 border-gray-100 text-right">Total</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y-2 divide-gray-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                         <td className="px-4 py-5">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-gray-200 rounded-xl overflow-hidden shrink-0">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    </div>
                                  )}
                               </div>
                               <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-black text-base md:text-lg truncate">{item.productName}</span>
                                  <span className="text-gray-500 font-medium text-xs md:text-sm">Variant: {item.variant}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-4 py-5 text-right font-semibold text-black text-sm md:text-base whitespace-nowrap">{order.currency} {item.unitPrice.toLocaleString()}</td>
                         <td className="px-4 py-5 text-center font-semibold text-black text-sm md:text-base">{item.quantity}</td>
                         <td className="px-4 py-5 text-right font-bold text-black text-base md:text-lg whitespace-nowrap">{order.currency} {item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
         </div>
      </div>

      {/* Payment / Totals Card */}
         <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getStatusColor(order.paymentStatus)}`}>
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-black">{order.paymentStatus}</h2>
                 </div>
                 {order.paymentStatus !== 'Paid' && order.status !== 'Cancelled' && (
                    <button 
                      onClick={() => setShowPaymentForm(true)}
                      className="bg-emerald-50 text-emerald-700 font-bold px-6 py-2.5 rounded-xl border-2 border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      Mark as Paid
                    </button>
                 )}
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                     <span className="text-gray-500 font-medium">Subtotal</span>
                     <span className="text-black font-semibold">{order.currency} {order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-lg">
                       <span className="text-gray-500 font-medium">Discount</span>
                       <span className="text-emerald-600 font-semibold">-{order.currency} {order.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg">
                     <span className="text-gray-500 font-medium">Shipping</span>
                     <span className="text-black font-semibold">{order.currency} {order.shippingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                     <span className="text-gray-500 font-medium">Tax</span>
                     <span className="text-black font-semibold">{order.currency} {order.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-6 border-t-2 border-gray-200 flex justify-between items-center">
                     <span className="text-2xl font-bold text-black">Total</span>
                     <span className="text-3xl font-bold tracking-tight text-black">{order.currency} {order.totalAmount.toLocaleString()}</span>
                  </div>
               </div>
            </div>

         </div>

         {/* Sidebar Data (Right) */}
         <div className="lg:col-span-1 space-y-8">
            
            {/* Customer Details */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xl text-black">Customer</h3>
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                     <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center font-bold text-xl text-gray-500">
                    {order.customerEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-black text-lg block hover:underline cursor-pointer">{order.customerEmail.split('@')[0]}</span>
                    <span className="text-gray-500 font-medium text-sm">{order.customerEmail}</span>
                  </div>
               </div>
               
               <div className="pt-6 border-t-2 border-gray-100 space-y-4">
                  <div>
                     <span className="text-sm font-semibold text-gray-400 block mb-1 uppercase tracking-wide">Contact</span>
                     <span className="text-blue-600 font-semibold text-base hover:underline cursor-pointer block">{order.customerEmail}</span>
                     <span className="text-black font-semibold text-base">{order.customerPhone}</span>
                  </div>
                  <div className="pt-4">
                     <span className="text-sm font-semibold text-gray-400 block mb-1 uppercase tracking-wide">Shipping Address</span>
                     <div className="text-black font-medium text-base leading-relaxed">
                        {order.shippingAddress.addressLine1}<br />
                        {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                        {order.shippingAddress.country}
                     </div>
                  </div>
               </div>
            </div>

            {/* Note / Edit section */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 space-y-4">
               <h3 className="font-semibold text-xl text-black">Notes</h3>
               <textarea 
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-base font-medium text-black outline-none focus:border-black transition-colors resize-none placeholder:text-gray-400 min-h-[120px]"
                  placeholder="Add a note to this order..."
                  defaultValue={order.note || ''}
               ></textarea>
               <button className="bg-white text-black border-2 border-gray-200 w-full px-6 py-3 rounded-xl text-base font-semibold hover:border-black transition-colors shadow-sm">
                  Save Note
               </button>
            </div>
            
         </div>
      </div>
    </div>
  );
}
