"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../cart/cartContext';
import { StorefrontService } from '../storefrontService';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const FloatingInput = ({ label, type = "text", id, value, onChange, placeholder = "", className = "" }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value !== "");

  useEffect(() => {
    setHasValue(value !== "");
  }, [value]);

  return (
    <div className={`relative group w-full ${className}`}>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e);
          setHasValue(e.target.value.length > 0);
        }}
        placeholder={isFocused ? placeholder : ""}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full bg-white border-2 rounded-2xl px-5 pt-8 pb-4 text-xl font-semibold text-black outline-none transition-all duration-200 peer
          ${isFocused ? 'border-black' : 'border-gray-200 hover:border-gray-300'}`}
        required
      />
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

import { usePaystackPayment } from 'react-paystack';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { cart, subtotal, clearCart } = useCart();
  const { width, height } = useWindowSize();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    note: ''
  });

  // Load user data if logged in
  useEffect(() => {
    const email = localStorage.getItem('email');
    const phone = localStorage.getItem('phoneNumber');
    const fullName = localStorage.getItem('fullName');

    if (email) {
      const names = (fullName || '').split(' ');
      setFormData(prev => ({
        ...prev,
        email: email || '',
        phone: phone || '',
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || ''
      }));
    }
  }, []);

  const shipping = 0;
  const taxes = subtotal * 0.08;
  const total = subtotal + shipping + taxes;

  const config: any = {
    reference: `${crypto.randomUUID()}-${localStorage.getItem('storeId')}`,
    email: formData.email,
    amount: Math.round(total * 100), // Amount is in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    console.log("Payment Successful:", reference);
    setIsProcessing(true);
    try {
      const customerId = localStorage.getItem('customerId') || '';
      const storeId = localStorage.getItem('storeId') || '';

      const orderPayload = {
        storeId,
        customerId,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          variant: item.variant || 'Default'
        })),
        shippingAddress: {
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          country: 'Nigeria',
          postalCode: formData.postalCode
        },
        note: formData.note,
        paymentReference: reference.reference, // Add Paystack reference
        paymentMethod: 'Paystack'
      };

      const res = await StorefrontService.placeOrder(orderPayload);
      console.log("Order Response:", res);

      if (res.success) {
        setOrderSuccess(true);
        clearCart();
      } else {
        throw new Error(res.message || "Failed to place order after payment");
      }
    } catch (err: any) {
      setError(err.message || "Payment was successful but order placement failed. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    console.log("Payment closed");
    setIsProcessing(false);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check auth
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      setError("Please sign in to complete your checkout.");
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
      return;
    }

    if (!config.publicKey) {
      setError("Payment configuration is missing. Please check your environment variables.");
      return;
    }

    setIsProcessing(true);
    initializePayment({ onSuccess, onClose });
  };

  if (orderSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center animate-in fade-in zoom-in duration-700">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.1} />
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-black mb-6">Order Placed!</h1>
        <p className="text-xl text-gray-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
          Thank you for your purchase. We've sent a confirmation email to <span className="text-black font-bold">{formData.email}</span>.
        </p>
        <Link href={`/store/${slug}`} className="bg-black text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all shadow-xl inline-block hover:-translate-y-1">
          Back to Store
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-6 text-black">Your cart is empty</h2>
        <Link href={`/store/${slug}/shop`} className="text-black underline font-bold">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16 animate-in fade-in duration-500 text-black">

      <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">
        <span className="text-black">Checkout</span>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* Checkout Form */}
        <div className="lg:pr-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-10">Checkout</h1>

          <div className="space-y-4 mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">Contact Information</h2>
            <FloatingInput label="Email address" type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} />
            <FloatingInput label="Phone number" type="tel" value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          <div className="space-y-4 mb-10">
            <h2 className="text-2xl font-bold text-black mb-6">Shipping Address</h2>
            <div className="flex gap-4">
              <FloatingInput label="First name" value={formData.firstName} onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} />
              <FloatingInput label="Last name" value={formData.lastName} onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <FloatingInput label="Address" value={formData.address} onChange={(e: any) => setFormData({ ...formData, address: e.target.value })} />
            <div className="flex gap-4">
              <FloatingInput label="City" value={formData.city} onChange={(e: any) => setFormData({ ...formData, city: e.target.value })} />
              <FloatingInput label="State" value={formData.state} onChange={(e: any) => setFormData({ ...formData, state: e.target.value })} />
              <FloatingInput label="Postal code" value={formData.postalCode} onChange={(e: any) => setFormData({ ...formData, postalCode: e.target.value })} />
            </div>
            <div className="pt-4">
              <h3 className="text-lg font-bold text-black mb-3">Order Note (Optional)</h3>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full bg-white border-2 border-gray-200 hover:border-black rounded-2xl p-5 text-lg font-medium outline-none transition-all h-32 resize-none"
                placeholder="Notes about your order, e.g. special delivery instructions."
              />
            </div>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-4 text-red-600 animate-in slide-in-from-top-4 duration-300">
              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div className="font-bold">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-black text-white px-8 py-5 rounded-3xl text-2xl font-black hover:bg-gray-800 transition-all shadow-2xl hover:shadow-black/20 hover:-translate-y-1 flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0"
          >
            {isProcessing ? (
              <>
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay with Paystack
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </>
            )}
          </button>
          <p className="text-center text-gray-400 font-bold mt-6 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            Secure and Encrypted Payments
          </p>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:border-l-2 lg:border-gray-100 lg:pl-16 mt-12 lg:mt-0">
          <div className="sticky top-32">
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-4 scrollbar-hide">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl border-2 border-gray-100 overflow-hidden relative group-hover:border-black transition-colors">
                      <img src={item.image} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white z-10">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black block mb-1">{item.name}</span>
                      <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">{item.variant || 'Standard'}</span>
                    </div>
                  </div>
                  <span className="font-bold text-black text-lg">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-xl font-bold border-t-2 border-gray-100 pt-8 mb-8">
              <div className="flex justify-between items-center text-gray-500">
                <span>Subtotal</span>
                <span className="text-black">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Shipping</span>
                <span className="text-emerald-600 uppercase text-sm border-2 border-emerald-100 bg-emerald-50 px-3 py-1 rounded-xl">Free</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Estimated Tax</span>
                <span className="text-black">${taxes.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t-2 border-gray-100 pt-8">
              <span className="text-2xl font-black text-black uppercase tracking-tight">Total</span>
              <div className="flex items-end gap-2">
                <span className="text-sm font-black text-gray-400 mb-1">NGN</span>
                <span className="text-5xl font-black tracking-tighter text-black">
                  {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
