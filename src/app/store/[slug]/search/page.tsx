"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StorefrontService } from '../storefrontService';

export default function SearchPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     const initSearch = async () => {
        if (!slug) return;
        try {
           const storeData = await StorefrontService.getStoreDetails(slug);
           if (storeData.id) {
              const data = await StorefrontService.getStoreProducts(storeData.id);
              setProducts(data || []);
           }
        } catch (e) {
           console.error("Failed to load products for search", e);
        } finally {
           setIsLoading(false);
        }
     };
     initSearch();
  }, [slug]);

  const filteredProducts = query 
     ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category?.toLowerCase().includes(query.toLowerCase())) 
     : [];

  if (isLoading) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 md:py-16 min-h-[60vh] animate-in fade-in duration-500">
      
      {/* Massive Search Bar */}
      <div className="max-w-4xl mx-auto mb-16 md:mb-24">
         <div className="relative group">
            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-black z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
               type="text"
               autoFocus
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Search products, brands, or categories..."
               className="w-full bg-gray-50 hover:bg-white border-4 border-transparent hover:border-gray-200 focus:border-black focus:bg-white rounded-full py-8 pl-20 pr-10 text-2xl md:text-4xl font-bold tracking-tight text-black outline-none transition-all duration-300 shadow-sm"
            />
         </div>
         
         {!query && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
               <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Trending Searches:</span>
               {['Leather Bags', 'Watches', 'Summer Apparel', 'Ceramics'].map(term => (
                  <button key={term} onClick={() => setQuery(term)} className="bg-white border-2 border-gray-200 px-4 py-2 rounded-xl text-black font-bold hover:border-black transition-colors">
                     {term}
                  </button>
               ))}
            </div>
         )}
      </div>

      {/* Results */}
      {query && (
         <div>
            <div className="flex justify-between items-center mb-10 border-b-2 border-gray-100 pb-6">
               <span className="text-2xl font-bold text-black">{filteredProducts.length} Results for "{query}"</span>
            </div>

            {filteredProducts.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => (
                     <Link href={`/store/${slug}/product/${product.id}`} key={product.id} className="group cursor-pointer">
                        <div className="w-full aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden mb-6 relative border-2 border-transparent group-hover:border-gray-200 transition-colors shadow-sm">
                           <img 
                             src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'} 
                             alt={product.name} 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                           />
                           <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              <button className="w-full bg-white text-black py-4 rounded-xl font-bold text-base border-2 border-black hover:bg-black hover:text-white transition-colors shadow-lg">
                                 View Item
                              </button>
                           </div>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-1 group-hover:underline underline-offset-4">{product.name}</h3>
                        <span className="text-lg font-bold text-gray-500">{product.currency} {product.price?.toLocaleString()}</span>
                     </Link>
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-6">
                     <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">No matching products</h3>
                  <p className="text-xl text-gray-400 font-medium">Try adjusting your search or browse our categories.</p>
                  <Link href={`/store/${slug}/shop`} className="mt-8 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                     Browse All Products
                  </Link>
               </div>
            )}
         </div>
      )}

    </div>
  );
}
