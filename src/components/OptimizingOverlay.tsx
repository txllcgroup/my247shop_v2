"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "Image processing...",
  "Applying professional touches...",
  "Enhancing lighting and composition...",
  "Optimizing for ecommerce...",
  "Fine-tuning details...",
  "Almost there...",
];

export default function OptimizingOverlay({ isVisible }: { isVisible: boolean }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl"
        >
          <div className="relative w-32 h-32 mb-12">
            {/* Premium Pulse rings */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-4 bg-indigo-600 rounded-full"
            />
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
            </div>
          </div>

          <div className="text-center space-y-4 px-6 max-w-md">
            <h2 className="text-4xl font-bold text-black tracking-tight mb-2">AI Optimisation</h2>
            <div className="h-8 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl text-gray-500 font-medium absolute inset-0 text-center"
                >
                  {messages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Progress bar simulation */}
          <div className="mt-16 w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
              animate={{ x: [-256, 256] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-black to-transparent"
            />
          </div>
          
          <div className="mt-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] bg-gray-50 px-4 py-2 rounded-full border border-gray-100">Intelligent Processing</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
