"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProductService } from './productService';

// --- Shared UI Components ---

const ShimmerCard = () => (
  <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden p-6 space-y-4 animate-pulse h-[420px]">
    <div className="w-full h-1/2 bg-gray-100 rounded-2xl"></div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-100 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
      <div className="pt-4 flex justify-between">
        <div className="h-8 bg-gray-100 rounded-lg w-20"></div>
        <div className="h-8 bg-gray-100 rounded-lg w-16"></div>
      </div>
    </div>
  </div>
);

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const storeId = localStorage.getItem('storeId') || "";
      if (!storeId) {
        console.error("No storeId found in localStorage");
        setIsLoading(false);
        return;
      }

      // Map activeTab to status/isPublished
      let status = undefined;
      let isPublished = undefined;
      if (activeTab === 'Active') {
        isPublished = true;
        status = 'Active';
      } else if (activeTab === 'Drafts') {
        isPublished = false;
        status = 'Draft';
      } else if (activeTab === 'Archived') {
        status = 'Archived';
      }

      const response = await ProductService.getProducts(storeId, {
        search: searchTerm,
        status,
        isPublished,
        page,
        pageSize
      });

      if (response.success) {
        setProducts(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, activeTab, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, page, fetchProducts]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-4">Products</h1>
          <p className="text-xl text-gray-500 font-medium max-w-xl">Manage your products, pricing, and product details.</p>
        </div>
        <div className="flex gap-4 flex-col sm:flex-row w-full md:w-auto">
          <Link href="/dashboard/products/add" className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-xl border-2 border-black text-base font-semibold hover:bg-gray-800 transition-colors inline-flex justify-center items-center gap-2 shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {['All', 'Active', 'Drafts', 'Archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-6 py-3 rounded-full text-base font-semibold whitespace-nowrap transition-colors border-2 ${activeTab === tab
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black'
                }`}
            >
              {tab} {tab === 'All' && !isLoading && <span className={`ml-2 px-2.5 py-0.5 rounded-full text-sm ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{totalCount}</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 text-base font-medium focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <button className="bg-white border-2 border-gray-200 px-6 py-3 rounded-xl text-base font-semibold hover:border-black transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ShimmerCard key={i} />)
        ) : (
          <>
            {products.map((product) => (
              <Link key={product.id} href={`/dashboard/products/${product.id}`} className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden hover:border-black hover:shadow-lg transition-all group flex flex-col h-[420px]">
                <div className="w-full h-[60%] bg-gray-50 flex items-center justify-center relative border-b-2 border-gray-100 group-hover:bg-gray-100 transition-colors">
                  {/* Product image */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border-2 border-gray-200 shadow-sm">{product.stockQuantity} in stock</div>
                  <div className={`absolute top-4 left-4 ${product.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-300'} px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-sm flex items-center gap-2`}>
                    <span className={`w-2 h-2 ${product.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'} rounded-full`}></span> {product.status}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-xl text-black mb-2 group-hover:underline underline-offset-4 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-500 font-medium text-base mb-4">{product.category || "General"}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 mt-auto">
                    <span className="font-semibold text-2xl text-black tracking-tight">{product.currency} {product.price.toLocaleString()}</span>

                  </div>
                </div>
              </Link>
            ))}

            {products.length === 0 && !isLoading && (
              <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">No products found</h3>
                <p className="text-gray-500 max-w-sm mb-8">We couldn't find any products matching your search or filters.</p>
                <Link href="/dashboard/products/add" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10">Add Your First Product</Link>
              </div>
            )}

            {/* Pagination Controls */}
            {totalCount > pageSize && (
              <div className="col-span-full flex justify-center items-center gap-4 mt-12 py-8 border-t-2 border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 font-bold hover:border-black disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-12 h-12 rounded-xl border-2 font-bold transition-all ${page === i + 1 ? 'bg-black border-black text-white' : 'border-gray-200 hover:border-black text-gray-500'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page === Math.ceil(totalCount / pageSize)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 font-bold hover:border-black disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
