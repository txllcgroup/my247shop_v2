"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StorefrontService } from '../../storefrontService';
import { useCart } from '../../cart/cartContext';

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
     const fetchProduct = async () => {
        if (!id) return;
        try {
           const data = await StorefrontService.getProductDetails(id);
           setProduct(data);
        } catch (e) {
           console.error("Failed to load product details", e);
        } finally {
           setIsLoading(false);
        }
     };
     fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0] || '',
      currency: product.currency || 'USD'
    });

    setTimeout(() => setAdding(false), 800);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
     return (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center">
           <h2 className="text-3xl font-bold mb-4">Product not found</h2>
           <Link href={`/store/${slug}/shop`} className="text-black underline underline-offset-4 font-bold">Back to Shop</Link>
        </div>
     );
  }

  const images = product.images?.length > 0 ? product.images : ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop"];
  const features = product.tags || ["High Quality", "Curated Selection"];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16 animate-in fade-in duration-500">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-8 md:mb-12">
        <Link href={`/store/${slug}`} className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/store/${slug}/shop`} className="hover:text-black transition-colors">{product.category || 'Shop'}</Link>
        <span>/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
         
         {/* Media Gallery (Left) */}
         <div className="space-y-6">
            <div className="w-full aspect-[4/5] md:aspect-square bg-gray-50 rounded-[2rem] border-2 border-gray-100 overflow-hidden relative">
               <img 
                 src={images[activeImage]} 
                 alt={product.name} 
                 className="w-full h-full object-cover transition-opacity duration-500" 
               />
            </div>
            {images.length > 1 && (
               <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img: string, idx: number) => (
                     <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                     >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                     </button>
                  ))}
               </div>
            )}
         </div>

         {/* Product Info (Right) */}
         <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4 leading-tight">{product.name}</h1>
            <div className="text-2xl font-bold text-black mb-8">{product.currency} {product.price?.toLocaleString()}</div>
            
            <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10">
               {product.description || product.shortDescription || "No description available for this product."}
            </p>
            
            <div className="space-y-8 border-t-2 border-gray-100 pt-8 mb-10">
               <div>
                  <h3 className="font-semibold text-lg text-black mb-4">Quantity</h3>
                  <div className="inline-flex items-center bg-gray-50 border-2 border-gray-200 rounded-2xl p-1 shadow-sm">
                     <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center text-xl font-bold text-black hover:bg-white rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        disabled={quantity <= 1}
                     >
                        −
                     </button>
                     <span className="w-16 text-center text-xl font-bold text-black">{quantity}</span>
                     <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 flex items-center justify-center text-xl font-bold text-black hover:bg-white rounded-xl transition-colors"
                     >
                        +
                     </button>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-4 mt-auto">
               <button 
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-5 rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 relative overflow-hidden"
               >
                  {adding ? (
                     <span className="animate-in fade-in zoom-in duration-300 flex items-center gap-2">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Added to Cart
                     </span>
                  ) : (
                     <span className="flex items-center gap-2">
                        Add to Cart — {product.currency} {product.price?.toLocaleString()}
                     </span>
                  )}
               </button>
               
               {/* Quick Pay */}
               <button className="w-full bg-[#5a31f4] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#4a24d4] transition-colors shadow-sm flex items-center justify-center gap-2">
                  Buy with <span className="font-serif italic font-medium ml-1">Shop Pay</span>
               </button>
            </div>
            
            <div className="mt-12 space-y-4">
               <div className="flex items-start gap-4 p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl">
                  <svg className="w-6 h-6 text-black shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <div>
                     <span className="font-bold text-black block mb-1">Fast Delivery</span>
                     <span className="text-gray-500 font-medium text-sm">Free standard shipping on orders over $100.</span>
                  </div>
               </div>
            </div>

         </div>
      </div>
      
      {/* Detail Specs */}
      <div className="mt-24 pt-16 border-t-2 border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-12">
         <div>
            <h2 className="text-3xl font-bold text-black mb-8">Product Details</h2>
            <ul className="space-y-4">
               {features.map((feat: any, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                     <svg className="w-6 h-6 text-black shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                     <span className="text-lg font-medium text-gray-500">{feat}</span>
                  </li>
               ))}
            </ul>
         </div>
      </div>
    </div>
  );
}
