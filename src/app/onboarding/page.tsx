"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { OnboardingService } from './onboardingService';

// --- Shared UI Components ---

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  const percentage = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div className="w-full h-1 bg-gray-200 fixed bottom-[72px] left-0 z-50">
      <div
        className="h-full bg-black transition-all duration-500 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const Header = () => (
  <header className="fixed top-0 w-full bg-white z-50 px-6 md:px-12 py-6 flex items-center justify-between">
    <div className="text-xl font-medium tracking-tight text-black flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
      <img src="/my247shop-logo.png" alt="My247Shop Logo" className="h-8 w-auto object-contain" />
    </div>
    <div className="flex items-center gap-2 md:gap-4">
      <button className="text-sm font-semibold text-black hover:bg-gray-100 px-4 py-2 rounded-full transition-colors hidden sm:block">
        Questions?
      </button>
      <button className="text-sm font-semibold text-black hover:bg-gray-100 px-4 py-2 rounded-full transition-colors border border-gray-200">
        Save & exit
      </button>
    </div>
  </header>
);

const Footer = ({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
  error
}: {
  onBack: () => void,
  onNext: () => void,
  isFirstStep: boolean,
  isLastStep: boolean,
  isSubmitting: boolean,
  error?: string | null
}) => (
  <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 z-50 h-[72px] px-6 md:px-12 flex items-center justify-between">
    <div>
      {!isFirstStep && (
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="text-base font-semibold text-black underline underline-offset-2 hover:text-gray-600 transition-colors px-2 py-2 disabled:opacity-50"
        >
          Back
        </button>
      )}
    </div>
    <div className="flex items-center gap-4">
      {error && <span className="text-red-500 text-sm font-semibold animate-in fade-in slide-in-from-right-2">{error}</span>}
      <button
        onClick={onNext}
        disabled={isSubmitting}
        className={`bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? "Loading..." : (isLastStep ? "Launch Store" : "Next")}
      </button>
    </div>
  </footer>
);

const OptionCard = ({
  title,
  description,
  icon,
  selected,
  onClick
}: {
  title: string,
  description?: string,
  icon?: React.ReactNode,
  selected: boolean,
  onClick: () => void
}) => (
  <div
    onClick={onClick}
    className={`border-2 rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 ${selected ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-black/50'
      }`}
  >
    <div className="flex justify-between items-start mb-4">
      <span className="font-semibold text-lg text-black">{title}</span>
      {icon && <span className="text-gray-500">{icon}</span>}
    </div>
    {description && <p className="text-[0.95rem] text-gray-500 font-medium leading-relaxed">{description}</p>}
  </div>
);

const FloatingInput = ({ label, placeholder, type = "text", value, onChange }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        id={label}
        value={value}
        onChange={onChange}
        className={`peer w-full border-2 border-gray-200 rounded-2xl px-5 pb-3 pt-7 text-lg focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder-transparent ${isPassword ? 'pr-12' : ''}`}
        placeholder={placeholder}
      />
      <label
        htmlFor={label}
        className="absolute left-5 top-2.5 text-xs font-semibold text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:font-medium peer-focus:top-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-black cursor-text"
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
        >
          {showPassword ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
          )}
        </button>
      )}
    </div>
  );
};

const AIBanner = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-8 max-w-xl w-full mx-auto">
    <div className="flex items-start gap-4 p-5 bg-black/5 border border-black/10 rounded-2xl">
      <svg className="w-6 h-6 text-black shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      <div className="text-[0.95rem] font-medium text-black leading-relaxed">{children}</div>
    </div>
  </div>
);

// --- Progressive Steps ---

const StepLayout = ({ title, description, children, aiBanner }: any) => (
  <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
    <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-6 text-center leading-[1.15]">{title}</h1>
    {description && <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 text-center max-w-xl leading-relaxed">{description}</p>}
    <div className="w-full max-w-xl flex flex-col gap-6">
      {children}
    </div>
    {aiBanner && <AIBanner>{aiBanner}</AIBanner>}
  </div>
);

const Step1Account = ({ formData, updateAccount }: any) => (
  <StepLayout
    title="Create your account"
    description="Enter your email to get started, or sign up with a social account."
  >
    <FloatingInput
      label="Email address"
      placeholder="name@example.com"
      type="email"
      value={formData.account.email}
      onChange={(e: any) => updateAccount({ email: e.target.value })}
    />

  
  </StepLayout>
);

const Step2Details = ({ formData, updateAccount }: any) => (
  <StepLayout title="Finish setting up your account" description="We need a little more info to secure your account and get to know you.">
    <FloatingInput label="Full Name" placeholder="Jane Doe" value={formData.account.fullName} onChange={(e: any) => updateAccount({ fullName: e.target.value })} />
    <FloatingInput label="Password" placeholder="••••••••" type="password" value={formData.account.password} onChange={(e: any) => updateAccount({ password: e.target.value })} />
    <FloatingInput label="Phone Number (optional)" placeholder="+1 (555) 000-0000" type="tel" value={formData.account.phone} onChange={(e: any) => updateAccount({ phone: e.target.value })} />
  </StepLayout>
);

const Step3StoreName = ({ formData, updateStore }: any) => (
  <StepLayout
    title="What's your store's name?"
    description="This will be the main brand name your customers see. You can change it anytime."
    aiBanner={
      <>
        AI suggests: <strong>"My247 Fashion"</strong> based on current trending names.<br />
        <button className="mt-2 text-sm font-semibold underline underline-offset-4 hover:text-gray-600 transition-colors">Apply suggestion</button>
      </>
    }
  >
    <FloatingInput label="Store Name" placeholder="e.g. My247 Fashion" value={formData.store.name} onChange={(e: any) => updateStore({ name: e.target.value })} />
  </StepLayout>
);

const Step5BusinessType = ({ formData, updateStore }: any) => {
  const types = [
    { label: "Individual", value: "Individual" },
    { label: "Small Business", value: "SmallBusiness" },
    { label: "Company", value: "Company" },
    { label: "Brand", value: "Brand" }
  ];

  return (
    <StepLayout title="What type of business are you?" description="This helps us tailor your experience and recommendations.">
      <div className="grid sm:grid-cols-2 gap-4 w-full">
        {types.map((type, i) => (
          <div
            key={i}
            onClick={() => updateStore({ businessType: type.value })}
            className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${formData.store.businessType === type.value ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-black/50'
              }`}
          >
            <span className="font-semibold text-lg text-black">{type.label}</span>
          </div>
        ))}
      </div>
    </StepLayout>
  );
};

