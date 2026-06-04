"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navGroups = [
  {
    title: 'PLATFORM OVERVIEW',
    items: [
      { 
        name: 'Console Home', 
        href: '/admin', 
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ) 
      },
      { 
        name: 'User Directory', 
        href: '/admin/users', 
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) 
      },
      { 
        name: 'Platform Credits', 
        href: '/admin/credits', 
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ) 
      },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { 
        name: 'Support Tickets', 
        href: '/admin/tickets', 
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ) 
      },
      { 
        name: 'System Logs', 
        href: '/admin/logs', 
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ) 
      },
      { 
        name: 'Platform Settings', 
        href: '/admin/settings', 
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ) 
      },
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to exit the admin console?")) {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex stretch selection:bg-black selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-[280px] bg-white border-r-2 border-gray-200 hidden md:flex flex-col h-screen sticky left-0 top-0 py-6 z-50">
        <div className="flex items-center px-8 pb-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
            <img src="/my247shop-logo.png" alt="My247Shop Logo" className="h-8 w-auto object-contain" />
            <span className="bg-black text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase -mt-1">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 flex flex-col gap-1">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
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
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile Card / Controls */}
        <div className="px-6 pt-4 shrink-0">
          <div
            onClick={handleLogout}
            className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 flex items-center gap-4 cursor-pointer hover:border-red-200 hover:bg-red-50/30 transition-all group"
            title="Exit Admin Console"
          >
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm relative shrink-0">
              AD
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold text-black truncate">Platform Control</span>
              <span className="text-xs font-semibold text-gray-400 truncate">Super Admin</span>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 w-full md:w-[calc(100%-280px)]">
        {/* Top Header - Solid white, thick border */}
        <header className="h-[72px] md:h-[88px] bg-white border-b-2 border-gray-200 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {/* Standard Title */}
            <div className="flex items-center text-xl font-semibold text-black gap-2 capitalize">
              <span className="font-extrabold">Console</span> 
              <span className="text-gray-400">/</span> 
              <span className="text-gray-600">
                {pathname === '/admin' ? 'Overview' : pathname.replace('/admin/', '').replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Indicator Badges */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">ALL SYSTEMS NOMINAL</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500">
              <span className="font-bold text-black">Nodes:</span> 8/8 Online
            </div>

            <button className="flex w-12 h-12 border-2 border-gray-200 rounded-full items-center justify-center text-black hover:bg-gray-50 hover:border-black transition-colors relative shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-[10px] right-[10px] w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-50 transition-all duration-300 animate-in fade-in">
            <aside className="w-[280px] bg-white h-screen flex flex-col py-6 animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between px-8 pb-6">
                <div className="flex items-center gap-2">
                  <img src="/my247shop-logo.png" alt="My247Shop Logo" className="h-8 w-auto object-contain" />
                  <span className="bg-black text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
                    Admin
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-black">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 flex flex-col gap-1">
                {navGroups.map((group) => (
                  <div key={group.title} className="mb-4">
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
                            onClick={() => setMobileMenuOpen(false)}
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
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="px-6 pt-4">
                <div
                  onClick={handleLogout}
                  className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                    AD
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-bold text-black truncate">Platform Control</span>
                    <span className="text-xs font-semibold text-gray-400 truncate">Super Admin</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 flex justify-around items-center px-2 py-4 z-40 pb-[calc(16px+env(safe-area-inset-bottom))]">
        {navGroups[0].items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full gap-2 p-1 rounded-xl transition-colors
                ${isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'}`}
            >
              <span>{item.icon}</span>
              <span className="text-[11px]">{item.name.replace('Console ', '')}</span>
            </Link>
          );
        })}
        {navGroups[1].items.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full gap-2 p-1 rounded-xl transition-colors
                ${isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'}`}
            >
              <span>{item.icon}</span>
              <span className="text-[11px]">{item.name.replace('Support ', '')}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
