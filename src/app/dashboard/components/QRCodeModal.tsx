"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  storeUrl: string;
}

export default function QRCodeModal({ isOpen, onClose, storeName, storeUrl }: QRCodeModalProps) {
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#3b82f6'); // Default to a nice blue like the image
  const [message, setMessage] = useState('SCAN ME');
  const [subMessage, setSubMessage] = useState('Hold the camera to the image');
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR preview whenever URL or colors change
  useEffect(() => {
    if (storeUrl) {
      QRCode.toDataURL(storeUrl, {
        width: 1000,
        margin: 1,
        color: {
          dark: fgColor,
          light: '#ffffff00' // Transparent
        },
        errorCorrectionLevel: 'H'
      }).then(setQrDataUrl);
    }
  }, [storeUrl, fgColor]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set High-res dimensions
      const width = 2000;
      const height = 2600;
      canvas.width = width;
      canvas.height = height;

      // Helper for rounded rectangles
      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      // 1. Draw Outer Rounded Background
      ctx.fillStyle = bgColor;
      roundRect(0, 0, width, height, 100);
      ctx.fill();

      // 2. Draw Phone Icon (Simplified Path)
      ctx.fillStyle = '#000000';
      const iconX = 300;
      const iconY = 200;
      const iconW = 240;
      const iconH = 400;
      roundRect(iconX, iconY, iconW, iconH, 40); // Phone body
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      roundRect(iconX + 30, iconY + 50, iconW - 60, iconH - 120, 10); // Screen
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(iconX + iconW / 2, iconY + iconH - 40, 20, 0, Math.PI * 2); // Home button
      ctx.fill();

      // 3. Draw Header Text
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = 'bold 150px sans-serif';
      ctx.fillText(message.toUpperCase(), 650, 360);
      
      ctx.font = 'bold 80px sans-serif';
      ctx.fillText(subMessage, 650, 480);

      // 4. Draw Inner White QR Box
      ctx.fillStyle = '#ffffff';
      const innerMargin = 150;
      const innerW = width - (innerMargin * 2);
      const innerH = height - 700;
      roundRect(innerMargin, 600, innerW, innerH, 80);
      ctx.fill();

      // 5. Draw the High-Res QR code
      const qrImage = new Image();
      // Generate a fresh high-res DataURL specifically for the canvas
      const highResQr = await QRCode.toDataURL(storeUrl, {
        width: 1400,
        margin: 1,
        color: {
          dark: fgColor,
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      qrImage.src = highResQr;
      
      await new Promise((resolve) => {
        qrImage.onload = () => {
          const qrSize = 1400;
          const x = (width - qrSize) / 2;
          const y = 800; // Positioned inside the white box
          ctx.drawImage(qrImage, x, y, qrSize, qrSize);
          resolve(true);
        };
      });

      // 6. Trigger download
      const link = document.createElement('a');
      link.download = `${storeName.replace(/\s+/g, '-')}-Branded-QR.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Failed to generate high-res QR", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full md:h-auto max-h-[90vh]"
          >
            {/* Left Side: Preview */}
            <div className="flex-1 bg-gray-100 p-8 flex flex-col items-center justify-center border-r-2 border-gray-100 overflow-hidden">
               <div 
                 className="w-full max-w-[340px] aspect-[3/4] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative border-4 border-white/20"
                 style={{ backgroundColor: bgColor }}
               >
                  {/* Header Area */}
                  <div className="p-6 flex items-center gap-4">
                    <div className="w-12 h-20 bg-black rounded-lg relative flex-shrink-0">
                      <div className="absolute inset-1.5 bg-white/20 rounded-sm" />
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-black leading-none mb-1">
                        {message}
                      </span>
                      <span className="text-[10px] font-bold text-black opacity-80 leading-tight">
                        {subMessage}
                      </span>
                    </div>
                  </div>

                  {/* QR Box */}
                  <div className="flex-1 bg-white m-4 mt-0 rounded-2xl p-6 flex items-center justify-center overflow-hidden">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Preview" className="w-[80%] h-auto" />
                    ) : (
                      <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                    )}
                  </div>
               </div>
               <p className="mt-6 text-gray-400 text-xs font-semibold uppercase tracking-widest">Branded Card Preview</p>
            </div>

            {/* Right Side: Controls */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-black uppercase tracking-tight">QR Styling</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Text */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Primary Header</label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold text-black outline-none focus:border-black transition-all"
                      placeholder="e.g. SCAN ME"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Sub-Message</label>
                    <input
                      type="text"
                      value={subMessage}
                      onChange={(e) => setSubMessage(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold text-black outline-none focus:border-black transition-all"
                      placeholder="e.g. Hold camera to image"
                    />
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Branding Color</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border-2 border-gray-100">
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent" 
                      />
                      <span className="text-xs font-bold">{bgColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">QR Color</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border-2 border-gray-100">
                      <input 
                        type="color" 
                        value={fgColor} 
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent" 
                      />
                      <span className="text-xs font-bold">{fgColor}</span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="pt-6">
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    Download Branded QR
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </AnimatePresence>
  );
}
