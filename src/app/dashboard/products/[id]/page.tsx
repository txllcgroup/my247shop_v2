"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductService, ProductData } from '../productService';

// --- Shared UI Components ---

const FloatingInput = ({ label, type = "text", id, value, onChange, placeholder = "", prefix }: any) => (
  <div className="relative group w-full">
    {prefix && (
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400 z-10 pt-2">
        {prefix}
      </div>
    )}
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`peer w-full bg-white border-2 rounded-2xl pb-3 pt-7 text-lg font-semibold text-black outline-none transition-all duration-200 border-gray-200 focus:border-black ${prefix ? 'pl-10' : 'pl-5'}`}
    />
    <label
      htmlFor={id}
      className={`absolute transition-all duration-200 pointer-events-none font-semibold ${prefix ? 'left-10' : 'left-5'} ${value || type === 'number' ? 'text-xs text-gray-500 top-2.5' : 'text-base text-gray-400 top-5'}`}
    >
      {label}
    </label>
  </div>
);

const Shimmer = () => (
  <div className="max-w-[1200px] mx-auto space-y-12 animate-pulse pt-10">
    <div className="h-10 bg-gray-100 rounded-xl w-48"></div>
    <div className="flex justify-between items-end border-b-2 border-gray-100 pb-8">
      <div className="space-y-4 w-1/2">
        <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
        <div className="h-6 bg-gray-100 rounded-xl w-32"></div>
      </div>
      <div className="flex gap-4">
        <div className="h-12 bg-gray-100 rounded-xl w-32"></div>
        <div className="h-12 bg-gray-100 rounded-xl w-32"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="h-96 bg-gray-100 rounded-[2.5rem]"></div>
        <div className="h-64 bg-gray-100 rounded-[2.5rem]"></div>
      </div>
      <div className="space-y-8">
        <div className="h-64 bg-gray-100 rounded-[2.5rem]"></div>
        <div className="h-64 bg-gray-100 rounded-[2.5rem]"></div>
      </div>
    </div>
  </div>
);

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductData | null>(null);
  const [storeName, setStoreName] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Local state for stock adjustment
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  // Local state for new variant
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariant, setNewVariant] = useState<any>({ name: '', value: '', price: 0, stockQuantity: 0 });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!resolvedParams.id) return;
      try {
        const response = await ProductService.getProduct(resolvedParams.id);
        if (response.success) {
          setFormData(response.data);
        } else {
          setError(response.message || "Product not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch product");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    
    const storedName = localStorage.getItem('storeName');
    if (storedName) setStoreName(storedName);
  }, [resolvedParams.id]);

  const updateData = (updates: Partial<ProductData>) => setFormData(prev => prev ? { ...prev, ...updates } : null);
  const updateSEO = (updates: Partial<ProductData['seo']>) => setFormData(prev => prev ? { ...prev, seo: { ...prev.seo, ...updates } } : null);

  const handleUpdate = async () => {
    if (!formData) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await ProductService.updateProduct(resolvedParams.id, formData);
      if (response.success) {
        setFormData(response.data);
        alert("Product updated successfully!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await ProductService.deleteProduct(resolvedParams.id);
      if (response.success) {
        router.push('/dashboard/products');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (action: 'publish' | 'unpublish' | 'archive') => {
    try {
      let res;
      if (action === 'publish') res = await ProductService.publishProduct(resolvedParams.id);
      else if (action === 'unpublish') res = await ProductService.unpublishProduct(resolvedParams.id);
      else res = await ProductService.archiveProduct(resolvedParams.id);
      
      if (res.success) {
        setFormData(prev => prev ? { ...prev, isPublished: action === 'publish', status: action === 'archive' ? 'Archived' : (action === 'publish' ? 'Active' : 'Draft') } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustStock = async () => {
    if (stockAdjustment === 0) return;
    try {
      const res = await ProductService.adjustStock(resolvedParams.id, stockAdjustment);
      if (res.success) {
        setFormData(prev => prev ? { ...prev, stockQuantity: (prev.stockQuantity || 0) + stockAdjustment } : null);
        setStockAdjustment(0);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteImage = async (imgUrl: string) => {
    if (!confirm("Remove this image?")) return;
    try {
      const res = await ProductService.deleteImage(resolvedParams.id, imgUrl);
      if (res.success) {
        setFormData(prev => prev ? { ...prev, images: prev.images.filter(img => img !== imgUrl) } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddVariant = async () => {
    try {
      const res = await ProductService.addVariant(resolvedParams.id, newVariant);
      if (res.success) {
        setFormData(prev => prev ? { ...prev, variants: [...(prev.variants || []), res.data] } : null);
        setShowAddVariant(false);
        setNewVariant({ name: '', value: '', price: 0, stockQuantity: 0 });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return;
    try {
      const res = await ProductService.deleteVariant(resolvedParams.id, variantId);
      if (res.success) {
        setFormData(prev => prev ? { ...prev, variants: (prev.variants || []).filter(v => v.id !== variantId) } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateVariant = async (variantId: string, updatedVariant: any) => {
    try {
      const res = await ProductService.updateVariant(resolvedParams.id, variantId, updatedVariant);
      if (res.success) {
        setFormData(prev => prev ? { ...prev, variants: (prev.variants || []).map(v => v.id === variantId ? res.data : v) } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStockDirect = async (newStock: number) => {
    try {
      const res = await ProductService.updateStock(resolvedParams.id, newStock);
      if (res.success) {
        setFormData(prev => prev ? { ...prev, stockQuantity: newStock } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicate = async () => {
    if (!formData) return;
    try {
      const { id, ...duplicateData } = formData as any;
      duplicateData.name = `${duplicateData.name} (Copy)`;
      duplicateData.sku = `${duplicateData.sku}-COPY`;
      const response = await ProductService.createProduct(duplicateData);
      if (response.success) {
        router.push(`/dashboard/products/${response.data.id}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const productUrl = `https://my247v2.airshop247.com/s/${storeName?.toLowerCase().replace(/\s+/g, '-')}/${formData?.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!formData) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: formData.name,
          text: `Check out our product: ${formData.name}`,
          url: productUrl,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Check out our product: ${formData.name} ${productUrl}`)}`, '_blank');
    }
  };

  if (isLoading) return <Shimmer />;
  if (!formData) return <div className="p-20 text-center font-bold text-2xl">Product not found</div>;

  return (
    <div className="max-w-[1240px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-32 pt-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b-2 border-gray-200 pb-10">
        <div>
          <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm transition-all mb-6 bg-gray-50 hover:bg-gray-100 px-5 py-2.5 rounded-2xl border-2 border-transparent">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Back to Products
          </Link>
          <div className="flex items-center gap-5 flex-wrap">
             <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-black leading-tight">{formData.name}</h1>
             <div className="flex items-center gap-3">
               <span className={`px-5 py-2 rounded-2xl text-sm font-bold border-2 flex items-center gap-2 shadow-sm ${formData.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${formData.isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  {formData.isPublished ? 'Active' : 'Draft'}
               </span>
               {(formData as any).status === 'Archived' && (
                 <span className="bg-red-50 text-red-700 border-red-200 px-5 py-2 rounded-2xl text-sm font-bold border-2">Archived</span>
               )}
             </div>
          </div>
        </div>
        <div className="flex gap-4 shrink-0 w-full sm:w-auto mt-4 md:mt-2">
           <button onClick={() => handleStatusChange(formData.isPublished ? 'unpublish' : 'publish')} className="flex-1 sm:flex-none bg-black text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all shadow-sm">
              {formData.isPublished ? 'Unpublish' : 'Publish'}
           </button>
           <button onClick={() => handleStatusChange('archive')} className="flex-1 sm:flex-none bg-white text-black px-8 py-4 rounded-2xl border-2 border-gray-200 text-lg font-bold hover:border-black transition-all shadow-sm">
              Archive
           </button>
           <div className="flex items-center gap-2">
              <button onClick={handleDuplicate} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all text-black" title="Duplicate">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
              </button>
              <button onClick={handleShare} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all text-black" title="Share Product">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
              <button onClick={handleCopy} className={`p-4 rounded-2xl border-2 transition-all ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-transparent text-black hover:bg-gray-100'}`} title="Copy Link">
                {copied ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
              </button>
              <button onClick={handleDelete} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all" title="Delete">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Main Content (Left) */}
         <div className="lg:col-span-2 space-y-10">
            
            {/* Gallery */}
            <div className="bg-white border-2 border-gray-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm">
               <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-black">Product Media</h2>
                  <button className="text-indigo-600 font-bold hover:bg-indigo-50 px-5 py-2 rounded-2xl transition-all">Add Images</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {formData.images?.map((imgUrl, idx) => (
                     <div key={idx} className={`relative aspect-square bg-gray-50 border-2 border-gray-100 rounded-3xl overflow-hidden group hover:border-black transition-all shadow-sm ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}>
                        <img src={imgUrl} alt={`Media ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <button 
                          onClick={() => handleDeleteImage(imgUrl)}
                          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl text-red-600 opacity-0 group-hover:opacity-100 transition-opacity border-2 border-red-50 hover:bg-red-50"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md">Cover Image</span>
                        )}
                     </div>
                  ))}
                  {(!formData.images || formData.images.length === 0) && (
                    <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4 text-gray-400">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="font-bold">No images uploaded yet</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Content & Descriptions */}
            <div className="bg-white border-2 border-gray-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm">
               <h2 className="text-3xl font-bold text-black">Product Content</h2>
               <div className="space-y-8">
                  <FloatingInput label="Product Name" id="name" value={formData.name} onChange={(e: any) => updateData({ name: e.target.value })} />
                  
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 ml-5 block uppercase tracking-widest">Short Description</label>
                    <textarea 
                       value={formData.shortDescription || ""}
                       onChange={(e) => updateData({ shortDescription: e.target.value })}
                       className="w-full p-6 min-h-[100px] text-lg font-medium text-black outline-none resize-y border-2 border-gray-200 rounded-3xl focus:border-black transition-all"
                       placeholder="Brief summary..."
                    ></textarea>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 ml-5 block uppercase tracking-widest">Full Description</label>
                    <textarea 
                       value={formData.description}
                       onChange={(e) => updateData({ description: e.target.value })}
                       className="w-full p-8 min-h-[250px] text-lg font-medium text-black outline-none resize-y border-2 border-gray-200 rounded-3xl focus:border-black transition-all"
                       placeholder="Detail description..."
                    ></textarea>
                  </div>
               </div>
            </div>

            {/* Variants Management */}
            <div className="bg-white border-2 border-gray-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm">
               <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-black">Product Variants</h2>
                  <button onClick={() => setShowAddVariant(true)} className="bg-indigo-50 text-indigo-700 font-bold px-6 py-3 rounded-2xl hover:bg-indigo-100 transition-all border-2 border-indigo-100">Add Variant</button>
               </div>
               
               {showAddVariant && (
                 <div className="p-8 bg-gray-50 rounded-3xl border-2 border-gray-200 space-y-6 animate-in slide-in-from-top duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FloatingInput label="Variant Name (e.g. Size)" value={newVariant.name} onChange={(e: any) => setNewVariant({ ...newVariant, name: e.target.value })} />
                       <FloatingInput label="Variant Value (e.g. Large)" value={newVariant.value} onChange={(e: any) => setNewVariant({ ...newVariant, value: e.target.value })} />
                       <FloatingInput label="Price Override" type="number" value={newVariant.price} onChange={(e: any) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })} />
                       <FloatingInput label="Stock Override" type="number" value={newVariant.stockQuantity} onChange={(e: any) => setNewVariant({ ...newVariant, stockQuantity: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="flex gap-4">
                       <button onClick={handleAddVariant} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">Save Variant</button>
                       <button onClick={() => setShowAddVariant(false)} className="bg-white border-2 border-gray-200 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all text-gray-500">Cancel</button>
                    </div>
                 </div>
               )}

               <div className="divide-y-2 divide-gray-100">
                  {formData.variants?.map((v, i) => (
                     <div key={v.id || i} className="py-6 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border-2 border-gray-100">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                           </div>
                           <div>
                              <p className="font-bold text-xl text-black">{v.name}: {v.value}</p>
                              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">₦{v.price.toLocaleString()} • {v.stockQuantity} in stock</p>
                           </div>
                        </div>
                        <button onClick={() => handleDeleteVariant(v.id!)} className="p-3 text-red-100 group-hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                     </div>
                  ))}
                  {(!formData.variants || formData.variants.length === 0) && !showAddVariant && (
                    <div className="py-10 text-center text-gray-400 font-bold italic">No variants configured for this product</div>
                  )}
               </div>
            </div>
         </div>

         {/* Sidebar (Right) */}
         <div className="lg:col-span-1 space-y-10">
            {/* Stock Management */}
            <div className="bg-white border-2 border-gray-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm">
               <h3 className="font-bold text-2xl text-black">Inventory Controls</h3>
               <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 flex items-center justify-between">
                     <div>
                       <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Total Stock</p>
                       <p className="text-4xl font-bold text-black">{formData.stockQuantity}</p>
                     </div>
                     <div className={`px-4 py-1.5 rounded-xl text-xs font-bold ${formData.stockQuantity! > (formData.lowStockThreshold || 0) ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700 animate-pulse'}`}>
                        {formData.stockQuantity! > (formData.lowStockThreshold || 0) ? 'In Stock' : 'Low Stock'}
                     </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                     <label className="text-sm font-bold text-gray-500 ml-4 block uppercase tracking-widest">Adjust Quantity</label>
                     <div className="flex gap-3">
                        <button onClick={() => setStockAdjustment(prev => prev - 1)} className="w-14 h-14 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center font-bold text-2xl hover:border-black transition-all">-</button>
                        <div className="flex-1 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center font-bold text-2xl text-black">
                           {stockAdjustment > 0 ? `+${stockAdjustment}` : stockAdjustment}
                        </div>
                        <button onClick={() => setStockAdjustment(prev => prev + 1)} className="w-14 h-14 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center font-bold text-2xl hover:border-black transition-all">+</button>
                     </div>
                     <button 
                        onClick={handleAdjustStock}
                        disabled={stockAdjustment === 0}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${stockAdjustment !== 0 ? 'bg-black text-white hover:bg-gray-800 shadow-lg' : 'bg-gray-100 text-gray-300'}`}
                     >
                        Confirm Adjustment
                     </button>
                  </div>
               </div>
            </div>

            {/* Price & Pricing Metrics */}
            <div className="bg-white border-2 border-gray-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm">
               <h3 className="font-bold text-2xl text-black">Pricing</h3>
               <div className="space-y-8">
                  <FloatingInput label="Regular Price" type="number" prefix="₦" value={formData.price} onChange={(e: any) => updateData({ price: parseFloat(e.target.value) || 0 })} />
                  <FloatingInput label="Cost Price" type="number" prefix="₦" value={formData.costPrice || 0} onChange={(e: any) => updateData({ costPrice: parseFloat(e.target.value) || 0 })} />
                  <div className="p-6 bg-indigo-50 rounded-3xl border-2 border-indigo-100">
                     <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">Estimated Profit</p>
                     <p className="text-3xl font-bold text-indigo-700">₦{((formData.price || 0) - (formData.costPrice || 0)).toLocaleString()}</p>
                     <p className="text-xs text-indigo-400 font-bold mt-2 uppercase tracking-tight">Margin: {formData.price ? Math.round(((formData.price - (formData.costPrice || 0)) / formData.price) * 100) : 0}%</p>
                  </div>
               </div>
            </div>

            {/* Organization */}
            <div className="bg-white border-2 border-gray-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm text-black">
               <h3 className="font-bold text-2xl">Organization</h3>
               <div className="space-y-6">
                  <FloatingInput label="Category" value={formData.category} onChange={(e: any) => updateData({ category: e.target.value })} />
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-gray-500 ml-4 block uppercase tracking-widest">Tags</label>
                     <input 
                      type="text"
                      className="w-full border-2 border-gray-200 rounded-2xl p-4 text-base font-bold outline-none focus:border-black transition-all"
                      placeholder="e.g. Featured, Sale"
                      value={formData.tags?.join(', ')}
                      onChange={(e) => updateData({ tags: e.target.value.split(',').map(t => t.trim()) })}
                     />
                  </div>
               </div>
            </div>

            {/* SEO & Visibility */}
            <div className="bg-white border-2 border-gray-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm text-black">
               <h3 className="font-bold text-2xl">SEO & Social</h3>
               <div className="space-y-8">
                  <FloatingInput label="Meta Title" value={formData.seo?.title || (formData.seo as any)?.metaTitle || ""} onChange={(e: any) => updateSEO({ title: e.target.value })} />
                  <FloatingInput label="Meta Description" value={formData.seo?.description || (formData.seo as any)?.metaDescription || ""} onChange={(e: any) => updateSEO({ description: e.target.value })} />
                  <FloatingInput label="Search Slug" value={formData.seo?.slug || formData.slug || ""} onChange={(e: any) => updateSEO({ slug: e.target.value })} />
                  
                  <div className="pt-6 border-t-2 border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Public Listing</p>
                      <p className="text-sm text-gray-400 font-medium">Toggle search engine indexing</p>
                    </div>
                    <button 
                      onClick={() => updateData({ isPublished: !formData.isPublished })}
                      className={`w-16 h-10 rounded-full transition-all relative ${formData.isPublished ? 'bg-black' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all shadow-sm ${formData.isPublished ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:ml-[280px] bg-white/90 backdrop-blur-md border-t-2 border-gray-200 p-6 md:p-10 z-50 flex items-center justify-between shadow-[0_-20px_60px_rgba(0,0,0,0.05)]">
         <div className="hidden sm:block">
            {error ? (
              <span className="text-red-500 font-bold bg-red-50 px-6 py-3 rounded-2xl border-2 border-red-100 shadow-sm">{error}</span>
            ) : (
              <span className="text-gray-400 font-bold italic text-xl">Updates are synced with backend</span>
            )}
         </div>
         <div className="flex gap-4 w-full sm:w-auto justify-end">
            <button onClick={() => window.location.reload()} className="text-gray-500 font-bold text-xl px-10 py-5 hover:bg-gray-50 border-2 border-transparent hover:border-gray-200 rounded-[1.5rem] transition-all">
               Discard
            </button>
            <button 
              onClick={handleUpdate}
              disabled={isSaving}
              className={`bg-black text-white px-16 py-6 justify-center flex rounded-[1.5rem] text-2xl font-bold hover:bg-gray-800 transition-all shadow-2xl shadow-black/10 min-w-[300px] ${isSaving ? 'opacity-50' : ''}`}
            >
              {isSaving ? 'Syncing...' : 'Save All Changes'}
            </button>
         </div>
      </div>
    </div>
  );
}
