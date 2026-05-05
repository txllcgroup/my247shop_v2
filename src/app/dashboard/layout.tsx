"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
const Joyride = dynamic(() => import('@list-labs/react-joyride'), { ssr: false });
import { CallBackProps, STATUS, Step } from '@list-labs/react-joyride';
import { AuthGuard } from '@/components/AuthGuard';
import { LoginService } from '../login/loginService';
import QRCodeModal from './components/QRCodeModal';

// Assuming we use standard Lucide-style SVG icons for navigation
const navGroups = [
  {
    title: 'MAIN',
    items: [
      { name: 'Home', href: '/dashboard', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
      { name: 'Orders', href: '/dashboard/orders', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
      { name: 'Products', href: '/dashboard/products', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
      { name: 'Customers', href: '/dashboard/customers', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
      { name: 'Staff', href: '/dashboard/staff', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
      { name: 'POS', href: '/pos', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
    ]
  },
  {
    title: 'GROWTH',
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
      { name: 'AI Tools', href: '/dashboard/ai-tools', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
      { name: 'Live Shopping', href: '/dashboard/live-shopping', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
    ]
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Wallet', href: '/dashboard/wallet', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
      { name: 'Billing', href: '/dashboard/billing', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg> },
    ]
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [runTutorial, setRunTutorial] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const steps: Step[] = React.useMemo(() => [
    {
      target: '.tour-step-menu',
      content: 'Here is your main navigation menu where you can access orders, products, customers, and more.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.tour-step-settings',
      content: 'Manage your store details and account settings here.',
      placement: 'right',
    },
    {
      target: '.tour-step-profile',
      content: 'Quick view of your active profile and current billing plan.',
      placement: 'right',
    },
    {
      target: '.tour-step-add-product',
      content: 'Ready to sell? Use this quick action button to list your first product!',
      placement: 'bottom',
    },
    {
      target: '.tour-step-main-content',
      content: 'Your dashboard overview. Track your sales, view recent orders, and get AI-powered suggestions here.',
      placement: 'center',
    }
  ], []);

  useEffect(() => {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
        
        // Redirect Staff to POS if they try to access Dashboard
        if (parsedProfile.role === 'Staff') {
          router.push('/pos');
        }
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      LoginService.logout();
    }
  };

  useEffect(() => {
    // Check if tutorial has been completed before
    const hasCompletedTutorial = localStorage.getItem('my247_tutorial_completed');
    if (!hasCompletedTutorial) {
      // Small delay so layout renders first
      setTimeout(() => setRunTutorial(true), 1500);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTutorial(false);
      localStorage.setItem('my247_tutorial_completed', 'true');
    }
  };


  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-black font-sans flex stretch selection:bg-black selection:text-white">
        {/* Sidebar Navigation */}
        <aside className="w-[280px] bg-white border-r-2 border-gray-200 hidden md:flex flex-col h-screen sticky left-0 top-0 py-6 z-50">
          <div className="flex items-center px-8 pb-6 shrink-0">
            <Link href="/" className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
              <img src="/my247shop-logo.png" alt="My247Shop Logo" className="h-8 w-auto object-contain" />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 flex flex-col gap-1 tour-step-menu">
            {navGroups.map((group) => (
              <div key={group.title} className="mb-4 last:mb-0">
                <div className="px-5 mb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{group.title}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all duration-200 group
                          ${isActive
                            ? 'border-black bg-gray-50 text-black font-semibold'
                            : 'border-transparent text-gray-600 hover:border-black/50 hover:text-black hover:bg-white font-medium'}`}
                      >
                        <span className={`transition-colors ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                          {item.icon}
                        </span>
                        <span className="text-[15px]">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="px-6 pt-4 shrink-0 tour-step-settings">
            {/* <div className="mb-4">
              <span className="text-sm font-semibold text-gray-500">Settings</span>
            </div> */}
            {/* <Link
              href="/dashboard/settings"
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-200 group
                ${pathname === '/dashboard/settings'
                  ? 'border-black bg-gray-50 text-black font-semibold'
                  : 'border-transparent text-gray-600 hover:border-black/50 hover:text-black hover:bg-white font-medium'}`}
            >
              <span className={`transition-colors ${pathname === '/dashboard/settings' ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Account Settings
            </Link> */}

            <div
              onClick={handleLogout}
              className="mt-8 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 flex items-center gap-4 cursor-pointer hover:border-red-200 hover:bg-red-50/30 transition-colors group tour-step-profile"
              title="Click to Logout"
            >
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'M'}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-base font-semibold text-black truncate">{profile?.fullName || "My247 Fashion"}</span>
                <span className="text-sm font-medium text-gray-500 truncate">Free Plan</span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 w-full md:w-[calc(100%-280px)]">
          {/* Top Header - Solid white, thick border */}
          <header className="h-[72px] md:h-[88px] bg-white border-b-2 border-gray-200 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button className="md:hidden text-black transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>

              {/* Standard Title */}
              <div className="hidden sm:flex items-center text-xl font-semibold text-black gap-2 capitalize">
                {pathname === '/dashboard' ? 'Overview' : pathname.replace('/dashboard/', '')}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="hidden lg:flex items-center justify-center gap-2 border-2 border-gray-200 text-black px-5 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:border-black transition-all ml-2 shrink-0 group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v1m0 11v1m4-8h1m-11 0h1m2-2h5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2zM7 7h1v1H7V7zm10 0h1v1h-1V7zM7 17h1v1H7v-1z" /></svg>
                <span className="hidden xl:inline">Store QR Code</span>
                <span className="xl:hidden">Store QR</span>
              </button>

              <StoreLinkHeader profile={profile} />

              <button className="hidden sm:flex w-12 h-12 border-2 border-gray-200 rounded-full items-center justify-center text-black hover:bg-gray-50 hover:border-black transition-colors relative shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-[10px] right-[10px] w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
              </button>

              <button
                onClick={() => setRunTutorial(true)}
                className="hidden sm:flex items-center justify-center gap-2 bg-gray-100 text-black px-4 py-3 rounded-2xl text-base font-semibold hover:bg-gray-200 transition-all ml-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Tutorial
              </button>

              <Link href="/dashboard/products/add" className="hidden sm:flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl text-base font-semibold hover:bg-gray-800 transition-all ml-2 tour-step-add-product">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Product
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 md:p-10 tour-step-main-content">
            {children}
          </main>
        </div>

        <Joyride
          steps={steps}
          run={runTutorial}
          continuous
          showProgress
          showSkipButton
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: '#000000',
              textColor: '#333333',
              zIndex: 1000,
            },
            buttonNext: {
              backgroundColor: '#000000',
              borderRadius: '8px',
              fontSize: '14px',
              padding: '8px 16px',
              fontWeight: 600
            },
            buttonBack: {
              color: '#666666',
              marginRight: '10px',
              fontWeight: 600,
              fontSize: '14px'
            },
            buttonSkip: {
              color: '#999999',
              fontWeight: 500,
              fontSize: '14px'
            },
            tooltip: {
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            },
            tooltipContent: {
              padding: '10px 0',
              fontSize: '15px',
              lineHeight: '1.5'
            }
          }}
        />

        <QRCodeModal 
          isOpen={isQRModalOpen} 
          onClose={() => setIsQRModalOpen(false)} 
          storeName={profile?.storeName || 'My Store'} 
          storeUrl={`https://my247.shop/store/${profile?.storeName?.replace(/\s+/g, '%20') || 'my-store'}`}
        />

        {/* Mobile Bottom Tab Bar - Solid flat white */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 flex justify-around items-center px-2 py-4 z-50 pb-[calc(16px+env(safe-area-inset-bottom))]">
          {[
            { name: 'Home', href: '/dashboard', icon: navGroups[0].items[0].icon },
            { name: 'Orders', href: '/dashboard/orders', icon: navGroups[0].items[1].icon },
            { name: 'Products', href: '/dashboard/products', icon: navGroups[0].items[2].icon },
            { name: 'POS', href: '/dashboard/pos', icon: navGroups[0].items[4].icon },
            { name: 'Wallet', href: '/dashboard/wallet', icon: navGroups[2].items[0].icon },
            { name: 'Billing', href: '/dashboard/billing', icon: navGroups[2].items[1].icon },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full gap-2 p-1 rounded-xl transition-colors
                  ${isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'}`}
              >
                <span className={`transition-all duration-300`}>
                  {item.icon}
                </span>
                <span className={`text-[12px] transition-all`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

      </div>
    </AuthGuard>
  );
}

function StoreLinkHeader({ profile }: { profile: any }) {
  const [copied, setCopied] = useState(false);
  const storeSlug = profile?.storeName?.replace(/ /g, '%20') || 'my-store';
  const storeUrl = `https://my247.shop/store/${storeSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1 md:p-1.5 shrink-0 mx-1 md:mx-0">
      <div className="hidden md:flex flex-col px-3 max-w-[140px]">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5 mt-0.5">Your Store Link</span>
        <span className="text-[13px] font-bold text-black truncate">{storeUrl.replace('https://', '')}</span>
      </div>

      <div className="flex items-center gap-1.5 md:pl-2 md:border-l-2 border-gray-200">
        <button
          onClick={handleCopy}
          className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white hover:bg-gray-200 text-gray-700 border border-transparent hover:border-gray-300'}`}
          title="Copy Link"
        >
          {copied ? (
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          )}
        </button>
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all shadow-sm"
          title="Visit Store"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </div>
    </div>
  );
}
