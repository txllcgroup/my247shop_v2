"use client";
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useCart } from './cartContext';
import { useParams } from 'next/navigation';

// Helper to get the currency symbol
function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'NGN': return '₦';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return currency;
  }
}

export default function CartPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { cart, updateQuantity, removeFromCart, subtotal } = useCart();

  // Derive currency from the first cart item (all items in a store share the same currency)
  const cartCurrency = useMemo(() => {
    if (cart.length > 0 && cart[0].currency) return cart[0].currency;
    return 'NGN'; // Default fallback
  }, [cart]);

  const currencySymbol = getCurrencySymbol(cartCurrency);

  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (cart.length === 0) {
      return (
         <div className="max-w-7xl mx-auto px-6 py-24 text-center animate-in fade-in duration-500">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6">Your cart is empty.</h1>
            <p className="text-xl text-gray-500 font-medium mb-12 max-w-md mx-auto">Looks like you haven't added anything to your cart yet.</p>
            <Link href={`/store/${slug}/shop`} className="bg-black text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all shadow-xl inline-block">
               Continue Shopping
            </Link>
         </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16 animate-in fade-in duration-500 text-black">
      
      <div className="flex items-center justify-between mb-12">
         <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black">Your Cart</h1>
         <span className="text-xl font-bold text-gray-400">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
         
         {/* Cart Items */}
         <div className="lg:col-span-2 space-y-8">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b-2 border-gray-100 text-sm font-bold text-gray-400 uppercase tracking-widest">
               <div className="col-span-6">Product</div>
               <div className="col-span-3 text-center">Quantity</div>
               <div className="col-span-3 text-right">Total</div>
            </div>
            
            <div className="space-y-8 md:space-y-6">
               {cart.map((item) => (
                  <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center py-6 border-b-2 border-gray-100 last:border-0">
                     <div className="col-span-6 flex items-center gap-6 w-full md:w-auto">
                        <Link href={`/store/${slug}/product/${item.id}`} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-gray-100 overflow-hidden shrink-0 bg-gray-50 hidden sm:block">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1">
                           <Link href={`/store/${slug}/product/${item.id}`} className="text-xl md:text-2xl font-bold text-black hover:underline mb-2 block">{item.name}</Link>
                           <p className="text-gray-500 font-bold mb-4 md:mb-0">{currencySymbol}{item.price.toLocaleString()}</p>
                           <button onClick={() => removeFromCart(item.id)} className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-colors underline underline-offset-4 md:hidden">Remove</button>
                        </div>
                     </div>
                     
                     <div className="col-span-3 flex justify-between md:justify-center w-full md:w-auto items-center">
                        <div className="inline-flex items-center bg-gray-50 border-2 border-gray-200 rounded-xl p-1 shadow-sm">
                           <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center text-lg font-bold text-black hover:bg-white rounded-lg transition-colors">−</button>
                           <span className="w-12 text-center text-lg font-bold text-black">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-lg font-bold text-black hover:bg-white rounded-lg transition-colors">+</button>
                        </div>
                     </div>
                     
                     <div className="col-span-3 flex justify-between md:justify-end w-full md:w-auto items-center">
                        <span className="md:hidden text-lg font-bold text-gray-400">Total:</span>
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-xl md:text-2xl font-bold text-black">{currencySymbol}{(item.price * item.quantity).toLocaleString()}</span>
                           <button onClick={() => removeFromCart(item.id)} className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-colors underline underline-offset-4 hidden md:block">Remove</button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Order Summary */}
         <div className="lg:col-span-1">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-[2rem] p-8 md:p-10 sticky top-32 shadow-sm">
               <h2 className="text-2xl font-bold text-black mb-8">Order Summary</h2>
               
               <div className="space-y-5 text-lg font-medium mb-8">
                  <div className="flex justify-between items-center text-gray-500">
                     <span>Subtotal</span>
                     <span className="text-black font-bold">{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 pb-6 border-b-2 border-gray-200">
                     <span>Shipping</span>
                     <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm border-2 border-emerald-200 bg-emerald-50 px-3 py-1 rounded-lg">Free</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                     <span className="text-xl font-bold text-black">Total</span>
                     <div className="flex items-end gap-2">
                        <span className="text-sm font-bold text-gray-400 mb-1">{cartCurrency}</span>
                        <span className="text-3xl font-bold tracking-tight text-black">{currencySymbol}{total.toFixed(2)}</span>
                     </div>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <Link href={`/store/${slug}/checkout`} className="w-full bg-black text-white px-8 py-5 rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-center block relative overflow-hidden group">
                     <span className="relative z-10 flex items-center justify-center gap-2">
                        Proceed to Checkout
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7 m0 0l-7 7m7-7H3"/></svg>
                     </span>
                  </Link>
                  <Link href={`/store/${slug}/shop`} className="w-full bg-white text-black px-8 py-4 rounded-2xl text-lg font-bold border-2 border-gray-200 hover:border-black transition-colors text-center block shadow-sm">
                     Continue Shopping
                  </Link>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
