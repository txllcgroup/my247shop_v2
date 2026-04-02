'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PWAInstallPromptProps {
  name?: string;
  iconUrl?: string;
}

export default function PWAInstallPrompt({
  name = 'My247Shop',
  iconUrl = '/pwa-icons/android/launchericon-192x192.png'
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed / standalone
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setShowAndroidPrompt(false);
        setShowIOSPrompt(false);
      }
    };
    checkStandalone();

    // Android: intercept beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show prompt if not already installed
      if (!isStandalone) {
        setShowAndroidPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // After successful installation
    window.addEventListener('appinstalled', () => {
      setShowAndroidPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    // Detailed check to trigger iOS prompt
    if (isIOS && !isStandalone && !(window as any).MSStream) {
      // Don't show immediately on every load, maybe use localStorage to delay or just show after timeout
      const hasSeenPrompt = localStorage.getItem('iosPwaPromptSeen');
      if (!hasSeenPrompt) {
        const timer = setTimeout(() => {
          setShowIOSPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowAndroidPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleCloseIOSPrompt = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('iosPwaPromptSeen', 'true');
  };

  const handleCloseAndroidPrompt = () => {
    setShowAndroidPrompt(false);
  };

  // If already standalone, render nothing
  if (isStandalone) return null;

  const BrandIcon = ({ size = "w-12 h-12" }: { size?: string }) => (
    iconUrl ? (
      <img src={iconUrl} alt={name} className={`${size} rounded-xl shadow-sm bg-zinc-100 object-contain`} />
    ) : (
      <div className={`${size} bg-black rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-black/10`}>
        {name?.[0] || 'S'}
      </div>
    )
  );

  return (
    <AnimatePresence>
      {/* Android Prompt */}
      {showAndroidPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-5 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <BrandIcon />
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white uppercase tracking-tighter">Install {name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Add to home screen for faster access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseAndroidPrompt}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-black text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Install
            </button>
          </div>
        </motion.div>
      )}

      {/* iOS Prompt */}
      {showIOSPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm bg-white dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <BrandIcon size="w-14 h-14" />
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white uppercase tracking-tighter text-lg">Install {name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Install this application on your home screen for quick and easy access when you're on the go.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 mt-2 w-full text-sm text-zinc-700 dark:text-zinc-300 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 font-medium text-xs">1</span>
                <span>Tap the <strong>Share</strong> icon in the menu bar.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 font-medium text-xs">2</span>
                <span>Scroll and tap <strong>Add to Home Screen</strong>.</span>
              </div>
            </div>

            <button
              onClick={handleCloseIOSPrompt}
              className="mt-2 w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Later
            </button>
          </div>

          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-zinc-900/90 rotate-45 border-r border-b border-zinc-200 dark:border-zinc-800"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
