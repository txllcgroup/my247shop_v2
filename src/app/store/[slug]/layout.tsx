"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomerService } from '../../dashboard/customers/customerService';
import { StorefrontService } from './storefrontService';
import { CartProvider, useCart } from './cart/cartContext';

const FloatingInput = ({ label, id, value, onChange, type = "text", required = false }: any) => (
  <div className="relative group w-full text-black">
    <input
      type={type}
      id={id}
      required={required}
      value={value}
      onChange={onChange}
      className={`peer w-full bg-white border-2 border-gray-100 rounded-2xl px-5 pt-8 pb-3 text-base font-bold text-black outline-none transition-all focus:border-black placeholder-transparent`}
      placeholder={label}
    />
    <label
      htmlFor={id}
      className="absolute left-5 top-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  </div>
);

function CartCountBadge() {
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (count === 0) return null;
  return (
    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center -mr-1 -mt-1 border border-white">
      {count}
    </span>
  );
}

function StoreLayoutContent({ children, pathname, slug }: any) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (customerId) {
      setUser({
        customerId,
        fullName: localStorage.getItem('fullName'),
        email: localStorage.getItem('email'),
        phoneNumber: localStorage.getItem('phoneNumber'),
        storeId: localStorage.getItem('storeId')
      });
    }

    const loadStoreBranding = async () => {
       if (!slug) return;
       try {
          const storeData = await StorefrontService.getStoreDetails(slug);
          setStore(storeData);
       } catch (e) {
          console.error("Failed to load store branding", e);
       }
    };
    loadStoreBranding();

    // Listen for global auth triggers
    const triggerAuth = (e: any) => {
      setAuthMode(e.detail?.mode || 'login');
      setIsAuthModalOpen(true);
    };
    window.addEventListener('open-auth-modal', triggerAuth);
    return () => window.removeEventListener('open-auth-modal', triggerAuth);
  }, [slug]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const storeId = store?.id || localStorage.getItem('storeId') || "69b5365d9f70bd3f664df062";

      if (authMode === 'login') {
        const res = await CustomerService.login({ 
          storeId,
          emailOrPhone: formData.email, 
          password: formData.password 
        });
        
        if (res.success && res.data) {
          const { token, customerId, fullName, email, phoneNumber } = res.data;
          localStorage.setItem('customerToken', token);
          localStorage.setItem('customerId', customerId);
          localStorage.setItem('storeId', storeId);
          localStorage.setItem('fullName', fullName);
          localStorage.setItem('email', email);
          localStorage.setItem('phoneNumber', phoneNumber);
          setUser(res.data);
          setIsAuthModalOpen(false);
        } else {
          setError(res.message || "Login failed");
        }
      } else {
        const registerData = {
          storeId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        };
        const res = await CustomerService.register(registerData);
        if (res.success) {
          setAuthMode('login');
          setError('Account created! Please sign in.');
        } else {
          setError(res.message || "Registration failed");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    localStorage.removeItem('phoneNumber');
    setUser(null);
  };

  const links = [
    { name: "Home", href: `/store/${slug}` },
    { name: "Shop", href: `/store/${slug}/shop` },
    { name: "Orders", href: `/store/${slug}/orders` },
    { name: "Support", href: `/store/${slug}/support` }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white text-black">
      <div className="bg-black text-white text-sm font-semibold py-2 px-4 text-center">
        Free Shipping on all orders over $100!
      </div>

      <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-100 flex items-center justify-between px-6 md:px-12 py-5">
        <Link href={`/store/${slug}`} className="flex items-center gap-2 z-10 transition-transform hover:scale-105 active:scale-95">
          {store?.logoUrl ? (
            <div className="h-10 w-auto flex items-center">
               <img src={store.logoUrl} alt={store.name} className="h-full w-auto object-contain" />
            </div>
          ) : (
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-black/10">
                   {store?.name?.[0] || 'S'}
                </div>
                <span className="text-xl md:text-2xl font-black tracking-tighter text-black uppercase">
                   {store?.name || "Store"}
                </span>
             </div>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-base font-semibold transition-colors relative hover:text-black ${pathname === link.href ? 'text-black' : 'text-gray-500'}`}
            >
              {link.name}
              {pathname === link.href && (
                <span className="absolute -bottom-6 left-0 right-0 h-1 bg-black rounded-t-full"></span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 z-10">
          <Link href={`/store/${slug}/search`} className="p-2 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
            <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </Link>

          {user ? (
            <div className="group relative">
              <button className="flex items-center gap-2 p-1.5 pr-4 border-2 border-gray-100 rounded-full hover:border-black transition-all">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
                  {user.fullName?.[0] || 'U'}
                </div>
                <span className="text-sm font-bold text-black">{user.fullName || 'User'}</span>
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-xl p-2 w-48 overflow-hidden">
                  <Link href={`/store/${slug}/orders`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all text-sm font-bold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> My Orders
                  </Link>
                  <button onClick={logout} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl transition-all text-sm font-bold w-full text-left">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </button>
          )}

          <Link href={`/store/${slug}/cart`} className="flex items-center justify-center p-2 rounded-full hover:bg-gray-50 transition-colors relative">
            <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <CartCountBadge />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAuthModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-black">{authMode === 'login' ? 'Sign In' : 'Create Account'}</h3>
                <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput label="First Name" id="firstName" value={formData.firstName} onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} required={authMode === 'signup'} />
                    <FloatingInput label="Last Name" id="lastName" value={formData.lastName} onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} required={authMode === 'signup'} />
                  </div>
                )}
                <FloatingInput label="Email" id="email" type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} required />
                {authMode === 'signup' && <FloatingInput label="Phone" id="phone" value={formData.phoneNumber} onChange={(e: any) => setFormData({ ...formData, phoneNumber: e.target.value })} />}
                <FloatingInput label="Password" id="password" type="password" value={formData.password} onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} required />
                {error && <p className="text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl">{error}</p>}
                <button disabled={isLoading} className="w-full bg-black text-white py-4 rounded-xl text-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-3">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
                <div className="pt-4 text-center">
                  <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-gray-500 font-bold hover:text-black">
                    {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="border-t-2 border-gray-100 py-12 px-6 md:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 font-medium text-sm">© 2026 My247. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <CartProvider>
      <StoreLayoutContent children={children} pathname={pathname} slug={slug} />
    </CartProvider>
  );
}
