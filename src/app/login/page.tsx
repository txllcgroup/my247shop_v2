"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginService } from './loginService';

// --- Shared UI Components ---

const Header = () => (
  <header className="fixed top-0 w-full bg-white z-50 px-6 md:px-12 py-6 flex items-center justify-between">
    <div className="text-xl font-medium tracking-tight text-black flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
      <img src="/my247shop-logo.png" alt="My247Shop Logo" className="h-8 w-auto object-contain" />
    </div>
    <div className="flex items-center gap-2 md:gap-4">
      <button className="text-sm font-semibold text-black hover:bg-gray-100 px-4 py-2 rounded-full transition-colors hidden sm:block">
        Help
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
        className={`bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 ${isFirstStep ? 'ml-auto' : ''} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? "Loading..." : (isLastStep ? "Log In" : "Continue")}
      </button>
    </div>
  </footer>
);

const FloatingInput = ({ label, placeholder, type = "text", value, onChange }: any) => (
  <div className="relative w-full">
    <input
      type={type}
      id={label}
      value={value}
      onChange={onChange}
      className="peer w-full border-2 border-gray-200 rounded-2xl px-5 pb-3 pt-7 text-lg focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder-transparent"
      placeholder={placeholder}
    />
    <label
      htmlFor={label}
      className="absolute left-5 top-2.5 text-xs font-semibold text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:font-medium peer-focus:top-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-black cursor-text"
    >
      {label}
    </label>
  </div>
);

// --- Progressive Steps ---

const StepLayout = ({ title, description, children }: any) => (
  <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
    <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-6 text-center leading-[1.15]">{title}</h1>
    {description && <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 text-center max-w-xl leading-relaxed">{description}</p>}
    <div className="w-full max-w-xl flex flex-col gap-6">
      {children}
    </div>
  </div>
);

const Step1Email = ({ formData, updateData, onExternalLogin }: any) => (
  <StepLayout
    title="Log in to your store"
    description="Welcome back. Enter your email to continue."
  >
    <FloatingInput
      label="Email address"
      placeholder="name@example.com"
      type="email"
      value={formData.email}
      onChange={(e: any) => updateData({ email: e.target.value })}
    />

    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
      <div className="relative flex justify-center"><span className="bg-white px-4 text-sm font-semibold text-gray-500">or continue with</span></div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => onExternalLogin('Google')} className="flex items-center justify-center gap-3 w-full border-2 border-gray-200 rounded-2xl p-4 font-semibold text-lg text-black hover:bg-gray-50 hover:border-black transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
        Google
      </button>
      <button onClick={() => onExternalLogin('Apple')} className="flex items-center justify-center gap-3 w-full border-2 border-gray-200 rounded-2xl p-4 font-semibold text-lg text-black hover:bg-gray-50 hover:border-black transition-colors">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.7 3.59-.72 2.37-.04 3.66 1.09 4.41 2.2-2.03 1.25-1.63 4.14.33 5.06-.61 1.95-1.6 3.86-3.41 5.63zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
        Apple
      </button>
    </div>
  </StepLayout>
);

const Step2Password = ({ formData, updateData }: any) => (
  <StepLayout
    title="Enter your password"
    description="To confirm your identity, use the password associated with this email."
  >
    <div className="flex flex-col gap-2 relative">
      <FloatingInput
        label="Password"
        placeholder="•••••••••"
        type="password"
        value={formData.password}
        onChange={(e: any) => updateData({ password: e.target.value })}
      />
      <button className="text-sm font-semibold text-black underline underline-offset-4 hover:text-gray-600 transition-colors self-start mt-2">
        Forgot password?
      </button>
    </div>
  </StepLayout>
);

export default function LoginFlow() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const updateData = (updates: any) => setFormData(prev => ({ ...prev, ...updates }));

  const handleExternalLogin = (provider: string) => {
    alert(`${provider} login not implemented in generic flow yet.`);
  };

  const steps = [
    <Step1Email key="step1" formData={formData} updateData={updateData} onExternalLogin={handleExternalLogin} />,
    <Step2Password key="step2" formData={formData} updateData={updateData} />
  ];
  const totalSteps = steps.length;

  const validateStep = (currentStep: number) => {
    setError(null);
    if (currentStep === 0) {
      if (!formData.email || !formData.email.includes('@')) {
        setError("Please enter a valid email address.");
        return false;
      }
    } else if (currentStep === 1) {
      if (!formData.password) {
        setError("Please enter your password.");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      setError(null);
      try {
        const response = await LoginService.login({ email: formData.email, password: formData.password });
        const { token, profile } = response;
        
        // Save the details to local storage
        localStorage.setItem('token', token);
        localStorage.setItem('profile', JSON.stringify(profile));
        
        // Save individual data as requested
        localStorage.setItem('storeId', profile.storeId);
        localStorage.setItem('storeName', profile.storeName);
        localStorage.setItem('userId', profile.id);
        localStorage.setItem('email', profile.email);
        localStorage.setItem('fullName', profile.fullName);
        localStorage.setItem('phone', profile.phone);
        localStorage.setItem('role', profile.role);
        localStorage.setItem('isEmailVerified', String(profile.isEmailVerified));
        
        // Final Login Action (redirect to dashboard)
        window.location.href = "/dashboard";
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Invalid email or password.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setError(null);
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col pt-24 pb-[72px] selection:bg-black selection:text-white">
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
