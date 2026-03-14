"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StorefrontService } from '../storefrontService';

export default function ShopPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
     const fetchProducts = async () => {
        if (!slug) return;
        try {
           setError(null);
           const storeData = await StorefrontService.getStoreDetails(slug);
           if (storeData.id) {
              const productsData = await StorefrontService.getStoreProducts(storeData.id);
              setProducts(productsData || []);
           }
        } catch (e: any) {
           console.error("Failed to load shop products", e);
           setError(e.message || "Failed to load shop");
        } finally {
           setIsLoading(false);
        }
     };
     fetchProducts();
  }, [slug]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
     return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center px-6 text-center">
           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </div>
           <h2 className="text-2xl font-bold text-black mb-2">Shop not available</h2>
           <p className="text-gray-500 font-medium mb-6">We couldn't load the products for this store. {error}</p>
           <Link href={`/store/${slug}`} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
              Try Again
           </Link>
        </div>
     );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 md:py-16 animate-in fade-in duration-500">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-8 md:mb-12">
        <Link href={`/store/${slug}`} className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black">Shop</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 border-b-2 border-gray-100 pb-12">
         <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-4">All Products</h1>
            <p className="text-xl text-gray-500 font-medium">Browse our full collection of premium goods.</p>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
         
         {/* Categories Sidebar */}
         <div className="lg:w-64 shrink-0">
            <h3 className="font-bold text-lg text-black mb-6 uppercase tracking-widest">Categories</h3>
            <ul className="space-y-4">
               {categories.map((cat: any) => (
                  <li key={cat}>
                     <button
                        onClick={() => setActiveCategory(cat)}
                        className={`text-lg font-bold transition-colors ${activeCategory === cat ? 'text-black underline underline-offset-8 decoration-2' : 'text-gray-400 hover:text-black'}`}
                     >
                        {cat}
                     </button>
                  </li>
               ))}
            </ul>
         </div>

         {/* Product Grid */}
         <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
               <span className="text-gray-500 font-bold">{filteredProducts.length} Results</span>
               <div className="flex gap-4">
                  <select className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-black outline-none hover:border-black cursor-pointer">
                     <option>Sort by: Featured</option>
                     <option>Price: Low to High</option>
                     <option>Price: High to Low</option>
                     <option>Newest Arrivals</option>
                  </select>
               </div>
            </div>

            {filteredProducts.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
                  {filteredProducts.map((product) => (
                     <Link href={`/store/${slug}/product/${product.id}`} key={product.id} className="group cursor-pointer">
                        <div className="w-full aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden mb-6 relative border-2 border-transparent group-hover:border-gray-200 transition-colors shadow-sm">
                           <img 
                           src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'} 
                           alt={product.name} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                           />
                           <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              <button 
                                 className="w-full bg-white/90 backdrop-blur-md text-black px-6 py-4 rounded-2xl font-bold text-base hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black flex justify-center items-center gap-2 shadow-lg"
                                 onClick={(e) => {
                                 e.preventDefault();
                                 }}
                              >
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                                 Quick Add
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
            ) : (
               <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-20 text-center">
                  <h3 className="text-2xl font-bold text-black mb-2">No products found</h3>
                  <p className="text-gray-500 font-medium text-lg">Try adjusting your filters or check back later.</p>
               </div>
            )}
            
            {/* Pagination Placeholder */}
            {filteredProducts.length > 12 && (
               <div className="mt-16 pt-8 border-t-2 border-gray-100 flex justify-center">
                  <div className="flex gap-2">
                     <button className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-200 text-gray-400 hover:border-black hover:text-black font-bold transition-colors">1</button>
                     <button className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-black bg-black text-white font-bold transition-colors">2</button>
                     <button className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-200 text-gray-400 hover:border-black hover:text-black font-bold transition-colors">3</button>
                  </div>
               </div>
            )}
         </div>

      </div>
    </div>
  );
}
