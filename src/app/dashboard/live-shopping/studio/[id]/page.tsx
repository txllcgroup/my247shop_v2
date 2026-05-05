"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LiveShoppingService, LiveSession } from '../../liveShoppingService';
import * as signalR from "@microsoft/signalr";

export default function LiveStudio() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<{user: string, text: string}[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hubConnection = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionData = await LiveShoppingService.getSessions(); // In real app, getById
        const current = sessionData.find(s => s.id === id);
        if (current) {
          setSession(current);
          setIsLive(current.status === 'Live');
        }
        
        // Fetch products for showcasing
        const res = await fetch('https://my247v2.airshop247.com/api/products', {
            headers: { 'X-Store-ID': localStorage.getItem('storeId') || '' }
        });
        const productData = await res.json();
        setProducts(productData.items || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    startCamera();
    setupSignalR();

    return () => {
      hubConnection.current?.stop();
    };
  }, [id]);

  const setupSignalR = async () => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://my247v2.airshop247.com/api/hubs/live")
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveMessage", (user, text) => {
      setChatMessages(prev => [...prev, { user, text }]);
    });

    connection.on("ViewerCountUpdated", (count) => {
      setViewerCount(count);
    });

    try {
      await connection.start();
      await connection.invoke("JoinSession", id);
      hubConnection.current = connection;
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const toggleLive = async () => {
    const nextStatus = isLive ? 'Ended' : 'Live';
    try {
      await LiveShoppingService.updateStatus(id as string, nextStatus);
      setIsLive(!isLive);
      if (nextStatus === 'Ended') {
          router.push('/dashboard/live-shopping');
      }
    } catch (err) {
      alert("Failed to update session status");
    }
  };

  const featureProduct = async (productId: string) => {
    try {
      await LiveShoppingService.featureProduct(id as string, productId);
      setSelectedProductId(productId);
      await hubConnection.current?.invoke("FeatureProduct", id, productId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Studio Controls Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent z-30 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">{session?.title}</h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-rose-500 animate-pulse' : 'bg-gray-500'}`}></span>
              <span className="text-white/60 text-xs font-black uppercase tracking-widest">{isLive ? 'Live' : 'Preview'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3">
             <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.523 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
             <span className="text-white font-bold">{viewerCount}</span>
          </div>
          <button
            onClick={toggleLive}
            className={`${isLive ? 'bg-rose-600' : 'bg-emerald-600'} text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl`}
          >
            {isLive ? 'End Stream' : 'Go Live Now'}
          </button>
        </div>
      </div>

      {/* Main Broadcaster Area */}
      <div className="flex-1 relative bg-neutral-900 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover mirror"
        />
        
        {/* Featured Product Overlay (Preview) */}
        {selectedProductId && (
          <div className="absolute bottom-10 left-10 animate-in slide-in-from-left duration-500">
            <div className="bg-white rounded-3xl p-4 shadow-2xl flex items-center gap-4 border-2 border-black">
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                <img src={products.find(p => p.id === selectedProductId)?.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="pr-4">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-0.5">Now Showing</span>
                <h4 className="font-bold text-black line-clamp-1">{products.find(p => p.id === selectedProductId)?.name}</h4>
                <p className="font-bold text-gray-500">₦{products.find(p => p.id === selectedProductId)?.price.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Studio Sidebar (Chat & Products) */}
      <div className="w-full md:w-[400px] bg-white flex flex-col shadow-2xl z-40">
        
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100">
          <button className="flex-1 py-6 font-bold text-black border-b-4 border-black">Showcase</button>
          <button className="flex-1 py-6 font-bold text-gray-400">Chat</button>
        </div>

        {/* Product Showcase Picker */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Tap to feature product</h2>
          <div className="grid grid-cols-1 gap-3">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => featureProduct(product.id)}
                className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left ${selectedProductId === product.id ? 'border-black bg-black text-white' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'}`}
              >
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0">
                   <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-[14px] truncate">{product.name}</h4>
                   <p className={`text-sm ${selectedProductId === product.id ? 'text-white/60' : 'text-gray-500'}`}>₦{product.price.toLocaleString()}</p>
                </div>
                {selectedProductId === product.id && (
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Chat (Mini Preview) */}
        <div className="h-[250px] bg-gray-50 border-t border-gray-100 p-6 flex flex-col">
           <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Live Chat</h2>
           <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className="font-bold text-black">{msg.user}: </span>
                  <span className="text-gray-600">{msg.text}</span>
                </div>
              ))}
              {chatMessages.length === 0 && <p className="text-gray-300 italic text-sm">Waiting for messages...</p>}
           </div>
           <div className="relative">
              <input 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black"
                placeholder="Type a message..."
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' && e.target.value) {
                    hubConnection.current?.invoke("SendMessage", id, "Merchant", e.target.value);
                    e.target.value = '';
                  }
                }}
              />
           </div>
        </div>

      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