const Step6Location = ({ formData, updateStore }: any) => (
  <StepLayout title="Where are you located?" description="This determines your default shipping regions and currency format.">
    <div className="w-full">
      <label className="block text-sm font-semibold text-black mb-3">Country / Region</label>
      <select
        value={formData.store.country}
        onChange={(e) => updateStore({ country: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:border-black bg-white appearance-none cursor-pointer hover:border-black/50 transition-colors"
      >
        <option value="United States">United States</option>
        <option value="United Kingdom">United Kingdom</option>
        <option value="Nigeria">Nigeria</option>
      </select>
    </div>
    <div className="w-full mt-4">
      <label className="block text-sm font-semibold text-black mb-3">Primary Currency</label>
      <select
        value={formData.store.currency}
        onChange={(e) => updateStore({ currency: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:border-black bg-white appearance-none cursor-pointer hover:border-black/50 transition-colors"
      >
        <option value="USD">USD ($)</option>
        <option value="GBP">GBP (£)</option>
        <option value="NGN">NGN (₦)</option>
        <option value="EUR">EUR (€)</option>
      </select>
    </div>
  </StepLayout>
);

const Step7Theme = ({ formData, updateStore }: any) => {
  const themes = [
    { title: "Minimal", desc: "Clean lines and ample whitespace.", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg> },
    { title: "Fashion", desc: "Large imagery and elegant typography.", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { title: "Electronics", desc: "Grid layouts and technical specs focus.", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { title: "Beauty", desc: "Soft colors and product-centric grid.", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg> },
  ];

  return (
    <StepLayout
      title="Choose a starting theme"
      description="You can fully customize this later."
      aiBanner="AI recommends 'Fashion Store' based on your previous selections."
    >
      <div className="grid sm:grid-cols-2 gap-4 w-full">
        {themes.map((theme, i) => (
          <OptionCard
            key={i}
            title={theme.title}
            description={theme.desc}
            icon={theme.icon}
            selected={formData.store.theme === theme.title}
            onClick={() => updateStore({ theme: theme.title })}
          />
        ))}
      </div>
    </StepLayout>
  );
};

const Step8Contact = ({ formData, updateContact }: any) => (
  <StepLayout title="How can customers reach you?" description="This information will be displayed on your store's contact page and receipts.">
    <FloatingInput label="Support Email" placeholder="support@example.com" type="email" value={formData.contact.supportEmail} onChange={(e: any) => updateContact({ supportEmail: e.target.value })} />
    <FloatingInput label="Support Phone (Optional)" placeholder="+1 (555) 123-4567" type="tel" value={formData.contact.supportPhone} onChange={(e: any) => updateContact({ supportPhone: e.target.value })} />
  </StepLayout>
);

const Step9Address = ({ formData, updateAddress }: any) => (
  <StepLayout title="Business physical address" description="Required for shipping calculation, taxes, and legal compliance.">
    <FloatingInput label="Street Address" placeholder="123 Commerce St" value={formData.contact.address.street} onChange={(e: any) => updateAddress({ street: e.target.value })} />
    {/* Optional Address Line 2 */}
    <FloatingInput label="Apt, Suite, Bldg (Optional)" placeholder="Suite 100" />
    <div className="grid grid-cols-2 gap-4 w-full">
      <FloatingInput label="City" placeholder="New York" value={formData.contact.address.city} onChange={(e: any) => updateAddress({ city: e.target.value })} />
      <FloatingInput label="State / Province" placeholder="NY" value={formData.contact.address.state} onChange={(e: any) => updateAddress({ state: e.target.value })} />
    </div>
    <FloatingInput label="Zip / Postal Code" placeholder="10001" value={formData.contact.address.zipCode} onChange={(e: any) => updateAddress({ zipCode: e.target.value })} />
  </StepLayout>
);

const Step11Payments = ({ formData, updatePayments }: any) => {
  const toggleSelection = (providerId: string) => {
    const selected = formData.payments.selectedProviders;
    if (selected.includes(providerId)) {
      updatePayments({ selectedProviders: selected.filter((id: string) => id !== providerId) });
    } else {
      updatePayments({ selectedProviders: [...selected, providerId] });
    }
  };

  const providers = [
    {
      id: "NOLimit",
      title: "No limit wallet",
      desc: "The fastest, most flexible way to get paid.",
      time: "Instant Payouts",
      fast: true,
      highlight: true,
      benefits: ["Eligible for Pay-as-you-go features", "Unlocks automatic Business Funding"]
    },
    {
      id: "Paystack",
      title: "Paystack",
      desc: "Cards, Bank Transfers, USSD in Africa.",
      time: "24-48 hrs",
      fast: false
    },
    {
      id: "Flutterwave",
      title: "Flutterwave",
      desc: "Global payments for local businesses.",
      time: "24-48 hrs",
      fast: false
    }
  ];

  return (
    <StepLayout title="Setup Payments" description="Connect payment methods to start receiving payments instantly.">
      <div className="space-y-4 w-full">
        {providers.map((p, i) => (
          <div
            key={i}
            onClick={() => toggleSelection(p.id)}
            className={`flex flex-col md:flex-row md:items-start justify-between p-6 border-2 rounded-2xl hover:border-black transition-all cursor-pointer relative overflow-hidden ${formData.payments.selectedProviders.includes(p.id)
                ? (p.highlight ? 'border-indigo-600 bg-indigo-50/30' : 'border-black bg-gray-50')
                : (p.highlight ? 'border-indigo-200 bg-white hover:border-indigo-400' : 'border-gray-200 bg-white')
              }`}
          >
            {p.highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>}

            <div className="flex-1 relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className={`font-semibold text-lg ${p.highlight ? 'text-indigo-950 font-bold' : 'text-black'}`}>{p.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-widest border-2 ${p.fast ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {p.time}
                </span>
                {p.highlight && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700 border-2 border-indigo-200 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    Recommended
                  </span>
                )}
              </div>
              <p className={`text-[0.95rem] font-medium mb-3 ${p.highlight ? 'text-indigo-800/80' : 'text-gray-500'}`}>{p.desc}</p>

              {p.benefits && (
                <ul className="space-y-1.5 mt-2">
                  {p.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                      <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`mt-4 md:mt-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 relative z-10 ${formData.payments.selectedProviders.includes(p.id)
                ? (p.highlight ? 'border-indigo-600 bg-indigo-600' : 'border-black bg-black')
                : (p.highlight ? 'border-indigo-300 bg-white' : 'border-gray-300 bg-white')
              }`}>
              {formData.payments.selectedProviders.includes(p.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
          </div>
        ))}
      </div>
    </StepLayout>
  );
};

const Step13ProductBasics = ({ formData, updateInitialProduct }: any) => (
  <StepLayout title="List your first product" description="Start building your catalog. Give your product a name and set its price.">
    <FloatingInput label="Product Name" placeholder="Classic Leather Bag" value={formData.initialProduct.name} onChange={(e: any) => updateInitialProduct({ name: e.target.value })} />
    <div className="relative w-full flex items-center">
      <div className="bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-2xl p-5 text-lg font-medium text-gray-400">
        $
      </div>
      <input
        type="number"
        value={formData.initialProduct.price}
        onChange={(e) => updateInitialProduct({ price: parseFloat(e.target.value) || "" })}
        className="w-full border-2 border-gray-200 rounded-r-2xl p-5 text-lg font-medium focus:outline-none focus:border-black focus:ring-0 transition-colors focus:z-10"
        placeholder="45.00"
      />
    </div>
  </StepLayout>
);

const Step14ProductDescription = ({ formData, updateInitialProduct }: any) => (
  <StepLayout
    title="Describe your product"
    description="Tell customers what makes this product great."
    aiBanner={
      <div className="flex flex-col gap-2">
        <span>AI Generated description:</span>
        <span className="italic text-gray-600 font-normal">"A premium leather bag designed for everyday elegance and durability. Crafted from authentic full-grain leather with brass hardware."</span>
        <button className="underline underline-offset-4 font-semibold text-sm self-start hover:text-gray-600 transition-colors">Use this description</button>
      </div>
    }
  >
    <div className="w-full relative">
      <textarea
        className="w-full border-2 border-gray-200 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:border-black focus:ring-0 transition-colors h-48 resize-none"
        placeholder="Type your product description here..."
        value={formData.initialProduct.description}
        onChange={(e) => updateInitialProduct({ description: e.target.value })}
      />
      <button className="absolute bottom-5 right-5 text-sm font-semibold text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        Generate
      </button>
    </div>
  </StepLayout>
);

const Step15ProductPhotos = ({ formData, updateInitialProduct }: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    const file = e.target.files[0];

    try {
      const url = await OnboardingService.uploadImage(file);
      updateInitialProduct({ imageUrls: [...formData.initialProduct.imageUrls, url] });
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <StepLayout title="Add product photos" description="Upload high-quality images to show off your product to customers.">
      <label className="w-full border-2 border-dashed border-gray-300 rounded-3xl h-72 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 hover:border-black/30 transition-all cursor-pointer relative overflow-hidden">
        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
        {isUploading ? (
          <span className="font-semibold text-lg text-black mb-1">Uploading...</span>
        ) : (
          <>
            <svg className="w-10 h-10 mb-4 text-black/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            <span className="font-semibold text-lg text-black mb-1">Click to upload</span>
            <span className="text-sm font-medium">or drag and drop</span>
          </>
        )}
      </label>

      {uploadError && <p className="text-red-500 text-sm font-medium text-center">{uploadError}</p>}

      {formData.initialProduct.imageUrls.length > 0 && (
        <div className="flex gap-4 mt-6 overflow-x-auto p-2">
          {formData.initialProduct.imageUrls.map((url: string, i: number) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shrink-0">
              <img src={url} alt={`Product ${i}`} className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  const newUrls = [...formData.initialProduct.imageUrls];
                  newUrls.splice(i, 1);
                  updateInitialProduct({ imageUrls: newUrls });
                }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </StepLayout>
  );
};

const Step16Preview = ({ formData }: any) => (
  <StepLayout title="Store Preview" description="Here's a sneak peek of how your storefront is looking.">
    <div className="w-full bg-gray-100 rounded-[2rem] p-3 md:p-8 border border-gray-200 shadow-inner">
      <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 aspect-[16/10] flex flex-col items-center justify-center">
        {/* Simulated Store UI */}
        <div className="w-full h-14 border-b border-gray-100 flex items-center px-8 justify-between">
          <div className="font-bold text-xl tracking-tight">{formData.store.name || "My Store"}</div>
          <div className="flex gap-6">
            <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
            <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 rounded-full bg-gray-100"></div>
          </div>
        </div>
        <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden bg-gray-50">
          {/* Mock product card */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-64 absolute mt-4">
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {formData.initialProduct.imageUrls[0] ? (
                <img src={formData.initialProduct.imageUrls[0]} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
            </div>
            <div className="w-3/4 h-3 bg-gray-800 rounded-full mb-2"></div>
            <div className="w-1/3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </StepLayout>
);

const Step17Launch = ({ formData }: any) => {
  const storeSlug = formData.store.name?.replace(/ /g, '%20') || 'MyStore';
  const storeUrl = `https://my247.shop/store/${storeSlug}`;
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
      <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center mb-10 shadow-xl shadow-black/20">
        <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-4xl md:text-5xl leading-[1.15] font-medium text-black mb-6">You're ready to launch!</h1>
      <p className="text-xl text-gray-500 font-medium mb-12 max-w-md leading-relaxed">
        Your store is live at <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="text-black font-bold underline underline-offset-4 hover:text-gray-600 transition-colors">my247.shop/store/{formData.store.name}</a>
      </p>
      <div className="w-full space-y-4">
        <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
            <span className="font-semibold text-black">1</span>
          </div>
          <span className="text-lg font-medium text-black">Your storefront becomes public</span>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
            <span className="font-semibold text-black">2</span>
          </div>
          <span className="text-lg font-medium text-black">Customers can add items to cart and checkout</span>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
            <span className="font-semibold text-black">3</span>
          </div>
          <span className="text-lg font-medium text-black">You can continue refining with AI tools</span>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowSize();

  const [formData, setFormData] = useState({
    account: { email: "", fullName: "", password: "", phone: "" },
    store: { name: "", businessType: "SmallBusiness", country: "United States", currency: "USD", theme: "Fashion" },
    contact: { supportEmail: "", supportPhone: "", address: { street: "", city: "", state: "", zipCode: "" } },
    payments: { selectedProviders: ["NOLimit"] as string[] },
    initialProduct: { name: "", price: "", description: "", imageUrls: [] as string[] }
  });

  const updateAccount = (updates: any) => setFormData(prev => ({ ...prev, account: { ...prev.account, ...updates } }));
  const updateStore = (updates: any) => setFormData(prev => ({ ...prev, store: { ...prev.store, ...updates } }));
  const updateContact = (updates: any) => setFormData(prev => ({ ...prev, contact: { ...prev.contact, ...updates } }));
  const updateAddress = (updates: any) => setFormData(prev => ({ ...prev, contact: { ...prev.contact, address: { ...prev.contact.address, ...updates } } }));
  const updatePayments = (updates: any) => setFormData(prev => ({ ...prev, payments: { ...prev.payments, ...updates } }));
  const updateInitialProduct = (updates: any) => setFormData(prev => ({ ...prev, initialProduct: { ...prev.initialProduct, ...updates } }));

  const steps = [
    <Step1Account key="step1" formData={formData} updateAccount={updateAccount} />,
    <Step2Details key="step2" formData={formData} updateAccount={updateAccount} />,
    <Step3StoreName key="step3" formData={formData} updateStore={updateStore} />,
    <Step5BusinessType key="step5" formData={formData} updateStore={updateStore} />,
    <Step6Location key="step6" formData={formData} updateStore={updateStore} />,
    <Step7Theme key="step7" formData={formData} updateStore={updateStore} />,
    <Step8Contact key="step8" formData={formData} updateContact={updateContact} />,
    <Step9Address key="step9" formData={formData} updateAddress={updateAddress} />,
    <Step11Payments key="step11" formData={formData} updatePayments={updatePayments} />,
    <Step13ProductBasics key="step13" formData={formData} updateInitialProduct={updateInitialProduct} />,
    <Step14ProductDescription key="step14" formData={formData} updateInitialProduct={updateInitialProduct} />,
    <Step15ProductPhotos key="step15" formData={formData} updateInitialProduct={updateInitialProduct} />,
    <Step16Preview key="step16" formData={formData} />,
    <Step17Launch key="step17" formData={formData} />
  ];

  const totalSteps = steps.length; // 14 steps

  const validateStep = (currentStep: number) => {
    setError(null);
    switch (currentStep) {
      case 0:
        if (!formData.account.email || !formData.account.email.includes('@')) {
          setError("Please enter a valid email address.");
          return false;
        }
        break;
      case 1:
        if (!formData.account.fullName.trim()) {
          setError("Full Name is required.");
          return false;
        }
        if (formData.account.password.length < 8) {
          setError("Password must be at least 8 characters.");
          return false;
        }
        break;
      case 2:
        if (!formData.store.name.trim()) {
          setError("Store Name is required.");
          return false;
        }
        break;
      case 6: // Step8Contact
        if (!formData.contact.supportEmail || !formData.contact.supportEmail.includes('@')) {
          setError("Please enter a valid support email address.");
          return false;
        }
        break;
      case 7: // Step9Address
        if (!formData.contact.address.street.trim() || !formData.contact.address.city.trim() || !formData.contact.address.state.trim() || !formData.contact.address.zipCode.trim()) {
          setError("Please fill out all required address fields.");
          return false;
        }
        break;
      case 8: // Step11Payments
        if (formData.payments.selectedProviders.length === 0) {
          setError("Please select at least one payment provider.");
          return false;
        }
        break;
      case 9: // Step13ProductBasics
        if (!formData.initialProduct.name.trim() || !formData.initialProduct.price) {
          setError("Product name and price are required.");
          return false;
        }
        break;
      case 10: // Step14ProductDescription
        if (!formData.initialProduct.description.trim()) {
          setError("Product description is required.");
          return false;
        }
        break;
      case 11: // Step15ProductPhotos
        if (formData.initialProduct.imageUrls.length === 0) {
          setError("Please upload at least one product photo.");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    // If we're on the Preview step (index 12), we submit.
    if (step === totalSteps - 2) {
      setIsSubmitting(true);
      setError(null);
      try {
        await OnboardingService.submitOnboarding(formData);
        setStep(step + 1);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Onboarding failed. Please try again.');
        alert('Onboarding failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Final Launch Action
      window.location.href = "/";
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col pt-24 pb-[72px] selection:bg-black selection:text-white">
      {/* LOUD CONFETTI TRIGGER */}
      {step === totalSteps - 1 && (
        <Confetti
          width={width}
          height={height}
          recycle={true}
          numberOfPieces={800}
          gravity={0.15}
          initialVelocityX={10}
          initialVelocityY={20}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100, pointerEvents: 'none' }}
        />
      )}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center w-full px-6 py-12 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </main>

      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      <Footer
        onBack={handleBack}
        onNext={handleNext}
        isFirstStep={step === 0}
        isLastStep={step === totalSteps - 1}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
