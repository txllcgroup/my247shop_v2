"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductService, ProductData, ProductVariant } from '../productService';

import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  const percentage = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div className="w-full h-1 bg-gray-200 fixed bottom-[88px] left-0 md:left-[280px] md:w-[calc(100%-280px)] z-50">
      <div
        className="h-full bg-black transition-all duration-500 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const FloatingInput = ({ label, placeholder, type = "text", value, onChange, prefix }: any) => (
  <div className="relative w-full">
    {prefix && (
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400 z-10">
        {prefix}
      </div>
    )}
    <input
      type={type}
      id={label}
      value={value}
      onChange={onChange}
      className={`peer w-full border-2 border-gray-200 rounded-2xl pb-3 pt-7 text-lg font-semibold focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder-transparent ${prefix ? 'pl-10' : 'pl-5'}`}
      placeholder={placeholder}
    />
    <label
      htmlFor={label}
      className={`absolute transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:font-medium peer-focus:top-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-black cursor-text ${prefix ? 'left-10' : 'left-5'} ${value || type === 'number' ? 'top-2.5 text-xs font-semibold text-gray-500' : 'top-5 text-base font-medium text-gray-400'}`}
    >
      {label}
    </label>
  </div>
);

const StepLayout = ({ title, description, children }: any) => (
  <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-6 text-center leading-[1.15]">{title}</h1>
    {description && <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 text-center max-w-xl leading-relaxed">{description}</p>}
    <div className="w-full max-w-xl flex flex-col gap-6">
      {children}
    </div>
  </div>
);

// --- Form Steps ---

const Step1Basics = ({ formData, updateData }: any) => (
  <StepLayout title="The Basics" description="Start with the most important details of your product.">
    <FloatingInput label="Product Name" placeholder="e.g. Men's Leather Jacket" value={formData.name} onChange={(e: any) => updateData({ name: e.target.value })} />
    <FloatingInput label="Category" placeholder="e.g. Clothing, Electronics" value={formData.category} onChange={(e: any) => updateData({ category: e.target.value })} />
    <FloatingInput label="SKU" placeholder="e.g. BLA-JACKET-001" value={formData.sku} onChange={(e: any) => updateData({ sku: e.target.value })} />
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-500 ml-2">Tags (comma separated)</label>
      <input
        className="w-full border-2 border-gray-200 rounded-2xl p-5 text-lg font-semibold focus:outline-none focus:border-black transition-colors"
        placeholder="e.g. featured, new, winter"
        value={formData.tags.join(', ')}
        onChange={(e) => updateData({ tags: e.target.value.split(',').map(t => t.trim()) })}
      />
    </div>
  </StepLayout>
);

const Step2Pricing = ({ formData, updateData }: any) => (
  <StepLayout title="Pricing & Inventory" description="Set your prices and track how much you have in stock.">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <FloatingInput label="Price" type="number" prefix={formData.currency === 'NGN' ? '₦' : '$'} value={formData.price} onChange={(e: any) => updateData({ price: parseFloat(e.target.value) || 0 })} />
      <FloatingInput label="Compare at Price" type="number" prefix={formData.currency === 'NGN' ? '₦' : '$'} value={formData.compareAtPrice} onChange={(e: any) => updateData({ compareAtPrice: parseFloat(e.target.value) || 0 })} />
    </div>
    <FloatingInput label="Cost per item" type="number" prefix={formData.currency === 'NGN' ? '₦' : '$'} value={formData.costPrice} onChange={(e: any) => updateData({ costPrice: parseFloat(e.target.value) || 0 })} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
      <FloatingInput label="Stock Quantity" type="number" value={formData.stockQuantity} onChange={(e: any) => updateData({ stockQuantity: parseInt(e.target.value) || 0 })} />
      <FloatingInput label="Low Stock Threshold" type="number" value={formData.lowStockThreshold} onChange={(e: any) => updateData({ lowStockThreshold: parseInt(e.target.value) || 0 })} />
    </div>
  </StepLayout>
);

const Step3Content = ({ formData, updateData, updateSEO }: any) => (
  <StepLayout title="Content & SEO" description="Describe your product for customers and search engines.">
    <div className="space-y-2 w-full">
      <label className="text-sm font-semibold text-gray-500 ml-2">Short Description</label>
      <textarea
        className="w-full border-2 border-gray-200 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:border-black transition-colors h-24 resize-none"
        placeholder="Brief summary..."
        value={formData.shortDescription}
        onChange={(e) => updateData({ shortDescription: e.target.value })}
      />
    </div>
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center ml-2">
        <label className="text-sm font-semibold text-gray-500">Full Description</label>
        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">Generate with AI</button>
      </div>
      <textarea
        className="w-full border-2 border-gray-200 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:border-black transition-colors h-48 resize-none"
        placeholder="Tell the full story..."
        value={formData.description}
        onChange={(e) => updateData({ description: e.target.value })}
      />
    </div>
    <div className="pt-6 border-t-2 border-gray-100 space-y-4 w-full">
      <h3 className="font-bold text-lg text-black">Search Engine Optimization</h3>
      <FloatingInput label="SEO Title" value={formData.seo.title} onChange={(e: any) => updateSEO({ title: e.target.value })} />
      <FloatingInput label="SEO Slug" value={formData.seo.slug} onChange={(e: any) => updateSEO({ slug: e.target.value })} />
    </div>
  </StepLayout>
);

const Step4Media = ({ formData, updateData }: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    const file = e.target.files[0];

    try {
      const url = await ProductService.uploadImage(file);
      updateData({ images: [...formData.images, url] });
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <StepLayout title="Media Assets" description="Upload product photos to show your customers exactly what they're buying.">
      <label className="w-full border-2 border-dashed border-gray-300 rounded-[2.5rem] h-64 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 hover:border-black cursor-pointer transition-all group overflow-hidden relative">
        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <span className="font-bold text-black uppercase tracking-widest text-xs">Uploading...</span>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="font-bold text-black text-lg">Add Images</span>
            <span className="text-sm font-medium text-gray-400 mt-1">or drag and drop</span>
          </>
        )}
      </label>

      {uploadError && <p className="text-red-500 text-sm font-semibold text-center">{uploadError}</p>}

      <div className="grid grid-cols-3 gap-4 mt-6">
        {formData.images.map((url: string, i: number) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group shadow-sm">
            <img src={url} alt={`Product ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <button
              onClick={() => {
                const newUrls = [...formData.images];
                newUrls.splice(i, 1);
                updateData({ images: newUrls });
              }}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-black rounded-full p-2 hover:bg-black hover:text-white transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </StepLayout>
  );
};

const Step5Review = ({ formData, updateData, isSubmitting }: any) => (
  <StepLayout title="Final Review" description="Review your product details before publishing to your store.">
    <div className="w-full bg-gray-50 border-2 border-gray-200 rounded-[2.5rem] p-8 space-y-6 shadow-inner">
      <div className="flex items-start gap-6 border-b-2 border-gray-100 pb-6">
        <div className="w-24 h-24 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden flex-shrink-0">
          {formData.images[0] ? (
            <img src={formData.images[0]} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-2xl text-black truncate">{formData.name || "Unnamed Product"}</h3>
          <p className="text-gray-500 font-semibold text-lg">{formData.currency} {formData.price}</p>
          <div className="flex gap-2 mt-2">
            <span className="bg-white border-2 border-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 tracking-wide uppercase">{formData.category || "General"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">SKU</label>
          <span className="font-bold text-black">{formData.sku || "N/A"}</span>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Stock</label>
          <span className="font-bold text-black">{formData.stockQuantity} units</span>
        </div>
      </div>

      <div className="pt-6 border-t-2 border-gray-100">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Product Visibility</label>
        <div className="flex gap-4">
          <button
            onClick={() => updateData({ isPublished: false })}
            className={`flex-1 p-4 rounded-2xl border-2 font-bold transition-all ${!formData.isPublished ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-gray-500 border-gray-100 hover:border-black'}`}
          >
            Draft
          </button>
          <button
            onClick={() => updateData({ isPublished: true })}
            className={`flex-1 p-4 rounded-2xl border-2 font-bold transition-all ${formData.isPublished ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-gray-500 border-gray-100 hover:border-black'}`}
          >
            Published
          </button>
        </div>
      </div>
    </div>
  </StepLayout>
);

const SuccessScreen = ({ product, storeName }: { product: any, storeName: string }) => {
  const { width, height } = useWindowSize();
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const productUrl = `https://my247v2.airshop247.com/s/${storeName?.toLowerCase().replace(/\s+/g, '-')}/${product.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out our new product: ${product.name}`,
          url: productUrl,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      // Fallback to WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(`Check out our new product: ${product.name} ${productUrl}`)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.1} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full text-center space-y-10 py-12"
      >
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-black/20">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-black mb-4">Product Live!</h1>
          <p className="text-xl text-gray-500 font-medium">Your product has been added and is ready for the world.</p>
        </div>

        <div className="bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] p-8 space-y-6">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl border-2 border-white bg-white overflow-hidden shadow-sm flex-shrink-0">
                 {product.images?.[0] ? (
                   <img src={product.images[0]} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                     <svg className="w-8 h-8 font-thin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   </div>
                 )}
              </div>
              <div className="text-left flex-1 min-w-0">
                 <h3 className="font-bold text-2xl text-black truncate">{product.name}</h3>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-emerald-600 font-bold">Active</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-gray-500 font-semibold">{product.currency} {product.price}</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={handleShare}
                className="flex-1 bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share Product
              </button>
              <button 
                onClick={handleCopy}
                className={`flex-1 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-gray-200 text-black hover:border-black'}`}
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copy Link
                  </>
                )}
              </button>
           </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 max-w-sm mx-auto">
          <button 
             onClick={() => {
               window.location.reload();
             }}
             className="w-full text-black font-bold text-lg hover:bg-gray-50 py-4 rounded-2xl transition-all"
          >
            Add Another Product
          </button>
          <button 
             onClick={() => router.push('/dashboard/products')}
             className="w-full text-gray-400 font-semibold hover:text-black transition-colors"
          >
            Go to Products List
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---

export default function AddProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductData>({
    storeId: "",
    name: "",
    description: "",
    shortDescription: "",
    sku: "",
    category: "",
    tags: [],
    price: 0,
    compareAtPrice: 0,
    costPrice: 0,
    currency: "NGN",
    stockQuantity: 0,
    lowStockThreshold: 5,
    images: [],
    variants: [],
    isPublished: false,
    seo: {
      title: "",
      description: "",
      slug: ""
    }
  });

  useEffect(() => {
    // Get storeId and currency from individual storage items or profile
    const storedStoreId = localStorage.getItem('storeId');
    const storedCurrency = localStorage.getItem('currency');
    const storedStoreName = localStorage.getItem('storeName');
    const profileStr = localStorage.getItem('profile');

    let storeId = storedStoreId || "";
    let currency = storedCurrency || "NGN";
    let name = storedStoreName || "";

    if (!storeId && profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        storeId = profile.storeId || profile.id || "";
        currency = profile.currency || currency;
        name = profile.storeName || name;
      } catch (e) {
        console.error("Error parsing profile for storeId", e);
      }
    }

    if (name) setStoreName(name);

    if (storeId) {
      setFormData(prev => ({
        ...prev,
        storeId,
        currency
      }));
    }
  }, []);

  const updateData = (updates: Partial<ProductData>) => setFormData(prev => ({ ...prev, ...updates }));
  const updateSEO = (updates: Partial<ProductData['seo']>) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ...updates } }));

  const steps = [
    <Step1Basics key="s1" formData={formData} updateData={updateData} />,
    <Step2Pricing key="s2" formData={formData} updateData={updateData} />,
    <Step3Content key="s3" formData={formData} updateData={updateData} updateSEO={updateSEO} />,
    <Step4Media key="s4" formData={formData} updateData={updateData} />,
    <Step5Review key="s5" formData={formData} updateData={updateData} isSubmitting={isSubmitting} />
  ];

  const validateStep = () => {
    setError(null);
    if (step === 0) {
      if (!formData.name.trim()) return "Product Name is required.";
      if (!formData.category.trim()) return "Category is required.";
    }
    if (step === 1) {
      if (formData.price <= 0) return "Valid Price is required.";
    }
    if (step === 3) {
      if (formData.images.length === 0) return "Please upload at least one image.";
    }
    return null;
  };

  const handleNext = async () => {
    const valetErr = validateStep();
    if (valetErr) {
      setError(valetErr);
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Final Submit
      setIsSubmitting(true);
      setError(null);
      try {
        // Sync SEO defaults if empty
        const finalData = { ...formData };
        if (!finalData.seo.title) finalData.seo.title = finalData.name;
        if (!finalData.seo.slug) finalData.seo.slug = finalData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (!finalData.seo.description) finalData.seo.description = finalData.shortDescription || finalData.name;
        
        const response = await ProductService.createProduct(finalData);
        if (response.success) {
          setCreatedProduct(response.data);
          setIsSuccess(true);
          window.scrollTo(0, 0);
        } else {
          throw new Error(response.message || "Failed to create product");
        }
      } catch (err: any) {
        setError(err.message || "Failed to create product");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    } else {
      router.push('/dashboard/products');
    }
  };

  if (isSuccess && createdProduct) {
    return <SuccessScreen product={createdProduct} storeName={storeName} />;
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-12 flex items-center justify-between">
        <button onClick={handleBack} className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center hover:border-black transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="w-12 h-12"></div>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-16 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </main>

      <ProgressBar currentStep={step} totalSteps={steps.length} />

      {/* Footer Bar */}
      <footer className="fixed bottom-0 left-0 right-0 md:ml-[280px] bg-white/80 backdrop-blur-md border-t-2 border-gray-100 p-6 md:p-8 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block">
            {error ? (
              <span className="text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-full border border-red-100 animate-in fade-in slide-in-from-left-2">{error}</span>
            ) : (
              <span className="text-gray-400 font-semibold italic text-sm">Draft automatically saved</span>
            )}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {error && <span className="sm:hidden text-red-500 font-bold text-xs flex-1 text-center">{error}</span>}
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className={`bg-black text-white px-10 py-4 rounded-[1.25rem] text-lg font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 w-full sm:w-auto ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                step === steps.length - 1 ? 'Publish Product' : 'Continue'
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
