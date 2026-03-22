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
      {/* <button className="text-sm font-semibold text-black underline underline-offset-4 hover:text-gray-600 transition-colors self-start mt-2">
        Forgot password?
      </button> */}
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
        localStorage.setItem('country', profile.country);

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
