"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import * as signalR from "@microsoft/signalr";

export default function LiveViewer() {
  const { slug } = useParams();
  const [store, setStore] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ user: string, text: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

  const hubConnection = useRef<signalR.HubConnection | null>(null);

  // Use a stable base URL detection
  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return "https://my247v2.airshop247.com/api";
    }
    return "https://my247v2.airshop247.com/api";
  };

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = getBaseUrl();
      try {
        // 1. Get Store Details
        const storeRes = await fetch(`${baseUrl}/storefront/store/${slug}`);
        if (!storeRes.ok) throw new Error("Store not found");
        const storeData = await storeRes.json();
        setStore(storeData);

        // 2. Get Active Live Session
        const liveRes = await fetch(`${baseUrl}/storefront/store/${storeData.id}/live`);
        const liveData = await liveRes.json();
        setSession(liveData);

        if (liveData) {
          setupSignalR(liveData.id, baseUrl);
          if (liveData.featuredProductId) {
            fetchProduct(storeData.id, liveData.featuredProductId, baseUrl);
          }
        }
      } catch (err) {
        console.error("Viewer Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      hubConnection.current?.stop();
    };
  }, [slug]);

  const setupSignalR = async (sessionId: string, baseUrl: string) => {
    const hubUrl = `${baseUrl.replace(/\/$/, '')}/hubs/live`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.on("ProductFeatured", (productId) => {
      if (productId) {
        fetchProduct(store.id, productId, baseUrl);
      } else {
        setFeaturedProduct(null);
      }
    });

    connection.on("ReceiveMessage", (user, text) => {
      setChatMessages(prev => [...prev, { user, text }]);
    });

    connection.on("ViewerCountUpdated", (count) => {
      setViewerCount(count);
    });

    try {
      await connection.start();
      await connection.invoke("JoinSession", sessionId);
      hubConnection.current = connection;
    } catch (err) {
      console.error("SignalR Connection Error:", err);
    }
  };

  const fetchProduct = async (storeId: string, productId: string, baseUrl: string) => {
    try {
      const res = await fetch(`${baseUrl}/storefront/store/${storeId}/products/${productId}`);
      if (res.ok) {
        const product = await res.json();
        setFeaturedProduct(product);
      } else {
        setFeaturedProduct(null);
      }
    } catch (err) {
      console.error("Product Fetch Error:", err);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!session || session.status !== 'Live') return (
    <div className="fixed inset-0 bg-neutral-900 flex flex-col items-center justify-center text-center p-8">
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Not Live Right Now</h1>
      <p className="text-white/60">Follow {store?.name || slug} to get notified when they go live!</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans">

      {/* Video Player (Simulated Stream) */}
      <div className="absolute inset-0 bg-neutral-900">
        <div className="w-full h-full flex items-center justify-center bg-black">
          <div className="text-white/20 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-white/10 border-t-white/60 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Connecting to Stream...</p>
          </div>
        </div>
      </div>

      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white">
            <img src={store?.logoUrl} alt="" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-white font-bold">{store?.name}</h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black uppercase rounded tracking-tighter">Live</span>
              <span className="text-white/60 text-xs font-bold">{viewerCount} Watching</span>
            </div>
          </div>
        </div>
        <button onClick={() => window.history.back()} className="bg-white/10 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Bottom Interface */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 flex flex-col gap-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">

        {/* Featured Product Prompt */}
        {featuredProduct && (
          <div className="animate-in slide-in-from-bottom duration-700">
            <div className="bg-white rounded-[32px] p-4 flex items-center gap-4 shadow-2xl max-w-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                <img src={featuredProduct.images?.[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-bold text-black line-clamp-1">{featuredProduct.name}</h4>
                <p className="text-gray-500 font-bold mb-2">₦{featuredProduct.price.toLocaleString()}</p>
                <button className="w-full bg-black text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat & Interaction */}
        <div className="flex items-end gap-4">
          <div className="flex-1 h-40 overflow-y-auto space-y-2 no-scrollbar flex flex-col justify-end">
            {chatMessages.map((msg, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-left duration-300">
                <span className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-2xl text-white text-sm">
                  <span className="font-bold text-white/60">{msg.user}: </span>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500 hover:scale-110 transition-all">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </button>
          </div>
        </div>

        {/* Chat Input */}
        <div className="relative">
          <input
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 outline-none focus:border-white/40 transition-all"
            placeholder="Say something nice..."
            onKeyDown={(e: any) => {
              if (e.key === 'Enter' && e.target.value) {
                hubConnection.current?.invoke("SendMessage", session.id, "Viewer", e.target.value);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
