"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StorefrontService } from './storefrontService';
import { useCart } from './cart/cartContext';

export default function StoreHome() {
   const params = useParams();
   const slug = params?.slug as string;
   const [store, setStore] = useState<any>(null);
   const [products, setProducts] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [addingId, setAddingId] = useState<string | null>(null);
   const { addToCart } = useCart();

   useEffect(() => {
      const initStorefront = async () => {
         if (!slug) return;
         try {
            setError(null);
            const storeName = slug;
            const storeData = await StorefrontService.getStoreDetails(storeName);
            setStore(storeData);

            if (storeData.id) {
               localStorage.setItem('storeId', storeData.id);
               localStorage.setItem('storeName', storeData.name);
               const productsData = await StorefrontService.getStoreProducts(storeData.id);
               setProducts(productsData || []);
            }
         } catch (err: any) {
            console.error("Failed to load storefront", err);
            setError(err.message || "Failed to load store");
         } finally {
            setIsLoading(false);
         }
      };

      initStorefront();
   }, [slug]);

   if (isLoading) {
      return (
         <div className="w-full flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="w-full flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-black mb-4">Store not found</h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">We couldn't find the store you're looking for. Please check the URL or try searching again.</p>
            <Link href="/" className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all">
               Back to My247
            </Link>
         </div>
      );
   }

   const bannerImage = store?.bannerUrl || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop";
   const displayProducts = products.slice(0, 6);

   return (
      <div className="w-full animate-in fade-in duration-700">

         {/* Hero Section */}
         <section className="px-6 md:px-12 py-8 md:py-12">
            <div className="w-full h-[60vh] md:h-[75vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden relative group">
               <img
                  src={bannerImage}
                  alt={store?.name || "Store Banner"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[20s] ease-out"
               />
               <div className="absolute inset-0 bg-black/30 md:bg-black/20 flex flex-col items-center justify-center text-center p-6 mix-blend-multiply"></div>
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                  <span className="text-white/90 text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-4">{store?.name || "Store"}</span>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-8 leading-[1.1] max-w-4xl italic">
                     {store?.name || "Welcome to our store"}
                  </h1>
                  <Link
                     href={`/store/${slug}/shop`}
                     className="bg-white text-black px-10 py-4 md:py-5 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors shadow-2xl hover:scale-105 transform duration-300"
                  >
                     Shop Collection
                  </Link>
               </div>
            </div>
         </section>

         {/* Featured Products */}
         <section className="px-6 md:px-12 py-16 md:py-24 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
               <div>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-4">New Arrivals</h2>
                  <p className="text-xl text-gray-500 font-medium">Explore the latest additions to {store?.name || 'our store'}.</p>
               </div>
               <Link href={`/store/${params.slug}/shop`} className="text-black font-semibold text-lg hover:underline underline-offset-4 flex items-center gap-2">
                  View all products <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </Link>
            </div>

            {displayProducts.length > 0 ? (
               <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                     {displayProducts.map((product) => (
                        <Link href={`/store/${params.slug}/product/${product.id}`} key={product.id} className="group cursor-pointer">
                           <div className="w-full aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden mb-6 relative border-2 border-transparent group-hover:border-gray-200 transition-colors shadow-sm">
                              <img
                                 src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                                 alt={product.name}
                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              />

                              {/* Quick Add Overlay */}
                              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                 <button
                                    className={`w-full backdrop-blur-md px-6 py-4 rounded-2xl font-bold text-base transition-all border-2 flex justify-center items-center gap-2 shadow-lg ${
                                       addingId === product.id 
                                       ? 'bg-emerald-500 text-white border-emerald-500' 
                                       : 'bg-white/90 text-black border-transparent hover:bg-black hover:text-white hover:border-black'
                                    }`}
                                    onClick={(e) => {
                                       e.preventDefault();
                                       setAddingId(product.id);
                                       addToCart({
                                          id: product.id,
                                          name: product.name,
                                          price: product.price,
                                          quantity: 1,
                                          image: product.images?.[0] || '',
                                          currency: product.currency || 'USD'
                                       });
                                       setTimeout(() => setAddingId(null), 1500);
                                    }}
                                    disabled={addingId === product.id}
                                 >
                                    {addingId === product.id ? (
                                       <>
                                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                          Added
                                       </>
                                    ) : (
                                       <>
                                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                          Quick Add
                                       </>
                                    )}
                                 </button>
                              </div>
                           </div>
                           <div className="flex justify-between items-start">
                              <div>
                                 <h3 className="text-xl font-bold text-black mb-1 group-hover:underline underline-offset-4">{product.name}</h3>
                                 <p className="text-gray-500 font-medium">{product.category || 'Lifestyle'}</p>
                              </div>
                              <span className="text-xl font-bold text-black bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">{product.currency} {product.price?.toLocaleString()}</span>
                           </div>
                        </Link>
                     ))}
                  </div>

                  {products.length > 6 && (
                     <div className="mt-20 text-center">
                        <Link href={`/store/${params.slug}/shop`} className="inline-block bg-black text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                           See all {products.length} products
                        </Link>
                     </div>
                  )}
               </>
            ) : (
               <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-20 text-center">
                  <div className="w-20 h-20 bg-white border-2 border-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-gray-400">
                     <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">No products found</h3>
                  <p className="text-gray-500 font-medium text-lg">We're currently updating our catalog. Check back soon!</p>
               </div>
            )}
         </section>

         {/* Value Props */}
         <section className="px-6 md:px-12 py-16 md:py-24 bg-gray-50 border-y-2 border-gray-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
               <div>
                  <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm">
                     <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Free Shipping</h3>
                  <p className="text-gray-500 font-medium text-lg">On all orders over {store?.currency || '$'}100 within the country.</p>
               </div>
               <div>
                  <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm">
                     <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Free Returns</h3>
                  <p className="text-gray-500 font-medium text-lg">Not happy? Return it within 30 days for a full refund.</p>
               </div>
               <div>
                  <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm">
                     <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Secure Checkout</h3>
                  <p className="text-gray-500 font-medium text-lg">Your data is safe. We use enterprise-grade encryption.</p>
               </div>
            </div>
         </section>

      </div>
   );
}
